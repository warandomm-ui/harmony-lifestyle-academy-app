import { supabase } from './supabaseClient';
import { generateContent } from './aiProxyService';

// ═══════════════════════════════════════════════════════════
// STUDY PLANNER AGENT — AI-powered weekly study scheduler
// Uses Gemini via aiProxyService (secure edge function proxy)
// ═══════════════════════════════════════════════════════════

// ── Types ──
export interface StudyProfile {
  id?: string;
  user_id?: string;
  tingkatan: number;
  subjects: string[];
  weak_subjects: Record<string, number>; // subject → weakness rating 1-5
  daily_hours: number;
  exam_date: string | null;
  dashboard_mode: 'muslim' | 'universal';
}

export interface StudySlot {
  time: string;
  subject: string;
  chapter: string;
  duration_minutes: number;
  priority: 'high' | 'medium' | 'low';
}

export interface StudyDay {
  day: string;
  slots: StudySlot[];
}

export interface WeeklyPlan {
  days: StudyDay[];
}

export interface StudyPlan {
  id: string;
  user_id: string;
  profile_id: string;
  plan_data: WeeklyPlan;
  week_number: number;
  status: 'active' | 'completed' | 'adjusted';
  generated_by: string;
  created_at: string;
}

export interface StudyProgress {
  id: string;
  user_id: string;
  plan_id: string;
  subject: string;
  chapter: string;
  score: number | null;
  time_spent_minutes: number | null;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
}

// ── Helper: Get current user ID ──
async function getCurrentUserId(): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');
  return user.id;
}

// ── 1. Generate Study Plan ──
export async function generateStudyPlan(profile: StudyProfile): Promise<WeeklyPlan> {
  const prompt = `Kamu adalah Study Planner AI untuk pelajar Malaysia Tingkatan ${profile.tingkatan}. Berdasarkan maklumat ini: subjek: ${JSON.stringify(profile.subjects)}, subjek lemah: ${JSON.stringify(profile.weak_subjects)}, jam belajar sehari: ${profile.daily_hours}, tarikh exam: ${profile.exam_date || 'belum ditetapkan'}. Buat jadual ulangkaji mingguan dalam format JSON dengan struktur: { "days": [{ "day": "Isnin", "slots": [{ "time": "8:00 PM", "subject": "", "chapter": "", "duration_minutes": 45, "priority": "high/medium/low" }] }] }. Prioritikan subjek lemah. Selang-selikan subjek berat dan ringan. Masukkan rehat 10 minit setiap 45 minit. Gunakan hari Isnin hingga Jumaat. Pastikan output JSON sahaja tanpa markdown.`;

  const text = await generateContent(prompt, { jsonMode: true });

  let plan: WeeklyPlan;
  try {
    plan = JSON.parse(text);
  } catch {
    // Try extracting JSON from response
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      plan = JSON.parse(match[0]);
    } else {
      throw new Error('Failed to parse study plan from AI response');
    }
  }

  return plan;
}

