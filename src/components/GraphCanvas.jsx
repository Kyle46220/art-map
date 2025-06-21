// src/components/GraphCanvas.jsx
import React, { useEffect, useRef } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import './GraphCanvas.css';

const GraphCanvas = ({ graphData, onNodeClick }) => {
  const cyRef = useRef(null);

  const coseLayout = {
    name: 'cose',
    randomize: false,
    fit: false,
    animate: 'end',
    animationEasing: 'ease-out',
    animationDuration: 1000,
    idealEdgeLength: 180,
    nodeRepulsion: 4500,
    padding: 50
  };

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    const handleTap = (event) => {
      const node = event.target;
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

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || graphData.nodes.length === 0) return;

    const layout = cy.layout(coseLayout);
    layout.run();

    if (graphData.edges.length > 0 && graphData.edges.length <= 5) {
      cy.animate({
        fit: { padding: 50 }
      }, {
        duration: 500
      });
    }

  }, [graphData]);

  return (
    <div className="graph-container">
      <CytoscapeComponent
        elements={CytoscapeComponent.normalizeElements(graphData)}
        style={{ width: '100%', height: '100%' }}
        layout={{ name: 'preset' }}
        stylesheet={stylesheet}
        cy={(cy) => { cyRef.current = cy; }}
      />
    </div>
  );
};

// --- STYLESHEET UPDATED ---
const stylesheet = [
  {
    selector: 'node',
    style: {
      'label': 'data(label)',
      'width': 80,
      'height': 80,
      'background-fit': 'cover',
      'background-image': 'data(image)',
      // THIS IS THE FIX: Tell Cytoscape not to use CORS mode for images.
      'background-image-crossorigin': 'null',
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