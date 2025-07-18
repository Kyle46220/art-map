// src/components/GraphCanvas.jsx
import React, { useState, useEffect, useRef } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import './GraphCanvas.css';

const GraphCanvas = ({ graphData, onNodeClick }) => {
  const cyRef = useRef(null);
  const tooltipRef = useRef(null); // For edges
  const [activeEdge, setActiveEdge] = useState(null);

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
    if (!cy || !tooltipRef.current) return;

    // --- MOUSEOVER / MOUSEOUT ---
    const handleEdgeMouseOver = (event) => {
      const edge = event.target;
      edge.addClass('highlighted');
      setActiveEdge(edge); // Set the active edge to trigger React re-render
      // Position at mouse
      const tooltip = tooltipRef.current;
      if (tooltip) {
        const { x, y } = event.renderedPosition;
        tooltip.style.left = `${x + 10}px`;
        tooltip.style.top = `${y + 10}px`;
        tooltip.style.transform = 'none'; // Remove transform, use absolute positioning
        tooltip.style.position = 'absolute';
      }
    };
    
    const handleEdgeMouseOut = (event) => {
      event.target.removeClass('highlighted');
      setActiveEdge(null); // Clear the active edge
    };

    // --- POSITIONING LOGIC ---
    // This function updates the tooltip's position. It's the core of the fix.
    // Remove updateTooltipPosition and updateNodeTooltipPosition functions and their event listeners, as positioning now happens on mouseover

    // --- EVENT BINDING ---
    const handleNodeTap = (event) => onNodeClick(event.target.id());

    cy.on('tap', 'node', handleNodeTap);
    cy.on('mouseover', 'edge', handleEdgeMouseOver);
    cy.on('mouseout', 'edge', handleEdgeMouseOut);

    // CRITICAL: Update tooltip position on pan, zoom, or graph render
    // In useEffect, remove cy.on('pan zoom render', ...) for tooltips

    // Update position if the active edge changes
    if (activeEdge) {
      // updateTooltipPosition(); // This line is no longer needed
    }

    return () => {
      cy.removeListener('tap', 'node', handleNodeTap);
      cy.removeListener('mouseover', 'edge', handleEdgeMouseOver);
      cy.removeListener('mouseout', 'edge', handleEdgeMouseOut);
      // cy.removeListener('pan zoom render', updateTooltipPosition); // This line is no longer needed
    };
  }, [activeEdge, onNodeClick]); // Re-run effect when activeEdge changes

  // Effect for running the layout
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy || graphData.nodes.length === 0) return;
    const layout = cy.layout(coseLayout);
    layout.run();
    // Removed all fitting/positioning code - let graph appear naturally
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
      {/* Edge Tooltip */}
      <div 
        ref={tooltipRef}
        className="graph-tooltip"
        style={{ display: activeEdge ? 'inline-block' : 'none' }}
      >
        {activeEdge && (
          <>
            <h4 className="tooltip-title">{`${activeEdge.source().data('label')} & ${activeEdge.target().data('label')}`}</h4>
            <p className="tooltip-body">{activeEdge.data('label')}</p>
          </>
        )}
      </div>
    </div>
  );
};

const stylesheet = [
  {
    selector: 'node',
    style: {
      'label': 'data(label)',
      'width': 80, 'height': 80,
      'font-family': 'Inter',
      
      // THE DEFINITIVE FIX: Cytoscape requires a number, not a string.
      'font-size': 12, 
      
      'text-valign': 'bottom', 'text-halign': 'center', 'text-margin-y': 5,
      'color': '#F0F0F0', 'text-outline-color': '#0D1B2A', 'text-outline-width': 2,
      'background-fit': 'cover', 'background-image': 'data(image)', 'background-image-crossorigin': 'null',
      'border-color': '#5FC3E4', 'border-width': 4, 'cursor': 'pointer',
    }
  },
  {
    selector: 'edge',
    style: {
      'width': 1.5, 'line-color': 'rgba(224, 229, 236, 0.25)',
      'target-arrow-color': 'rgba(224, 229, 236, 0.25)', 'target-arrow-shape': 'triangle',
      'curve-style': 'bezier', 'label': 'data(label)', 'text-opacity': 0, 
      'transition-property': 'line-color, width', 'transition-duration': '0.2s',
    }
  },
  {
    selector: ':selected',
    style: { 'border-color': '#E55D87', 'border-width': 6, }
  },
  {
    selector: 'edge.highlighted',
    style: { 'line-color': '#E55D87', 'width': 3, }
  }
];

export default GraphCanvas;