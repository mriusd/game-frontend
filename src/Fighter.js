import React, { useEffect } from 'react';

const Fighter = ({ health, color, currentHealth }) => {
  //const [currentHealth, setCurrentHealth] = useState(health);

  const healthBarStyles = {
    width: '100%',
    height: '20px',
    backgroundColor: 'gray',
    borderRadius: '10px'
  };

  const currentHealthBarStyles = {
    width: `${(currentHealth / health) * 100}%`,
    height: '20px',
    backgroundColor: color,
    borderRadius: '10px'
  };

  const healthTextStyles = {
    textAlign: 'center',
    fontWeight: 'bold'
  };

  const decreaseHealth = (amount) => {
    const newHealth = currentHealth - amount;
    //setCurrentHealth(newHealth < 0 ? 0 : newHealth);
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={healthBarStyles}>
        <div style={currentHealthBarStyles}></div>
      </div>
      <p style={healthTextStyles}>{currentHealth} / {health}</p>
    </div>
  );
};

export default Fighter;