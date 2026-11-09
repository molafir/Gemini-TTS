import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

app.use(express.json({ limit: '10mb' }));

// Initialize GoogleGenAI client with required User-Agent and v1alpha apiVersion for TTS models
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    apiVersion: 'v1alpha',
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * Text-to-Speech endpoint using gemini-3.8-flash-tts
 * Enhanced with authentic Balochi phonological & poetic directives
 */
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text, voiceName = 'Fenrir', stylePrompt, isBalochi = true } = req.body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required for TTS recitation.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured. Please ensure your API key is configured in Settings > Secrets.',
        model: 'gemini-3.8-flash-tts',
      });
    }

    // gemini-3.8-flash-tts supports prebuilt voices (Fenrir, Puck, Kore, Zephyr, Charon, Aoede)
    const validVoice = ['Fenrir', 'Puck', 'Kore', 'Zephyr', 'Charon', 'Aoede'].includes(voiceName)
      ? voiceName
      : 'Fenrir';

    // Clean speech text directly: TTS models vocalize whatever is in parts[0].text verbatim.
    // To ensure no English instructions or preambles are spoken, we pass purely the Balochi text.
    const cleanSpeechText = text.trim();

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: cleanSpeechText,
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: validVoice },
          },
        },
      },
    });

    const candidate = response.candidates?.[0];
    const audioPart = candidate?.content?.parts?.find((p: any) => p.inlineData?.data);

    if (!audioPart || !audioPart.inlineData?.data) {
      console.error('TTS returned no audio part:', JSON.stringify(response, null, 2));
      return res.status(500).json({
        error: 'Failed to generate audio from gemini-3.8-flash-tts. No audio track returned.',
      });
    }

    const mimeType = audioPart.inlineData.mimeType || 'audio/wav';
    const base64Data = audioPart.inlineData.data;

    return res.json({
      success: true,
      audioData: `data:${mimeType};base64,${base64Data}`,
      mimeType,
      voice: validVoice,
      model: 'gemini-3.8-flash-tts',
    });
  } catch (error: any) {
    console.error('Error generating speech with gemini-3.8-flash-tts:', error);
    const errorMessage = error?.message || 'Speech synthesis failed';
    const status = error?.status || 500;
    return res.status(status).json({
      error: errorMessage,
      model: 'gemini-3.8-flash-tts',
    });
  }
});

/**
 * Balochi Poetry Generation Endpoint using gemini-3.8-flash
 */
app.post('/api/compose-poem', async (req: Request, res: Response) => {
  try {
    const {
      theme = 'دلیری و غیرت بلوچ',
      form = 'غزل و دو بیتی حماسی',
      dialect = 'مکرانی',
      mood = 'حماسی و انگیزشی',
      customTopic = '',
      verseCount = 4,
    } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'GEMINI_API_KEY is not configured.' });
    }

    const systemInstruction = `You are a renowned master Balochi poet and literary scholar (استاد و شاهر نامدار بلوچستان).
Your task is to compose authentic, beautiful, and linguistically accurate Balochi poetry.
Requirements:
1. Write in genuine Balochi language (not Persian or Urdu disguised as Balochi) with authentic vocabulary (like: مڑا، سرمچنڈ، بوجی، چئول، تلار، پند، زهیروک، وش‌اتکے، ورنا، گوات، دیوان، زر).
2. Follow traditional Balochi meter and rhyme patterns.
3. Provide Balochi text in traditional Arabic-Balochi script (with letters ݔ، ۏ، ئے، ء، ڈ، ٹ، ڑ).
4. Provide precise Romanized phonetic transliteration for every verse to guide accurate speech pronunciation.
5. Provide a faithful Persian (Farsi) translation for each verse.
6. Provide an insightful literary explanation and vocabulary breakdown.
Output must be strictly valid JSON.`;

    const userPrompt = `Compose an original Balochi poem:
- Theme / Subject: ${customTopic ? `${customTopic} (${theme})` : theme}
- Poetic Form: ${form}
- Dialect: ${dialect}
- Mood: ${mood}
- Number of couplets: ${verseCount}

Return JSON with this schema:
{
  "title": "Title in Balochi (عنوان به فارسی)",
  "poeticMeter": "وزن و ریتم شعری",
  "dialect": "${dialect}",
  "verses": [
    {
      "balochi": "مصرع اول ... مصرع دوم",
      "transliteration": "Phonetic Romanized script showing vowel elongation...",
      "translation": "معنی روان فارسی بیت"
    }
  ],
  "fullBalochiText": "All Balochi verses separated by line breaks for text-to-speech recitation",
  "explanation": "شرح ادبی مضمون و تشبیهات شعر به فارسی",
  "vocabulary": [
    { "word": "واژه اصیل بلوچی", "meaning": "معنی فارسی" }
  ]
}`;

    let responseText = '';
    const contents = [{ role: 'user' as const, parts: [{ text: userPrompt }] }];

    try {
      // Use gemini-3.1-flash-lite for instant, high-reliability generation without 503 load spikes
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents,
        config: systemInstruction ? { systemInstruction } : undefined,
      });
      responseText = response.text || '{}';
    } catch (primaryErr: any) {
      console.warn('Error with gemini-3.1-flash-lite, trying gemini-3.8-flash:', primaryErr?.message);
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: systemInstruction ? { systemInstruction } : undefined,
      });
      responseText = fallbackResponse.text || '{}';
    }

    let parsed: any;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(responseText);
      }
    } catch (parseErr) {
      console.error('Failed to parse poem JSON:', responseText);
      throw new Error('Poem generation returned non-JSON output');
    }

    return res.json({ success: true, poem: parsed });
  } catch (error: any) {
    console.error('Error in /api/compose-poem:', error);
    return res.status(500).json({ error: error?.message || 'Failed to compose Balochi poem' });
  }
});

