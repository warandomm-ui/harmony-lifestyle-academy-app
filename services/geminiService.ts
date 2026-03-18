/**
 * Gemini Service - SECURED via Supabase Edge Function
 * All AI calls go through the ai-proxy edge function
 * No API keys exposed to the browser
 */
import { generateContent, generateContentWithImage, generateTTS, retry } from './aiProxyService';
import type { AnalysisResult, CourseDifficulty, CourseOutline, Goal, SkillSuggestion, SurveyAnswers, AdminAssistanceResult, GroundedCareerDetail, StudentDataItem, StudyMode, StudyBuddyMessage, Emotion, WeeklyEmotionReview } from '../types';
import { DEFAULT_ANALYSIS_RESULT } from '../constants';

const escapePrompt = (content: string, tag: string = "user_content") => {
    const cleanContent = content.replace(new RegExp(`</${tag}>`, 'g'), '');
    return `<${tag}>\n${cleanContent}\n</${tag}>`;
};

const SIMPLE_EXPLANATION_INSTRUCTION = "Keep your explanations very simple, like you are talking to a 5th grader (10-11 years old). Use easy words and helpful examples.";

// Helper: safely parse JSON from response
const safeParseJSON = (text: string | undefined): any => {
  if (!text) return null;
  let cleaned = text.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }
  return JSON.parse(cleaned);
};
export const getPersonalityAnalysis = async (answers: SurveyAnswers): Promise<AnalysisResult> => {
  try {
    const prompt = `You are an expert personality analyst for Malaysian secondary school students.
Analyze the following survey data and return a JSON object.

${escapePrompt(JSON.stringify(answers), "survey_data")}

You MUST return a valid JSON object with EXACTLY this structure (no extra keys, no missing keys):
{
  "studentProfile": {
    "disc": { "style": "string", "summary": "string" },
    "mbti": { "type": "string like INTJ", "summary": "string" },
    "enneagram": { "type": "string like Type 5", "summary": "string" },
    "bigFive": { "summary": "string", "traits": [{"name": "Openness", "score": 4}] },
    "hexaco": { "summary": "string", "traits": [{"name": "Honesty-Humility", "score": 4}] },
    "temperament": { "type": "string", "summary": "string" },
    "socialStyles": { "style": "string", "summary": "string" },
    "multipleIntelligences": { "topIntelligences": ["string"], "summary": "string" }
  },
  "overallSummary": "A friendly 2-3 sentence summary for a teenager",
  "recommendedStudyTechniques": ["technique1", "technique2"],
  "personalityType": "A fun 2-3 word label",
  "emoji": "one emoji",
  "summary": { "coreStrengths": [], "naturalTalents": [], "learningStyle": "", "workEnvironmentFit": "" },
  "careerRecommendations": [{ "name": "", "match": 85, "why": "", "skills": [], "salary": "RM range" }],
  "otherCareerOptions": [{ "name": "", "skills": [], "salary": "" }],
  "learningPath": { "startWith": "", "thenMaster": "", "buildToward": "" },
  "lifeSkills": [], "specialSkills": [], "recommendedSports": [],
  "startupIdeas": [{ "title": "", "description": "", "targetMarket": "", "validationSteps": [], "challenges": [] }]
}
Return ONLY valid JSON. Use Malaysian context (RM for salary). Keep tone fun and encouraging.`;
    const text = await retry(async () => {
      const response = await generateContent(prompt, { jsonMode: true });
      const parsed = safeParseJSON(response);
      if (!parsed || !parsed.studentProfile || !parsed.personalityType) {
        throw new Error("Invalid response structure from AI");
      }
      return response;
    });
    return safeParseJSON(text) as AnalysisResult;
  } catch (error) {
    console.error("Error in getPersonalityAnalysis:", error);
    return DEFAULT_ANALYSIS_RESULT;
  }
};

export const getSkillRecommendations = async (personalityType: string, goal: Goal, careerPaths: string[]): Promise<SkillSuggestion> => {
    try {
        const prompt = `Recommend 5 skills for a Malaysian student. Personality: ${personalityType}, Goal: ${goal}, Interests: ${careerPaths.join(', ')}. ${SIMPLE_EXPLANATION_INSTRUCTION} Return JSON with keys: skills (array of {name, description, relevance}).`;
        const text = await generateContent(prompt, { jsonMode: true });
        return safeParseJSON(text) || { skills: [] };
    } catch (error) { console.error("Skill recommendations failed:", error); return { skills: [] } as any; }
};

export const generateCourseOutline = async (topic: string, difficulty: CourseDifficulty): Promise<CourseOutline> => {
    try {
        const prompt = `Create a course outline for: ${topic} (${difficulty}). ${SIMPLE_EXPLANATION_INSTRUCTION} Return as JSON.`;
        const text = await generateContent(prompt, { jsonMode: true });
        return safeParseJSON(text) || {};
    } catch (error) { console.error("Course outline failed:", error); throw error; }
};
export const generatePlaceholderVideo = async (prompt: string): Promise<string> => {
    const text = await generateContent(`You are an educational content creator. Create a lesson brief for a short educational video about: "${prompt}". Return ONLY a valid JSON object with exactly these keys: "title" (string), "duration" (string like "3 min"), "objective" (one-sentence learning goal), "keyPoints" (array of 3-4 strings), "script" (2-3 paragraph narration), "visualNotes" (string describing visuals/animations).`, { jsonMode: true });
    if (!text) throw new Error('No content generated');
    return text;
};

