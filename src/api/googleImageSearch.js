import axios from 'axios';

export const getArtistImage = async (artistName, apiKey, engineId) => {
  try {
    const response = await fetch('/api/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ artistName, apiKey, engineId }),
    });
    if (!response.ok) {
      console.warn('Image proxy failed (check if running with vercel dev):', response.status);
      throw new Error('Proxy error');
    }
    const { imageUrl } = await response.json();
    return imageUrl;
  } catch (error) {
    console.error('Image API error:', error);
    console.warn('Using placeholder image - real API calls may not work locally without vercel dev');
    return 'https://via.placeholder.com/150/cccccc/ffffff?text=' + encodeURIComponent(artistName);
  }
}; 