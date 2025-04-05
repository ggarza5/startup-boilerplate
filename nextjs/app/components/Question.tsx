import React from 'react';
import { Question } from '../types';

interface QuestionProps {
  question: Question;
  currentQuestionIndex: number; // Add currentQuestionIndex prop
  handleAnswerSelect: (index: number, value: string) => void; // Single click handler
  handleDoubleClickAnswer: (index: number, value: string) => void; // Add double click handler prop
  selectedAnswer: string | null; // Add selectedAnswer prop
}

/**
 * Question component
 * @param question - The question object
 * @param currentQuestionIndex - The index of the current question
 * @param handleAnswerSelect - The function to handle answer selection
 * @param handleDoubleClickAnswer - The function to handle double click answer
 * @param selectedAnswer - The selected answer
 * @returns The Question component
 */
const QuestionComponent: React.FC<QuestionProps> = ({
  question,
  currentQuestionIndex,
  handleAnswerSelect,
  handleDoubleClickAnswer,
  selectedAnswer
}) => {
  return (
    <div className="prose dark:prose-invert max-w-none p-1">
      <p className="mb-4 text-foreground">{question.question}</p>
      <ul className="list-none p-0">
        {question.answer_choices.map((choice, index) => (
          <li
            key={index}
            className="px-2 mb-2 cursor-pointer hover:bg-muted/40 hover:rounded-lg transition-colors duration-150"
            onClick={() => handleAnswerSelect(currentQuestionIndex, choice)}
            onDoubleClick={() =>
              handleDoubleClickAnswer(currentQuestionIndex, choice)
            }
          >
            <label className="inline-flex items-center cursor-pointer w-full py-2">
              <input
                type="radio"
                name={`question-${currentQuestionIndex}`}
                value={choice}
                className="form-radio cursor-pointer mr-2 text-brand-blue focus:ring-brand-blue/50"
                checked={selectedAnswer === choice}
                readOnly
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
