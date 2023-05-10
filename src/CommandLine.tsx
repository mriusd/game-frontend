import React, { useState } from 'react';
import './CommandLine.css';

import { useEventCloud } from './EventCloudContext';

const CommandLine = () => {
  const [command, setCommand] = useState('');
  const { sendCommand } = useEventCloud();
  

  const handleChange = (e) => {
    setCommand(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Command:", command);
    sendCommand(command);
    setCommand('');
  };

  return (
    <form className="command-line" onSubmit={handleSubmit}>
      <input
        type="text"
        value={command}
        onChange={handleChange}
        placeholder="Enter command here"
      />
      <button type="submit">Send</button>
    </form>
  );
};

export default CommandLine;