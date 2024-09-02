const Results = ({ sessionData }) => {
  const calculateScore = (answers) => {
    // Implement scoring logic
    return 0; // Placeholder
  };

  const score = calculateScore(sessionData.answers);

  return (
    <div className="results">
      <h2>Results</h2>
      <p>Score: {score}</p>
      <p>Estimated SAT Score: {score * 10}</p>
      <p>Colleges in Range: ...</p>
    </div>
  );
};

export default Results;