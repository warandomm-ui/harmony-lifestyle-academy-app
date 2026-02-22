import { GoogleGenAI } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY || '' });

const STUDENT_SYSTEM = `You are a friendly Malaysian school tutor. 
RULES:
- Explain like talking to a Form 1-5 student (age 13-17)
- Use simple Bahasa Malaysia mixed with English (like how Malaysian students talk)
- Give examples from Malaysian context (RM for money, local places, SPM, etc.)
- Be encouraging, use emoji sparingly
- If student asks in BM, reply in BM. If English, reply in English.`;

const retry = async <T>(fn: () => Promise<T>, retries = 2, delay = 2000): Promise<T> => {
  for (let i = 0; i <= retries; i++) {
    try { return await fn(); } 
    catch (err: any) {
      if (i === retries) throw err;
      await new Promise(r => setTimeout(r, err?.status === 429 ? delay * 3 : delay));
    }
  }
  throw new Error("Retry failed");
};

// Extract text from PDF using FileReader (client-side, no server needed)
export const extractTextFromPDF = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer;
        const bytes = new Uint8Array(arrayBuffer);
        // Convert to base64 for Gemini
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64 = btoa(binary);
        
        // Use Gemini to extract & understand the PDF content
        const ai = getAI();
        const response = await retry(() => ai.models.generateContent({
          model: "gemini-2.5-flash-preview-05-20",
          contents: [{
            parts: [
              { inlineData: { data: base64, mimeType: "application/pdf" } },
              { text: "Extract ALL text content from this PDF. Keep the structure (headings, paragraphs, lists, tables). Return the full text content only, no commentary." }
            ]
          }]
        }));
        
        resolve(response.text || "Tidak dapat membaca PDF ini.");
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
  const ai = getAI();
  
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

  const response = await retry(() => ai.models.generateContent({
    model: "gemini-2.5-flash-preview-05-20",
    contents: prompt
  }));
  
  return response.text || "Maaf, tak dapat jawab sekarang. Cuba lagi!";
};

// Smart Notes - generate summary, key points, flashcards
export const generateSmartNotes = async (
  pdfContent: string, 
  noteType: 'summary' | 'keypoints' | 'flashcards' | 'mindmap'
): Promise<string> => {
  const ai = getAI();
  
  const typePrompts: Record<string, string> = {
    summary: `Buat RINGKASAN yang mudah faham dari content ini.
Format:
## Tajuk Utama
Ringkasan 2-3 perenggan.

## Perkara Penting
- Point 1
- Point 2
- Point 3

## Kesimpulan
Satu perenggan penutup.`,
    
    keypoints: `Extract SEMUA key points penting dari content ini.
Format setiap point macam ni:
🔑 **Point Utama**: Penerangan ringkas
💡 **Kenapa penting**: Sebab...
📝 **Contoh**: ...

List minimum 8-10 key points.`,
    
    flashcards: `Buat 15 FLASHCARDS dari content ini untuk revision.
Format SETIAP flashcard:
---
❓ **Soalan**: [soalan]
✅ **Jawapan**: [jawapan ringkas]
💡 **Tip ingat**: [trick untuk ingat]
---

Buat soalan yang likely keluar dalam exam.`,
    
    mindmap: `Buat MIND MAP dalam format text dari content ini.
Format:
🌟 **TAJUK UTAMA**
├── 📌 Subtopic 1
│   ├── Detail A
│   ├── Detail B
│   └── Detail C
├── 📌 Subtopic 2
│   ├── Detail D
│   └── Detail E
└── 📌 Subtopic 3
    ├── Detail F
    └── Detail G

Buat comprehensive tapi mudah faham.`
  };
  
  const prompt = `${STUDENT_SYSTEM}

CONTENT DARI NOTA/TEXTBOOK:
<content>
${pdfContent.slice(0, 30000)}
</content>

TASK: ${typePrompts[noteType]}

IMPORTANT: Guna bahasa yang student Form 1-5 boleh faham. Mix BM dan English macam biasa student cakap.`;

  const response = await retry(() => ai.models.generateContent({
    model: "gemini-2.5-flash-preview-05-20",
    contents: prompt
  }));
  
  return response.text || "Tidak dapat generate nota. Cuba lagi.";
};

