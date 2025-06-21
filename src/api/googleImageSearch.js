import axios from 'axios';

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_SEARCH_API_KEY;
const SEARCH_ENGINE_ID = import.meta.env.VITE_GOOGLE_SEARCH_ENGINE_ID;

export const getArtistImage = async (artistName) => {
  const query = `${artistName} artwork`;
  const API_URL = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${SEARCH_ENGINE_ID}&q=${encodeURIComponent(query)}&searchType=image&num=1`;

  try {
    if (!GOOGLE_API_KEY || !SEARCH_ENGINE_ID) {
      console.warn("Google Search API credentials not configured, using placeholder image");
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