/**
 * Balochi Text & Poetry Analysis Endpoint using gemini-3.8-flash (with gemini-3.1-flash-lite fallback)
 * Analyzes custom Balochi text, adds phonetic transliteration, Persian translation, and recitation prep
 */
app.post('/api/analyze-balochi', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Balochi text is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'GEMINI_API_KEY is not configured.' });
    }

    const systemInstruction = `You are a native Balochi literary scholar and phoneticist.
Analyze the provided Balochi text/poetry:
1. Parse it verse by verse.
2. Provide exact Romanized phonetic transcription indicating long vowels and retroflex consonants (d, t, r) so the user and TTS engine can recite it with complete accuracy.
3. Provide a Persian (Farsi) translation for each verse.
4. Prepare an optimized Balochi recitation script with clean hemistich separations.
5. Extract key Balochi vocabulary terms with their Persian definitions.
Output must be strictly valid JSON without any markdown formatting or commentary.`;

    const userPrompt = `Analyze this Balochi poetry:
"""
${text.trim()}
"""

Return JSON with this schema:
{
  "verses": [
    {
      "balochi": "Original verse",
      "transliteration": "Phonetic transliteration",
      "translation": "معنی فارسی بیت"
    }
  ],
  "optimizedRecitationText": "Cleaned Balochi text formatted with line breaks for reciting",
  "phoneticGuide": "نکات تلفظ حروف خاص بلوچی و ریتم دکلمه",
  "vocabulary": [
    { "word": "واژه", "meaning": "معنی فارسی" }
  ]
}`;

    let responseText = '';
    const contents = [{ role: 'user' as const, parts: [{ text: userPrompt }] }];

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents,
        config: systemInstruction ? { systemInstruction } : undefined,
      });
      responseText = response.text || '{}';
    } catch (primaryErr: any) {
      console.warn('Error with gemini-3.1-flash-lite, trying gemini-3.8-flash:', primaryErr?.message);
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: systemInstruction ? { systemInstruction } : undefined,
      });
      responseText = fallbackResponse.text || '{}';
    }

    let parsed: any;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(responseText);
      }
    } catch (parseErr) {
      console.error('Failed to parse analysis JSON:', responseText);
      throw new Error('Analysis returned non-JSON output');
    }

    return res.json({ success: true, analysis: parsed });
  } catch (error: any) {
    console.error('Error in /api/analyze-balochi:', error);
    return res.status(500).json({ error: error?.message || 'Failed to analyze Balochi text' });
  }
});

/**
 * Multi-Speaker Tagging & Segmentation Endpoint
 * Analyzes any Balochi poem or text, automatically partitions and tags verses for multiple speakers
 */
