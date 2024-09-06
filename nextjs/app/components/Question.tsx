import React from 'react';
import { Question } from '../types';

interface QuestionProps {
	question: Question;
}

const QuestionComponent: React.FC<QuestionProps> = ({ question }) => {
	return (
		<div className="question">
			<h2>{question.question}</h2>
			<ul>
				{question.answer_choices.map((choice, index) => (
					<li key={index}>{choice}</li>
				))}
			</ul>
		</div>
	);
};

export default QuestionComponent;