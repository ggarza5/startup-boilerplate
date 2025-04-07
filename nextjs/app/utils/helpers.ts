import { Section } from '../types';

export const getURL = (): string => {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
};

export const logIfNotProduction = (message: string, ...args: any[]) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(message, ...args);
  }
};

export const logErrorIfNotProduction = (error: Error) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error(error);
  }
};

export const calculateScore = (
  section: Section | null,
  userAnswers: string[]
) => {
  console.log('calculateScore', section, userAnswers);
  if (!section || !section.questions) {
    return 0; // Return 0 if section or questions are not available
  }

  let numCorrect = 0;
  section.questions.forEach((question, index) => {
    if (userAnswers[index] === question.answer) {
      numCorrect++;
    }
  });

  const score = (numCorrect / section.questions.length) * 100;
  return score;
};
