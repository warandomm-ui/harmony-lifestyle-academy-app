
import { GoogleGenAI, Type, Modality } from "@google/genai";
import type { AnalysisResult, CourseDifficulty, CourseOutline, Goal, SkillSuggestion, SurveyAnswers, AdminAssistanceResult, GroundedCareerDetail, StudentDataItem, StudyMode, StudyBuddyMessage, Emotion, WeeklyEmotionReview, SpiritualGuidanceResponse } from '../types';

/**
 * Security: Wraps user-provided content in unique XML tags to prevent prompt injection.
 */
const escapePrompt = (content: string, tag: string = "user_content") => {
    const cleanContent = content.replace(new RegExp(`</${tag}>`, 'g'), '');
    return `<${tag}>\n${cleanContent}\n</${tag}>`;
};

// Common instruction to ensure 5th-grade level understanding
const SIMPLE_EXPLANATION_INSTRUCTION = "Keep your explanations very simple, like you are talking to a 5th grader (10-11 years old). Use easy words and helpful examples.";

export const getPersonalityAnalysis = async (answers: SurveyAnswers): Promise<AnalysisResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
    You are an expert personality analyst. Analyze the following user survey data strictly within the tags.
    ${escapePrompt(JSON.stringify(answers), "survey_data")}
    Return a valid JSON object matching the HLA schema.
    IMPORTANT: Make the 'overallSummary' and 'why' sections very easy to read for a 5th grader.
    `;
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" },
    });
    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Error in getPersonalityAnalysis:", error);
    throw error;
  }
};

export const getSkillRecommendations = async (personalityType: string, goal: Goal, careerPaths: string[]): Promise<SkillSuggestion> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Recommend 5 skills for: Personality: ${personalityType}, Goal: ${goal}, Interests: ${careerPaths.join(', ')}. ${SIMPLE_EXPLANATION_INSTRUCTION} Return JSON.`;
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        throw error;
    }
};

export const generateCourseOutline = async (topic: string, difficulty: CourseDifficulty): Promise<CourseOutline> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Create a course outline for: ${topic} (${difficulty}). ${SIMPLE_EXPLANATION_INSTRUCTION} Return as JSON.`;
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: prompt,
            config: { responseMimeType: "application/json" }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        throw error;
    }
};

export const generatePlaceholderVideo = async (prompt: string): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-fast-generate-preview',
            prompt: `Cinematic conceptual video: ${prompt}`,
            config: { numberOfVideos: 1, resolution: '720p', aspectRatio: '16:9' }
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const videoBlob = await response.blob();
        return URL.createObjectURL(videoBlob);
    } catch (error) {
        console.error("Error in generatePlaceholderVideo:", error);
        throw error;
    }
};

export const getAdminAssistance = async (prompt: string, studentData?: StudentDataItem[]): Promise<AdminAssistanceResult> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const fullPrompt = `System: Harmony Admin Assistant. Context: ${studentData ? JSON.stringify(studentData) : "N/A"}. Request: ${prompt}`;
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: fullPrompt,
            config: {
                tools: [{googleSearch: {}}],
                thinkingConfig: { thinkingBudget: 16000 },
            },
        });
        return {
            text: response.text,
            groundingLinks: response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(c => c.web ? { uri: c.web.uri, title: c.web.title } : null).filter(Boolean) as any,
        };
    } catch (error) {
        throw error;
    }
};

export const getGroundedCareerInfo = async (careerName: string, personalityType: string, location: string): Promise<GroundedCareerDetail> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const prompt = `Provide grounded career insights for: Career: ${careerName}, Personality: ${personalityType}, Location: ${location}. ${SIMPLE_EXPLANATION_INSTRUCTION} 
        Return a JSON object with keys: groundedExplanation, groundedSalaryRange, jobMarketTrends.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-3-pro-preview",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
                responseMimeType: "application/json",
            },
        });

        const groundingLinks = response.candidates?.[0]?.groundingMetadata?.groundingChunks?.map(chunk => {
            if (chunk.web) {
                return { uri: chunk.web.uri, title: chunk.web.title || 'Web Source' };
            }
            return null;
        }).filter(Boolean) as { uri: string; title: string }[];

        try {
            const json = JSON.parse(response.text.trim());
            return {
                groundedExplanation: json.groundedExplanation || "No explanation provided.",
                groundedSalaryRange: json.groundedSalaryRange || "No salary data available.",
                jobMarketTrends: json.jobMarketTrends || "No trends data available.",
                groundingLinks,
            };
        } catch (e) {
            return {
                groundedExplanation: response.text || "Analysis complete.",
                groundedSalaryRange: "Check sources for details.",
                jobMarketTrends: "Consult search results.",
                groundingLinks,
            };
        }
    } catch (error) {
        throw error;
    }
};

export const analyzeImage = async (data: string, mimeType: string, prompt: string): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { inlineData: { data, mimeType } },
                    { text: prompt + " " + SIMPLE_EXPLANATION_INSTRUCTION }
                ]
            }
        });
        return response.text || "No analysis available.";
    } catch (error) {
        throw error;
    }
};

export const editImage = async (data: string, mimeType: string, prompt: string): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
                parts: [
                    { inlineData: { data, mimeType } },
                    { text: prompt }
                ]
            }
        });
        
        let imageBase64 = "";
        if (response.candidates?.[0]?.content?.parts) {
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    imageBase64 = part.inlineData.data;
                    break;
                }
            }
        }
        return imageBase64;
    } catch (error) {
        throw error;
    }
};

export const getWeeklyReview = async (emotions: Emotion[]): Promise<WeeklyEmotionReview> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Review these emotions: ${emotions.join(', ')}. ${SIMPLE_EXPLANATION_INSTRUCTION} Return JSON: summary, reflectionQuestions, actionableTip.`;
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: { responseMimeType: "application/json" },
    });
    return JSON.parse(response.text.trim());
};

export const getStudyBuddyResponse = async (history: StudyBuddyMessage[], topic: string, mode: StudyMode, userText: string = ''): Promise<any> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Mode: ${mode}. Topic: ${topic}. User: ${userText}. ${SIMPLE_EXPLANATION_INSTRUCTION} History: ${JSON.stringify(history.map(m => m.text))}`;
    const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt
    });
    return response.text;
};

export const getLanguageTutorResponse = async (language: string, history: { role: 'user' | 'model'; text: string }[], userMessage: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Language tutor for ${language}. Student: ${userMessage}. ${SIMPLE_EXPLANATION_INSTRUCTION}`;
    const response = await ai.models.generateContent({ model: "gemini-3-flash-preview", contents: prompt });
    return response.text;
};

export const askAIAboutNote = async (noteContent: string, userQuery: string, history: { role: 'user' | 'model'; text: string }[]): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `Note Context: ${escapePrompt(noteContent, "note")}. Query: ${userQuery}. ${SIMPLE_EXPLANATION_INSTRUCTION}`;
    const response = await ai.models.generateContent({ model: "gemini-3-flash-preview", contents: prompt });
    return response.text;
};

export const generatePodcastAudio = async (noteContent: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: `Podcast summary of: ${noteContent}. Talk clearly for a 5th grader.` }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                multiSpeakerVoiceConfig: {
                    speakerVoiceConfigs: [
                        { speaker: 'Host 1', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
                        { speaker: 'Host 2', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } }
                    ]
                }
            }
        }
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || "";
};
