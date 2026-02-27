import { GoogleGenAI, Modality } from "@google/genai";
import type { AnalysisResult, CourseDifficulty, CourseOutline, Goal, SkillSuggestion, SurveyAnswers, AdminAssistanceResult, GroundedCareerDetail, StudentDataItem, StudyMode, StudyBuddyMessage, Emotion, WeeklyEmotionReview } from '../types';
import { DEFAULT_ANALYSIS_RESULT } from '../constants';

const escapePrompt = (content: string, tag: string = "user_content") => {
    const cleanContent = content.replace(new RegExp(`</${tag}>`, 'g'), '');
    return `<${tag}>\n${cleanContent}\n</${tag}>`;
};

const SIMPLE_EXPLANATION_INSTRUCTION = "Keep your explanations very simple, like you are talking to a 5th grader (10-11 years old). Use easy words and helpful examples.";

const getAI = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  if (!apiKey) {
    console.error('[Gemini] Missing VITE_GEMINI_API_KEY. AI features will not work.');
  }
  return new GoogleGenAI({ apiKey });
};

// Helper: retry a function up to N times with delay
const retry = async <T>(fn: () => Promise<T>, retries = 2, delay = 3000): Promise<T> => {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      if (i === retries) throw err;
      // If rate limited (429), wait longer
      const waitTime = err?.status === 429 ? delay * (i + 2) : delay;
      await new Promise(r => setTimeout(r, waitTime));
    }
  }
  throw new Error("Retry failed");
};

// Helper: safely parse JSON from Gemini response
const safeParseJSON = (text: string | undefined): any => {
  if (!text) return null;
  let cleaned = text.trim();
  // Remove markdown code fences if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }
  return JSON.parse(cleaned);
};

export const getPersonalityAnalysis = async (answers: SurveyAnswers): Promise<AnalysisResult> => {
  try {
    const ai = getAI();
    
    const prompt = `You are an expert personality analyst for Malaysian secondary school students.
Analyze the following survey data and return a JSON object.

${escapePrompt(JSON.stringify(answers), "survey_data")}

You MUST return a valid JSON object with EXACTLY this structure (no extra keys, no missing keys):
{
  "studentProfile": {
    "disc": { "style": "string", "summary": "string" },
    "mbti": { "type": "string like INTJ", "summary": "string" },
    "enneagram": { "type": "string like Type 5", "summary": "string" },
    "bigFive": { "summary": "string", "traits": [{"name": "Openness", "score": 4}, {"name": "Conscientiousness", "score": 3}] },
    "hexaco": { "summary": "string", "traits": [{"name": "Honesty-Humility", "score": 4}] },
    "temperament": { "type": "string", "summary": "string" },
    "socialStyles": { "style": "string", "summary": "string" },
    "multipleIntelligences": { "topIntelligences": ["string", "string"], "summary": "string" }
  },
  "overallSummary": "A friendly 2-3 sentence summary written for a teenager",
  "recommendedStudyTechniques": ["technique1", "technique2", "technique3"],
  "personalityType": "A fun 2-3 word label like The Visionary",
  "emoji": "one emoji",
  "summary": {
    "coreStrengths": ["strength1", "strength2", "strength3"],
    "naturalTalents": ["talent1", "talent2"],
    "learningStyle": "one sentence",
    "workEnvironmentFit": "one sentence"
  },
  "careerRecommendations": [
    { "name": "Career Name", "match": 85, "why": "short reason", "skills": ["skill1", "skill2"], "salary": "RM40k-90k/year" }
  ],
  "otherCareerOptions": [
    { "name": "Career Name", "skills": ["skill1"], "salary": "RM range" }
  ],
  "learningPath": {
    "startWith": "first step",
    "thenMaster": "next step",
    "buildToward": "end goal"
  },
  "lifeSkills": ["skill1", "skill2", "skill3"],
  "specialSkills": ["skill1", "skill2"],
  "recommendedSports": ["sport1", "sport2"],
  "startupIdeas": [
    {
      "title": "Idea Name",
      "description": "short description",
      "targetMarket": "who it's for",
      "validationSteps": ["step1", "step2"],
      "challenges": ["challenge1"]
    }
  ]
}

IMPORTANT RULES:
- Return ONLY valid JSON, no extra text
- Include at least 3 careerRecommendations and 3 otherCareerOptions
- Make all summaries easy to read for a 15-year-old Malaysian student
- Use Malaysian context (RM for salary, local career examples)
- Keep the tone fun and encouraging`;

    const result = await retry(async () => {
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: prompt,
        config: { responseMimeType: "application/json" },
      });
      const parsed = safeParseJSON(response.text);
      if (!parsed || !parsed.studentProfile || !parsed.personalityType) {
        throw new Error("Invalid response structure from AI");
      }
      return parsed as AnalysisResult;
    });

    return result;
  } catch (error) {
    console.error("Error in getPersonalityAnalysis:", error);
    // Return default instead of crashing
    console.warn("Using default analysis result as fallback");
    return DEFAULT_ANALYSIS_RESULT;
  }
};

