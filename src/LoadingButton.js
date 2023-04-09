import React, { useState, useEffect, useCallback } from 'react';
import './LoadingButton.css';

const LoadingButton = ({ onClick, children, playerSpeed }) => {
  const [loading, setLoading] = useState(false);
  const [autoClick, setAutoClick] = useState(true);
  const [lastClick, setLastClick] = useState(Date.now());

  const handleClick = useCallback(async () => {
    console.log("handleClick called");
    setLoading(true);
    setLastClick(Date.now());
    await onClick();
    setTimeout(() => {
      setLoading(false);
    }, 60000 / playerSpeed);
  }, [onClick, playerSpeed]);

  useEffect(() => {
    if (autoClick && !loading) {
      const timeSinceLastClick = Date.now() - lastClick;
      const timeToNextClick = Math.max(0, 60000 / playerSpeed - timeSinceLastClick);
      const timer = setTimeout(() => {
        handleClick();
      }, timeToNextClick);
      return () => clearTimeout(timer);
    }
  }, [autoClick, loading, handleClick, playerSpeed, lastClick]);

  const handleCheckboxChange = (e) => {
    setAutoClick(e.target.checked);
  };

  const animationDuration = `${60000 / playerSpeed}ms`;

  return (
    <div>
      <button
        className={`loading-button ${loading ? 'loading' : ''}`}
        onClick={handleClick}
        disabled={loading}
      >
        {children}
        <div
          className={`progress-bar ${loading ? 'loading' : ''}`}
          style={{ animationDuration }}
        ></div>
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
