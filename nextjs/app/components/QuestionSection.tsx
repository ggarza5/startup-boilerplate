import React, { useState } from 'react';
import { Question } from '../types';

interface QuestionSectionProps {
  questions: Question[];
  onSubmit: (answers: Record<string, string>) => void;
}

const QuestionSection: React.FC<QuestionSectionProps> = ({ questions, onSubmit }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const handleChange = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = () => {
    onSubmit(answers);
  };

  return (
    <div>
      {questions && questions.length > 0 ? questions.map((question) => (
        <div key={question.id}>
          <p>{question.question}</p>
          {question.answer_choices.map((option) => (
            <label key={`${question.id}-${option}`}>
              <input
                type="radio"
                name={question.id}
                value={option}
                onChange={() => handleChange(question.id, option)}
              />
              {option}
            </label>
          ))}
        </div>
      )) : <p>No questions available</p>}
      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
};

export default QuestionSection;