"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import Timer from '../components/Timer';
import { Section, Question } from '../types';
import { Navbar } from '@/components/landing/Navbar';

const IndexPage: React.FC = () => {
  const [sections, setSections] = useState<Section[]>([]);
  const [currentSection, setCurrentSection] = useState<{ questions: Question[] } | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [startTimer, setStartTimer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFetchingSection, setisFetchingSection] = useState(false);
  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchSections = async () => {
      const response = await fetch('/api/sections');
      const data = await response.json();
      setSections(data);
    };
    fetchSections();
  }, []);

  useEffect(() => {
    console.log('currentSection', currentSection);
  }, [currentSection]);

  const handleSelectSection = async (sectionName: string, sectionId: string) => {
    setLoading(true);
    setisFetchingSection(true);
    try {
      const response = await fetch(`/api/sections/${sectionName}`);
      const data = await response.json();
      setCurrentQuestionIndex(0);
      setCurrentSection(data);
      setStartTimer(true);
    } catch (error) {
      console.error('Error fetching section:', error);
    } finally {
      setLoading(false);
      setisFetchingSection(false);
    }
  };

  const handleAddSection = async (type: string, sectionName: string) => {
    setIsCreatingSection(true);
    try {
      const response = await fetch('/api/ai/generateSection', {
        method: 'POST',
        body: JSON.stringify({ name: sectionName, type: type }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      console.log('data', data);
      const newSection = {
        id: data.id,
        name: data.name,
        type: data.section_type,
        questions: data.questions,
        created_at: data.created_at
      };
      console.log('newSection', newSection);
      setSections([newSection, ...sections]);
      await handleSelectSection(data.name, data.id);
    } catch (error) {
      console.error('Error creating section:', error);
    } finally {
      setIsCreatingSection(false);
    }
  };

  const handleSubmitAnswers = (answers: Record<number, string>) => {
    setStartTimer(false);
    router.push('/results');
  };

  const handleNextQuestion = () => {
    if (currentSection && currentQuestionIndex < currentSection.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      resetSelectedAnswer();
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      resetSelectedAnswer();
    }
  };

  const resetSelectedAnswer = () => {
    const radios = document.getElementsByName(`question-${currentQuestionIndex}`);
    radios.forEach((radio) => {
      (radio as HTMLInputElement).checked = false;
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
      <Navbar user={null} />
      <div className="flex grow">
        <Sidebar sections={sections} onSelectSection={handleSelectSection} onAddSection={handleAddSection} isCreatingSection={isCreatingSection} setIsCreatingSection={setIsCreatingSection}/>
        <div className="flex grow flex-col p-4">
          {loading || isFetchingSection || isCreatingSection ? (
            <div className="flex flex-col justify-center items-center h-full">
              <div className="flex justify-center items-center margin-auto">
                <svg aria-hidden="true" className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                  <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                </svg>              
                <span className="sr-only">Loading...</span>            
              </div>
              {isFetchingSection && (
                <div className="text-center text-blue-500">Fetching section, please wait...</div>
              )}
              {isCreatingSection && (
                <div className="text-center text-blue-500">Creating section, please wait...</div>
              )}
            </div>
          ) : (
            currentSection && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <Timer startTimer={startTimer} />
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Question {currentQuestionIndex + 1}</h2>
                  {currentSection.questions && currentSection.questions[currentQuestionIndex] && (
                    <>
                      <p className="text-gray-700 dark:text-gray-300">
                        {currentSection.questions[currentQuestionIndex].question}
                      </p>
                      <div className="mt-4">
                        {currentSection.questions[currentQuestionIndex].answer_choices && currentSection.questions[currentQuestionIndex].answer_choices.map((choice, index) => (
                          <div key={index} className="mb-2">
                            <label className="inline-flex items-center">
                              <input type="radio" name={`question-${currentQuestionIndex}`} value={choice} className="form-radio" />
                              <span className="ml-2 text-gray-700 dark:text-gray-300">{choice}</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
                <div className="flex justify-between">
                  <button
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {currentSection.questions && currentQuestionIndex < currentSection.questions.length - 1 ? (
                    <button
                      onClick={handleNextQuestion}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSubmitAnswers({})}
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Submit
                    </button>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default IndexPage;