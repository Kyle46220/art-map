import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
import GraphCanvas from './components/GraphCanvas';
import { getArtistAssociations } from './api/gemini';
import { getArtistImage } from './api/googleImageSearch';
import './App.css';

function App() {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const addArtistToGraph = async (artistName) => {
    setIsLoading(true);
    setError(null);

    try {
      // 1. Check if the central artist node already exists
      const existingNode = graphData.nodes.find(node => node.data.id === artistName);

      if (!existingNode) {
        // If the node is new, get its image and add it
        const imageUrl = await getArtistImage(artistName);
        const centralNode = { data: { id: artistName, label: artistName, image: imageUrl } };
        setGraphData(prev => ({ ...prev, nodes: [...prev.nodes, centralNode] }));
      }

      // 2. Fetch associated artists from Gemini
      const associations = await getArtistAssociations(artistName);
      
      // 3. Process the new associations
      const newNodes = [];
      const newEdges = [];

      for (const assoc of associations) {
        // Check if this associated node already exists in our graph
        const assocExists = graphData.nodes.some(node => node.data.id === assoc.name);
        if (!assocExists) {
          // If not, fetch its image and create a new node
          const imageUrl = await getArtistImage(assoc.name);
          newNodes.push({ data: { id: assoc.name, label: assoc.name, image: imageUrl } });
        }

        // Create an edge connecting the central artist to the new one
        const edgeId = `${artistName}-${assoc.name}`;
        const edgeExists = graphData.edges.some(edge => edge.data.id === edgeId);
        if (!edgeExists) {
          newEdges.push({ 
            data: { 
              id: edgeId,
              source: artistName, 
              target: assoc.name, 
              label: assoc.connection 
            } 
          });
        }
      }

      // 4. Update the state by merging old and new data
      setGraphData(prev => ({
        nodes: [...prev.nodes, ...newNodes],
        edges: [...prev.edges, ...newEdges]
      }));

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

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