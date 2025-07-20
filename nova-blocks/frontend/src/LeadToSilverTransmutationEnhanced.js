import React, { useState } from 'react';
import './LeadToSilverTransmutation.css';

const LeadToSilverTransmutationEnhanced = () => {
  const [transmuted, setTransmuted] = useState(false);

  const handleTransmute = () => {
    setTransmuted(true);
  };

  return (
    <div className="transmutation-container" role="main" aria-label="Lead to Silver Transmutation">
      <h1 tabIndex="0">Lead to Pure Silver Transmutation</h1>
      <p tabIndex="0">Click the button below to transmute lead into pure silver.</p>
      <button
        onClick={handleTransmute}
        disabled={transmuted}
        className="transmute-button"
        aria-pressed={transmuted}
        aria-live="polite"
        aria-label={transmuted ? "Transmutation complete" : "Transmute lead to silver"}
      >
        {transmuted ? 'Transmuted!' : 'Transmute Lead'}
      </button>
      {transmuted && (
        <div className="result" role="alert" aria-live="assertive">
          <p>
            ✨ Lead has been successfully turned into <strong>Pure Silver</strong>! ✨
          </p>
          <div className="silver-swatch" aria-hidden="true"></div>
        </div>
      )}
    </div>
  );
};

export default LeadToSilverTransmutationEnhanced;
