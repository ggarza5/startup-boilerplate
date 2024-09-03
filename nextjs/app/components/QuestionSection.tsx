import React, { useState } from 'react';

interface Question {
  id: number;
  text: string;
  options: string[];
}

interface QuestionSectionProps {
  questions: Question[];
  onSubmit: (answers: Record<number, string>) => void;
}

const QuestionSection: React.FC<QuestionSectionProps> = ({ questions, onSubmit }) => {
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const handleChange = (questionId: number, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = () => {
    onSubmit(answers);
  };

  return (
    <div>
      {questions.map((question) => (
        <div key={question.id}>
          <p>{question.text}</p>
          {question.options.map((option) => (
            <label key={option}>
              <input
                type="radio"
                name={question.id.toString()}
                value={option}
                onChange={() => handleChange(question.id, option)}
              />
              {option}
            </label>
          ))}
        </div>
      ))}
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default QuestionSection;