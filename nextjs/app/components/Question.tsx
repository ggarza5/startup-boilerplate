import React from 'react';
import { Question } from '../types';

interface QuestionProps {
	question: Question;
	currentQuestionIndex: number; // Add currentQuestionIndex prop
	handleAnswerSelect: (index: number, value: string) => void; // Add handleAnswerSelect prop
	selectedAnswer: string | null; // Add selectedAnswer prop
}

const QuestionComponent: React.FC<QuestionProps> = ({ question, currentQuestionIndex, handleAnswerSelect, selectedAnswer }) => {
	return (
		<div className="question" style={{ minWidth: '600px' }}>
			<h2>{question.question}</h2>
			<ul>
				{question.answer_choices.map((choice, index) => (
					<li 
						key={index} 
						className="px-2 mb-2 cursor-pointer hover:bg-gray-300 hover:rounded-2xl dark:hover:bg-gray-800" 
						onClick={() => handleAnswerSelect(currentQuestionIndex, choice)} // Handle answer selection on <li> click
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