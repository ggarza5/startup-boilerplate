export interface Question {
  id: string;
  section_id: string;
  question: string;
  answer_choices: string[];
  answer: string;
  explanation?: string;
  created_at: string;
  // Keeping this for backward compatibility, will be deprecated
  follow_up_questions?: string[] | null;
}

export interface Section {
  id: string;
  name: string;
  type: string;
  questions: Question[];
  createdAt?: string;
}

export interface Result {
  id: string;
  user_id: string;
  section_id: string;
  score: number;
  created_at: string;
  practice_test_id?: string | null;
}

export interface PracticeTest {
  id: string;
  user_id: string;
  name: string;
  sections: string[];
  start_time?: string | null;
  end_time?: string | null;
  status: 'in_progress' | 'completed' | 'paused';
  created_at: string;
}

export interface FollowUpQuestion {
  id: string;
  question_id: string;
  follow_up_content: string;
  answer_choices: string[];
  correct_answer: string;
  explanation?: string | null;
  created_at: string;
}
