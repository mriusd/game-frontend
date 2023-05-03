import React, { useState, useEffect, useCallback } from 'react';
import './LoadingButton.css';
import { useEventCloud } from './EventCloudContext';

const LoadingButton = ({ children }) => {
  const { 
    fighter,
    submitAttack
  } = useEventCloud();

  const [loading, setLoading] = useState(false);
  const [autoClick, setAutoClick] = useState(false);
  const [lastClick, setLastClick] = useState(Date.now());

  const handleClick = useCallback(async () => {
    console.log("handleClick called");
    setLoading(true);
    setLastClick(Date.now());
    await submitAttack();
    setTimeout(() => {
      setLoading(false);
    }, 60000 / fighter?.attackSpeed);
  }, [submitAttack, fighter?.attackSpeed]);

  useEffect(() => {
    if (!fighter) { return }
    if (autoClick && !loading) {
      const timeSinceLastClick = Date.now() - lastClick;
      const timeToNextClick = Math.max(0, 60000 / fighter.attackSpeed - timeSinceLastClick);
      const timer = setTimeout(() => {
        handleClick();
      }, timeToNextClick);
      return () => clearTimeout(timer);
    }
  }, [autoClick, loading, handleClick, lastClick]);

  const handleCheckboxChange = (e) => {
    setAutoClick(e.target.checked);
  };

  const animationDuration = `${60000 / fighter?.attackSpeed}ms`;

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
