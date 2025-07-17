import axios from 'axios';

export const getArtistImage = async (artistName, apiKey, engineId) => {
  const query = `${artistName} artwork`;
  const API_URL = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${engineId}&q=${encodeURIComponent(query)}&searchType=image&num=1`;

  try {
    if (!apiKey || !engineId) {
      console.warn("Google Search API credentials not provided, using placeholder image");
      return 'https://via.placeholder.com/150/cccccc/ffffff?text=' + encodeURIComponent(artistName);
    }

    const response = await axios.get(API_URL);
    if (response.data.items && response.data.items.length > 0) {
      return response.data.items[0].link; // URL of the first image result
    }
    return 'https://via.placeholder.com/150/cccccc/ffffff?text=' + encodeURIComponent(artistName); // Return placeholder if no image is found
  } catch (error) {
    console.error("Error fetching from Google Image Search:", error);
    // Return a placeholder so the app doesn't crash
    return 'https://via.placeholder.com/150/cccccc/ffffff?text=' + encodeURIComponent(artistName); 
  }
}; 