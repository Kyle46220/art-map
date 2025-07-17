export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { artistName, apiKey, engineId } = req.body;
  if (!artistName || !apiKey || !engineId) {
    return res.status(400).json({ error: 'Missing parameters' });
  }

  const query = `${artistName} artwork`;
  const API_URL = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${engineId}&q=${encodeURIComponent(query)}&searchType=image&num=1`;

  try {
    const response = await fetch(API_URL);
    const data = await response.json();
    const imageUrl = data.items?.[0]?.link || 'https://via.placeholder.com/150/cccccc/ffffff?text=' + encodeURIComponent(artistName);
    res.status(200).json({ imageUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch image' });
  }
}; 