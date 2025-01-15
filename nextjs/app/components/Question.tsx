import React from 'react';
import { Question } from '../types';

interface QuestionProps {
  question: Question;
  currentQuestionIndex: number; // Add currentQuestionIndex prop
  handleAnswerSelect: (index: number, value: string) => void; // Add handleAnswerSelect prop
  selectedAnswer: string | null; // Add selectedAnswer prop
}

/**
 * Question component
 * @param question - The question object
 * @param currentQuestionIndex - The index of the current question
 * @param handleAnswerSelect - The function to handle answer selection
 * @param selectedAnswer - The selected answer
 * @returns The Question component
 */
const QuestionComponent: React.FC<QuestionProps> = ({
  question,
  currentQuestionIndex,
  handleAnswerSelect,
  selectedAnswer
}) => {
  return (
    <div className="question">
      <h2>{question.question}</h2>
      <ul className="mt-4">
        {question.answer_choices.map((choice, index) => (
          <li
            key={index}
            className="px-2 mb-2 cursor-pointer hover:bg-muted/40 hover:rounded-2xl"
            onMouseUp={() => handleAnswerSelect(currentQuestionIndex, choice)} // Handle answer selection on <li> click
          >
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="radio"
                name={`question-${currentQuestionIndex}`} // Ensure unique name for each question
                value={choice}
                className="form-radio cursor-pointer"
                checked={selectedAnswer === choice} // Check if this choice is selected
              />
              <span className="ml-2 cursor-pointer">{choice}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuestionComponent;
