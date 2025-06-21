// src/App.jsx
import React, { useState, useCallback } from 'react';
import SearchBar from './components/SearchBar';
import GraphCanvas from './components/GraphCanvas';
import { getArtistAssociations } from './api/gemini';
import { getArtistImage } from './api/googleImageSearch';
import './App.css';

function App() {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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
            const imageUrl = await getArtistImage(artistName);
            newNodes.push({ data: { id: artistName, label: artistName, image: imageUrl } });
            existingNodeIds.add(artistName);
        }

        const associations = await getArtistAssociations(artistName);
        if (!associations || associations.length === 0) {
            console.warn(`No associations found for ${artistName}`);
            setIsLoading(false);
            return;
        }

        for (const assoc of associations) {
            if (!existingNodeIds.has(assoc.name)) {
                const imageUrl = await getArtistImage(assoc.name);
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
  }, [isLoading, graphData]);

  return (
    <div className="App">
      <header className="app-header">
        <h1>Artverse Navigator</h1>
        <SearchBar onSearch={addArtistToGraph} />
      </header>
      {isLoading && <div className="loading-spinner">Loading...</div>}
      {error && <div className="error-message">{error}</div>}
      <GraphCanvas graphData={graphData} onNodeClick={addArtistToGraph} />
    </div>
  );
}

export default App;