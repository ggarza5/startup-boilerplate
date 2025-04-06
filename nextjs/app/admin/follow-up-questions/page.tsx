'use client';

import { useState, useEffect, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { FollowUpQuestion, Question } from '@/app/types';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * FollowUpQuestionsPage
 *
 * Admin page for managing follow-up questions. Allows administrators to:
 * - View existing follow-up questions for any question
 * - Add new follow-up questions
 * - Delete existing follow-up questions
 *
 * @returns The FollowUpQuestionsPage component
 */
export default function FollowUpQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [followUpQuestions, setFollowUpQuestions] = useState<
    FollowUpQuestion[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(
    null
  );
  const [newFollowUp, setNewFollowUp] = useState({
    followUpContent: '',
    answerChoices: ['', '', '', ''],
    correctAnswer: '',
    explanation: ''
  });
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch all questions
        const { data: questionsData, error: questionsError } = await supabase
          .from('questions')
          .select('*')
          .order('created_at', { ascending: false });

        if (questionsError) throw questionsError;
        setQuestions(questionsData || []);

        // Fetch all follow-up questions
        const { data: followUpData, error: followUpError } = await supabase
          .from('follow_up_questions')
          .select('*')
          .order('created_at', { ascending: false });

        if (followUpError) throw followUpError;
        setFollowUpQuestions(followUpData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load questions and follow-ups',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddFollowUp = async () => {
    if (!selectedQuestionId) {
      toast({
        title: 'Error',
        description: 'Please select a question first',
        variant: 'destructive'
      });
      return;
    }

    if (!newFollowUp.followUpContent || !newFollowUp.correctAnswer) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    // Filter out empty answer choices
    const filteredAnswerChoices = newFollowUp.answerChoices.filter(
      (choice) => choice.trim() !== ''
    );

    if (filteredAnswerChoices.length < 2) {
      toast({
        title: 'Error',
        description: 'Please provide at least two answer choices',
        variant: 'destructive'
      });
      return;
    }

    if (!filteredAnswerChoices.includes(newFollowUp.correctAnswer)) {
      toast({
        title: 'Error',
        description: 'The correct answer must be one of the answer choices',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('follow_up_questions')
        .insert([
          {
            question_id: selectedQuestionId,
            follow_up_content: newFollowUp.followUpContent,
            answer_choices: filteredAnswerChoices,
            correct_answer: newFollowUp.correctAnswer,
            explanation: newFollowUp.explanation || null
          }
        ])
        .select();

      if (error) throw error;

      setFollowUpQuestions([...(data || []), ...followUpQuestions]);

      toast({
        title: 'Success',
        description: 'Follow-up question added successfully'
      });

      // Reset form
      setNewFollowUp({
        followUpContent: '',
        answerChoices: ['', '', '', ''],
        correctAnswer: '',
        explanation: ''
      });
      setIsFormOpen(false);
    } catch (error) {
      console.error('Error adding follow-up question:', error);
      toast({
        title: 'Error',
        description: 'Failed to add follow-up question',
        variant: 'destructive'
      });
    }
  };

  const handleDeleteFollowUp = async (id: string) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this follow-up question?'
      )
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from('follow_up_questions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setFollowUpQuestions(followUpQuestions.filter((q) => q.id !== id));

      toast({
        title: 'Success',
        description: 'Follow-up question deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting follow-up question:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete follow-up question',
        variant: 'destructive'
      });
    }
  };

  const getQuestionById = (id: string) => {
    return questions.find((q) => q.id === id);
  };

  const getFollowUpsForQuestion = (questionId: string) => {
    return followUpQuestions.filter((fq) => fq.question_id === questionId);
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold tracking-tight mb-6">
        Follow-up Questions Management
      </h1>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Follow-up Questions Overview</CardTitle>
          <CardDescription>
            Add and manage follow-up questions for existing questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <>
              <div className="mb-4">
                <Label htmlFor="questionSelect">Select a Question:</Label>
                <select
                  id="questionSelect"
                  className="w-full p-2 border rounded mt-1"
                  value={selectedQuestionId || ''}
                  onChange={(e) =>
                    setSelectedQuestionId(e.target.value || null)
                  }
                >
                  <option value="">-- Select a question --</option>
                  {questions.map((question) => (
                    <option key={question.id} value={question.id}>
                      {question.question.substring(0, 100)}...
                    </option>
                  ))}
                </select>
              </div>

              {selectedQuestionId && (
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                      Follow-up Questions for Selected Question
                    </h3>
                    <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                      <DialogTrigger asChild>
                        <Button>Add Follow-up</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Add Follow-up Question</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="content">Question Content</Label>
                            <Textarea
                              id="content"
                              placeholder="Enter the follow-up question"
                              className="min-h-20"
                              value={newFollowUp.followUpContent}
                              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                                setNewFollowUp({
                                  ...newFollowUp,
                                  followUpContent: e.target.value
                                })
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label>Answer Choices</Label>
                            {newFollowUp.answerChoices.map((choice, index) => (
                              <Input
                                key={index}
                                placeholder={`Answer choice ${index + 1}`}
                                value={choice}
                                onChange={(
                                  e: ChangeEvent<HTMLInputElement>
                                ) => {
                                  const updatedChoices = [
                                    ...newFollowUp.answerChoices
                                  ];
                                  updatedChoices[index] = e.target.value;
                                  setNewFollowUp({
                                    ...newFollowUp,
                                    answerChoices: updatedChoices
                                  });
                                }}
                                className="mb-2"
                              />
                            ))}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="correctAnswer">
                              Correct Answer
                            </Label>
                            <Input
                              id="correctAnswer"
                              placeholder="Enter the correct answer"
                              value={newFollowUp.correctAnswer}
                              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setNewFollowUp({
                                  ...newFollowUp,
                                  correctAnswer: e.target.value
                                })
                              }
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="explanation">
                              Explanation (Optional)
                            </Label>
                            <Textarea
                              id="explanation"
                              placeholder="Explain why this answer is correct"
                              className="min-h-20"
                              value={newFollowUp.explanation}
                              onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
                                setNewFollowUp({
                                  ...newFollowUp,
                                  explanation: e.target.value
                                })
                              }
                            />
                          </div>

                          <Button
                            className="w-full"
                            onClick={handleAddFollowUp}
                          >
                            Add Follow-up Question
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Follow-up Question</TableHead>
                        <TableHead>Answer Choices</TableHead>
                        <TableHead>Correct Answer</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFollowUpsForQuestion(selectedQuestionId).length >
                      0 ? (
                        getFollowUpsForQuestion(selectedQuestionId).map(
                          (followUp) => (
                            <TableRow key={followUp.id}>
                              <TableCell className="max-w-xs truncate">
                                {followUp.follow_up_content}
                              </TableCell>
                              <TableCell className="max-w-xs truncate">
                                {followUp.answer_choices.join(', ')}
                              </TableCell>
                              <TableCell>{followUp.correct_answer}</TableCell>
                              <TableCell>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() =>
                                    handleDeleteFollowUp(followUp.id)
                                  }
                                >
                                  Delete
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        )
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">
                            No follow-up questions for this question yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
