import { useEffect, useState } from 'react';

interface Result {
  score: number;
  colleges: { name: string }[];
}

function Results({ userId }: { userId: string }) {
  const [results, setResults] = useState<Result | null>(null);

  useEffect(() => {
    fetch(`/api/results?userId=${userId}`)
      .then((res) => res.json())
      .then((data) => setResults(data[0])); // Assuming data is an array
  }, [userId]);

  if (!results) return <div>Loading...</div>;

  return (
    <div>
      <h1>Your Score: {results.score}</h1>
      <h2>Potential Colleges:</h2>
      <ul>
        {results.colleges.map((college, index) => (
          <li key={index}>{college.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default Results;