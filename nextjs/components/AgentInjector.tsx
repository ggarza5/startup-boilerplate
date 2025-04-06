'use client';

import React from 'react';

// SVG component for the Discord logo - REMOVED
/*
const DiscordLogo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className="w-8 h-8 fill-white"
  >
    <path d="M20.317 4.369a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.078.037 14.077 14.077 0 0 0-1.453 3.076 18.458 18.458 0 0 0-5.602 0 14.253 14.253 0 0 0-1.453-3.076.075.075 0 0 0-.078-.037 19.736 19.736 0 0 0-4.885 1.515.069.069 0 0 0-.032.027c-2.441 4.086-3.075 8.807-2.165 13.143a.073.073 0 0 0 .042.063 21.618 21.618 0 0 0 5.693 2.099.076.076 0 0 0 .087-.027 14.996 14.996 0 0 0 1.844-3.114.071.071 0 0 0-.031-.092 16.475 16.475 0 0 1-1.448-.62.074.074 0 0 1-.017-.118 14.328 14.328 0 0 1 .788-1.016.074.074 0 0 1 .1-.019 17.181 17.181 0 0 0 6.186 0 .074.074 0 0 1 .1.019 14.38 14.38 0 0 1 .788 1.016.073.073 0 0 1-.017.118 16.397 16.397 0 0 1-1.448.62.071.071 0 0 0-.031.092 15.069 15.069 0 0 0 1.844 3.114.076.076 0 0 0 .087.027 21.618 21.618 0 0 0 5.693-2.1.073.073 0 0 0 .042-.063c.91-4.336.276-9.057-2.165-13.143a.069.069 0 0 0-.032-.027ZM8.02 15.33c-1.183 0-2.142-.966-2.142-2.16s.959-2.16 2.142-2.16c1.184 0 2.143.966 2.143 2.16s-.959 2.16-2.143 2.16Zm7.96 0c-1.183 0-2.142-.966-2.142-2.16s.959-2.16 2.142-2.16c1.184 0 2.143.966 2.143 2.16s-.959 2.16-2.143 2.16Z" />
  </svg>
);
*/

const DiscordLinkWidget: React.FC = () => {
  return (
    <a
      href="https://discord.gg/6bzAzHAhxa"
      target="_blank"
      rel="noopener noreferrer"
      title="Join our Discord!"
      className="fixed bottom-6 right-6 z-[1000] flex h-14 w-14 items-center justify-center rounded-full bg-[#5865F2] shadow-md transition-all duration-200 ease-in-out hover:scale-110 hover:shadow-lg"
    >
      {/* Replace inline SVG with img tag referencing public file */}
      <img
        src="/Discord-Symbol-White.svg" // Path relative to public folder
        alt="Discord Logo"
        className="w-8 h-8" // Apply Tailwind size classes
      />
    </a>
  );
};

// Renaming the component for clarity
export default DiscordLinkWidget;
