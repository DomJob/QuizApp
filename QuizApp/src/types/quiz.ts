export interface Choice {
  text: string;
  answer: string;
  originalIndex: number;
}

export interface RawChoice {
  text: string;
  answer: string;
}

export interface RawQuestion {
  source: string;
  question: string;
  choices: RawChoice[];
  originalBlock: string;
}

export interface Question {
  source: string;
  question: string;
  choices: Choice[];
  type: QuestionType;
  selectOptions: string[];
  index: number;
}

export type QuestionType = 'single' | 'multiple' | 'select';

export type SingleResponse = number;
export type MultipleResponse = Set<number>;
export type SelectResponse = Map<number, string>;
export type QuestionResponse = SingleResponse | MultipleResponse | SelectResponse;

export interface QuizState {
  questions: Question[];
  rawQuestions: RawQuestion[];
  currentIndex: number;
  responses: Map<number, QuestionResponse>;
  revealed: Set<number>;
}

export interface QuizSettings {
  shuffleQuestions: boolean;
  removeNumbersFromSources: boolean;
}

export interface QuizResults {
  correctCount: number;
  total: number;
  percent: number;
  wrong: WrongAnswer[];
  skipped: number;
}

export interface WrongAnswer {
  questionIndex: number;
  question: string;
  type: QuestionType;
  details: WrongAnswerDetails;
}

export interface WrongAnswerDetails {
  your?: string;
  correct?: string;
  rows?: {
    text: string;
    your: string;
    correct: string;
  }[];
}

export interface AppState {
  currentView: 'uploader' | 'settings' | 'quiz' | 'results' | 'loading';
  quizState: QuizState;
  settings: QuizSettings;
  results?: QuizResults;
  uploadStatus: string;
}
