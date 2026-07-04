import express from 'express';
import { SecretClient } from '@azure/keyvault-secrets';
import { DefaultAzureCredential } from '@azure/identity';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
const PORT = parseInt(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.static('.'));

const KEY_VAULT_URL = process.env.AZURE_KEY_VAULT_URL;
const GEMINI_SECRET_NAME = process.env.GEMINI_SECRET_NAME || 'GEMINI-API-KEY-PRIMARY';

let genAI = null;

async function getGeminiKey() {
  if (process.env.GEMINI_API_KEY) {
    return process.env.GEMINI_API_KEY;
  }
  if (KEY_VAULT_URL) {
    try {
      const credential = new DefaultAzureCredential();
      const client = new SecretClient(KEY_VAULT_URL, credential);
      const secret = await client.getSecret(GEMINI_SECRET_NAME);
      return secret.value;
    } catch (err) {
      console.error('Azure Key Vault fetch failed:', err.message);
    }
  }
  return null;
}

async function initGemini() {
  const key = await getGeminiKey();
  if (key) {
    genAI = new GoogleGenerativeAI(key);
    console.log('Gemini API initialized');
  } else {
    console.warn('No Gemini API key available — generators will be unavailable');
  }
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', geminiReady: !!genAI });
});

app.post('/api/generate/infographic', async (req, res) => {
  if (!genAI) {
    return res.status(503).json({ error: 'Gemini API not configured' });
  }

  const { topic, style, theme, animated } = req.body;
  if (!topic || typeof topic !== 'string') {
    return res.status(400).json({ error: 'topic is required' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const colorScheme = theme === 'light'
      ? 'Light background (#ffffff), dark text (#1a1a2e), accent colors (#0066cc, #00aa88, #cc4400)'
      : 'Dark background (#1a1a2e), light text (#e0e0e0), accent colors (#00d4aa, #e94560, #e8c766)';
    const animGuide = animated
      ? `- Add data-target="VALUE" attributes to key numeric elements for GSAP counter animation\n- Group animated elements with <g class="anim-fade-in">, <g class="anim-scale">, or <g class="anim-slide-up"> for GSAP selector targets\n- Each animated group should have an id for GSAP targeting`
      : '';

    const prompt = `You are an expert infographic designer. Create a professional SVG infographic about: "${topic}".

Requirements:
- Return ONLY valid SVG markup inside \`\`\`svg ... \`\`\` code blocks
- Use viewBox="0 0 800 600"
- Include a clear title, data points, section headings, and visual hierarchy
- Use a cohesive color palette: ${colorScheme}
- Format with proper <g> grouping and semantic elements
- Make it self-contained with all text visible
${animGuide}
${style ? `\nStyle guidance: ${style}` : ''}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    const svgMatch = text.match(/```svg\n?([\s\S]*?)```/);
    const svg = svgMatch ? svgMatch[1].trim() : text.trim();

    res.json({ svg });
  } catch (err) {
    console.error('Infographic generation failed:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/generate/audio', async (req, res) => {
  if (!genAI) {
    return res.status(503).json({ error: 'Gemini API not configured' });
  }

  const { topic, script } = req.body;
  if (!topic && !script) {
    return res.status(400).json({ error: 'topic or script is required' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = script
      ? `Improve the following narration script for clarity and impact. Keep it concise (30-60 seconds when read aloud). Return only the improved script:\n\n${script}`
      : `Write a professional narration script about: "${topic}". The script should be 30-60 seconds when read aloud. Return only the script text, no additional commentary or formatting.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const generatedScript = response.text().trim();

    const wordCount = generatedScript.split(/\s+/).length;
    const estimatedDuration = Math.ceil(wordCount / 150 * 60);

    res.json({ script: generatedScript, duration: estimatedDuration });
  } catch (err) {
    console.error('Audio generation failed:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/generate/animation', async (req, res) => {
  if (!genAI) {
    return res.status(503).json({ error: 'Gemini API not configured' });
  }

  const { topic, scenes } = req.body;
  if (!topic || typeof topic !== 'string') {
    return res.status(400).json({ error: 'topic is required' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const sceneCount = Math.min(Math.max(parseInt(scenes) || 4, 1), 6);

    const prompt = `You are a GSAP animation director. Generate a complete cinematic animation configuration for a ${sceneCount}-scene architectural demo about: "${topic}".

Return ONLY valid JSON. No markdown, no code fences.

The JSON structure must be:
{
  "title": "Overall demo title",
  "totalDuration": <total seconds for all scenes>,
  "modelName": "Name of the recommended AI model/architecture",
  "scenes": [
    {
      "id": 1,
      "title": "Scene 1 title (setup/title card)",
      "subtitle": "Short subtitle / problem statement",
      "description": "One-sentence description",
      "badges": ["🏷️ Badge1", "🏷️ Badge2"],
      "antiPattern": "Anti-pattern name",
      "solutionName": "Solution name",
      "animation": { "duration": 0.8, "ease": "power2.out", "stagger": 0.15 }
    },
    {
      "id": 2,
      "title": "Scene 2 title (problem / naive fails)",
      "description": "Describe the anti-pattern consequences",
      "badges": ["❌ Problem 1", "❌ Problem 2", "❌ Problem 3"],
      "failureScenario": "What happens when naive approach fails",
      "failureConsequence": "The failure consequence",
      "warningMessage": "Warning overlay message",
      "animation": { "duration": 0.8, "ease": "power2.out", "stagger": 0.15 }
    },
    {
      "id": 3,
      "title": "Scene 3 title (solution / resilient wins)",
      "description": "Describe the solution",
      "pillars": [
        { "icon": "🛡️", "title": "Pillar 1 Title", "description": "Pillar 1 description" },
        { "icon": "⚡", "title": "Pillar 2 Title", "description": "Pillar 2 description" },
        { "icon": "📊", "title": "Pillar 3 Title", "description": "Pillar 3 description" }
      ],
      "successMessage": "✅ Success scenario description",
      "animation": { "duration": 0.7, "ease": "back.out(1.7)", "stagger": 0.25 }
    },
    {
      "id": 4,
      "title": "The Results",
      "description": "Performance metrics description",
      "metrics": [
        { "label": "⚡ Metric 1", "unit": "%", "target": 75 },
        { "label": "🛡️ Metric 2", "unit": "%", "target": 100 },
        { "label": "📈 Metric 3", "unit": "%", "target": 95 }
      ],
      "animation": { "duration": 0.8, "ease": "elastic.out(1, 0.3)", "stagger": 0.2 }
    }
  ]
}

Generate exactly ${sceneCount} scenes. Scene 1 is always the setup/title card, scene 4 (or last) is always metrics. Fill scenes 2-3+ with problem/solution content appropriate to the topic.
Make all text specific to "${topic}" — no generic placeholders.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text().trim();

    const jsonMatch = text.replace(/```(?:json)?\n?/g, '');
    const config = JSON.parse(jsonMatch);

    res.json(config);
  } catch (err) {
    console.error('Animation generation failed:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  initGemini();
});
