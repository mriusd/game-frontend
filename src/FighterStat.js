import React, { useState } from "react";

function FighterStat({ name, value, onChange, availablePoints }) {
  const [pointsToAdd, setPointsToAdd] = useState(0);

  const canDecrement = value[1] > 0;
  const canIncrement = availablePoints > 0;

  function increment() {

    if (canIncrement) {
      onChange(name, [parseInt(parseInt(value[0])+1), parseInt(parseInt(value[1]) +1)]);
    }
  }

  function decrement() {
    
    if (canDecrement) {
      onChange(name, [parseInt(parseInt(value[0])-1), parseInt(parseInt(value[1]) -1)]);
    }
  }


  return (
    <div>
      <span>{name}</span>
      <button disabled={!canDecrement} onClick={decrement}>
        -
      </button>
      <span>{value[0]}</span>
      <button disabled={!canIncrement} onClick={increment}>
        +
      </button>
      {value[1] > 0 && (
        <span style={{ marginLeft: 10 }}>
          +{value[1]}
        </span>
      )}
    </div>
  );
}

export default FighterStat;