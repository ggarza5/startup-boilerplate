"use client";

// This file defines the main page component for handling sections and questions in a quiz application.

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import Timer from '../components/Timer';
import { Section, Question } from '../types';
import { Loader } from '@/components/ui/loader';
import { createClient } from '@/utils/supabase/client';
import { Navbar } from '../components/ui/Navbar';
import { User } from '@supabase/supabase-js';
import QuestionComponent from '../components/Question'; // Import QuestionComponent

const IndexPage: React.FC = () => {
  return (
    <Suspense fallback={<Loader />}>
      <QuestionsPage />
    </Suspense>
  );
};

// Main component for the Index Page
const QuestionsPage: React.FC = () => {
  const queryVariables = useSearchParams();
  const querySectionId = queryVariables?.get('sectionId');
  const querySectionName = queryVariables?.get('sectionName');
  let queryAddSection = queryVariables?.get('addSection');
  const queryType = queryVariables?.get('type');

  const [sections, setSections] = useState<Section[]>([]);
  const [currentSection, setCurrentSection] = useState<Section | null>(null); 
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [startTimer, setStartTimer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFetchingSection, setIsFetchingSection] = useState(false);
  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [unansweredQuestions, setUnansweredQuestions] = useState<Set<number>>(new Set());
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const router = useRouter();

  const [sectionsLoaded, setSectionsLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null); // Update state type to User | null
  const supabase = createClient();
  const [selectedAnswerState, setSelectedAnswerState] = useState<string | null>(null);


  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error("Error fetching user:", error.message);
          router.push('/auth'); // Redirect to auth if not logged in
          return;
        }
        
        if (data && data.user) {
          setUser(data.user as User); // Cast to User type
        } else {
          console.log("No user data available:", data);
          router.push('/auth'); // Redirect to auth if not logged in
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      }
      setLoading(false);
    };
  
    fetchUser();
  }, []);


  // Handle section selection based on query parameters
  useEffect(() => {
    if (sectionsLoaded && querySectionId) 
      handleSelectSection(querySectionName as string, querySectionId as string);    
  }, [sectionsLoaded, querySectionId]);


  // Handle adding a new section based on query parameters
  useEffect(() => {
    if (queryAddSection) {
      queryAddSection = null;
      handleAddSection(queryType as string, querySectionName as string);
    }
  }, [sectionsLoaded, queryAddSection]);


  // Fetch sections from the API when the component mounts
  useEffect(() => {

    const fetchSections = async () => {
      const response = await fetch('/api/sections');
      const data = await response.json();
      setSections(data);
      setSectionsLoaded(true);
    };
    fetchSections();
  }, [])


useEffect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault(); // Prevent default behavior of arrow keys
        handlePreviousQuestion(); // Move to the previous question
        break;
      case 'ArrowDown':
      case 'ArrowRight':
      case 'Enter':
        event.preventDefault(); // Prevent default behavior of arrow keys
        handleNextQuestion(); // Move to the next question
        break;      
      default:
        break;
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  
  return () => {
    window.removeEventListener('keydown', handleKeyDown);
  };
}, [currentQuestionIndex, currentSection]); // Add dependencies

  // Function to handle section selection
  const handleSelectSection = async (sectionName: string, sectionId: string) => {
    setLoading(true);
    setIsFetchingSection(true);
    setUnansweredQuestions(new Set());
    setUserAnswers({});
    try {
      const response = await fetch(`/api/section/${sectionId}`);
      const data = await response.json();
      setCurrentQuestionIndex(0);
      setCurrentSection(data);
      setStartTimer(true);
    } catch (error) {
      console.error('Error fetching section:', error);
    } finally {
      setLoading(false);
      setIsFetchingSection(false);
    }
  };

  // Function to handle adding a new section
  const handleAddSection = async (type: string, sectionName: string) => {
    const existingSection = sections.find(section => section.name === sectionName);
    if (existingSection) {
      setCurrentSection(existingSection);
      setCurrentQuestionIndex(0);
      setStartTimer(true);
      await handleSelectSection(sectionName, existingSection.id); // Wait for section selection
      return;
    }

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
      const newSection = {
        id: data.sectionId,
        name: data.name,
        type: data.section_type,
        questions: data.questions,
        created_at: data.created_at
      };
      setSections([newSection, ...sections]);
      await handleSelectSection(data.name, data.sectionId); // Wait for section selection
    } catch (error) {
      console.error('Error creating section:', error);
    } finally {
      setIsCreatingSection(false);
    }
  };

  // Function to handle submitting answers
  const handleSubmitAnswers = () => {
    const radios = document.getElementsByName(`question-${currentQuestionIndex}`);
    const selectedAnswer = Array.from(radios).find((radio) => (radio as HTMLInputElement).checked);
    if (selectedAnswer) {
      setSelectedAnswerState((selectedAnswer as HTMLInputElement).value);
      setUserAnswers((prev) => ({ ...prev, [currentQuestionIndex]: (selectedAnswer as HTMLInputElement).value }));
      setUnansweredQuestions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(currentQuestionIndex); // Remove from unanswered if answered
        return newSet;
      });
    }
    setStartTimer(false);
    router.push(`/results?userAnswers=${encodeURIComponent(JSON.stringify(userAnswers))}&sectionId=${currentSection?.id}`);
  };

  // Function to handle moving to the next question
  const handleNextQuestion = () => {
    if (currentSection && currentQuestionIndex < currentSection.questions.length - 1) {
      const radios = document.getElementsByName(`question-${currentQuestionIndex}`);
      const selectedAnswer = Array.from(radios).find((radio) => (radio as HTMLInputElement).checked);
      if (selectedAnswer) {
        setUserAnswers((prev) => ({ ...prev, [currentQuestionIndex]: (selectedAnswer as HTMLInputElement).value }));
        setUnansweredQuestions((prev) => {
          const newSet = new Set(prev);
          newSet.delete(currentQuestionIndex); // Remove from unanswered if answered
          return newSet;
        });
      } else {
        if (!userAnswers[currentQuestionIndex]) 
        setUnansweredQuestions((prev) => new Set(prev).add(currentQuestionIndex));      
      }
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      resetSelectedAnswer();
    }
  };

  // Function to handle moving to the previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const radios = document.getElementsByName(`question-${currentQuestionIndex}`);
      const selectedAnswer = Array.from(radios).find((radio) => (radio as HTMLInputElement).checked);
      if (selectedAnswer) {
        setUnansweredQuestions((prev) => {
          const newSet = new Set(prev);
          newSet.delete(currentQuestionIndex); // Remove from unanswered if answered
          return newSet;
        });
      }
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      resetSelectedAnswer();
    }
  };

  // Function to handle jumping to a specific question
  const handleGoToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    resetSelectedAnswer();
  };

  // Function to reset the selected answer for the current question
  const resetSelectedAnswer = () => {
    const radios = document.getElementsByName(`question-${currentQuestionIndex}`);
    radios.forEach((radio) => {
      (radio as HTMLInputElement).checked = false;
    });
  };

  const handleAnswerSelect = (index: number, value: string) => {
    console.log('handleAnswerSelect', index, value);
    setSelectedAnswerState(value);
    setUserAnswers((prev) => ({ ...prev, [index]: value })); // Update user answers
  };

  const renderUnansweredQuestions = () => {
    return (
      <div className="mt-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Unanswered Questions:</h3>
        <div className="flex flex-wrap gap-2">  
          { unansweredQuestions.size > 0 ? 
            Array.from(unansweredQuestions).map((index) => (
              <button
              key={index}
              onClick={() => handleGoToQuestion(index)}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
              Question {index + 1}
            </button>
            )) : <p className="text-gray-500 dark:text-gray-400 py-2">All questions answered!</p>}
        </div>
      </div>
    );
  }

