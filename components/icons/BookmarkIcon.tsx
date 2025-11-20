import React from 'react';

const BookmarkIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} width="24" height="24" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
    <path d="M18 7v12l-6 -4l-6 4v-12a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4z" />
  </svg>
);

export default BookmarkIcon;