export const getSkillRecommendations = async (personalityType: string, goal: Goal, careerPaths: string[]): Promise<SkillSuggestion> => {
    try {
        const ai = getAI();
        const prompt = `Recommend 5 skills for a Malaysian student. Personality: ${personalityType}, Goal: ${goal}, Interests: ${careerPaths.join(', ')}. ${SIMPLE_EXPLANATION_INSTRUCTION} Return JSON with keys: skills (array of {name, description, relevance}).`;
        const response = await retry(() => ai.models.generateContent({ model: "gemini-2.5-flash-lite", contents: prompt, config: { responseMimeType: "application/json" } }));
        return safeParseJSON(response.text) || { skills: [] };
    } catch (error) { console.error("Skill recommendations failed:", error); return { skills: [] } as any; }
};

export const generateCourseOutline = async (topic: string, difficulty: CourseDifficulty): Promise<CourseOutline> => {
    try {
        const ai = getAI();
        const prompt = `Create a course outline for: ${topic} (${difficulty}). ${SIMPLE_EXPLANATION_INSTRUCTION} Return as JSON.`;
        const response = await retry(() => ai.models.generateContent({ model: "gemini-2.5-flash-lite", contents: prompt, config: { responseMimeType: "application/json" } }));
        return safeParseJSON(response.text) || {};
    } catch (error) { console.error("Course outline failed:", error); throw error; }
};

export const generatePlaceholderVideo = async (prompt: string): Promise<string> => {
    const ai = getAI();
    const response = await retry(() => ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: `You are an educational content creator. Create a lesson brief for a short educational video about: "${prompt}". Return ONLY a valid JSON object with exactly these keys: "title" (string), "duration" (string like "3 min"), "objective" (one-sentence learning goal), "keyPoints" (array of 3-4 strings), "script" (2-3 paragraph narration), "visualNotes" (string describing visuals/animations).`,
        config: { responseMimeType: 'application/json' },
    }));
    if (!response.text) throw new Error('No content generated');
    return response.text;
};

export const getAdminAssistance = async (prompt: string, studentData?: StudentDataItem[]): Promise<AdminAssistanceResult> => {
    try {
        const ai = getAI();
        const fullPrompt = `System: Harmony Admin Assistant. Context: ${studentData ? JSON.stringify(studentData) : "N/A"}. Request: ${prompt}`;
        const response = await retry(() => ai.models.generateContent({ model: "gemini-2.5-flash-lite", contents: fullPrompt }));
        return { text: response.text || '', groundingLinks: [] };
    } catch (error) { return { text: 'Sorry, assistant is temporarily unavailable.', groundingLinks: [] }; }
};

export const getGroundedCareerInfo = async (careerName: string, personalityType: string, location: string): Promise<GroundedCareerDetail> => {
    try {
        const ai = getAI();
        const prompt = `Provide career insights for: Career: ${careerName}, Personality: ${personalityType}, Location: ${location}. ${SIMPLE_EXPLANATION_INSTRUCTION} Return a JSON object with keys: groundedExplanation, groundedSalaryRange, jobMarketTrends.`;
        const response = await retry(() => ai.models.generateContent({ model: "gemini-2.5-flash-lite", contents: prompt, config: { responseMimeType: "application/json" } }));
        try {
            const json = safeParseJSON(response.text);
            return { groundedExplanation: json?.groundedExplanation || "No explanation.", groundedSalaryRange: json?.groundedSalaryRange || "N/A", jobMarketTrends: json?.jobMarketTrends || "N/A", groundingLinks: [] };
        } catch (e) {
            return { groundedExplanation: response.text || "Done.", groundedSalaryRange: "N/A", jobMarketTrends: "N/A", groundingLinks: [] };
        }
    } catch (error) { return { groundedExplanation: "Career info temporarily unavailable.", groundedSalaryRange: "N/A", jobMarketTrends: "N/A", groundingLinks: [] }; }
};

