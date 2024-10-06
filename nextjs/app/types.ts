
export interface Question {
  id: string;
  section_id: string;
  question: string;
  answer_choices: string[];
  answer: string;
  explanation?: string;
  created_at: string;
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
}