// Exam Practice - generate questions based on PDF
export const generateExamQuestions = async (
  pdfContent: string, 
  questionType: 'objective' | 'subjective' | 'mixed',
  difficulty: 'easy' | 'medium' | 'hard',
  count: number = 10
): Promise<string> => {
  const ai = getAI();
  
  const difficultyBM: Record<string, string> = {
    easy: 'Senang (Form 1-2 level)',
    medium: 'Sederhana (Form 3-4 level, PT3/SPM style)',
    hard: 'Susah (SPM level, soalan KBAT/HOTS)'
  };
  
  const typeInstructions: Record<string, string> = {
    objective: `Buat ${count} soalan OBJEKTIF (multiple choice A/B/C/D).
Format setiap soalan:
**Soalan [nombor]:**
[soalan]

A) [pilihan]
B) [pilihan]
C) [pilihan]
D) [pilihan]

✅ **Jawapan: [huruf]**
📖 **Penerangan**: [kenapa jawapan tu betul]

---`,
    
    subjective: `Buat ${count} soalan SUBJEKTIF (structured/essay).
Format setiap soalan:
**Soalan [nombor]:** [markah]
[soalan]

📝 **Skema Jawapan:**
[jawapan lengkap dengan point-point]

💡 **Tips menjawab**: [tips untuk score full marks]

---`,
    
    mixed: `Buat ${count} soalan CAMPURAN:
- ${Math.ceil(count * 0.6)} soalan objektif (A/B/C/D)
- ${Math.floor(count * 0.4)} soalan subjektif

BAHAGIAN A: OBJEKTIF
Format: Soalan + 4 pilihan + Jawapan + Penerangan

BAHAGIAN B: SUBJEKTIF  
Format: Soalan + Markah + Skema jawapan + Tips`
  };
  
  const prompt = `${STUDENT_SYSTEM}

CONTENT DARI NOTA/TEXTBOOK:
<content>
${pdfContent.slice(0, 30000)}
</content>

TASK: ${typeInstructions[questionType]}

DIFFICULTY: ${difficultyBM[difficulty]}

RULES:
- Soalan MESTI based on content yang diberi
- Ikut format SPM/PT3 Malaysia
- Bagi penerangan untuk setiap jawapan (supaya student belajar, bukan sekadar jawab)
- Soalan kena cover pelbagai bahagian dalam content, jangan focus satu topic je`;

  const response = await retry(() => ai.models.generateContent({
    model: "gemini-2.5-flash-preview-05-20",
    contents: prompt
  }));
  
  return response.text || "Tidak dapat generate soalan. Cuba lagi.";
};

// Check answer - student submit answer, AI marks it
export const checkAnswer = async (
  pdfContent: string,
  question: string,
  studentAnswer: string
): Promise<string> => {
  const ai = getAI();
  
  const prompt = `${STUDENT_SYSTEM}

CONTENT:
<content>
${pdfContent.slice(0, 20000)}
</content>

SOALAN: ${question}

JAWAPAN STUDENT: ${studentAnswer}

TASK: Mark jawapan student ni.
Format:
📊 **Markah**: [x/10] atau [Betul/Salah untuk objektif]
✅ **Apa yang betul**: [point yang student dah jawab betul]
❌ **Apa yang kurang**: [point yang tertinggal atau salah]
📖 **Jawapan penuh**: [jawapan ideal]
💡 **Tips**: [cara improve jawapan]

Be encouraging even if answer is wrong. Help student learn, don't just mark.`;

  const response = await retry(() => ai.models.generateContent({
    model: "gemini-2.5-flash-preview-05-20",
    contents: prompt
  }));
  
  return response.text || "Tak dapat check jawapan. Cuba lagi.";
};
