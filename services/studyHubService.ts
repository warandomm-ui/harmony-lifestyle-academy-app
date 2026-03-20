/**
 * Study Hub Service - SECURED via Supabase Edge Function
 * All AI calls go through the ai-proxy edge function
 */
import { generateContent, callAI, retry } from './aiProxyService';

const STUDENT_SYSTEM = `You are a friendly Malaysian school tutor. 
RULES:
- Explain like talking to a Form 1-5 student (age 13-17)
- Use simple Bahasa Malaysia mixed with English (like how Malaysian students talk)
- Give examples from Malaysian context (RM for money, local places, SPM, etc.)
- Be encouraging, use emoji sparingly
- If student asks in BM, reply in BM. If English, reply in English.`;

// Extract text from PDF using Gemini via edge function
export const extractTextFromPDF = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer;
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);
        const result = await retry(async () => {
          const res = await callAI({
            action: 'generateContent',
            payload: {
              contents: [{
                parts: [
                  { inlineData: { data: base64, mimeType: "application/pdf" } },
                  { text: "Extract ALL text content from this PDF. Keep the structure (headings, paragraphs, lists, tables). Return the full text content only, no commentary." }
                ]
              }],
              model: 'gemini-2.5-flash-lite',
            },
          });
          return res.text;
        });
        resolve(result || "Tidak dapat membaca PDF ini.");
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Gagal membaca fail."));
    reader.readAsArrayBuffer(file);
  });
};
// AI Tutor - answer questions based on PDF content
export const askTutor = async (
  pdfContent: string, 
  question: string, 
  chatHistory: { role: 'user' | 'model'; text: string }[]
): Promise<string> => {
  const historyFormatted = chatHistory.slice(-10).map(m => 
    `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.text}`
  ).join('\n');
  
  const prompt = `${STUDENT_SYSTEM}

NOTA/TEXTBOOK CONTENT:
<content>
${pdfContent.slice(0, 30000)}
</content>

PREVIOUS CONVERSATION:
${historyFormatted}

STUDENT'S QUESTION: ${question}

Answer based on the content above. If the question is not related to the content, still try to help but mention it's outside the notes. Use examples and analogies a teenager would understand.`;

  return await generateContent(prompt) || "Maaf, tak dapat jawab sekarang. Cuba lagi!";
};
// Smart Notes - generate summary, key points, flashcards
export const generateSmartNotes = async (
  pdfContent: string, 
  noteType: 'summary' | 'keypoints' | 'flashcards' | 'mindmap'
): Promise<string> => {
  const typePrompts: Record<string, string> = {
    summary: `Buat RINGKASAN yang mudah faham dari content ini.\n## Tajuk Utama\nRingkasan 2-3 perenggan.\n## Perkara Penting\n- Point 1-3\n## Kesimpulan`,
    keypoints: `Extract SEMUA key points penting. Format: 🔑 **Point Utama**: Penerangan. 💡 **Kenapa penting**. 📝 **Contoh**. List minimum 8-10 key points.`,
    flashcards: `Buat 15 FLASHCARDS. Format: ❓ **Soalan** / ✅ **Jawapan** / 💡 **Tip ingat**. Soalan yang likely keluar exam.`,
    mindmap: `Buat MIND MAP text format. 🌟 TAJUK UTAMA ├── 📌 Subtopic ├── Detail. Comprehensive tapi mudah faham.`
  };
  
  const prompt = `${STUDENT_SYSTEM}\n\nCONTENT:\n<content>\n${pdfContent.slice(0, 30000)}\n</content>\n\nTASK: ${typePrompts[noteType]}\n\nGuna bahasa student Form 1-5 boleh faham. Mix BM dan English.`;
  return await generateContent(prompt) || "Tidak dapat generate nota. Cuba lagi.";
};
// Exam Practice - generate questions based on PDF
export const generateExamQuestions = async (
  pdfContent: string, 
  questionType: 'objective' | 'subjective' | 'mixed',
  difficulty: 'easy' | 'medium' | 'hard',
  count: number = 10
): Promise<string> => {
  const difficultyBM: Record<string, string> = {
    easy: 'Senang (Form 1-2 level)',
    medium: 'Sederhana (Form 3-4, PT3/SPM style)',
    hard: 'Susah (SPM level, soalan KBAT/HOTS)'
  };
  const typeInstructions: Record<string, string> = {
    objective: `Buat ${count} soalan OBJEKTIF (A/B/C/D). Format: Soalan + 4 pilihan + Jawapan + Penerangan.`,
    subjective: `Buat ${count} soalan SUBJEKTIF. Format: Soalan + Markah + Skema jawapan + Tips.`,
    mixed: `Buat ${count} soalan CAMPURAN: ${Math.ceil(count*0.6)} objektif + ${Math.floor(count*0.4)} subjektif.`
  };
  const prompt = `${STUDENT_SYSTEM}\n\nCONTENT:\n<content>\n${pdfContent.slice(0, 30000)}\n</content>\n\n${typeInstructions[questionType]}\nDIFFICULTY: ${difficultyBM[difficulty]}\nSoalan MESTI based on content. Ikut format SPM/PT3 Malaysia.`;
  return await generateContent(prompt) || "Tidak dapat generate soalan. Cuba lagi.";
};

