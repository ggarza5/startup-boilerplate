import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { FollowUpQuestion } from '@/app/types';

interface FollowUpChatProps {
  questionId: string;
  userAnswer: string;
  correctAnswer: string;
  explanation?: string | null;
}

interface ChatMessage {
  id: string;
  content: string;
  sender: 'system' | 'user';
  isFollowUp?: boolean;
}

/**
 * FollowUpChat component
 * Displays a chat-like interface for follow-up questions after a user answers a question
 *
 * @param questionId - The ID of the main question
 * @param userAnswer - The user's answer to the main question
 * @param correctAnswer - The correct answer to the main question
 * @param explanation - Optional explanation for the main question
 * @returns The FollowUpChat component
 */
const FollowUpChat: React.FC<FollowUpChatProps> = ({
  questionId,
  userAnswer,
  correctAnswer,
  explanation
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [followUpQuestions, setFollowUpQuestions] = useState<
    FollowUpQuestion[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentFollowUpIndex, setCurrentFollowUpIndex] = useState(-1);

  // Initialize with feedback on the answered question
  useEffect(() => {
    const initialMessage: ChatMessage = {
      id: 'initial',
      content:
        userAnswer === correctAnswer
          ? `Correct! ${explanation || ''}`
          : `The correct answer is ${correctAnswer}. ${explanation || ''}`,
      sender: 'system'
    };

    setMessages([initialMessage]);

    // Fetch follow-up questions
    const fetchFollowUpQuestions = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/follow-up-questions?questionId=${questionId}`
        );
        if (response.ok) {
          const data = await response.json();
          setFollowUpQuestions(data);

          // If there are follow-up questions, show the first one
          if (data.length > 0) {
            setCurrentFollowUpIndex(0);
            const followUpMessage: ChatMessage = {
              id: data[0].id,
              content: data[0].follow_up_content,
              sender: 'system',
              isFollowUp: true
            };
            setMessages((prev) => [...prev, followUpMessage]);
          }
        }
      } catch (error) {
        console.error('Error fetching follow-up questions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFollowUpQuestions();
  }, [questionId, userAnswer, correctAnswer, explanation]);

  /**
   * Handles when a user clicks on an answer choice
   * @param answer - The selected answer
   */
  const handleAnswerClick = (answer: string) => {
    if (
      currentFollowUpIndex === -1 ||
      currentFollowUpIndex >= followUpQuestions.length
    ) {
      return;
    }

    // Add user's answer to messages
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: answer,
      sender: 'user'
    };
    setMessages((prev) => [...prev, userMessage]);

    // Get current follow-up question
    const currentQuestion = followUpQuestions[currentFollowUpIndex];

    // Add feedback based on whether the answer was correct
    const feedbackMessage: ChatMessage = {
      id: `feedback-${Date.now()}`,
      content:
        answer === currentQuestion.correct_answer
          ? `Correct! ${currentQuestion.explanation || ''}`
          : `The correct answer is ${currentQuestion.correct_answer}. ${currentQuestion.explanation || ''}`,
      sender: 'system'
    };

    // Move to next follow-up question if available
    if (currentFollowUpIndex < followUpQuestions.length - 1) {
      const nextIndex = currentFollowUpIndex + 1;
      const nextQuestion = followUpQuestions[nextIndex];

      const nextFollowUpMessage: ChatMessage = {
        id: nextQuestion.id,
        content: nextQuestion.follow_up_content,
        sender: 'system',
        isFollowUp: true
      };

      setMessages((prev) => [...prev, feedbackMessage, nextFollowUpMessage]);
      setCurrentFollowUpIndex(nextIndex);
    } else {
      // No more follow-up questions
      const completionMessage: ChatMessage = {
        id: 'completion',
        content: 'You have completed all follow-up questions for this topic.',
        sender: 'system'
      };

      setMessages((prev) => [...prev, feedbackMessage, completionMessage]);
      setCurrentFollowUpIndex(-1); // Reset
    }
  };

  /**
   * Gets the current follow-up question based on the index
   * @returns The current follow-up question or null if none is available
   */
  const getCurrentFollowUpQuestion = () => {
    if (
      currentFollowUpIndex >= 0 &&
      currentFollowUpIndex < followUpQuestions.length
    ) {
      return followUpQuestions[currentFollowUpIndex];
    }
    return null;
  };

  const currentFollowUp = getCurrentFollowUpQuestion();

  return (
    <div className="mt-6 p-4 border rounded-lg bg-card shadow-sm">
      <h3 className="text-lg font-semibold mb-3">Understanding Deeper</h3>

      <div className="space-y-4 mb-4 max-h-80 overflow-y-auto">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-3 rounded-lg ${
              message.sender === 'system'
                ? 'bg-muted text-foreground'
                : 'bg-primary/10 text-foreground ml-8'
            }`}
          >
            <p>{message.content}</p>
          </div>
        ))}
      </div>

      {isLoading && (
        <p className="text-center text-muted-foreground">
          Loading follow-up questions...
        </p>
      )}

      {!isLoading && currentFollowUp && (
        <div className="mt-4">
          <p className="font-medium mb-2">Your answer:</p>
          <div className="grid grid-cols-1 gap-2">
            {currentFollowUp.answer_choices.map((choice, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start h-auto py-2 px-3 whitespace-normal text-left"
                onClick={() => handleAnswerClick(choice)}
              >
                {choice}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowUpChat;
