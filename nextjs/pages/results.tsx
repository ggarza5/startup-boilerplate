import React from 'react';
import ResultsPage from '../components/ResultsPage';

const Results: React.FC = () => {
  const score = 1200; // Example score
  const colleges = [
    { id: 1, name: 'College A' },
    { id: 2, name: 'College B' },
    // ... other colleges
  ];

  return <ResultsPage score={score} colleges={colleges} />;
};

export default Results;