app.post('/api/multi-speaker-tag', async (req: Request, res: Response) => {
  try {
    const { text, speakerCount = 2, mode = 'dialogue' } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required for multi-speaker tagging' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({ error: 'GEMINI_API_KEY is not configured.' });
    }

    const systemInstruction = `You are an expert native Balochi theatrical and literary director specializing in Balochi poetic recitation (شاهری و دیوان بلوچی).
Your job is to take a Balochi poem or text and intelligently segment, partition, and tag it for ${speakerCount} distinct speakers for dramatic multi-speaker audio recitation (دکلمه چندصدایی / مناظره و همخوانی).
Rules:
1. Divide the text into logical lines, couplets, or call-and-response hemistichs.
2. Assign each segment to one of the speakers:
   - Speaker 1 (e.g. پیر شاهری / راوی - Voice: Charon or Fenrir)
   - Speaker 2 (e.g. جوان سلحشور / ورنا - Voice: Puck or Aoede)
   - Speaker 3 (if 3 speakers: e.g. بانوی راوی / هم‌سرا - Voice: Aoede or Kore)
3. Alternate or assign according to natural dramatic dialogue, question/answer, or narrator vs actor.
4. For each segment, provide:
   - id: unique segment id like "seg-1"
   - speakerId: "spk1" or "spk2" (or "spk3")
   - speakerName: Role name in Persian/Balochi
   - assignedVoice: One of ['Fenrir', 'Puck', 'Charon', 'Aoede', 'Kore', 'Zephyr']
   - balochiText: The exact Balochi verses/lines
   - transliteration: Latinized phonetic reading
   - translation: Persian translation of this line
   - deliveryHint: Emotional or cadence cue (e.g. "حماسی و باصلابت", "پرشور و شتابان", "محزون و پرسشگر")
Output strictly valid JSON without any markdown code fences.`;

    const userPrompt = `Partition and tag this Balochi poetry for ${speakerCount} speakers in ${mode} mode:
"""
${text.trim()}
"""

Return JSON format:
{
  "speakers": [
    { "id": "spk1", "name": "پیر دانا / راوی", "voice": "Charon", "role": "راوی و پیر دانا", "color": "amber" },
    { "id": "spk2", "name": "ورنا / جوان بلوچ", "voice": "Puck", "role": "جوان پرشور و سلحشور", "color": "cyan" }
  ],
  "segments": [
    {
      "id": "seg-1",
      "speakerId": "spk1",
      "speakerName": "پیر دانا / راوی",
      "assignedVoice": "Charon",
      "balochiText": "او مڑا داریں بلوچ! او سرمَچنڈیں نامدار",
      "transliteration": "Ō maṛā-dārē̃ Balōch! Ō sarmachinḍē̃ nāmdār",
      "translation": "ای بلوچ صاحب غیرت! ای سلحشور نامدار",
      "deliveryHint": "حماسی و باصلابت"
    }
  ]
}`;

    let responseText = '';
    const contents = [{ role: 'user' as const, parts: [{ text: userPrompt }] }];

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents,
        config: systemInstruction ? { systemInstruction } : undefined,
      });
      responseText = response.text || '{}';
    } catch (primaryErr: any) {
      console.warn('Error in multi-speaker-tag with 3.1-lite, trying 3.8-flash:', primaryErr?.message);
      const fallbackResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: systemInstruction ? { systemInstruction } : undefined,
      });
      responseText = fallbackResponse.text || '{}';
    }

    let parsed: any;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(responseText);
      }
    } catch (parseErr) {
      console.error('Failed to parse multi-speaker JSON:', responseText);
      throw new Error('Multi-speaker tagging returned non-JSON output');
    }

    return res.json({ success: true, multiSpeakerData: parsed });
  } catch (error: any) {
    console.error('Error in /api/multi-speaker-tag:', error);
    return res.status(500).json({ error: error?.message || 'Failed to partition and tag text' });
  }
});

/**
 * Multi-turn Chat endpoint using Gemini models
 * Supports: 'gemini-3.8-flash' (general/literary) and 'gemini-3.1-flash-lite' (fast tasks)
 */
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { history = [], message, model = 'gemini-3.8-flash', systemInstruction } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message text is required.' });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'GEMINI_API_KEY is not configured. Please ensure your API key is configured in Settings > Secrets.',
      });
    }

    const targetModel = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'].includes(model)
      ? model
      : 'gemini-3.8-flash';

    // Format conversation history for Gemini API: first turn MUST be 'user'
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];
    let hasUserStarted = false;

    for (const msg of history) {
      if (msg.role === 'user' && msg.text) {
        hasUserStarted = true;
        contents.push({
          role: 'user',
          parts: [{ text: msg.text }],
        });
      } else if (msg.role === 'model' && msg.text && hasUserStarted) {
        contents.push({
          role: 'model',
          parts: [{ text: msg.text }],
        });
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: message.trim() }],
    });

    let replyText = '';
    let usedModel = targetModel;

    try {
      const response = await ai.models.generateContent({
        model: targetModel,
        contents,
        config: systemInstruction
          ? {
              systemInstruction,
            }
          : undefined,
      });
      replyText = response.text || '';
    } catch (primaryErr: any) {
      console.warn(`Primary model ${targetModel} error, trying fallback gemini-3.1-flash-lite:`, primaryErr?.message);
      if (targetModel !== 'gemini-3.1-flash-lite') {
        usedModel = 'gemini-3.1-flash-lite';
        const fallbackResponse = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents,
          config: systemInstruction
            ? {
                systemInstruction,
              }
            : undefined,
        });
        replyText = fallbackResponse.text || '';
      } else {
        throw primaryErr;
      }
    }

    return res.json({
      success: true,
      reply: replyText,
      model: usedModel,
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    const errorMessage = error?.message || 'Chat generation failed';
    const status = error?.status || 500;
    return res.status(status).json({
      error: errorMessage,
    });
  }
});

/**
 * Health & Config Status endpoint
 */
app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    ttsModel: 'gemini-3.8-flash-tts',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Vite dev server mounting in development or static hosting in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port} (mode: ${process.env.NODE_ENV || 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
