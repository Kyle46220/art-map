export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { artistName, apiKey } = req.body;
  if (!artistName || !apiKey) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
  const prompt = `You are an expert art historian API. For the artist "${artistName}", generate a list of 5 associated artists. Associations can be direct influence, a shared movement, or a contemporary with a similar style.\nReturn the answer ONLY as a valid JSON object with a single key "associations". The value should be an array of objects, where each object has "name" and "connection" keys.\nDo not include any text before or after the JSON object. Do not use markdown formatting.`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      return res.status(response.status).json({ error: 'Google API error', details: errorData });
    }
    const data = await response.json();
    const rawText = data.candidates[0].content.parts[0].text;
    const jsonText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const associations = JSON.parse(jsonText).associations;
    res.status(200).json(associations);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Proxy failed', details: error.message });
  }
}; 