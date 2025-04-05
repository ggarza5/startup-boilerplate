export interface Question {
  id: string;
  section_id: string;
  question: string;
  answer_choices: string[];
  answer: string;
  explanation?: string | null;
  created_at: string;
}

export interface Section {
  id: string;
  name: string;
  section_type: string;
  category?: string | null;
  questions?: Question[];
  created_at?: string;
  created_by?: string;
}

export interface Result {
  id: string;
  user_id: string;
  section_id: string;
  score: number;
  created_at: string;
}