const renderButtons = () => {
  if (currentSection) return (
    <div className="flex justify-between mt-4">
      <button
        onClick={handlePreviousQuestion}
        disabled={currentQuestionIndex === 0}
        className={`bg-gray-500 text-white font-bold py-2 px-4 rounded ${currentQuestionIndex === 0 ? 'opacity-50 ' : 'hover:bg-gray-700'}`}
      >
        Previous
      </button>
      {currentSection.questions && currentQuestionIndex < currentSection.questions.length - 1 ? (
        <button
          onClick={handleNextQuestion}
          className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded dark:bg-gray-400 dark:hover:bg-gray-300 dark:text-gray-800"
        >
          Next
        </button>
      ) : (
        <button
          onClick={handleSubmitAnswers}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Submit
        </button>
      )}
    </div>
  )
  else return null;
}

const renderSection = () => {
  if (currentSection) 
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md flex flex-col justify-between h-full">
        <Timer startTimer={startTimer} />
        <div className="flex-grow mb-4" style={{ width: '600px', overflowX: 'auto' }}>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Question {currentQuestionIndex + 1}</h2>
            {currentSection.questions && currentSection.questions[currentQuestionIndex] && (
              <QuestionComponent 
                question={currentSection.questions[currentQuestionIndex]} 
                currentQuestionIndex={currentQuestionIndex} // Pass currentQuestionIndex
                handleAnswerSelect={handleAnswerSelect} // Pass handleAnswerSelect
                selectedAnswer={selectedAnswerState} // Pass selectedAnswer
              />
            )}
        </div>
        {renderButtons()}
        {renderUnansweredQuestions()}
        {renderDisclaimer()}
      </div>
    );  
  else return (
    <div className="flex flex-col justify-between items-center h-full">
      <div className="flex flex-col justify-center items-center h-full">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Welcome!</h2>
        <p className="text-gray-700 dark:text-gray-300">Click a section in the sidebar or generate a new one to get started practicing.</p>
      </div>
      {renderDisclaimer()}
    </div>
  );
}

const renderDisclaimer = () => {
  return (
    <div className="p-4 text-center mt-auto">
      <p>
        By using SAT Practice Bot, you agree to our <a href="/privacy-policy" className="text-blue-500 underline">Privacy Policy</a> and have read our <a href="/terms-of-service" className="text-blue-500 underline">Terms of Service</a>.
      </p>
    </div>
  )
}

const renderLoaders = () => 
  <div className="flex flex-col justify-center items-center h-full">
    <Loader />
    {isFetchingSection && !isCreatingSection && (
      <div className="text-center text-gray-500 dark:text-gray-400">Fetching section, please wait...</div>
    )}
    {isCreatingSection &&  (
      <div className="text-center text-gray-500 dark:text-gray-400">Creating section, please wait...</div>
    )}
  </div>

  return (
    <div className="flex flex-col h-screen bg-muted/40 ">
      <Navbar user={user} /> {/* Pass user to Navbar */}
      <div className="flex grow">
        <Sidebar sections={sections} onSelectSection={handleSelectSection} onAddSection={handleAddSection} isCreatingSection={isCreatingSection} setIsCreatingSection={setIsCreatingSection}/>
        <div className="flex grow flex-col p-4">
          {loading || isFetchingSection || isCreatingSection ? (
            renderLoaders()
          ) : (
            renderSection()
          )}
        </div>
      </div>
      
    </div>
  );
};


export default IndexPage;