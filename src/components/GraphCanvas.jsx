// src/components/GraphCanvas.jsx
import React, { useEffect, useRef } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import './GraphCanvas.css';

const GraphCanvas = ({ graphData, onNodeClick }) => {
  const layout = { 
    name: 'cose', 
    animate: true, 
    fit: true, 
    padding: 50, 
    idealEdgeLength: 180, 
    nodeRepulsion: 4500 
  };

  const cyRef = useRef(null);

  // Effect to set up the node click listener
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    const handleTap = (event) => {
      const node = event.target;
      // Ensure it's a node before firing
      if (node.isNode()) { 
        onNodeClick(node.id());
      }
    };

    cy.on('tap', 'node', handleTap);

    return () => {
      if (cy.removeListener) {
        cy.removeListener('tap', 'node', handleTap);
      }
    };
  }, [onNodeClick]); 

  // Effect to re-run layout when data changes to make nodes radiate out
  useEffect(() => {
    const cy = cyRef.current;
    if (cy && graphData.nodes.length > 0) {
      // Get a fresh layout instance and run it
      const newLayout = cy.layout(layout);
      newLayout.run();
    }
  }, [graphData]); // Re-run whenever graphData changes

  return (
    <div className="graph-container">
      <CytoscapeComponent
        elements={CytoscapeComponent.normalizeElements(graphData)}
        // The container div now controls the size, this will fill it
        style={{ width: '100%', height: '100%' }}
        // Use 'preset' initially; the effect will run the animated 'cose' layout
        layout={{ name: 'preset' }} 
        stylesheet={stylesheet}
        cy={(cy) => { cyRef.current = cy; }}
      />
    </div>
  );
};

// Define the visual style of the graph
const stylesheet = [
  {
    selector: 'node',
    style: {
      'label': 'data(label)',
      'width': 80,
      'height': 80,
      'background-fit': 'cover',
      'background-image': 'data(image)',
      /* 'background-image-crossorigin' REMOVED to prevent CORS issues */
      'border-color': '#4ecdc4',
      'border-width': 4,
      'font-size': 14,
      'text-valign': 'bottom',
      'text-halign': 'center',
      'color': '#ffffff',
      'text-outline-width': 2,
      'text-outline-color': '#000000',
      'cursor': 'pointer'
    }
  },
  {
    selector: 'edge',
    style: {
      'width': 2,
      'line-color': '#cccccc',
      'target-arrow-color': '#cccccc',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      'label': 'data(label)',
      'font-size': 10,
      'text-rotation': 'autorotate',
      'color': '#bbbbbb',
      'text-background-opacity': 1,
      'text-background-color': '#242424',
      'text-background-padding': '3px'
    }
  },
   {
    selector: ':selected',
    style: {
      'border-color': '#ff6b6b',
      'border-width': 6,
    }
  }
];

export default GraphCanvas;