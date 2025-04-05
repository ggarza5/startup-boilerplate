'use client'; // Mark this as a Client Component

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Question, Section } from '@/app/types';
import { Loader } from '@/components/ui/loader';
import { createClient } from '@/utils/supabase/client';
import { Navbar } from '../components/ui/Navbar';
import Sidebar from '../components/Sidebar';
import { QuestionsButton } from '../components/QuestionsButton';
import useFetchUser from '../hooks/useFetchUser';
import * as Constants from '../constants'; // Import constants

// This component contains the logic that depends on useSearchParams
const ReviewClientComponent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sectionId = searchParams.get('sectionId');

  const [section, setSection] = useState<Section | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isCreatingSection, setIsCreatingSection] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const { user, loading: userLoading } = useFetchUser();

  useEffect(() => {
    const fetchData = async () => {
      if (!sectionId) {
        setLoading(false);
        return;
      }

      try {
        const supabase = createClient();

        // Fetch section data
        const { data: sectionData, error: sectionError } = await supabase
          .from('sections')
          .select('*')
          .eq('id', sectionId)
          .single();

        if (sectionError) {
          console.error(Constants.ERROR_FETCHING_SECTION, sectionError);
          setLoading(false);
          return;
        }

        setSection(sectionData);

        // Fetch questions for this section
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .eq('section_id', sectionId)
          .order('created_at', { ascending: true });

        if (questionsError) {
          console.error(Constants.ERROR_FETCHING_QUESTIONS, questionsError);
          setLoading(false);
          return;
        }

        setQuestions(questionsData);

        // Fetch user answers if available
        if (user) {
          const { data: answersData, error: answersError } = await supabase
            .from('answers')
            .select('*')
            .eq('section_id', sectionId)
            .eq('user_id', user.id);

          if (!answersError && answersData) {
            const userAnswerMap: Record<string, string> = {};
            answersData.forEach((answer: any) => {
              userAnswerMap[answer.question_id] = answer.answer;
            });
            setUserAnswers(userAnswerMap);
          }
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user !== undefined) {
      // Only fetch data when user state is resolved
      fetchData();
    }
  }, [sectionId, user]);

  const handleSelectSection = async (
    sectionId: string,
    sectionName?: string
  ) => {
    console.log(
      `ReviewClientComponent: handleSelectSection called with id: ${sectionId}, name: ${sectionName}`
    );
    await router.push(`/questions?sectionId=${sectionId}`);
  };

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

  const toggleExpand = (questionId: string) => {
    setExpanded((prev) => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  // Use userLoading for initial load, then the component's loading state
  if (userLoading || loading) {
    return <Loader className="h-screen" />;
  }

  if (!sectionId) {
    return (
      <div className="flex flex-col h-screen">
        <Navbar user={user} />
        <div className="flex bg-muted/40">
          <Sidebar
            onSelectSection={handleSelectSection}
            onAddSection={handleAddSection}
            isCreatingSection={isCreatingSection}
            setIsCreatingSection={setIsCreatingSection}
          />
          <div className="container mx-auto p-4">
            <div className="text-center py-10">
              <h1 className="text-2xl font-bold mb-4">
                {Constants.NO_SECTION_SELECTED_TITLE}
              </h1>
              <p className="mb-4">{Constants.NO_SECTION_SELECTED_PROMPT}</p>
              <QuestionsButton />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      <Navbar user={user} />
      <div className="flex bg-muted/40">
        <Sidebar
          onSelectSection={handleSelectSection}
          onAddSection={handleAddSection}
          isCreatingSection={isCreatingSection}
          setIsCreatingSection={setIsCreatingSection}
        />
        <div className="container mx-auto p-4 overflow-y-scroll h-vh-minus-navbar">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">
              {`Review: ${section?.section_type || ''} Section`}
              {section?.category && (
                <span className="block text-lg font-normal text-gray-600 dark:text-gray-400">
                  {section.category}
                </span>
              )}
            </h1>
            <button
              onClick={() => router.push(`/questions?sectionId=${sectionId}`)}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            >
              {Constants.TAKE_AGAIN}
            </button>
          </div>

          <div className="space-y-8">
            {questions.map((question, index) => {
              const userAnswer = userAnswers[question.id];
              const isCorrect = userAnswer === question.answer;
              const hasUserAnswer = userAnswer !== undefined;

              return (
                <div
                  key={question.id}
                  className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${
                    hasUserAnswer
                      ? isCorrect
                        ? 'border-l-4 border-green-500'
                        : 'border-l-4 border-red-500'
                      : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold">
                      Question {index + 1}
                    </h3>
                    {hasUserAnswer && (
                      <span
                        className={`px-3 py-1 rounded-full text-sm ${
                          isCorrect
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}
                      >
                        {isCorrect ? 'Correct' : 'Incorrect'}
                      </span>
                    )}
                  </div>

                  <div className="mb-4 whitespace-pre-wrap">
                    {question.question}
                  </div>

                  <div className="space-y-2 mb-4">
                    {question.answer_choices.map((choice, choiceIndex) => {
                      const isUserChoice = userAnswer === choice;
                      const isCorrectChoice = question.answer === choice;

                      return (
                        <div
                          key={choiceIndex}
                          className={`p-3 rounded-md ${
                            isUserChoice && isCorrectChoice
                              ? 'bg-green-100 dark:bg-green-900'
                              : isUserChoice && !isCorrectChoice
                                ? 'bg-red-100 dark:bg-red-900'
                                : isCorrectChoice
                                  ? 'bg-green-50 dark:bg-green-900/40'
                                  : 'bg-gray-50 dark:bg-gray-700'
                          }`}
                        >
                          <div className="flex">
                            <span className="w-6">
                              {String.fromCharCode(65 + choiceIndex)}.
                            </span>
                            <span>{choice}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => toggleExpand(question.id)}
                    className="text-blue-500 hover:text-blue-700 font-medium flex items-center"
                  >
                    {expanded[question.id]
                      ? Constants.HIDE_EXPLANATION
                      : Constants.SHOW_EXPLANATION}
                    <svg
                      className={`w-4 h-4 ml-1 transform ${expanded[question.id] ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {expanded[question.id] && (
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <h4 className="font-medium mb-2">Explanation:</h4>
                      <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                        {question.explanation || Constants.NO_EXPLANATION}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-center my-8">
            <QuestionsButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewClientComponent;
