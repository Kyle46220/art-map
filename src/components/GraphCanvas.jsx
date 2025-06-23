// src/components/GraphCanvas.jsx
import React, { useState, useEffect, useRef } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import './GraphCanvas.css';

const GraphCanvas = ({ graphData, onNodeClick }) => {
  const cyRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  const coseLayout = {
    name: 'cose',
    idealEdgeLength: 150,
    nodeRepulsion: 1000,
    animate: 'end',
    animationEasing: 'ease-out',
    animationDuration: 1000,
    fit: false,
    randomize: false,
    padding: 50,
  };

  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    const handleNodeTap = (event) => {
      const node = event.target;
      if (node.isNode()) {
        onNodeClick(node.id());
      }
    };

    const handleEdgeMouseOver = (event) => {
      const edge = event.target;
      edge.addClass('highlighted');
      
      const sourceName = edge.source().data('label');
      const targetName = edge.target().data('label');

      setTooltip({
        title: `${sourceName} & ${targetName}`,
        body: edge.data('label'),
        x: event.renderedPosition.x,
        y: event.renderedPosition.y,
      });
    };

    const handleEdgeMouseOut = (event) => {
      const edge = event.target;
      edge.removeClass('highlighted');
      setTooltip(null);
    };
    
    cy.on('tap', 'node', handleNodeTap);
    cy.on('mouseover', 'edge', handleEdgeMouseOver);
    cy.on('mouseout', 'edge', handleEdgeMouseOut);

    return () => {
      if (cy.removeListener) {
        cy.removeListener('tap', 'node', handleNodeTap);
        cy.removeListener('mouseover', 'edge', handleEdgeMouseOver);
        cy.removeListener('mouseout', 'edge', handleEdgeMouseOut);
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

    // Force a re-layout once styles are applied to fix font-size bounding box issues
    // setTimeout(() => {
    //   cy.fit();
    //   cy.center();
    // }, 0);
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
      {tooltip && (
        <div 
          className="graph-tooltip" 
          style={{ top: `${tooltip.y}px`, left: `${tooltip.x}px` }}
        >
          <h4 className="tooltip-title">{tooltip.title}</h4>
          <p className="tooltip-body">{tooltip.body}</p>
        </div>
      )}
    </div>
  );
};

const stylesheet = [
  {
    selector: 'node',
    style: {
      'label': 'data(label)',
      'width': 80,
      'height': 80,
      'font-family': 'Inter',
      
      // THE DEFINITIVE FIX: Cytoscape requires a number, not a string with 'px'.
      'font-size': 12, 
      
      'text-valign': 'bottom',
      'text-halign': 'center',
      'text-margin-y': 5,
      'color': '#F0F0F0',
      'text-outline-color': '#0D1B2A',
      'text-outline-width': 2,
      'background-fit': 'cover',
      'background-image': 'data(image)',
      'background-image-crossorigin': 'null',
      'border-color': '#5FC3E4',
      'border-width': 4,
      'cursor': 'pointer',
    }
  },
  {
    selector: 'edge',
    style: {
      'width': 1.5,
      'line-color': 'rgba(224, 229, 236, 0.25)',
      'target-arrow-color': 'rgba(224, 229, 236, 0.25)',
      'target-arrow-shape': 'triangle',
      'curve-style': 'bezier',
      'label': 'data(label)',
      'text-opacity': 0, 
      'transition-property': 'line-color, width',
      'transition-duration': '0.2s',
    }
  },
   {
    selector: ':selected',
    style: {
      'border-color': '#E55D87',
      'border-width': 6,
    }
  },
  {
    selector: 'edge.highlighted',
    style: {
      'line-color': '#E55D87',
      'width': 3,
    }
  }
];

export default GraphCanvas;