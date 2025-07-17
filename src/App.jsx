// src/App.jsx
//working
import React, { useState, useCallback, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import GraphCanvas from './components/GraphCanvas';
import { getArtistAssociations } from './api/gemini';
import { getArtistImage } from './api/googleImageSearch';
import './App.css';
import ApiKeyModal from './components/ApiKeyModal';

function App() {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [geminiKey, setGeminiKey] = useState(sessionStorage.getItem('geminiKey') || '');
  const [searchApiKey, setSearchApiKey] = useState(sessionStorage.getItem('searchApiKey') || '');
  const [searchEngineId, setSearchEngineId] = useState(sessionStorage.getItem('searchEngineId') || '');
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingQuery, setPendingQuery] = useState(null);

  useEffect(() => {
    sessionStorage.setItem('geminiKey', geminiKey);
    sessionStorage.setItem('searchApiKey', searchApiKey);
    sessionStorage.setItem('searchEngineId', searchEngineId);
  }, [geminiKey, searchApiKey, searchEngineId]);

  const handleSearch = (query) => {
    if (!geminiKey || !searchApiKey || !searchEngineId) {
      setPendingQuery(query);
      setModalOpen(true);
    } else {
      addArtistToGraph(query);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    if (pendingQuery && geminiKey && searchApiKey && searchEngineId) {
      addArtistToGraph(pendingQuery);
      setPendingQuery(null);
    }
  };

  const addArtistToGraph = useCallback(async (artistName) => {
    if (isLoading) {
      console.log("A search is already in progress.");
      return;
    }

    const isAlreadyExpanded = graphData.edges.some(edge => edge.data.source === artistName);
    if (isAlreadyExpanded) {
        console.log(`'${artistName}' has already been expanded.`);
        return;
    }

    setIsLoading(true);
    setError(null);

    try {
        const newNodes = [];
        const newEdges = [];

        const existingNodeIds = new Set(graphData.nodes.map(n => n.data.id));
        const existingEdgeIds = new Set(graphData.edges.map(e => e.data.id));

        if (!existingNodeIds.has(artistName)) {
            const imageUrl = await getArtistImage(artistName, searchApiKey, searchEngineId);
            // --- REVERTED ---
            // The image URL is now used directly, without the proxy.
            newNodes.push({ data: { id: artistName, label: artistName, image: imageUrl } });
            existingNodeIds.add(artistName);
        }

        const associations = await getArtistAssociations(artistName, geminiKey);
        if (!associations || associations.length === 0) {
            console.warn(`No associations found for ${artistName}`);
            setIsLoading(false);
            return;
        }

        for (const assoc of associations) {
            if (!existingNodeIds.has(assoc.name)) {
                const imageUrl = await getArtistImage(assoc.name, searchApiKey, searchEngineId);
                // --- REVERTED ---
                // The image URL is now used directly, without the proxy.
                newNodes.push({ data: { id: assoc.name, label: assoc.name, image: imageUrl } });
                existingNodeIds.add(assoc.name);
            }

            const edgeId = `${artistName}-${assoc.name}`;
            const reverseEdgeId = `${assoc.name}-${artistName}`;
            if (!existingEdgeIds.has(edgeId) && !existingEdgeIds.has(reverseEdgeId)) {
                newEdges.push({ 
                    data: { 
                        id: edgeId,
                        source: artistName, 
                        target: assoc.name, 
                        label: assoc.connection 
                    } 
                });
                existingEdgeIds.add(edgeId);
            }
        }

        if (newNodes.length > 0 || newEdges.length > 0) {
            setGraphData(prev => ({
                nodes: [...prev.nodes, ...newNodes],
                edges: [...prev.edges, ...newEdges]
            }));
        }

    } catch (err) {
        setError(err.message);
        setTimeout(() => setError(null), 5000);
    } finally {
        setIsLoading(false);
    }
  }, [isLoading, graphData, geminiKey, searchApiKey, searchEngineId]);

  return (
    <div className="App">
      <header className="app-header">
        <h1>Art Map</h1>
        <p>Search for an artist to see their influences, contemporaries and connections</p>
        <p>Click any artist to expand the web.</p>
        <SearchBar onSearch={handleSearch} />
        <button 
          onClick={() => setModalOpen(true)} 
          style={{position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer'}}
        >
          ⚙️
        </button>
      </header>
      {isLoading && <div className="loading-spinner">Loading...</div>}
      {error && <div className="error-message">{error}</div>}
      <GraphCanvas graphData={graphData} onNodeClick={addArtistToGraph} />
      <ApiKeyModal 
        isOpen={modalOpen} 
        onClose={handleModalClose} 
        geminiKey={geminiKey} setGeminiKey={setGeminiKey}
        searchApiKey={searchApiKey} setSearchApiKey={setSearchApiKey}
        searchEngineId={searchEngineId} setSearchEngineId={setSearchEngineId}
      />
    </div>
  );
}

export default App;