// Check answer - student submit answer, AI marks it
export const checkAnswer = async (
  pdfContent: string,
  question: string,
  studentAnswer: string
): Promise<string> => {
  const prompt = `${STUDENT_SYSTEM}\n\nCONTENT:\n<content>\n${pdfContent.slice(0, 20000)}\n</content>\n\nSOALAN: ${question}\nJAWAPAN STUDENT: ${studentAnswer}\n\nMark jawapan student. Format:\n📊 **Markah**: [x/10]\n✅ **Betul**: [points]\n❌ **Kurang**: [points]\n📖 **Jawapan penuh**: [ideal]\n💡 **Tips**: [improve]\n\nBe encouraging even if wrong.`;
  return await generateContent(prompt) || "Tak dapat check jawapan. Cuba lagi.";
};
/**
 * Study Hub Service - SECURED via Supabase Edge Function
 * All AI calls go through the ai-proxy edge function
 */
import { generateContent, callAI, retry } from './aiProxyService';

const STUDENT_SYSTEM = `You are a friendly Malaysian school tutor. 
RULES:
- Explain like talking to a Form 1-5 student (age 13-17)
- Use simple Bahasa Malaysia mixed with English (like how Malaysian students talk)
- Give examples from Malaysian context (RM for money, local places, SPM, etc.)
- Be encouraging, use emoji sparingly
- If student asks in BM, reply in BM. If English, reply in English.`;