export const getAdminAssistance = async (prompt: string, studentData?: StudentDataItem[]): Promise<AdminAssistanceResult> => {
    try {
        const fullPrompt = `System: Harmony Admin Assistant. Context: ${studentData ? JSON.stringify(studentData) : "N/A"}. Request: ${prompt}`;
        const text = await generateContent(fullPrompt);
        return { text: text || '', groundingLinks: [] };
    } catch (error) { return { text: 'Sorry, assistant is temporarily unavailable.', groundingLinks: [] }; }
};

export const getGroundedCareerInfo = async (careerName: string, personalityType: string, location: string): Promise<GroundedCareerDetail> => {
    try {
        const prompt = `Provide career insights for: Career: ${careerName}, Personality: ${personalityType}, Location: ${location}. ${SIMPLE_EXPLANATION_INSTRUCTION} Return a JSON object with keys: groundedExplanation, groundedSalaryRange, jobMarketTrends.`;
        const text = await generateContent(prompt, { jsonMode: true });
        try {
            const json = safeParseJSON(text);
            return { groundedExplanation: json?.groundedExplanation || "No explanation.", groundedSalaryRange: json?.groundedSalaryRange || "N/A", jobMarketTrends: json?.jobMarketTrends || "N/A", groundingLinks: [] };
        } catch (e) {
            return { groundedExplanation: text || "Done.", groundedSalaryRange: "N/A", jobMarketTrends: "N/A", groundingLinks: [] };
        }
    } catch (error) { return { groundedExplanation: "Career info temporarily unavailable.", groundedSalaryRange: "N/A", jobMarketTrends: "N/A", groundingLinks: [] }; }
};
export const analyzeImage = async (data: string, mimeType: string, prompt: string): Promise<string> => {
    try {
        return await generateContentWithImage(data, mimeType, prompt + " " + SIMPLE_EXPLANATION_INSTRUCTION);
    } catch (error) { return "Image analysis temporarily unavailable."; }
};

export const editImage = async (data: string, mimeType: string, prompt: string): Promise<string> => {
    try {
        return await generateContentWithImage(data, mimeType, prompt);
    } catch (error) { return ""; }
};

export const getWeeklyReview = async (emotions: Emotion[]): Promise<WeeklyEmotionReview> => {
    try {
        const prompt = `Review these emotions: ${emotions.join(', ')}. ${SIMPLE_EXPLANATION_INSTRUCTION} Return JSON: summary, reflectionQuestions, actionableTip.`;
        const text = await generateContent(prompt, { jsonMode: true });
        return safeParseJSON(text) || { summary: '', reflectionQuestions: [], actionableTip: '' };
    } catch (error) { return { summary: 'Review unavailable.', reflectionQuestions: [], actionableTip: 'Take a deep breath.' } as any; }
};

export const getStudyBuddyResponse = async (history: StudyBuddyMessage[], topic: string, mode: StudyMode, userText: string = ''): Promise<string> => {
    try {
        const prompt = `Mode: ${mode}. Topic: ${topic}. User: ${userText}. ${SIMPLE_EXPLANATION_INSTRUCTION}`;
        return await generateContent(prompt);
    } catch (error) { return "Study buddy is taking a break. Try again in a moment!"; }
};
export const getLanguageTutorResponse = async (language: string, history: { role: 'user' | 'model'; text: string }[], userMessage: string): Promise<string> => {
    try {
        const prompt = `Language tutor for ${language}. Student: ${userMessage}. ${SIMPLE_EXPLANATION_INSTRUCTION}`;
        return await generateContent(prompt);
    } catch (error) { return "Language tutor is temporarily unavailable."; }
};

export const askAIAboutNote = async (noteContent: string, userQuery: string, history: { role: 'user' | 'model'; text: string }[]): Promise<string> => {
    try {
        const prompt = `Note Context: ${escapePrompt(noteContent, "note")}. Query: ${userQuery}. ${SIMPLE_EXPLANATION_INSTRUCTION}`;
        return await generateContent(prompt);
    } catch (error) { return "Note assistant is temporarily unavailable."; }
};

export const generatePodcastAudio = async (noteContent: string): Promise<string> => {
    // Step 1: Generate narration script
    const script = await generateContent(
      `Write a short, engaging podcast-style narration (80-120 words) summarising these notes. Write it as a single narrator speaking naturally. No markdown or headers.\n\nNotes:\n${noteContent.slice(0, 2000)}`
    );
    const cleanScript = script?.trim() || noteContent.slice(0, 300);

    // Step 2: Convert to audio via TTS
    const audioData = await generateTTS(cleanScript);
    if (!audioData) throw new Error('No audio data returned from TTS model');
    return audioData;
};