import React, { useState } from "react";

const MoveFighterForm = ({ fighter, moveFighter }) => {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  const handleSubmit = async (event) => {
    console.log("Submit fighter move");
    event.preventDefault();

    moveFighter(parseInt(x), parseInt(y));
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="x">X:</label>
      <input
        type="number"
        id="x"
        value={x}
        onChange={(e) => setX(e.target.value)}
      />
      <label htmlFor="y">Y:</label>
      <input
        type="number"
        id="y"
        value={y}
        onChange={(e) => setY(e.target.value)}
      />
      <button type="submit">Move Fighter</button>
    </form>
  );
};

export default MoveFighterForm;
