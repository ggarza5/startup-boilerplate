import React from 'react';

interface College {
  id: number;
  name: string;
}

interface ResultsPageProps {
  score: number;
  colleges: College[];
}

const ResultsPage: React.FC<ResultsPageProps> = ({ score, colleges }) => {
  return (
    <div>
      <h1>Your Score: {score}</h1>
      <h2>Colleges within range:</h2>
      <ul>
        {colleges.map((college) => (
          <li key={college.id}>{college.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default ResultsPage;