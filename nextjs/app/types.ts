interface Question {
  id: number;
  text: string;
  options: string[];
}

export interface Section {
  id: number;
  name: string;
  type: string;
  questions: Question[];
}