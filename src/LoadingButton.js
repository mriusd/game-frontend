import React, { useState, useEffect } from 'react';
import './LoadingButton.css';

const LoadingButton = ({ onClick, children, isBattle, playerSpeed }) => {
  const [loading, setLoading] = useState(false);
  const [autoClick, setAutoClick] = useState(true);

  const handleClick = async () => {
    setLoading(true);
    await onClick();
    setTimeout(() => {
      setLoading(false);
    }, 60000 / playerSpeed);
  };

  useEffect(() => {
    let timer;

    if (autoClick && isBattle && !loading) {
      handleClick();
      timer = setTimeout(handleClick, 60000 / playerSpeed);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [autoClick, isBattle, loading, handleClick, playerSpeed]);

  // Stop the spinner when isBattle becomes false
  useEffect(() => {
    if (!isBattle) {
      setLoading(false);
    }
  }, [isBattle]);

  const handleCheckboxChange = (e) => {
    setAutoClick(e.target.checked);
  };

  return (
    <div>
      <button
        className={`loading-button ${loading ? 'loading' : ''}`}
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? <span className="spinner"></span> : null}
        {children}
      </button>
      <label htmlFor="auto-click-checkbox">
        <input
          id="auto-click-checkbox"
          type="checkbox"
          checked={autoClick}
          onChange={handleCheckboxChange}
        />
        Auto-Click
      </label>
    </div>
  );
};

export default LoadingButton;
