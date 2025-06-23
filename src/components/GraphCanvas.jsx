// src/components/GraphCanvas.jsx
import React, { useState, useEffect, useRef } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import './GraphCanvas.css';

const GraphCanvas = ({ graphData, onNodeClick }) => {
  const cyRef = useRef(null);
  const tooltipRef = useRef(null); // Ref for the tooltip DOM element
  const [activeEdge, setActiveEdge] = useState(null); // State to track the hovered edge

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
    };
    
    const handleEdgeMouseOut = (event) => {
      event.target.removeClass('highlighted');
      setActiveEdge(null); // Clear the active edge
    };

    // --- POSITIONING LOGIC ---
    // This function updates the tooltip's position. It's the core of the fix.
    const updateTooltipPosition = () => {
      if (!activeEdge || !tooltipRef.current) return;
      
      const tooltip = tooltipRef.current;
      const { x, y } = activeEdge.midpoint(); // Get the midpoint of the edge
      const { x: panX, y: panY } = cy.pan();
      const zoom = cy.zoom();

      // Apply pan and zoom to the midpoint to get the correct screen coordinates
      const renderedX = x * zoom + panX;
      const renderedY = y * zoom + panY;

      tooltip.style.transform = `translate(-50%, -150%) translate(${renderedX}px, ${renderedY - 30}px)`;
    };

    // --- EVENT BINDING ---
    const handleNodeTap = (event) => onNodeClick(event.target.id());

    cy.on('tap', 'node', handleNodeTap);
    cy.on('mouseover', 'edge', handleEdgeMouseOver);
    cy.on('mouseout', 'edge', handleEdgeMouseOut);

    // CRITICAL: Update tooltip position on pan, zoom, or graph render
    cy.on('pan zoom render', updateTooltipPosition);

    // Update position if the active edge changes
    if (activeEdge) {
      updateTooltipPosition();
    }

    return () => {
      cy.removeListener('tap', 'node', handleNodeTap);
      cy.removeListener('mouseover', 'edge', handleEdgeMouseOver);
      cy.removeListener('mouseout', 'edge', handleEdgeMouseOut);
      cy.removeListener('pan zoom render', updateTooltipPosition);
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
      {/* The tooltip div is now controlled by a ref and its content by state */}
      <div 
        ref={tooltipRef}
        className="graph-tooltip"
        style={{ display: activeEdge ? 'inline-block' : 'none' }} // Show/hide based on activeEdge
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