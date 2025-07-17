import axios from 'axios';

// This prompt is CRITICAL. It instructs the model to return ONLY JSON.
const buildPrompt = (artistName) => `
You are an expert art historian API. For the artist "${artistName}", generate a list of 5 associated artists. Associations can be direct influence, a shared movement, or a contemporary with a similar style.
Return the answer ONLY as a valid JSON object with a single key "associations". The value should be an array of objects, where each object has "name" and "connection" keys.
Do not include any text before or after the JSON object. Do not use markdown formatting.
`;

export const getArtistAssociations = async (artistName, apiKey) => {
  try {
    if (!apiKey) {
      throw new Error("Gemini API key not provided.");
    }

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const prompt = buildPrompt(artistName);
    const response = await axios.post(API_URL, {
      contents: [{ parts: [{ text: prompt }] }],
    });

    // The response is often wrapped in markdown, so we clean it.
    const rawText = response.data.candidates[0].content.parts[0].text;
    const jsonText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(jsonText).associations; // e.g., [{ name: 'Artist B', connection: '...' }]
  } catch (error) {
    console.error("Error fetching from Gemini API:", error);
    
    // Fallback data for development/testing
    if (!apiKey) {
      console.warn("Using fallback data since API key is not configured");
      return [
        { name: "Pablo Picasso", connection: "Cubist movement pioneer" },
        { name: "Georges Braque", connection: "Co-founder of Cubism" },
        { name: "Henri Matisse", connection: "Contemporary and rival" },
        { name: "Paul Cézanne", connection: "Major influence" },
        { name: "Joan Miró", connection: "Surrealist contemporary" }
      ];
    }
    
    throw new Error("Could not retrieve artist connections.");
  }
}; 