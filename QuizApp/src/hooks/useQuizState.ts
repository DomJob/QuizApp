import { useState, useCallback } from 'react';
import { AppState, QuizSettings, QuestionResponse } from '../types/quiz';
import { buildQuizData, computeResults } from '../utils/quizUtils';
import { parseQuestionsFile } from '../utils/questionParser';

const DEFAULT_STATE: AppState = {
  currentView: 'uploader',
  quizState: {
    questions: [],
    rawQuestions: [],
    currentIndex: 0,
    responses: new Map(),
    revealed: new Set(),
  },
  settings: {
    shuffleQuestions: true,
    removeNumbersFromSources: true,
  },
  uploadStatus: '',
};

export function useQuizState() {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);

  const setView = useCallback((view: AppState['currentView']) => {
    setState(prev => ({ ...prev, currentView: view }));
  }, []);

  const setUploadStatus = useCallback((status: string) => {
    setState(prev => ({ ...prev, uploadStatus: status }));
  }, []);

  const updateSettings = useCallback((settings: Partial<QuizSettings>) => {
    setState(prev => ({
      ...prev,
      settings: { ...prev.settings, ...settings }
    }));
  }, []);

  const loadQuizFromText = useCallback((text: string) => {
    try {
      const rawQuestions = parseQuestionsFile(text);
      if (!rawQuestions || !rawQuestions.length) {
        throw new Error("No questions found in file");
      }
      setState(prev => ({
        ...prev,
        quizState: {
          ...prev.quizState,
          rawQuestions,
        },
        currentView: 'settings',
        uploadStatus: '',
      }));
    } catch (error) {
      setUploadStatus(`Failed to load file. ${error instanceof Error ? error.message : ''}`);
    }
  }, []);

  const startQuiz = useCallback(() => {
    const questions = buildQuizData(state.quizState.rawQuestions, state.settings.shuffleQuestions);
    setState(prev => ({
      ...prev,
      currentView: 'quiz',
      quizState: {
        ...prev.quizState,
        questions,
        currentIndex: 0,
        responses: new Map(),
        revealed: new Set(),
      }
    }));
  }, [state.quizState.rawQuestions, state.settings.shuffleQuestions]);

  const updateResponse = useCallback((questionIndex: number, response: QuestionResponse) => {
    setState(prev => ({
      ...prev,
      quizState: {
        ...prev.quizState,
        responses: new Map(prev.quizState.responses).set(questionIndex, response),
      }
    }));
  }, []);

  const toggleReveal = useCallback((questionIndex: number) => {
    setState(prev => {
      const newRevealed = new Set(prev.quizState.revealed);
      if (newRevealed.has(questionIndex)) {
        newRevealed.delete(questionIndex);
      } else {
        newRevealed.add(questionIndex);
      }
      return {
        ...prev,
        quizState: {
          ...prev.quizState,
          revealed: newRevealed,
        }
      };
    });
  }, []);

  const navigateToQuestion = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      quizState: {
        ...prev.quizState,
        currentIndex: Math.max(0, Math.min(index, prev.quizState.questions.length - 1)),
      }
    }));
  }, []);

  const finishQuiz = useCallback(() => {
    const results = computeResults(state.quizState.questions, state.quizState.responses);
    setState(prev => ({
      ...prev,
      currentView: 'results',
      results,
    }));
  }, [state.quizState.questions, state.quizState.responses]);

  const resetQuiz = useCallback(() => {
    setState(DEFAULT_STATE);
  }, []);

  return {
    state,
    setView,
    setUploadStatus,
    updateSettings,
    loadQuizFromText,
    startQuiz,
    updateResponse,
    toggleReveal,
    navigateToQuestion,
    finishQuiz,
    resetQuiz,
  };
}
