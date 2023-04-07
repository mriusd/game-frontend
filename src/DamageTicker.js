import React, { useState, useEffect } from 'react';
import './DamageTicker.css';

const DamageTicker = ({ damages, color }) => {
  const [displayedDamages, setDisplayedDamages] = useState([]);

  useEffect(() => {
    if (damages.length > 8) {
      setDisplayedDamages(damages.slice(-8).reverse());
    } else {
      setDisplayedDamages(damages.reverse());
    }
  }, [damages]);

  return (
    <div className="damage-ticker">
      {displayedDamages.map((damage, index) => (
        <div key={index} className="damage-item" style={{color: color}}>
          {damage}
        </div>
      ))}
    </div>
  );
};

export default DamageTicker;
