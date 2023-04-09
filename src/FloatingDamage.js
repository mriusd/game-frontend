import React, { useEffect } from "react";
import "./FloatingDamage.css";

const FloatingDamage = ({ damage, onAnimationEnd }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onAnimationEnd();
    }, 1500);

    return () => clearTimeout(timer);
  }, [onAnimationEnd]);

  return (
    <div className="floating-damage" onAnimationEnd={onAnimationEnd}>
      -{damage}
    </div>
  );
};

export default FloatingDamage;
