import React, { useState, useEffect } from 'react';

interface AutoCloseTimerProps {
  onComplete: () => void;
  durationMs?: number;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const AutoCloseTimer: React.FC<AutoCloseTimerProps> = ({
  onComplete,
  durationMs = 5000,
  size = 24,
  color = '#8E8E93',
  strokeWidth = 2,
}) => {
  const [timeLeft, setTimeLeft] = useState(durationMs);
  const [isActive, setIsActive] = useState(false);
  const hasCompletedRef = React.useRef(false);

  useEffect(() => {
    // Reset the completion flag if duration or logic resets
    hasCompletedRef.current = false;
  }, [durationMs]);

  useEffect(() => {
    // When the mouse is outside the extension window, isActive should be true
    const handleMouseLeave = () => setIsActive(true);
    // When the mouse enters the window, we freeze and brutally reset the timer
    const handleMouseEnter = () => {
      setIsActive(false);
      setTimeLeft(durationMs);
    };

    // By default, if the cursor is already fully outside the popup when it opens, 
    // it won't fire mouseleave unless it crosses the boundary. 
    // To gracefully handle this, we assume it's NOT active until they leave.
    document.body.addEventListener('mouseleave', handleMouseLeave);
    document.body.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [durationMs]);

  useEffect(() => {
    if (!isActive) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 50) {
          clearInterval(timer);
          if (!hasCompletedRef.current) {
            hasCompletedRef.current = true;
            onComplete();
          }
          return 0;
        }
        return prev - 50;
      });
    }, 50);

    return () => clearInterval(timer);
  }, [isActive, onComplete]);

  // If the user hasn't left the window yet, hide the SVG with opacity so it still occupies the 24px layout space invisibly.
  const isVisible = isActive || timeLeft < durationMs;

  // Mathematics for the SVG ring drawing
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = timeLeft / durationMs;
  const strokeDashoffset = circumference - progress * circumference;

  return (
    <div 
      className="popup-auto-close-timer" 
      style={{ 
        width: size, 
        height: size, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        position: 'relative',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 0.2s ease-in-out',
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
      title="Auto-closing..."
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(142, 142, 147, 0.2)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.05s linear' }}
          strokeLinecap="round"
        />
      </svg>
      <span 
        style={{ 
          position: 'absolute', 
          fontSize: '10px', 
          color, 
          fontWeight: 600,
          fontFamily: 'Inter, sans-serif'
        }}
      >
        {Math.ceil(timeLeft / 1000)}
      </span>
    </div>
  );
};
