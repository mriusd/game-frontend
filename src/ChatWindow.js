import React, { useRef, useState } from 'react';
import './ChatWindow.css';

const ChatWindow = React.forwardRef((props, ref) => {
  const [messages, setMessages] = useState([]);

  const writeMessageToLog = (message, action = null, actionLabel = 'Take Action') => {
    setMessages(prevMessages => [...prevMessages, { message, action, actionLabel }]);
  };

  const handleTakeAction = (action) => {
    if (typeof action === 'function') {
      action();
    }
  };

  React.useImperativeHandle(ref, () => ({
    writeMessageToLog
  }));

  return (
    <div className="chat-window">
      <div className="chat-log">
        {messages.map(({ message, action, actionLabel }, index) => (
          <div key={index} className="chat-message">
            {message}
            &nbsp; 
            {action && (
              <button onClick={() => handleTakeAction(action)} className="take-action-btn">
                {actionLabel}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

export default ChatWindow;
