import React, { useState } from 'react';
import './LeadToSilverTransmutation.css';

const LeadToSilverTransmutation = () => {
  const [transmuted, setTransmuted] = useState(false);

  const handleTransmute = () => {
    // Simulate the transmutation process
    setTransmuted(true);
  };

  return (
    <div className="transmutation-container">
      <h1>Lead to Pure Silver Transmutation</h1>
      <p>Click the button below to transmute lead into pure silver.</p>
      <button onClick={handleTransmute} disabled={transmuted} className="transmute-button">
        {transmuted ? 'Transmuted!' : 'Transmute Lead'}
      </button>
      {transmuted && (
        <div className="result">
          <p>✨ Lead has been successfully turned into <strong>Pure Silver</strong>! ✨</p>
          <div className="silver-swatch"></div>
        </div>
      )}
    </div>
  );
};

export default LeadToSilverTransmutation;
