import React, { useEffect } from 'react';

const Fighter = ({ fighter, color }) => {
  if (!fighter) {
    return <div>Fighter not available</div>;
  }

  const healthBarStyles = {
    width: '100%',
    height: '20px',
    backgroundColor: 'gray',
    borderRadius: '10px'
  };

  const currentHealthBarStyles = {
    width: `${(fighter.currentHealth / fighter.maxHealth) * 100}%`,
    height: '20px',
    backgroundColor: color,
    borderRadius: '10px'
  };

  const healthTextStyles = {
    textAlign: 'center',
    fontWeight: 'bold'
  };

  const decreaseHealth = (amount) => {
    const newHealth = fighter.currentHealth;
    //setCurrentHealth(newHealth < 0 ? 0 : newHealth);
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={healthBarStyles}>
        <div style={currentHealthBarStyles}></div>
      </div>
      <p style={healthTextStyles}>{fighter.currentHealth} / {fighter.maxHealth}</p>
    </div>
  );
};

export default Fighter;