// Extract text from PDF using Gemini via edge function
export const extractTextFromPDF = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer;
        const bytes = new Uint8Array(arrayBuffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);
        const result = await retry(async () => {
          const res = await callAI({
            action: 'generateContent',
            payload: {
              contents: [{
                parts: [
                  { inlineData: { data: base64, mimeType: "application/pdf" } },
                  { text: "Extract ALL text content from this PDF. Keep the structure (headings, paragraphs, lists, tables). Return the full text content only, no commentary." }
                ]
              }],
              model: 'gemini-2.0-flash',
            },
          });
          return res.text;
        });
        resolve(result || "Tidak dapat membaca PDF ini.");
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error("Gagal membaca fail."));
    reader.readAsArrayBuffer(file);
  });
};
// AI Tutor - answer questions based on PDF content
export const askTutor = async (
  pdfContent: string, 
  question: string, 
  chatHistory: { role: 'user' | 'model'; text: string }[]
): Promise<string> => {
  const historyFormatted = chatHistory.slice(-10).map(m => 
    `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.text}`
  ).join('\n');
  
  const prompt = `${STUDENT_SYSTEM}

NOTA/TEXTBOOK CONTENT:
<content>
${pdfContent.slice(0, 30000)}
</content>

PREVIOUS CONVERSATION:
${historyFormatted}

STUDENT'S QUESTION: ${question}

Answer based on the content above. If the question is not related to the content, still try to help but mention it's outside the notes. Use examples and analogies a teenager would understand.`;

  return await generateContent(prompt) || "Maaf, tak dapat jawab sekarang. Cuba lagi!";
};
// Smart Notes - generate summary, key points, flashcards
export const generateSmartNotes = async (
  pdfContent: string, 
  noteType: 'summary' | 'keypoints' | 'flashcards' | 'mindmap'
): Promise<string> => {
  const typePrompts: Record<string, string> = {
    summary: `Buat RINGKASAN yang mudah faham dari content ini.\n## Tajuk Utama\nRingkasan 2-3 perenggan.\n## Perkara Penting\n- Point 1-3\n## Kesimpulan`,
    keypoints: `Extract SEMUA key points penting. Format: 🔑 **Point Utama**: Penerangan. 💡 **Kenapa penting**. 📝 **Contoh**. List minimum 8-10 key points.`,
    flashcards: `Buat 15 FLASHCARDS. Format: ❓ **Soalan** / ✅ **Jawapan** / 💡 **Tip ingat**. Soalan yang likely keluar exam.`,
    mindmap: `Buat MIND MAP text format. 🌟 TAJUK UTAMA ├── 📌 Subtopic ├── Detail. Comprehensive tapi mudah faham.`
  };
  
  const prompt = `${STUDENT_SYSTEM}\n\nCONTENT:\n<content>\n${pdfContent.slice(0, 30000)}\n</content>\n\nTASK: ${typePrompts[noteType]}\n\nGuna bahasa student Form 1-5 boleh faham. Mix BM dan English.`;
  return await generateContent(prompt) || "Tidak dapat generate nota. Cuba lagi.";
};
// Exam Practice - generate questions based on PDF
export const generateExamQuestions = async (
  pdfContent: string, 
  questionType: 'objective' | 'subjective' | 'mixed',
  difficulty: 'easy' | 'medium' | 'hard',
  count: number = 10
): Promise<string> => {
  const difficultyBM: Record<string, string> = {
    easy: 'Senang (Form 1-2 level)',
    medium: 'Sederhana (Form 3-4, PT3/SPM style)',
    hard: 'Susah (SPM level, soalan KBAT/HOTS)'
  };
  const typeInstructions: Record<string, string> = {
    objective: `Buat ${count} soalan OBJEKTIF (A/B/C/D). Format: Soalan + 4 pilihan + Jawapan + Penerangan.`,
    subjective: `Buat ${count} soalan SUBJEKTIF. Format: Soalan + Markah + Skema jawapan + Tips.`,
    mixed: `Buat ${count} soalan CAMPURAN: ${Math.ceil(count*0.6)} objektif + ${Math.floor(count*0.4)} subjektif.`
  };
  const prompt = `${STUDENT_SYSTEM}\n\nCONTENT:\n<content>\n${pdfContent.slice(0, 30000)}\n</content>\n\n${typeInstructions[questionType]}\nDIFFICULTY: ${difficultyBM[difficulty]}\nSoalan MESTI based on content. Ikut format SPM/PT3 Malaysia.`;
  return await generateContent(prompt) || "Tidak dapat generate soalan. Cuba lagi.";
};

// Check answer - student submit answer, AI marks it
export const checkAnswer = async (
  pdfContent: string,
  question: string,
  studentAnswer: string
): Promise<string> => {
  const prompt = `${STUDENT_SYSTEM}\n\nCONTENT:\n<content>\n${pdfContent.slice(0, 20000)}\n</content>\n\nSOALAN: ${question}\nJAWAPAN STUDENT: ${studentAnswer}\n\nMark jawapan student. Format:\n📊 **Markah**: [x/10]\n✅ **Betul**: [points]\n❌ **Kurang**: [points]\n📖 **Jawapan penuh**: [ideal]\n💡 **Tips**: [improve]\n\nBe encouraging even if wrong.`;
  return await generateContent(prompt) || "Tak dapat check jawapan. Cuba lagi.";
};
