import React, { useState } from 'react';

const ApiKeyModal = ({ isOpen, onClose, geminiKey, setGeminiKey, searchApiKey, setSearchApiKey, searchEngineId, setSearchEngineId }) => {
  const [errors, setErrors] = useState({});

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!geminiKey || geminiKey.length < 30) newErrors.geminiKey = 'Gemini API Key is required (min 30 chars)';
    if (!searchApiKey || searchApiKey.length < 30) newErrors.searchApiKey = 'Google Search API Key is required (min 30 chars)';
    if (!searchEngineId || searchEngineId.length < 15) newErrors.searchEngineId = 'Search Engine ID is required (min 15 chars)';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onClose();
    }
  };

  return (
    <div style={{position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000}}>
      <div style={{background: 'white', padding: '20px', borderRadius: '8px', color: 'black', width: '300px'}}>
        <h2>Enter API Keys</h2>
        <p style={{fontSize: '0.9em', color: 'red'}}>Disclaimer: These keys are sent securely to the server for API calls and held temporarily in memory (cleared on page refresh or tab close). They are not stored in your browser. Use at your own risk—do not enter highly sensitive keys.</p>
        <input 
          type="text" 
          placeholder="Gemini API Key" 
          value={geminiKey} 
          onChange={(e) => setGeminiKey(e.target.value)} 
          style={{display: 'block', margin: '10px 0', width: '100%'}} 
        />
        {errors.geminiKey && <p style={{color: 'red', fontSize: '0.8em'}}>{errors.geminiKey}</p>}
        <input 
          type="text" 
          placeholder="Google Search API Key" 
          value={searchApiKey} 
          onChange={(e) => setSearchApiKey(e.target.value)} 
          style={{display: 'block', margin: '10px 0', width: '100%'}} 
        />
        {errors.searchApiKey && <p style={{color: 'red', fontSize: '0.8em'}}>{errors.searchApiKey}</p>}
        <input 
          type="text" 
          placeholder="Google Search Engine ID" 
          value={searchEngineId} 
          onChange={(e) => setSearchEngineId(e.target.value)} 
          style={{display: 'block', margin: '10px 0', width: '100%'}} 
        />
        {errors.searchEngineId && <p style={{color: 'red', fontSize: '0.8em'}}>{errors.searchEngineId}</p>}
        <button onClick={handleSave}>Save</button>
        <button onClick={onClose} style={{marginLeft: '10px'}}>Cancel</button>
      </div>
    </div>
  );
};

export default ApiKeyModal; 