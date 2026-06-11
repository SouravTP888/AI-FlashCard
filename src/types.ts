export interface Flashcard {
  question: string;
  answer: string;
  isMastered?: boolean;
  isFlagged?: boolean;
}

export interface KeyConcept {
  term: string;
  definition: string;
  explanation: string;
}

export interface StudyData {
  flashcards: Flashcard[];
  keyConcepts: KeyConcept[];
  revisionNotes: string[];
}

export type FocusOption = "standard" | "exam-prep" | "summarized" | "conceptual";

export interface SavedDeck {
  id: string;
  title: string;
  createdAt: string;
  contentLength: number;
  data: StudyData;
  option: FocusOption;
}
