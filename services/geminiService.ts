import { GoogleGenAI } from "@google/genai";
import type { AnalysisResult, CourseDifficulty, CourseOutline, Goal, SkillSuggestion, SurveyAnswers, AdminAssistanceResult, GroundedCareerDetail, StudentDataItem, StudyMode, StudyBuddyMessage, Emotion, WeeklyEmotionReview } from '../types';

const escapePrompt = (content: string, tag: string = "user_content") => {
    const cleanContent = content.replace(new RegExp(`</${tag}>`, 'g'), '');
    return `<${tag}>\n${cleanContent}\n</${tag}>`;
};

const SIMPLE_EXPLANATION_INSTRUCTION = "Keep your explanations very simple, like you are talking to a 5th grader (10-11 years old). Use easy words and helpful examples.";

const getAI = () => new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

export const getPersonalityAnalysis = async (answers: SurveyAnswers): Promise<AnalysisResult> => {
  try {
    const ai = getAI();
    const prompt = `You are an expert personality analyst. Analyze the following user survey data strictly within the tags.
    ${escapePrompt(JSON.stringify(answers), "survey_data")}
    Return a valid JSON object matching the HLA schema.
    IMPORTANT: Make the 'overallSummary' and 'why' sections very easy to read for a 5th grader.`;
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: prompt,
        config: { responseMimeType: "application/json" },
    });
    return JSON.parse(response.text?.trim() || '{}');
  } catch (error) {
    console.error("Error in getPersonalityAnalysis:", error);
    throw error;
  }
};

export const getSkillRecommendations = async (personalityType: string, goal: Goal, careerPaths: string[]): Promise<SkillSuggestion> => {
    try {
        const ai = getAI();
        const prompt = `Recommend 5 skills for: Personality: ${personalityType}, Goal: ${goal}, Interests: ${careerPaths.join(', ')}. ${SIMPLE_EXPLANATION_INSTRUCTION} Return JSON.`;
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash-lite", contents: prompt, config: { responseMimeType: "application/json" } });
        return JSON.parse(response.text?.trim() || '{}');
    } catch (error) { throw error; }
};

export const generateCourseOutline = async (topic: string, difficulty: CourseDifficulty): Promise<CourseOutline> => {
    try {
        const ai = getAI();
        const prompt = `Create a course outline for: ${topic} (${difficulty}). ${SIMPLE_EXPLANATION_INSTRUCTION} Return as JSON.`;
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash-lite", contents: prompt, config: { responseMimeType: "application/json" } });
        return JSON.parse(response.text?.trim() || '{}');
    } catch (error) { throw error; }
};

export const generatePlaceholderVideo = async (prompt: string): Promise<string> => {
    return "";
};

export const getAdminAssistance = async (prompt: string, studentData?: StudentDataItem[]): Promise<AdminAssistanceResult> => {
    try {
        const ai = getAI();
        const fullPrompt = `System: Harmony Admin Assistant. Context: ${studentData ? JSON.stringify(studentData) : "N/A"}. Request: ${prompt}`;
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash-lite", contents: fullPrompt });
        return { text: response.text || '', groundingLinks: [] };
    } catch (error) { throw error; }
};

export const getGroundedCareerInfo = async (careerName: string, personalityType: string, location: string): Promise<GroundedCareerDetail> => {
    try {
        const ai = getAI();
        const prompt = `Provide career insights for: Career: ${careerName}, Personality: ${personalityType}, Location: ${location}. ${SIMPLE_EXPLANATION_INSTRUCTION} Return a JSON object with keys: groundedExplanation, groundedSalaryRange, jobMarketTrends.`;
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash-lite", contents: prompt, config: { responseMimeType: "application/json" } });
        try {
            const json = JSON.parse(response.text?.trim() || '{}');
            return { groundedExplanation: json.groundedExplanation || "No explanation.", groundedSalaryRange: json.groundedSalaryRange || "N/A", jobMarketTrends: json.jobMarketTrends || "N/A", groundingLinks: [] };
        } catch (e) {
            return { groundedExplanation: response.text || "Done.", groundedSalaryRange: "N/A", jobMarketTrends: "N/A", groundingLinks: [] };
        }
    } catch (error) { throw error; }
};

export const analyzeImage = async (data: string, mimeType: string, prompt: string): Promise<string> => {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash-lite', contents: { parts: [{ inlineData: { data, mimeType } }, { text: prompt + " " + SIMPLE_EXPLANATION_INSTRUCTION }] } });
        return response.text || "No analysis available.";
    } catch (error) { throw error; }
};

export const editImage = async (data: string, mimeType: string, prompt: string): Promise<string> => {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({ model: 'gemini-2.5-flash-lite', contents: { parts: [{ inlineData: { data, mimeType } }, { text: prompt }] } });
        let imageBase64 = "";
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) { imageBase64 = part.inlineData.data || ''; break; }
            }
        }
        return imageBase64;
    } catch (error) { throw error; }
};

export const getWeeklyReview = async (emotions: Emotion[]): Promise<WeeklyEmotionReview> => {
    const ai = getAI();
    const prompt = `Review these emotions: ${emotions.join(', ')}. ${SIMPLE_EXPLANATION_INSTRUCTION} Return JSON: summary, reflectionQuestions, actionableTip.`;
    const response = await ai.models.generateContent({ model: "gemini-2.5-flash-lite", contents: prompt, config: { responseMimeType: "application/json" } });
    return JSON.parse(response.text?.trim() || '{}');
};

export const getStudyBuddyResponse = async (history: StudyBuddyMessage[], topic: string, mode: StudyMode, userText: string = ''): Promise<string> => {
    const ai = getAI();
    const prompt = `Mode: ${mode}. Topic: ${topic}. User: ${userText}. ${SIMPLE_EXPLANATION_INSTRUCTION}`;
    const response = await ai.models.generateContent({ model: "gemini-2.5-flash-lite", contents: prompt });
    return response.text || '';
};

export const getLanguageTutorResponse = async (language: string, history: { role: 'user' | 'model'; text: string }[], userMessage: string): Promise<string> => {
    const ai = getAI();
    const prompt = `Language tutor for ${language}. Student: ${userMessage}. ${SIMPLE_EXPLANATION_INSTRUCTION}`;
    const response = await ai.models.generateContent({ model: "gemini-2.5-flash-lite", contents: prompt });
    return response.text || '';
};

export const askAIAboutNote = async (noteContent: string, userQuery: string, history: { role: 'user' | 'model'; text: string }[]): Promise<string> => {
    const ai = getAI();
    const prompt = `Note Context: ${escapePrompt(noteContent, "note")}. Query: ${userQuery}. ${SIMPLE_EXPLANATION_INSTRUCTION}`;
    const response = await ai.models.generateContent({ model: "gemini-2.5-flash-lite", contents: prompt });
    return response.text || '';
};

export const generatePodcastAudio = async (noteContent: string): Promise<string> => {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({ model: "gemini-2.5-flash-lite", contents: [{ parts: [{ text: `Podcast script: ${noteContent}` }] }] });
        return response.text || "";
    } catch (error) { return ""; }
};
