import React, { useState, useRef, useEffect } from 'react';
import './CommandLine.css';

import { useEventCloud } from './EventCloudContext';

const CommandLine = () => {
  const [command, setCommand] = useState('');

  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const { sendCommand } = useEventCloud();
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      setTimeout(() => {
        inputRef.current.setSelectionRange(command.length, command.length);
      }, 0);
    }
  }, [command]);

  const handleChange = (e) => {
    setCommand(e.target.value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Command:", command);
    sendCommand(command);
    setCommandHistory([...commandHistory, command]);
    setHistoryIndex(-1);
    setCommand('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp' && historyIndex < commandHistory.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setCommand(commandHistory[commandHistory.length - 1 - newIndex]);
    } else if (e.key === 'ArrowDown' && historyIndex > -1) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      if (newIndex === -1) {
        setCommand('');
      } else {
        setCommand(commandHistory[commandHistory.length - 1 - newIndex]);
      }
    }
  };

  return (
    <form className="command-line" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        type="text"
        value={command}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Enter command here"
      />
      <button type="submit">Send</button>
    </form>
  );
};

export default CommandLine;