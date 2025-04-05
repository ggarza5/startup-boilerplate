'use client';

// This file defines the results page component for displaying the results of a quiz section.

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/landing/Navbar';
import Sidebar from '../components/Sidebar';
import Confetti from 'react-confetti';
import { Section, Question } from '../types';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import Font Awesome CSS
import {
  faCheck,
  faTimes,
  faQuestion
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useUser } from '@/context/UserContext'; // Import useUser
import { Loader } from '@/components/ui/loader';
import { calculateScore } from '../utils/helpers';
import { ProgressButton } from '../components/ProgressButton';

const Results: React.FC = () => {
  return (
    <Suspense fallback={<Loader />}>
      <ResultsPage />
    </Suspense>
  );
};

// Main component for the Results Page
const ResultsPage: React.FC = () => {
  const { user, userLoading } = useUser(); // Use the useUser hook
  const router = useRouter();
  const queryVariables = useSearchParams();
  const userAnswersQuery = queryVariables?.get('userAnswers');
  const sectionName = queryVariables?.get('sectionName'); // Get sectionName from URL
  const sectionId = queryVariables?.get('sectionId'); // Get sectionId from URL
  const userAnswers = userAnswersQuery
    ? JSON.parse(decodeURIComponent(userAnswersQuery))
    : {};
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );
  const [currentSection, setCurrentSection] = useState<Section | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if window is defined
      // Your logic that requires window
    }
  }, []);

  useEffect(() => {
    setIsClient(true); // Set to true when the component mounts on the client
  }, []);

  // Fetch sections from the API when the component mounts
  useEffect(() => {
    if (userLoading) return; // Wait for user to load
    if (!user) {
      router.push('/auth'); // Redirect to login if no user
      return;
    }

    const fetchSections = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/sections');
        const data = await response.json();
        setSections(data);
      } catch (error) {
        console.error('Error fetching sections:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSections();
  }, [user, userLoading]);

  // Set the current section based on the section name from the query parameters
  useEffect(() => {
    if (sections.length > 0 && sectionName) {
      const section = sections.find((sec) => sec.name === sectionName);
      setCurrentSection(section || null);
    }
  }, [sections, sectionName]);

  // Fetch the current section based on the section ID from the query parameters
  useEffect(() => {
    const fetchCurrentSection = async () => {
      if (sectionId) {
        try {
          setIsLoading(true);
          const response = await fetch(`/api/section/${sectionId}`);
          const data = await response.json();
          setCurrentSection(data);
        } catch (error) {
          console.error('Error fetching section:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchCurrentSection();
  }, [sectionId]);

  // Handle clicking on a question to view its details
  const handleQuestionClick = (question: Question) => {
    setSelectedQuestion(question);
  };

  // Handle going back to the results summary
  const handleBackToResults = () => {
    setSelectedQuestion(null);
  };

  // Get the status of a question (correct, incorrect, or unanswered)
  const getQuestionStatus = (question: Question, index: number) => {
    const userAnswer = userAnswers[index]; // Use index to get the user answer
    if (!userAnswer) return 'unanswered';
    return userAnswer === question.answer ? 'correct' : 'incorrect';
  };

  // Calculate the summary of the results
  const calculateSummary = () => {
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;
    let percentageCorrect = 0;

    if (currentSection && currentSection.questions) {
      // Added check here
      currentSection.questions.forEach((question, index) => {
        const status = getQuestionStatus(question, index);
        if (status === 'correct') correct++;
        else if (status === 'incorrect') incorrect++;
        else unanswered++;
      });

      percentageCorrect = calculateScore(
        currentSection as Section, // Safe to cast here due to the check
        userAnswers
      );
    }

    return { correct, incorrect, unanswered, percentageCorrect };
  };

  const summary = calculateSummary();

  // Handle selecting a section from the sidebar
  const handleSelectSection = async (
    sectionName: string,
    sectionId: string
  ) => {
    router.push(`/questions?section=${sectionName}&sectionId=${sectionId}`); // Add this line to update the URL with sectionId
  };

  // Handle adding a new section from the sidebar
  const handleAddSection = async (
    type: string,
    sectionName: string,
    category?: string
  ) => {
    let url = `/questions?addSection=true&type=${type}&sectionName=${sectionName}`;
    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }
    router.push(url);
  };

  // Handle going to the detailed review page
  const handleGoToReview = () => {
    router.push(`/review?sectionId=${sectionId}`);
  };

  return (
    <div className="flex flex-col bg-muted/40">
      <Navbar user={user} /> {/* Pass user to Navbar */}
      <div className="flex scrollbar-thin scrollbar-thumb-scrollbar-thumb-light scrollbar-track-scrollbar-track-light dark:scrollbar-thumb-scrollbar-thumb-dark dark:scrollbar-track-scrollbar-track-dark">
        <Sidebar
          onSelectSection={handleSelectSection}
          onAddSection={handleAddSection}
          isCreatingSection={false}
          setIsCreatingSection={() => {}}
        />
        <div className="flex flex-col p-4 h-vh-minus-navbar w-full">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader />
            </div>
          ) : selectedQuestion ? (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md relative flex flex-col items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Question Review
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                {selectedQuestion.question}
              </p>
              <div className="w-full text-left">
                {selectedQuestion?.answer_choices?.map((choice, index) => (
                  <div
                    key={index}
                    className={`mb-2 p-2 rounded text-gray-700 dark:text-gray-300 ${
                      choice === selectedQuestion.answer
                        ? 'bg-green-200 dark:bg-green-800'
                        : choice === userAnswers[selectedQuestion.id]
                          ? 'bg-red-200'
                          : 'bg-transparent'
                    }`}
                  >
                    <span className="font-bold mr-2 text-gray-700 dark:text-gray-300">
                      {String.fromCharCode(65 + index)}.
                    </span>{' '}
                    {/* Render choice letter */}
                    {choice}
                  </div>
                ))}
              </div>
              <p className="text-md text-gray-700 dark:text-gray-300 mt-4">
                {selectedQuestion.explanation}
              </p>
              <button
                onClick={handleBackToResults}
                className="mt-4 bg-gray-500 hover:bg-gray-700 dark:bg-gray-700 hover:dark:bg-gray-600 text-white dark:text-black font-bold py-2 px-4 rounded"
              >
                Back to Results
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md relative flex flex-col items-center w-full overflow-y-scroll h-full scrollbar-thin scrollbar-thumb-scrollbar-thumb-light scrollbar-track-scrollbar-track-light dark:scrollbar-thumb-scrollbar-thumb-dark dark:scrollbar-track-scrollbar-track-dark">
              {isClient && ( // Only render Confetti on the client
                <Confetti
                  width={window.innerWidth - 312} // Now safe to access window
                  height={window.innerHeight} // Now safe to access window
                  numberOfPieces={200}
                  recycle={false}
                />
              )}
              <div className="flex flex-col items-center ">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  Congratulations!
                </h1>
                <p className="text-lg text-gray-700 dark:text-gray-300 text-center mb-8 ">
                  You have completed the section.<br></br>Select a question to
                  see its explanation.
                </p>
                <div className="flex gap-4 mb-6">
                  <button
                    onClick={handleGoToReview}
                    className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center"
                  >
                    <span className="mr-2">Detailed Review</span>
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                  <ProgressButton />
                </div>
                <div className="w-full text-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Your Results
                  </h2>
                  <div className="mt-4">
                    <p className="text-lg text-gray-700 dark:text-gray-300">
                      Correct: {summary.correct}, Incorrect: {summary.incorrect}
                      , Unanswered: {summary.unanswered}, Percentage Correct:{' '}
                      {summary.percentageCorrect.toFixed(2)}%
                    </p>
                    {currentSection ? (
                      currentSection.questions?.map((question, index) => (
                        <div
                          key={question.id}
                          className="text-left mb-4 p-4 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer"
                          onClick={() => handleQuestionClick(question)}
                        >
                          <p className="text-lg font-bold text-gray-900 dark:text-gray-100 inline">
                            {index + 1}. {question.question}
                          </p>
                          <p className="text-md text-gray-700 dark:text-gray-300 mt-2 inline ml-3">
                            <FontAwesomeIcon
                              icon={
                                getQuestionStatus(question, index) === 'correct'
                                  ? faCheck
                                  : getQuestionStatus(question, index) ===
                                      'incorrect'
                                    ? faTimes
                                    : faQuestion
                              }
                            />
                          </p>
                          <p className="text-md text-gray-700 dark:text-gray-300 mt-2">
                            Your Answer: {userAnswers[index] || 'Unanswered'}
                          </p>
                          <div className="mt-2">
                            {question.answer_choices.map(
                              (choice, choiceIndex) => (
                                <div
                                  key={choiceIndex}
                                  className="text-md text-gray-700 dark:text-gray-300"
                                >
                                  <span className="font-bold mr-2">
                                    {String.fromCharCode(65 + choiceIndex)}.
                                  </span>{' '}
                                  {/* Render choice letter */}
                                  {choice}
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-lg text-gray-700 dark:text-gray-300">
                        No questions available for this section.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Results;
