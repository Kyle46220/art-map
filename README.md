# Artverse Navigator

An interactive web application that allows users to explore connections between visual artists through an interactive node graph powered by Google's Gemini AI.

## Features

- **Interactive Graph Visualization**: Click on any artist node to explore their connections
- **AI-Powered Associations**: Uses Google Gemini API to find related artists
- **Visual Artwork Integration**: Displays representative artwork for each artist
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Exploration**: Dynamically builds the graph as you explore

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. API Keys Setup

You'll need to obtain API keys from Google for both the Gemini API and Custom Search API:

#### Google Gemini API
1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Create a new project and get your API key
3. The free tier includes 60 requests per minute

#### Google Custom Search API
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project and enable the "Custom Search API"
3. Create an API key in "Credentials"
4. Go to [Programmable Search Engine](https://programmablesearchengine.google.com/)
5. Create a new search engine that searches the entire web
6. Enable "Image search"
7. Copy the Search Engine ID

### 3. Environment Variables

Create a `.env.local` file in the root directory with your API keys:

```bash
# Google Gemini API Key
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# Google Custom Search API Key  
VITE_GOOGLE_SEARCH_API_KEY=your_google_search_api_key_here

# Google Custom Search Engine ID
VITE_GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
```

**Important**: Never commit your `.env.local` file to version control!

### 4. Run the Application

```bash
npm run dev
```

The application will start on `http://localhost:3000`

## Usage

1. Enter an artist's name in the search bar (e.g., "Van Gogh", "Picasso", "Monet")
2. Click "Explore" to see the artist and their connections
3. Click on any node in the graph to explore that artist's connections
4. The graph will continue to expand as you explore

## Technology Stack

- **React** - Frontend framework
- **Vite** - Build tool and development server
- **Cytoscape.js** - Graph visualization library
- **Axios** - HTTP client for API requests
- **Google Gemini API** - AI-powered artist associations
- **Google Custom Search API** - Artist artwork images

## Development Notes

- The app includes fallback data when API keys are not configured
- Images use placeholder URLs if the Google Search API is not available
- The graph uses the Cose layout algorithm for optimal node positioning
- All API calls include proper error handling

## Project Structure

```
src/
├── api/
│   ├── gemini.js              # Gemini API integration
│   └── googleImageSearch.js   # Google Image Search API
├── components/
│   ├── GraphCanvas.jsx        # Graph visualization component
│   ├── GraphCanvas.css
│   ├── SearchBar.jsx          # Search input component
│   └── SearchBar.css
├── App.jsx                    # Main application component
├── App.css
├── main.jsx                   # React entry point
└── index.css                  # Global styles
```

## License

MIT License - feel free to use this project for learning and experimentation! 