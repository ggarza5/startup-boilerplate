import React, { useState } from 'react';
import { Question } from '../types';
import FollowUpChat from './FollowUpChat';

interface QuestionProps {
  question: Question;
  currentQuestionIndex: number; // Add currentQuestionIndex prop
  handleAnswerSelect: (index: number, value: string) => void; // Single click handler
  handleDoubleClickAnswer: (index: number, value: string) => void; // Add double click handler prop
  selectedAnswer: string | null; // Add selectedAnswer prop
  showExplanation?: boolean;
}

/**
 * Question component
 * @param question - The question object
 * @param currentQuestionIndex - The index of the current question
 * @param handleAnswerSelect - The function to handle answer selection
 * @param handleDoubleClickAnswer - The function to handle double click answer
 * @param selectedAnswer - The selected answer
 * @param showExplanation - Whether to show the explanation
 * @returns The Question component
 */
const QuestionComponent: React.FC<QuestionProps> = ({
  question,
  currentQuestionIndex,
  handleAnswerSelect,
  handleDoubleClickAnswer,
  selectedAnswer,
  showExplanation = false
}) => {
  const [showFollowUp, setShowFollowUp] = useState(false);

  // Determine if the selected answer is correct
  const isCorrect = selectedAnswer === question.answer;

  return (
    <div className="prose dark:prose-invert max-w-none p-1">
      <p className="mb-4 text-foreground">{question.question}</p>
      <ul className="list-none p-0">
        {question.answer_choices.map((choice, index) => (
          <li
            key={index}
            className={`px-2 mb-2 cursor-pointer hover:bg-muted/40 hover:rounded-lg transition-colors duration-150 ${
              showExplanation && choice === question.answer
                ? 'bg-green-100 dark:bg-green-900/30 rounded-lg'
                : showExplanation && selectedAnswer === choice && !isCorrect
                  ? 'bg-red-100 dark:bg-red-900/30 rounded-lg'
                  : ''
            }`}
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

      {showExplanation && question.explanation && (
        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Explanation</h3>
          <p>{question.explanation}</p>
        </div>
      )}

      {showExplanation && selectedAnswer && (
        <>
          {!showFollowUp && (
            <button
              onClick={() => setShowFollowUp(true)}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Show Follow-Up Questions
            </button>
          )}

          {showFollowUp && (
            <FollowUpChat
              questionId={question.id}
              userAnswer={selectedAnswer}
              correctAnswer={question.answer}
              explanation={question.explanation}
            />
          )}
        </>
      )}
    </div>
  );
};

export default QuestionComponent;
