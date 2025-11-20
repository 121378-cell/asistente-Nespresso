
import React from 'react';

const LightbulbIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    strokeWidth="2" 
    stroke="currentColor" 
    fill="none" 
    strokeLinecap="round" 
    strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M9 16a5 5 0 1 1 6 0a3.5 3.5 0 0 0 -1 3a2 2 0 0 1 -4 0a3.5 3.5 0 0 0 -1 -3" />
    <line x1="12" y1="12" x2="12" y2="16" />
    <line x1="12" y1="2" x2="12" y2="3" />
    <line x1="6" y1="6" x2="7" y2="7" />
    <line x1="18" y1="6" x2="17" y2="7" />
  </svg>
);

export default LightbulbIcon;