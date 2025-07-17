import React from 'react';

const ApiKeyModal = ({ isOpen, onClose, geminiKey, setGeminiKey, searchApiKey, setSearchApiKey, searchEngineId, setSearchEngineId }) => {
  if (!isOpen) return null;

  const handleSave = () => {
    onClose();
  };

  return (
    <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
      <div style={{background: 'white', padding: '20px', borderRadius: '8px', color: 'black', width: '300px'}}>
        <h2>Enter API Keys</h2>
        <input 
          type="text" 
          placeholder="Gemini API Key" 
          value={geminiKey} 
          onChange={(e) => setGeminiKey(e.target.value)} 
          style={{display: 'block', margin: '10px 0', width: '100%'}} 
        />
        <input 
          type="text" 
          placeholder="Google Search API Key" 
          value={searchApiKey} 
          onChange={(e) => setSearchApiKey(e.target.value)} 
          style={{display: 'block', margin: '10px 0', width: '100%'}} 
        />
        <input 
          type="text" 
          placeholder="Google Search Engine ID" 
          value={searchEngineId} 
          onChange={(e) => setSearchEngineId(e.target.value)} 
          style={{display: 'block', margin: '10px 0', width: '100%'}} 
        />
        <button onClick={handleSave}>Save</button>
        <button onClick={onClose} style={{marginLeft: '10px'}}>Cancel</button>
      </div>
    </div>
  );
};

export default ApiKeyModal; 