"use client";

// This file defines the results page component for displaying the results of a quiz section.

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/landing/Navbar';
import Sidebar from '../components/Sidebar';
import Confetti from 'react-confetti';
import { Section, Question } from '../types';
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import Font Awesome CSS
import { faCheck, faTimes, faQuestion } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useUser } from '@/context/UserContext'; // Import useUser
import { Loader } from '@/components/ui/loader';

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
  const userAnswers = userAnswersQuery ? JSON.parse(decodeURIComponent(userAnswersQuery)) : {};
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [currentSection, setCurrentSection] = useState<Section | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
    
  // Fetch sections from the API when the component mounts
  useEffect(() => {
    if (userLoading) return; // Wait for user to load
    if (!user) {
      router.push('/login'); // Redirect to login if no user
      return;
    }

    const fetchSections = async () => {
      const response = await fetch('/api/sections');
      const data = await response.json();
      setSections(data);
    };
    fetchSections();
  }, [user, userLoading]);

  // Set the current section based on the section name from the query parameters
  useEffect(() => {
    if (sections.length > 0 && sectionName) {
      const section = sections.find(sec => sec.name === sectionName);
      setCurrentSection(section || null);
    }
  }, [sections, sectionName]);

  // Fetch the current section based on the section ID from the query parameters
  useEffect(() => {
    const fetchCurrentSection = async () => {
      if (sectionId) {
        const response = await fetch(`/api/section/${sectionId}`);
        const data = await response.json();
        setCurrentSection(data);
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

    currentSection?.questions.forEach((question, index) => {
      const status = getQuestionStatus(question, index);
      if (status === 'correct') correct++;
      else if (status === 'incorrect') incorrect++;
      else unanswered++;
    });

    const total = currentSection?.questions.length || 0;
    const percentageCorrect = total > 0 ? (correct / total) * 100 : 0;

    return { correct, incorrect, unanswered, percentageCorrect };
  };

  const summary = calculateSummary();

  // Handle selecting a section from the sidebar
  const handleSelectSection = async (sectionName: string, sectionId: string) => {
    router.push(`/questions?section=${sectionName}&sectionId=${sectionId}`); // Add this line to update the URL with sectionId
  };

  // Handle adding a new section from the sidebar
  const handleAddSection = async (type: string, sectionName: string) => {
    router.push(`/questions?addSection=true&type=${type}&sectionName=${sectionName}`);
  };

  return (
    <div className="flex flex-col bg-gray-100 dark:bg-gray-900">
      <Navbar user={user} /> {/* Pass user to Navbar */}
      <div className="flex scrollbar-thin scrollbar-thumb-scrollbar-thumb-light scrollbar-track-scrollbar-track-light dark:scrollbar-thumb-scrollbar-thumb-dark dark:scrollbar-track-scrollbar-track-dark" >
        <Sidebar sections={sections} onSelectSection={handleSelectSection} onAddSection={handleAddSection} isCreatingSection={false} setIsCreatingSection={() => {}} />
        <div className="flex flex-col p-4" style={{height: 'calc(100vh - 57px)'}} >
          {selectedQuestion ? (
            <div  className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md relative flex flex-col items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Question Review</h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">{selectedQuestion.question}</p>
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
                    <span className="font-bold mr-2 text-gray-700 dark:text-gray-300">{String.fromCharCode(65 + index)}.</span> {/* Render choice letter */}
                    {choice}
                  </div>
                ))}
              </div>
              <p className="text-md text-gray-700 dark:text-gray-300 mt-4">{selectedQuestion.explanation}</p>
              <button
                onClick={handleBackToResults}
                className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Back to Results
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md relative flex flex-col items-center w-full overflow-y-scroll h-full scrollbar-thin scrollbar-thumb-scrollbar-thumb-light scrollbar-track-scrollbar-track-light dark:scrollbar-thumb-scrollbar-thumb-dark dark:scrollbar-track-scrollbar-track-dark">
              {/* confetti full width minus sidebar */}
              <Confetti
                width={window.innerWidth - 312}
                height={window.innerHeight}
                numberOfPieces={200}
                recycle={false}
              />
              <div className="flex flex-col items-center ">
                <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Congratulations!</h1>
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">You have completed the section.</p>
                <div className="w-full text-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Your Results</h2>
                  <div className="mt-4">
                    <p className="text-lg text-gray-700 dark:text-gray-300">
                      Correct: {summary.correct}, Incorrect: {summary.incorrect}, Unanswered: {summary.unanswered}, Percentage Correct: {summary.percentageCorrect.toFixed(2)}%
                    </p>
                    {currentSection ? (
                      currentSection.questions?.map((question, index) => (
                        <div
                          key={question.id}
                          className="text-left mb-4 p-4 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 cursor-pointer"
                          onClick={() => handleQuestionClick(question)}
                        >
                          <p className="text-lg font-bold text-gray-900 dark:text-gray-100 inline">{index + 1}. {question.question}</p>
                          <p className="text-md text-gray-700 dark:text-gray-300 mt-2 inline ml-3">
                            <FontAwesomeIcon icon={getQuestionStatus(question, index) === 'correct' ? faCheck : getQuestionStatus(question, index) === 'incorrect' ? faTimes : faQuestion} />
                          </p>
                          <p className="text-md text-gray-700 dark:text-gray-300 mt-2">
                            Your Answer: {userAnswers[index] || 'Unanswered'}
                          </p>
                          <div className="mt-2">
                            {question.answer_choices.map((choice, choiceIndex) => (
                              <div key={choiceIndex} className="text-md text-gray-700 dark:text-gray-300">
                                <span className="font-bold mr-2">{String.fromCharCode(65 + choiceIndex)}.</span> {/* Render choice letter */}
                                {choice}
                              </div>
                            ))}
                          </div>                          
                        </div>
                      ))
                    ) : (
                      <p className="text-lg text-gray-700 dark:text-gray-300">No questions available for this section.</p>
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

