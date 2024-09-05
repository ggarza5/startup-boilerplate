"use client"; // Add this directive

import React from 'react';
import ResultsPage from '../components/ResultsPage';
import { Navbar } from '@/components/landing/Navbar'; // Import Navbar
import Sidebar from '../components/Sidebar';

const Results: React.FC = () => {
  const score = 1200; // Example score
  const colleges = [
    { id: 1, name: 'College A' },
    { id: 2, name: 'College B' },
    // ... other colleges
  ];

  return (
    <div className="flex flex-col h-screen">
      <Navbar user={null} /> {/* Add Navbar */}
      <div className="flex grow">
        <Sidebar sections={[]} onSelectSection={async () => {}} /> {/* Add Sidebar */}
        <div className="flex grow flex-col ml-64"> {/* Add margin to avoid overlap */}
          <ResultsPage score={score} colleges={colleges} />
        </div>
      </div>
    </div>
  );
};

export default Results;

