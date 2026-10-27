import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'),
      timestamp: new Date().toISOString()
    });
  });

  // AI Question Generation endpoint for Teacher Mode
  app.post('/api/generate-questions', async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      const { missionId = 1, topic, difficulty = 'sedang', count = 3 } = req.body;

      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        return res.status(400).json({
          error: 'Kunci API Gemini belum dikonfigurasi di secrets/lingkungan. Silakan gunakan bank soal manual atau konfigurasikan GEMINI_API_KEY.',
          isConfigured: false
        });
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `Anda adalah Guru Matematika SMK Kelas X Fase E dan Ahli Soal Interaktif.
Buatkan ${count} butir soal pilihan ganda tentang Sifat-Sifat Bilangan Berpangkat (Materi SMK Kelas X Fase E) untuk Misi ${missionId}.
Topik: ${topic || 'Sifat-sifat eksponen perkalian, pembagian, pemangkatan, nol, dan negatif'}.
Tingkat Kesulitan: ${difficulty}.

Aturan penting:
1. Notasi matematika harus jelas, gunakan superskrip seperti 2³, 5⁻², (3²)⁴ agar mudah dibaca di layar HP/game.
2. Setiap soal memiliki 4 pilihan jawaban yang masuk akal (hanya satu yang benar).
3. Berikan pembahasan matematis langkah demi langkah yang akurat dan menyebutkan sifat yang digunakan (misal aᵐ × aⁿ = aᵐ⁺ⁿ).
4. Indeks jawaban benar (correctIndex) adalah 0, 1, 2, atau 3.
5. Format keluaran harus berupa array JSON sesuai skema yang diminta.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                missionId: { type: Type.INTEGER },
                topic: { type: Type.STRING },
                questionText: { type: Type.STRING },
                mathExpression: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING }
                },
                correctIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING },
                ruleUsed: { type: Type.STRING },
                difficulty: { type: Type.STRING }
              },
              required: ['questionText', 'mathExpression', 'options', 'correctIndex', 'explanation', 'ruleUsed']
            }
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Tidak ada respon dari model AI.');
      }

      const questions = JSON.parse(responseText);

      // Sanitize and validate
      const validatedQuestions = questions.map((q: any, idx: number) => ({
        id: `ai-${Date.now()}-${idx}`,
        missionId: Number(missionId) || 1,
        topic: q.topic || 'Sifat Bilangan Berpangkat',
        questionText: q.questionText || 'Sederhanakan operasi eksponen berikut:',
        mathExpression: q.mathExpression || '2³ × 2²',
        options: Array.isArray(q.options) && q.options.length >= 4 
          ? q.options.slice(0, 4) 
          : ['2⁵', '2⁶', '4⁵', '2¹'],
        correctIndex: typeof q.correctIndex === 'number' && q.correctIndex >= 0 && q.correctIndex <= 3 
          ? q.correctIndex 
          : 0,
        explanation: q.explanation || 'Gunakan sifat dasar bilangan berpangkat.',
        ruleUsed: q.ruleUsed || 'aᵐ × aⁿ = aᵐ⁺ⁿ',
        difficulty: ['mudah', 'sedang', 'sulit'].includes(q.difficulty) ? q.difficulty : difficulty
      }));

      return res.json({
        success: true,
        questions: validatedQuestions
      });
    } catch (err: any) {
      console.error('Gemini API Question Generation Error:', err);
      return res.status(500).json({
        error: err.message || 'Gagal membuat soal melalui AI.',
        details: err.toString()
      });
    }
  });

  // Setup Vite in development or serve static in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('index.html', { root: 'dist' });
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MATH AIR FORCE Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
