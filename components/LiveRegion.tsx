import React from 'react';

interface LiveRegionProps {
  message: string;
  priority?: 'polite' | 'assertive';
}

/**
 * LiveRegion component for screen reader announcements
 * Announces dynamic content changes to screen reader users
 */
const LiveRegion: React.FC<LiveRegionProps> = ({ message, priority = 'polite' }) => {
  if (!message) return null;

  return (
    <div role="status" aria-live={priority} aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
};

export default LiveRegion;
