import axios from 'axios';

// This prompt is CRITICAL. It instructs the model to return ONLY JSON.
const buildPrompt = (artistName) => `
You are an expert art historian API. For the artist "${artistName}", generate a list of 5 associated artists. Associations can be direct influence, a shared movement, or a contemporary with a similar style.
Return the answer ONLY as a valid JSON object with a single key "associations". The value should be an array of objects, where each object has "name" and "connection" keys. always include the artists full name in the name key.
Do not include any text before or after the JSON object. Do not use markdown formatting.
`;

export const getArtistAssociations = async (artistName, apiKey) => {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ artistName, apiKey }),
    });
    if (!response.ok) {
      console.warn('Gemini proxy failed (check if running with vercel dev):', response.status);
      throw new Error('Proxy error');
    }
    return await response.json();
  } catch (error) {
    console.error('Gemini API error:', error);
    console.warn('Using fallback data - real API calls may not work locally without vercel dev');
    return [
      { name: "Pablo Picasso", connection: "Cubist movement pioneer" },
      { name: "Georges Braque", connection: "Co-founder of Cubism" },
      { name: "Henri Matisse", connection: "Contemporary and rival" },
      { name: "Paul Cézanne", connection: "Major influence" },
      { name: "Joan Miró", connection: "Surrealist contemporary" }
    ];
  }
}; 