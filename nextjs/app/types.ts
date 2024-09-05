
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
  id: number;
  name: string;
  type: string;
  questions: Question[];
}