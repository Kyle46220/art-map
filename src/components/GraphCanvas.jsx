import React from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import './GraphCanvas.css';

const GraphCanvas = ({ graphData, onNodeClick }) => {
  const layout = { name: 'cose', animate: true, idealEdgeLength: 180, nodeRepulsion: 4500 };

  // Use a ref to access the Cytoscape core instance
  const cyRef = React.useRef(null);

  React.useEffect(() => {
    if (cyRef.current) {
      cyRef.current.on('tap', 'node', (event) => {
        const node = event.target;
        onNodeClick(node.id());
      });
    }

    // Cleanup listener on component unmount
    return () => {
      if (cyRef.current) {
        cyRef.current.removeListener('tap');
      }
    };
  }, [onNodeClick]);

  return (
    <div className="graph-container">
      <CytoscapeComponent
        elements={CytoscapeComponent.normalizeElements(graphData)}
        style={{ width: '100%', height: '100%' }}
        layout={layout}
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
      'background-fit': 'cover',
      'background-image': 'data(image)',
      'background-image-crossorigin': 'null',
      'border-color': '#0074D9',
      'border-width': 3,
      'font-size': 14,
      'text-valign': 'bottom',
      'text-halign': 'center',
      'color': '#ffffff',
      'text-outline-width': 2,
      'text-outline-color': '#000000',
      'width': 80,
      'height': 80,
      'cursor': 'pointer',
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
      'label': 'data(label)', // Display the connection text
      'font-size': 10,
      'text-rotation': 'autorotate',
      'color': '#888888',
      'text-background-opacity': 1,
      'text-background-color': 'white',
    }
  }
];

export default GraphCanvas; 