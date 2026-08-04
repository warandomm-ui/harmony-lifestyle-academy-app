// ═══════════════════════════════════════════════════════════
// REPLAN AGENT — Supabase Edge Function
// Trigger: Weekly (Ahad malam) or manual via HTTP POST
// For each active study profile:
//   1. Get progress from last week
//   2. Send to Gemini for re-plan
//   3. Insert new study_plan with week_number++
// ═══════════════════════════════════════════════════════════

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { GoogleGenAI } from 'https://esm.sh/@google/genai@1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const geminiKey = Deno.env.get('GEMINI_API_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseKey);
    const ai = new GoogleGenAI({ apiKey: geminiKey });

    // Get all active study profiles
    const { data: profiles, error: profilesErr } = await supabase
      .from('study_profiles')
      .select('*');

    if (profilesErr) throw profilesErr;
    if (!profiles || profiles.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No active profiles found', count: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let replannedCount = 0;

    for (const profile of profiles) {
      try {
        // Get current active plan
        const { data: currentPlan } = await supabase
          .from('study_plans')
          .select('id, week_number')
          .eq('user_id', profile.user_id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (!currentPlan) continue;

        // Get progress for current plan
        const { data: progress } = await supabase
          .from('study_progress')
          .select('subject, score, completed')
          .eq('plan_id', currentPlan.id);

        // Calculate weak subjects
        const subjectScores: Record<string, { total: number; count: number }> = {};
        for (const p of (progress || [])) {
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

        // Generate new plan via Gemini
        const prompt = `Kamu adalah Study Planner AI untuk pelajar Malaysia Tingkatan ${profile.tingkatan}. Berdasarkan maklumat ini: subjek: ${JSON.stringify(profile.subjects)}, subjek lemah minggu lepas: ${weakSubjects.length > 0 ? weakSubjects.join(', ') : 'Tiada'}, jam belajar sehari: ${profile.daily_hours}, tarikh exam: ${profile.exam_date || 'belum ditetapkan'}. Buat jadual ulangkaji mingguan baru dalam format JSON dengan struktur: { "days": [{ "day": "Isnin", "slots": [{ "time": "8:00 PM", "subject": "", "chapter": "", "duration_minutes": 45, "priority": "high/medium/low" }] }] }. Naikkan prioriti subjek lemah. Selang-selikan subjek berat dan ringan. Masukkan rehat 10 minit setiap 45 minit. Pastikan output JSON sahaja.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-lite',
          contents: prompt,
          config: { responseMimeType: 'application/json' },
        });

        const planText = response.text || '';
        let planData;
        try {
          planData = JSON.parse(planText);
        } catch {
          const match = planText.match(/\{[\s\S]*\}/);
          if (match) planData = JSON.parse(match[0]);
          else continue;
        }

        // Mark old plan as completed
        await supabase
          .from('study_plans')
          .update({ status: 'completed' })
          .eq('id', currentPlan.id);

        // Insert new plan
        const newWeekNumber = (currentPlan.week_number || 0) + 1;
        await supabase
          .from('study_plans')
          .insert({
            user_id: profile.user_id,
            profile_id: profile.id,
            plan_data: planData,
            week_number: newWeekNumber,
            status: 'active',
            generated_by: 'replan-agent',
          });

        replannedCount++;
      } catch (err) {
        console.error(`Error replanning for user ${profile.user_id}:`, err);
        // Continue with next profile
      }
    }

    return new Response(
      JSON.stringify({ message: 'Replan complete', count: replannedCount }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Replan agent error:', err);
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
