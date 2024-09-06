"use client"; // Add this directive

import React from 'react';
import { Navbar } from '@/components/landing/Navbar'; // Import Navbar
import Sidebar from '../components/Sidebar';
import Confetti from 'react-confetti'; // Import Confetti

const Results: React.FC = () => {
  const score = 1350; // Updated example score
  const colleges = [
    { id: 1, name: 'College A', location: 'City A', ranking: 5 },
    { id: 2, name: 'College B', location: 'City B', ranking: 10 },
    { id: 3, name: 'College C', location: 'City C', ranking: 15 },
    { id: 4, name: 'College D', location: 'City D', ranking: 20 },
    { id: 5, name: 'College E', location: 'City E', ranking: 25 },
    // ... other colleges
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
      <Navbar user={null} /> {/* Add Navbar */}
      <div className="flex grow">
        <Sidebar sections={[]} onSelectSection={async () => {}} /> {/* Add Sidebar */}
        <div className="flex grow flex-col p-4 overflow-hidden"> {/* Add margin to avoid overlap */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md relative flex flex-col items-center">
            <Confetti
              width={window.innerWidth}
              height={window.innerHeight}
              numberOfPieces={200}
              recycle={false}
            />
            <div className="flex flex-col items-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Congratulations!</h1>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">You have completed the test.</p>
              <div className="w-full text-center">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Your Score: {score}</h1>
                <h2 className="text-xl text-gray-900 dark:text-gray-100 mt-4">Colleges within range:</h2>
                <ul className="list-disc list-inside mt-2">
                  {colleges.map((college) => (
                    <li key={college.id} className="text-gray-700 dark:text-gray-300">{college.name}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Results;

