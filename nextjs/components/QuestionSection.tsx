import React, { useState } from 'react';

interface Section {
  type: string;
  questions: { text: string }[];
}

interface SaveSessionFunction {
  (sessionData: { sectionType: string; answers: string[]; timeSpent: number }): void;
}

const QuestionSection: React.FC<{ section: Section; saveSession: SaveSessionFunction }> = ({ section, saveSession }) => {
  const [answers, setAnswers] = useState<string[]>([]);

  const handleAnswerChange = (index: number, answer: string): void => {
    const newAnswers = [...answers];
    newAnswers[index] = answer;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    const sessionData = {
      sectionType: section.type,
      answers,
      timeSpent: 0, // Placeholder value, replace with actual time tracking
    };
    saveSession(sessionData);
  };

  return (
    <div className="question-section">
      {section.questions.map((question, index) => (
        <div key={index}>
          <p>{question.text}</p>
          <input
            type="text"
            value={answers[index] || ''}
            onChange={(e) => handleAnswerChange(index, e.target.value)}
          />
        </div>
      ))}
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default QuestionSection;