// ── 2. Save Profile ──
export async function saveStudyProfile(profile: StudyProfile): Promise<string> {
  const userId = await getCurrentUserId();

  // Upsert: update if exists, insert if not
  const { data: existing } = await supabase
    .from('study_profiles')
    .select('id')
    .eq('user_id', userId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('study_profiles')
      .update({
        tingkatan: profile.tingkatan,
        subjects: profile.subjects,
        weak_subjects: profile.weak_subjects,
        daily_hours: profile.daily_hours,
        exam_date: profile.exam_date,
        dashboard_mode: profile.dashboard_mode,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
    if (error) throw error;
    return existing.id;
  }

  const { data, error } = await supabase
    .from('study_profiles')
    .insert({
      user_id: userId,
      tingkatan: profile.tingkatan,
      subjects: profile.subjects,
      weak_subjects: profile.weak_subjects,
      daily_hours: profile.daily_hours,
      exam_date: profile.exam_date,
      dashboard_mode: profile.dashboard_mode,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

// ── 3. Save Plan to DB ──
export async function saveStudyPlan(
  profileId: string,
  planData: WeeklyPlan,
  weekNumber: number
): Promise<string> {
  const userId = await getCurrentUserId();

  // Mark previous active plans as completed
  await supabase
    .from('study_plans')
    .update({ status: 'completed' })
    .eq('user_id', userId)
    .eq('status', 'active');

  const { data, error } = await supabase
    .from('study_plans')
    .insert({
      user_id: userId,
      profile_id: profileId,
      plan_data: planData,
      week_number: weekNumber,
      status: 'active',
      generated_by: 'agent',
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

// ── 4. Get Active Plan ──
export async function getActivePlan(): Promise<StudyPlan | null> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('study_plans')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data || null;
}

// ── 5. Get Today's Tasks ──
export async function getTodayTasks(userId?: string): Promise<StudySlot[]> {
  const uid = userId || await getCurrentUserId();

  const { data: plan } = await supabase
    .from('study_plans')
    .select('id, plan_data')
    .eq('user_id', uid)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (!plan) return [];

  const dayNames = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];
  const today = dayNames[new Date().getDay()];
  const planData = plan.plan_data as WeeklyPlan;

  const todaySchedule = planData.days?.find(
    (d) => d.day.toLowerCase() === today.toLowerCase()
  );

  return todaySchedule?.slots || [];
}

// ── 6. Mark Task Complete ──
export async function markTaskComplete(
  planId: string,
  subject: string,
  chapter: string,
  score: number
): Promise<void> {
  const userId = await getCurrentUserId();

  // Check if progress entry exists
  const { data: existing } = await supabase
    .from('study_progress')
    .select('id')
    .eq('plan_id', planId)
    .eq('subject', subject)
    .eq('chapter', chapter)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('study_progress')
      .update({
        score,
        completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('study_progress')
      .insert({
        user_id: userId,
        plan_id: planId,
        subject,
        chapter,
        score,
        completed: true,
        completed_at: new Date().toISOString(),
      });
    if (error) throw error;
  }
}

// ── 7. Get Progress for Plan ──
export async function getPlanProgress(planId: string): Promise<StudyProgress[]> {
  const { data, error } = await supabase
    .from('study_progress')
    .select('*')
    .eq('plan_id', planId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// ── 8. Adjust Plan (Re-plan based on progress) ──
export async function adjustPlan(planId: string): Promise<WeeklyPlan> {
  const progress = await getPlanProgress(planId);

  // Get the plan's profile
  const { data: plan } = await supabase
    .from('study_plans')
    .select('profile_id')
    .eq('id', planId)
    .single();

  if (!plan) throw new Error('Plan not found');

  const { data: profile } = await supabase
    .from('study_profiles')
    .select('*')
    .eq('id', plan.profile_id)
    .single();

  if (!profile) throw new Error('Profile not found');

  // Calculate subject averages
  const subjectScores: Record<string, { total: number; count: number }> = {};
  for (const p of progress) {
    if (p.score != null) {
      if (!subjectScores[p.subject]) subjectScores[p.subject] = { total: 0, count: 0 };
      subjectScores[p.subject].total += p.score;
      subjectScores[p.subject].count += 1;
    }
  }

  const weakSubjects: string[] = [];
  for (const [subject, data] of Object.entries(subjectScores)) {
    const avg = data.total / data.count;
    if (avg < 60) weakSubjects.push(`${subject} (purata: ${avg.toFixed(0)}%)`);
  }

  const prompt = `Kamu adalah Study Planner AI. Berdasarkan progress pelajar minggu lepas:
Subjek lemah (skor <60%): ${weakSubjects.length > 0 ? weakSubjects.join(', ') : 'Tiada'}
Subjek: ${JSON.stringify(profile.subjects)}
Tingkatan: ${profile.tingkatan}
Jam belajar sehari: ${profile.daily_hours}
Tarikh exam: ${profile.exam_date || 'belum ditetapkan'}

Buat jadual ulangkaji mingguan baru. Naikkan prioriti subjek lemah. Format JSON: { "days": [{ "day": "Isnin", "slots": [{ "time": "8:00 PM", "subject": "", "chapter": "", "duration_minutes": 45, "priority": "high/medium/low" }] }] }. Pastikan output JSON sahaja.`;

  const text = await generateContent(prompt, { jsonMode: true });

  let newPlan: WeeklyPlan;
  try {
    newPlan = JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      newPlan = JSON.parse(match[0]);
    } else {
      throw new Error('Failed to parse adjusted plan');
    }
  }

  // Mark old plan as adjusted
  await supabase
    .from('study_plans')
    .update({ status: 'adjusted' })
    .eq('id', planId);

  return newPlan;
}

// ── 9. Get Study Profile ──
export async function getStudyProfile(): Promise<StudyProfile | null> {
  const userId = await getCurrentUserId();

  const { data, error } = await supabase
    .from('study_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

// ── 10. Get Weekly Insights ──
export async function getWeeklyInsights(planId: string): Promise<{
  weakestSubject: string | null;
  studyStreak: number;
  totalMinutesThisWeek: number;
  recommendation: string;
}> {
  const progress = await getPlanProgress(planId);

  // Find weakest subject
  const subjectScores: Record<string, { total: number; count: number }> = {};
  let totalMinutes = 0;
  let completedCount = 0;

  for (const p of progress) {
    if (p.score != null) {
      if (!subjectScores[p.subject]) subjectScores[p.subject] = { total: 0, count: 0 };
      subjectScores[p.subject].total += p.score;
      subjectScores[p.subject].count += 1;
    }
    totalMinutes += p.time_spent_minutes || 0;
    if (p.completed) completedCount++;
  }

  let weakestSubject: string | null = null;
  let lowestAvg = 100;
  for (const [subject, data] of Object.entries(subjectScores)) {
    const avg = data.total / data.count;
    if (avg < lowestAvg) {
      lowestAvg = avg;
      weakestSubject = subject;
    }
  }

  const recommendation = weakestSubject
    ? `Fokus lebih pada ${weakestSubject} minggu depan`
    : 'Teruskan usaha yang baik!';

  return {
    weakestSubject,
    studyStreak: completedCount,
    totalMinutesThisWeek: totalMinutes,
    recommendation,
  };
}

// ── 11. Generate Motivational Message ──
export async function getMotivationalMessage(isMuslim: boolean): Promise<string> {
  const prompt = isMuslim
    ? 'Beri satu ayat motivasi pendek dalam Bahasa Melayu untuk pelajar yang telah siapkan semua tugasan hari ini. Sertakan unsur Islamik. Ayat sahaja, tiada markdown.'
    : 'Give one short motivational sentence in English for a student who completed all tasks today. Just the sentence, no markdown.';

  try {
    return await generateContent(prompt);
  } catch {
    return isMuslim
      ? 'Tahniah! Kamu telah berjaya hari ini. Teruskan usaha!'
      : 'Great job! You completed all tasks today. Keep it up!';
  }
}
