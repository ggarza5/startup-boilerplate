// Main component for the Index Page
'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import Timer from '../components/Timer';
import { Section, Question } from '../types';
import { Loader } from '@/components/ui/loader';
import { createClient } from '@/utils/supabase/client';
import { Navbar } from '../components/ui/Navbar';
import { User } from '@supabase/supabase-js';
import QuestionComponent from '../components/Question';
import {
  calculateScore,
  logErrorIfNotProduction,
  logIfNotProduction
} from '../utils/helpers';
import { useSections } from '@/context/SectionsContext';
import { ProgressButton } from '../components/ProgressButton';
import * as Constants from '../constants'; // Import constants
import RecentSectionCard from '../components/RecentSectionCard'; // Import the new card
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion'; // Import framer-motion

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
  const queryCategory = queryVariables?.get('category');

  const { sections, fetchSections, isLoadingSections } = useSections();
  const [currentSection, setCurrentSection] = useState<Section | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [startTimer, setStartTimer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isFetchingSection, setIsFetchingSection] = useState(false);
  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [unansweredQuestions, setUnansweredQuestions] = useState<Set<number>>(
    new Set()
  );
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const router = useRouter();

  const [sectionsLoaded, setSectionsLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();
  const [selectedAnswerState, setSelectedAnswerState] = useState<
    Record<number, string>
  >({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generationMessages, setGenerationMessages] = useState<string[]>([]); // State for messages
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0); // State for current message index
  const processingSectionIdRef = useRef<string | null>(null); // Ref to track processing ID
  const lastProcessedTimeRef = useRef<Map<string, number>>(new Map()); // NEW: Map to track when a section was last processed
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(
    null
  );
  const DEBOUNCE_INTERVAL = 2000; // 2 seconds debounce interval - ignore repeated calls within this window
  const [optimisticActiveSectionId, setOptimisticActiveSectionId] = useState<
    string | null
  >(null); // NEW STATE

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          logErrorIfNotProduction(error);
          router.push('/auth');
          return;
        }

        if (data && data.user) {
          setUser(data.user as User);
        } else {
          logIfNotProduction('No user data available:', data);
          router.push('/auth');
        }
      } catch (err: any) {
        logErrorIfNotProduction(err);
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  // Handle section selection based on query parameters
  useEffect(() => {
    if (sectionsLoaded && querySectionId) {
      // Get current time and compare with last processed time for this ID
      const now = Date.now();
      const lastProcessed = lastProcessedTimeRef.current.get(querySectionId);
      const timeSinceLastProcessed = lastProcessed
        ? now - lastProcessed
        : Infinity;

      // Only call handleSelectSection if it's been at least DEBOUNCE_INTERVAL since we last processed this ID
      if (timeSinceLastProcessed > DEBOUNCE_INTERVAL)
        handleSelectSection(
          querySectionId as string,
          querySectionName as string
        );
    }
  }, [sectionsLoaded, querySectionId]); // Simplified dependency array

  useEffect(() => {
    const currentSectionId = currentSection?.id;
    const searchParamSectionId = queryVariables?.get('sectionId');

    // Only update URL if a section is loaded AND its ID doesn't match the URL param
    if (currentSectionId && currentSectionId !== searchParamSectionId)
      router.replace(`/questions?sectionId=${currentSectionId}`, undefined);
  }, [currentSection?.id, queryVariables, router]);

  // Handle adding a new section based on query parameters
  useEffect(() => {
    if (queryAddSection === 'true' && queryType && querySectionName) {
      handleAddSection(queryType, querySectionName, queryCategory || undefined);
      router.replace('/questions', undefined);
    }
  }, [queryAddSection, queryType, querySectionName, queryCategory]);

  useEffect(() => {
    if (sections.length > 0) {
      setSectionsLoaded(true);
    }
  }, [sections]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          handlePreviousQuestion();
          break;
        case 'ArrowDown':
        case 'ArrowRight':
        case 'Enter':
          event.preventDefault();
          handleNextQuestion();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentQuestionIndex, currentSection]);

  // Define the sequence of messages
  const GENERATION_FEEDBACK_MESSAGES = [
    'Asking the SAT Practice Bot...',
    'Generating unique SAT questions just for you...',
    'Tailoring explanations...',
    'Almost there, preparing your section...'
  ];

  // Effect to cycle through messages during generation
  useEffect(() => {
    let messageTimer: NodeJS.Timeout | null = null;

    if (isCreatingSection) {
      setGenerationMessages(GENERATION_FEEDBACK_MESSAGES);
      setCurrentMessageIndex(0); // Start from the first message

      const showNextMessage = (index: number) => {
        if (index < GENERATION_FEEDBACK_MESSAGES.length - 1) {
          messageTimer = setTimeout(() => {
            setCurrentMessageIndex(index + 1);
            showNextMessage(index + 1);
          }, 4500); // Increased delay to 4.5 seconds
        }
      };

      // Set the first message immediately
      setCurrentMessageIndex(0);
      // Start timeout chain for the next message
      showNextMessage(0);
    } else {
      // Reset messages when not creating
      setGenerationMessages([]);
      setCurrentMessageIndex(0);
    }

    // Cleanup function
    return () => {
      if (messageTimer) {
        clearTimeout(messageTimer);
      }
    };
  }, [isCreatingSection]);

  // --- NEW: Effect to sync optimistic state with actual currentSection ---
  useEffect(() => {
    console.log(
      `QuestionsPage: useEffect[currentSection] - Syncing optimistic ID. currentSection?.id=${currentSection?.id}`
    );
    setOptimisticActiveSectionId(currentSection?.id || null);
  }, [currentSection]);

  // Function to handle section selection
  const handleSelectSection = async (
    sectionId: string,
    sectionName?: string
  ) => {
    // Set optimistic state immediately
    setOptimisticActiveSectionId(sectionId);
    console.log(
      `QuestionsPage: handleSelectSection - Set optimisticActiveSectionId = ${sectionId}`
    );

    // Record timestamp for debouncing
    lastProcessedTimeRef.current.set(sectionId, Date.now());
    console.log(
      `QuestionsPage: handleSelectSection - Recording timestamp for ${sectionId}`
    );

    // Set processing ref
    processingSectionIdRef.current = sectionId;
    console.log(
      `QuestionsPage: handleSelectSection - Set processingIdRef = ${sectionId}`
    );

    // Set fetching state
    console.log(
      `QuestionsPage: handleSelectSection - About to set isFetchingSection = true for id: ${sectionId}`
    );
    setIsFetchingSection(true);
    setUnansweredQuestions(new Set());
    setUserAnswers({});
    setSelectedAnswerState({});
    setStartTimer(false);
    setCurrentQuestionIndex(0);

    try {
      const response = await fetch(`/api/section/${sectionId}`);
      const data = await response.json();

      if (!response.ok || !data) {
        throw new Error(data.error || Constants.ERROR_FETCHING_SECTION);
      }

      // Set the actual fetched section data
      setCurrentSection(data);
      setStartTimer(true); // Start timer only after data is ready
    } catch (error: any) {
      logErrorIfNotProduction(
        new Error(`${Constants.ERROR_FETCHING_SECTION}: ${error.message}`)
      );
      setCurrentSection(null); // Clear actual section on error
      // Optimistic state will be cleared by the useEffect watching currentSection
    } finally {
      console.log(
        `QuestionsPage: handleSelectSection FINALLY - Setting isFetchingSection = false, clearing processingIdRef for id: ${sectionId}`
      );
      setIsFetchingSection(false);
      processingSectionIdRef.current = null;
    }
  };

  // Function to handle adding a new section
  const handleAddSection = async (
    type: string,
    sectionName: string, // This is the unique timestamped name initially
    category?: string
  ) => {
    setIsCreatingSection(true); // Set loading true at the start
    let newSectionId: string | null = null;
    let newSectionTitle: string | null = null;

    try {
      const requestBody = {
        name: sectionName,
        type: type,
        category: category
      };

      const response = await fetch('/api/ai/generateSection', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();

      if (response.ok && data.sectionId) {
        newSectionId = data.sectionId;
        newSectionTitle = data.name;

        // Refetch sections via context - DO NOT show global loader
        await fetchSections({ showLoader: false }); // Pass option here

        // Now that context should be updated, clear generating state
        setIsCreatingSection(false);

        // Select the new section using its ID and actual title
        if (newSectionId) {
          await handleSelectSection(newSectionId, newSectionTitle || undefined);
        } else {
          console.error(Constants.ERROR_SECTION_ID_NULL);
        }
      } else {
        // Handle API error
        const errorMsg = data.error || Constants.ERROR_UNKNOWN;
        console.error(`${Constants.ERROR_CREATING_SECTION_API}:`, errorMsg);
        logErrorIfNotProduction(new Error(errorMsg));
        setIsCreatingSection(false); // Also clear loading on error
      }
    } catch (error: any) {
      // Handle fetch error
      logErrorIfNotProduction(
        new Error(`${Constants.ERROR_CREATING_SECTION_API}: ${error.message}`)
      );
      setIsCreatingSection(false); // Clear loading on error
    }
    // Removed finally block as setIsCreatingSection is handled in try/catch
  };

  // Function to handle submitting answers
  const handleSubmitAnswers = async () => {
    setIsSubmitting(true);
    // Changed to async
    const radios = document.getElementsByName(
      `question-${currentQuestionIndex}`
    );
    const selectedAnswer = Array.from(radios).find(
      (radio) => (radio as HTMLInputElement).checked
    );
    if (selectedAnswer) {
      setSelectedAnswerState((prev) => ({
        ...prev,
        [currentQuestionIndex]: (selectedAnswer as HTMLInputElement).value
      }));
      setUserAnswers((prev) => ({
        ...prev,
        [currentQuestionIndex]: (selectedAnswer as HTMLInputElement).value
      }));
      setUnansweredQuestions((prev) => {
        const newSet = new Set(prev);
        newSet.delete(currentQuestionIndex); // Remove from unanswered if answered
        return newSet;
      });
    }
    setStartTimer(false);
    try {
      const response = await fetch('/api/results', {
        // Call the POST route
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: user?.id, // Assuming user?.id is the user ID
          sectionId: currentSection?.id, // Current section ID
          score: calculateScore(
            currentSection as Section,
            Object.values(userAnswers)
          ) // Function to calculate score based on userAnswers
        })
      });

      if (!response.ok) {
        throw new Error(Constants.ERROR_SUBMITTING_ANSWERS);
      }

      const result = await response.json();

      // Store user answers in Supabase for each question
      if (currentSection && currentSection.questions) {
        const answersPromises = currentSection.questions.map(
          (question, index) => {
            if (userAnswers[index]) {
              return fetch('/api/sectionSession/answer', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  userId: user?.id,
                  sectionId: currentSection.id,
                  questionId: question.id,
                  answer: userAnswers[index]
                })
              });
            }
            return Promise.resolve();
          }
        );

        await Promise.all(answersPromises);
      }

      // Redirect to the review page instead of the results page
      router.push(`/review?sectionId=${currentSection?.id}`);
    } catch (error: any) {
      logErrorIfNotProduction(
        new Error(`${Constants.ERROR_SUBMITTING_ANSWERS}: ${error.message}`)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to handle moving to the next question
  const handleNextQuestion = () => {
    if (
      currentSection &&
      currentSection.questions &&
      currentQuestionIndex < currentSection.questions.length - 1
    ) {
      setSlideDirection('right'); // Set direction BEFORE changing index
      clearSelection();
      const radios = document.getElementsByName(
        `question-${currentQuestionIndex}`
      );
      const selectedAnswer = Array.from(radios).find(
        (radio) => (radio as HTMLInputElement).checked
      );
      if (selectedAnswer) {
        setUserAnswers((prev) => ({
          ...prev,
          [currentQuestionIndex]: (selectedAnswer as HTMLInputElement).value
        }));
        setUnansweredQuestions((prev) => {
          const newSet = new Set(prev);
          newSet.delete(currentQuestionIndex); // Remove from unanswered if answered
          return newSet;
        });
      } else {
        if (!userAnswers[currentQuestionIndex])
          setUnansweredQuestions((prev) =>
            new Set(prev).add(currentQuestionIndex)
          );
      }
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      resetSelectedAnswer();
    }
  };

  // Function to handle moving to the previous question
  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setSlideDirection('left'); // Set direction BEFORE changing index
      clearSelection();
      const radios = document.getElementsByName(
        `question-${currentQuestionIndex}`
      );
      const selectedAnswer = Array.from(radios).find(
        (radio) => (radio as HTMLInputElement).checked
      );
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
    // Determine slide direction based on jump
    if (index > currentQuestionIndex) {
      setSlideDirection('right');
    } else if (index < currentQuestionIndex) {
      setSlideDirection('left');
    } else {
      // If jumping to the same question, no direction needed (or set null)
      // This case likely won't happen with unanswered list, but good practice
      setSlideDirection(null);
    }

    // Update the index after setting direction
    setCurrentQuestionIndex(index);
    resetSelectedAnswer();
  };

  // Function to reset the selected answer for the current question
  const resetSelectedAnswer = () => {
    // No need to manually reset radios if using controlled components properly
    // setSelectedAnswerState((prev) => ({ ...prev, [currentQuestionIndex]: null }));
  };

  const handleAnswerSelect = (index: number, value: string) => {
    // --- Simplified: Only update state ---
    // 1. Update states
    setSelectedAnswerState((prev) => ({ ...prev, [index]: value }));
    setUserAnswers((prev) => ({ ...prev, [index]: value }));

    // 2. Update unanswered set immediately
    setUnansweredQuestions((prev) => {
      const newSet = new Set(prev);
      newSet.delete(index); // Remove from unanswered
      return newSet;
    });
    // --- Removed next/submit logic ---
  };

  // --- NEW: Handler for double-click ---
  const handleDoubleClickAnswer = (index: number, value: string) => {
    // Check if the double-clicked value is the currently selected answer
    // AND if the interaction is for the currently displayed question
    if (
      selectedAnswerState[index] === value &&
      index === currentQuestionIndex
    ) {
      // Determine if it's the last question
      const isLastQuestion =
        currentSection &&
        currentSection.questions &&
        currentQuestionIndex === currentSection.questions.length - 1;

      if (isLastQuestion) {
        handleSubmitAnswers();
      } else {
        handleNextQuestion();
      }
    }
    // If it's not a double-click on the currently selected answer, do nothing.
  };

  const renderUnansweredQuestions = () => {
    return (
      <div className="mt-6 pt-6 border-t border-border/60 max-h-36 overflow-y-auto scrollbar-thin scrollbar-thumb-scrollbar-thumb-light scrollbar-track-scrollbar-track-light dark:scrollbar-thumb-scrollbar-thumb-dark dark:scrollbar-track-scrollbar-track-dark pr-2">
        <h3 className="text-base font-semibold text-foreground/80 mb-3 sticky top-0 py-1">
          Unanswered Questions
        </h3>
        <div className="flex flex-wrap gap-2 h-8">
          {unansweredQuestions.size > 0 ? (
            Array.from(unansweredQuestions).map((index) => (
              <button
                key={index}
                onClick={() => handleGoToQuestion(index)}
                className="text-sm bg-muted hover:bg-accent text-muted-foreground hover:text-accent-foreground font-medium py-1.5 px-3 rounded-md transition-colors duration-150 border border-border"
              >
                Q {index + 1}
              </button>
            ))
          ) : (
            <p className="text-sm text-muted-foreground py-1 h-8">
              {Constants.SIDEBAR_QUESTION_SKIP_INFO}
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderButtons = () => {
    if (!currentSection || !currentSection.questions) return null;

    const questionCount = currentSection.questions.length;
    const isLastQuestion = currentQuestionIndex === questionCount - 1;

    return (
      <div className="flex justify-between mt-6 pt-6 border-t border-border/60">
        <Button
          variant="outline"
          onClick={handlePreviousQuestion}
          disabled={currentQuestionIndex === 0}
          className={`flex items-center gap-2 ${currentQuestionIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <i className="fas fa-arrow-left w-3 h-3"></i>
          {Constants.PREVIOUS_QUESTION}
        </Button>
        {isLastQuestion ? (
          <Button
            onClick={handleSubmitAnswers}
            disabled={isSubmitting}
            className="bg-brand-green hover:bg-brand-green/90 text-white font-bold flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader className="w-4 h-4" />
                {Constants.SUBMITTING}
              </>
            ) : (
              <>
                {Constants.SUBMIT}
                <i className="fas fa-check w-3 h-3"></i>
              </>
            )}
          </Button>
        ) : (
          <Button
            variant="default"
            onClick={handleNextQuestion}
            className="bg-brand-blue-hex dark:bg-brand-blue-hex text-white dark:text-white hover:bg-[#03a3d7] dark:hover:bg-[#03a3d7] focus-visible:ring-brand-blue-hex transition-colors duration-150"
          >
            {Constants.NEXT_QUESTION}
            <i className="fas fa-arrow-right w-3 h-3 ml-2"></i>
          </Button>
        )}
      </div>
    );
  };

  // Define animation variants
  const variants = {
    enter: (direction: 'left' | 'right') => ({
      x: direction === 'right' ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: 'left' | 'right') => ({
      zIndex: 0,
      x: direction === 'right' ? '-100%' : '100%',
      opacity: 0
    })
  };

  const renderSection = () => {
    if (currentSection)
      return (
        <div className="p-6 rounded-lg shadow-md flex flex-col justify-between h-full">
          <Timer startTimer={startTimer} resetKey={currentSection?.id || 0} />
          <div
            className="flex-grow mb-4"
            style={{ width: '600px', overflowX: 'auto' }}
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Question {currentQuestionIndex + 1}
            </h2>
            {/* == Scrollable Question Area == */}
            {/* Use relative positioning for the container to contain the absolute positioned motion divs */}
            <div className="flex-grow overflow-hidden mb-4 relative">
              {/* AnimatePresence handles enter/exit animations */}
              {/* Use `mode="wait"` if you want the old one to exit before the new one enters */}
              <AnimatePresence
                initial={false}
                custom={slideDirection}
                mode="wait"
              >
                {/* motion.div wraps the component to be animated */}
                {/* Use `key={currentQuestionIndex}` to trigger animation on index change */}
                <motion.div
                  key={currentQuestionIndex}
                  custom={slideDirection}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{
                    x: { type: 'tween', ease: 'easeInOut', duration: 0.3 },
                    opacity: { duration: 0.2 }
                  }}
                  // Add absolute positioning to allow stacking during transition
                  className="absolute w-full h-full overflow-y-auto scrollbar-thin scrollbar-thumb-scrollbar-thumb-light scrollbar-track-scrollbar-track-light dark:scrollbar-thumb-scrollbar-thumb-dark dark:scrollbar-track-scrollbar-track-dark pr-2"
                >
                  {/* Question Component */}
                  {currentSection.questions &&
                  currentSection.questions[currentQuestionIndex] ? (
                    <QuestionComponent
                      question={currentSection.questions[currentQuestionIndex]}
                      currentQuestionIndex={currentQuestionIndex}
                      handleAnswerSelect={handleAnswerSelect}
                      handleDoubleClickAnswer={handleDoubleClickAnswer}
                      selectedAnswer={
                        selectedAnswerState[currentQuestionIndex] || null
                      }
                    />
                  ) : (
                    <p>Loading question or question not found...</p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
            {renderButtons()}
            {renderUnansweredQuestions()}
            {renderDisclaimer()}
          </div>
        </div>
      );
    else
      return (
        <div className="flex flex-col justify-between items-center h-full">
          <div className="flex flex-col justify-center items-center h-full">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Welcome!
            </h2>
            <p className="text-gray-700 dark:text-gray-300 text-center">
              Click a section in the sidebar or generate a new one to get
              started practicing.
            </p>
          </div>
          <ProgressButton />
          {renderDisclaimer()}
        </div>
      );
  };

  const renderDisclaimer = () => {
    return (
      <div className="p-4 text-center mt-auto">
        <p>
          By using SAT Practice Bot, you agree to our{' '}
          <a
            href="/privacy-policy"
            className="text-[#1fc0f1]  hover:text-[#03a3d7] underline"
          >
            Privacy Policy
          </a>{' '}
          and have read our{' '}
          <a
            href="/terms-of-service"
            className="text-[#1fc0f1]  hover:text-[#03a3d7] underline"
          >
            Terms of Service
          </a>
          .
        </p>
      </div>
    );
  };

  const renderLoaders = () => (
    <div className="flex flex-col justify-center items-center h-full">
      <Loader />
      {isFetchingSection && !isCreatingSection && (
        <div className="text-center text-gray-500 dark:text-gray-400">
          Fetching section, please wait...
        </div>
      )}
      {isCreatingSection && (
        <div className="text-center text-gray-500 dark:text-gray-400">
          Creating section, please wait...
        </div>
      )}
    </div>
  );

  const clearSelection = () => {
    if (window.getSelection) {
      window.getSelection()?.removeAllRanges();
    }
  };

  // Prepare recent sections for the welcome screen
  const recentSections = [...sections] // Create a copy to sort
    .filter((section) => section.created_at) // Ensure created_at exists
    .sort((a, b) => {
      // Add checks for created_at existence
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA; // Most recent first
    })
    .slice(0, 4); // Take the top 4 most recent

  if (loading || user === null || isLoadingSections) {
    return <Loader className="h-screen" />;
  }

  return (
    <div className="flex flex-col h-screen">
      <Navbar user={user} />
      <div className="flex bg-muted/40 flex-1 overflow-hidden">
        <Sidebar
          onSelectSection={handleSelectSection}
          onAddSection={handleAddSection}
          isCreatingSection={isCreatingSection}
          setIsCreatingSection={setIsCreatingSection}
          activeSectionId={optimisticActiveSectionId}
        />
        <div className="flex-1 flex flex-col p-6 md:p-8 overflow-y-auto h-vh-minus-navbar scrollbar-thin scrollbar-thumb-scrollbar-thumb-light scrollbar-track-scrollbar-track-light dark:scrollbar-thumb-scrollbar-thumb-dark dark:scrollbar-track-scrollbar-track-dark">
          {isCreatingSection ? (
            // --- Generation Message View ---
            <div className="flex flex-col justify-center items-center h-full text-center">
              <Loader />
              {generationMessages.length > 0 &&
                currentMessageIndex < generationMessages.length && ( // Check index bounds
                  <p className="ml-4 text-lg mt-4 text-gray-700 dark:text-gray-300 animate-pulse">
                    {generationMessages[currentMessageIndex]}
                  </p>
                )}
            </div>
          ) : currentSection ? (
            // --- Active Section View --- Apply flex column and height here
            <div className="w-full max-w-3xl flex flex-col h-full">
              {/* == Top Fixed Part == */}
              <div>
                {/* Display Section Title, Loader, and Progress */}
                <div className="flex items-center gap-2 mb-1">
                  {/* Title */}
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {currentSection?.name || 'Loading Title...'}
                  </h1>
                  {/* Loader */}
                  {isFetchingSection && (
                    <Loader className="w-5 h-5 text-brand-pink dark:text-brand-pink" />
                  )}
                  {/* Progress Indicator (pushes right) */}
                  {!isFetchingSection && currentSection?.questions?.length && (
                    <div className="ml-auto text-sm font-medium text-gray-600 dark:text-gray-400">
                      Question {currentQuestionIndex + 1} /{' '}
                      {currentSection.questions.length}
                    </div>
                  )}
                </div>

                {/* Timer Component */}
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-border/60 dark:border-border/40">
                  {currentSection && (
                    <p className="text-base text-gray-600 dark:text-gray-400">
                      {currentSection.section_type} -{' '}
                      {currentSection.category || Constants.OTHER_CATEGORY}
                    </p>
                  )}
                  <Timer
                    startTimer={startTimer}
                    resetKey={currentSection?.id || 0}
                  />
                </div>
              </div>
              <div className="flex-grow overflow-hidde relative">
                {/* AnimatePresence handles enter/exit animations */}
                <AnimatePresence
                  initial={false}
                  custom={slideDirection}
                  mode="wait"
                >
                  {/* motion.div wraps the component to be animated */}
                  {/* Use `key={currentQuestionIndex}` to trigger animation on index change */}
                  <motion.div
                    key={currentQuestionIndex}
                    custom={slideDirection}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: 'tween', ease: 'easeInOut', duration: 0.3 },
                      opacity: { duration: 0.2 }
                    }}
                    // Add absolute positioning to allow stacking during transition
                    className="absolute w-full h-full overflow-y-auto scrollbar-thin scrollbar-thumb-scrollbar-thumb-light scrollbar-track-scrollbar-track-light dark:scrollbar-thumb-scrollbar-thumb-dark dark:scrollbar-track-scrollbar-track-dark pr-2"
                  >
                    {/* Question Component */}
                    {currentSection.questions &&
                    currentSection.questions[currentQuestionIndex] ? (
                      <QuestionComponent
                        question={
                          currentSection.questions[currentQuestionIndex]
                        }
                        currentQuestionIndex={currentQuestionIndex}
                        handleAnswerSelect={handleAnswerSelect}
                        handleDoubleClickAnswer={handleDoubleClickAnswer}
                        selectedAnswer={
                          selectedAnswerState[currentQuestionIndex] || null
                        }
                      />
                    ) : (
                      <p>Loading question or question not found...</p>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* == Bottom Fixed Part == */}
              <div>
                {/* Navigation Buttons */}
                {renderButtons()}

                {/* Unanswered Questions List */}
                {renderUnansweredQuestions()}
              </div>
            </div>
          ) : (
            // --- Initial/Empty State View ---
            <div className="flex flex-col justify-center items-center h-full text-center px-4">
              <h1 className="text-3xl font-bold mb-4 text-foreground">
                {Constants.WELCOME}
              </h1>
              <p className="text-lg text-muted-foreground text-center mb-6 max-w-md">
                {Constants.WELCOME_PROMPT}
              </p>
              {/* Recent Sections Area */}
              {recentSections.length > 0 && (
                <div className="mt-8 w-full max-w-2xl">
                  <h2 className="text-xl font-semibold mb-4 text-foreground/90">
                    Recent Sections
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 justify-items-center">
                    {recentSections.map((section) => (
                      <RecentSectionCard
                        key={section.id}
                        section={section}
                        onSelect={handleSelectSection}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IndexPage;