export const analyzeImage = async (data: string, mimeType: string, prompt: string): Promise<string> => {
    try {
        const ai = getAI();
        const response = await retry(() => ai.models.generateContent({ model: 'gemini-2.5-flash-lite', contents: { parts: [{ inlineData: { data, mimeType } }, { text: prompt + " " + SIMPLE_EXPLANATION_INSTRUCTION }] } }));
        return response.text || "No analysis available.";
    } catch (error) { return "Image analysis temporarily unavailable."; }
};

export const editImage = async (data: string, mimeType: string, prompt: string): Promise<string> => {
    try {
        const ai = getAI();
        const response = await retry(() => ai.models.generateContent({ model: 'gemini-2.5-flash-lite', contents: { parts: [{ inlineData: { data, mimeType } }, { text: prompt }] } }));
        let imageBase64 = "";
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) { imageBase64 = part.inlineData.data || ''; break; }
            }
        }
        return imageBase64;
    } catch (error) { return ""; }
};

export const getWeeklyReview = async (emotions: Emotion[]): Promise<WeeklyEmotionReview> => {
    try {
        const ai = getAI();
        const prompt = `Review these emotions: ${emotions.join(', ')}. ${SIMPLE_EXPLANATION_INSTRUCTION} Return JSON: summary, reflectionQuestions, actionableTip.`;
        const response = await retry(() => ai.models.generateContent({ model: "gemini-2.5-flash-lite", contents: prompt, config: { responseMimeType: "application/json" } }));
        return safeParseJSON(response.text) || { summary: '', reflectionQuestions: [], actionableTip: '' };
    } catch (error) { return { summary: 'Review unavailable.', reflectionQuestions: [], actionableTip: 'Take a deep breath.' } as any; }
};

export const getStudyBuddyResponse = async (history: StudyBuddyMessage[], topic: string, mode: StudyMode, userText: string = ''): Promise<string> => {
    try {
        const ai = getAI();
        const prompt = `Mode: ${mode}. Topic: ${topic}. User: ${userText}. ${SIMPLE_EXPLANATION_INSTRUCTION}`;
        const response = await retry(() => ai.models.generateContent({ model: "gemini-2.5-flash-lite", contents: prompt }));
        return response.text || '';
    } catch (error) { return "Study buddy is taking a break. Try again in a moment!"; }
};

export const getLanguageTutorResponse = async (language: string, history: { role: 'user' | 'model'; text: string }[], userMessage: string): Promise<string> => {
    try {
        const ai = getAI();
        const prompt = `Language tutor for ${language}. Student: ${userMessage}. ${SIMPLE_EXPLANATION_INSTRUCTION}`;
        const response = await retry(() => ai.models.generateContent({ model: "gemini-2.5-flash-lite", contents: prompt }));
        return response.text || '';
    } catch (error) { return "Language tutor is temporarily unavailable."; }
};

export const askAIAboutNote = async (noteContent: string, userQuery: string, history: { role: 'user' | 'model'; text: string }[]): Promise<string> => {
    try {
        const ai = getAI();
        const prompt = `Note Context: ${escapePrompt(noteContent, "note")}. Query: ${userQuery}. ${SIMPLE_EXPLANATION_INSTRUCTION}`;
        const response = await retry(() => ai.models.generateContent({ model: "gemini-2.5-flash-lite", contents: prompt }));
        return response.text || '';
    } catch (error) { return "Note assistant is temporarily unavailable."; }
};

export const generatePodcastAudio = async (noteContent: string): Promise<string> => {
    const ai = getAI();

    // Step 1: Generate a concise, naturally-spoken narration script
    const scriptRes = await retry(() => ai.models.generateContent({
        model: 'gemini-2.5-flash-lite',
        contents: `Write a short, engaging podcast-style narration (80–120 words) summarising these notes. Write it as a single narrator speaking naturally, as if recording an audio overview. Do not include any markdown, headers, or speaker labels — just the spoken text.\n\nNotes:\n${noteContent.slice(0, 2000)}`,
    }));
    const script = scriptRes.text?.trim() || noteContent.slice(0, 300);

    // Step 2: Convert script to audio using Gemini TTS
    const ttsRes = await retry(() => ai.models.generateContent({
        model: 'gemini-2.5-flash-preview-tts',
        contents: [{ parts: [{ text: script }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } },
            },
        } as any,
    }));

    const audioData = ttsRes.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audioData) throw new Error('No audio data returned from TTS model');
    return audioData;
};
