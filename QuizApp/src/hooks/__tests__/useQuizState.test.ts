import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useQuizState } from '../useQuizState';

vi.mock('../../utils/questionParser', () => ({
  parseQuestionsFile: vi.fn().mockReturnValue([
    {
      source: 'Test Source',
      question: 'Test Question?',
      choices: [
        { text: 'Option A', answer: 'x' },
        { text: 'Option B', answer: '' },
      ],
      originalBlock: 'Test block',
    },
  ]),
}));

describe('useQuizState', () => {
  let hook: ReturnType<typeof renderHook<ReturnType<typeof useQuizState>, any>>;

  beforeEach(() => {
    hook = renderHook(() => useQuizState());
  });

  it('should initialize with default state', () => {
    const { result } = hook;
    
    expect(result.current.state.currentView).toBe('uploader');
    expect(result.current.state.quizState.questions).toHaveLength(0);
    expect(result.current.state.settings.shuffleQuestions).toBe(true);
    expect(result.current.state.settings.removeNumbersFromSources).toBe(true);
    expect(result.current.state.uploadStatus).toBe('');
  });

  it('should set view correctly', () => {
    const { result } = hook;
    
    act(() => {
      result.current.setView('settings');
    });
    
    expect(result.current.state.currentView).toBe('settings');
  });

  it('should update upload status', () => {
    const { result } = hook;
    
    act(() => {
      result.current.setUploadStatus('Loading file...');
    });
    
    expect(result.current.state.uploadStatus).toBe('Loading file...');
  });

  it('should update settings', () => {
    const { result } = hook;
    
    act(() => {
      result.current.updateSettings({ shuffleQuestions: false });
    });
    
    expect(result.current.state.settings.shuffleQuestions).toBe(false);
    expect(result.current.state.settings.removeNumbersFromSources).toBe(true); // Should remain unchanged
  });

  it('should load quiz from text and navigate to settings', () => {
    const { result } = hook;
    
    act(() => {
      result.current.loadQuizFromText('Test quiz content');
    });
    
    expect(result.current.state.currentView).toBe('settings');
    expect(result.current.state.quizState.rawQuestions).toHaveLength(1);
    expect(result.current.state.uploadStatus).toBe('');
  });

  it('should handle quiz loading error', async () => {
    const { result } = hook;
    
    // Get the mocked function and make it throw an error
    const { parseQuestionsFile } = await import('../../utils/questionParser');
    (parseQuestionsFile as any).mockImplementationOnce(() => {
      throw new Error('Invalid format');
    });
    
    act(() => {
      result.current.loadQuizFromText('Invalid content');
    });
    
    expect(result.current.state.currentView).toBe('uploader'); // Should stay on uploader
    expect(result.current.state.uploadStatus).toContain('Failed to load file');
  });

  it('should start quiz and navigate to quiz view', () => {
    const { result } = hook;
    
    // First load some questions
    act(() => {
      result.current.loadQuizFromText('Test quiz content');
    });
    
    // Then start the quiz
    act(() => {
      result.current.startQuiz();
    });
    
    expect(result.current.state.currentView).toBe('quiz');
    expect(result.current.state.quizState.questions).toHaveLength(1);
    expect(result.current.state.quizState.currentIndex).toBe(0);
    expect(result.current.state.quizState.responses.size).toBe(0);
  });

  it('should update response for a question', () => {
    const { result } = hook;
    
    // Setup quiz
    act(() => {
      result.current.loadQuizFromText('Test quiz content');
      result.current.startQuiz();
    });
    
    // Update response
    act(() => {
      result.current.updateResponse(0, 1);
    });
    
    expect(result.current.state.quizState.responses.get(0)).toBe(1);
  });

  it('should toggle reveal state for a question', () => {
    const { result } = hook;
    
    // Setup quiz
    act(() => {
      result.current.loadQuizFromText('Test quiz content');
      result.current.startQuiz();
    });
    
    // Toggle reveal
    act(() => {
      result.current.toggleReveal(0);
    });
    
    expect(result.current.state.quizState.revealed.has(0)).toBe(true);
    
    // Toggle again
    act(() => {
      result.current.toggleReveal(0);
    });
    
    expect(result.current.state.quizState.revealed.has(0)).toBe(false);
  });

  it('should navigate to different questions', async () => {
    const { result } = hook;
    
    // Setup quiz with multiple questions
    const { parseQuestionsFile } = await import('../../utils/questionParser');
    (parseQuestionsFile as any).mockReturnValueOnce([
      { 
        source: 'Q1', 
        question: 'Question 1?', 
        choices: [{ text: 'A', answer: 'x' }], 
        originalBlock: '' 
      },
      { 
        source: 'Q2', 
        question: 'Question 2?', 
        choices: [{ text: 'B', answer: 'x' }], 
        originalBlock: '' 
      },
    ]);
    
    act(() => {
      result.current.loadQuizFromText('Test quiz content');
      result.current.startQuiz();
    });
    
    expect(result.current.state.quizState.currentIndex).toBe(0);
    expect(result.current.state.quizState.questions).toHaveLength(2);
    
    act(() => {
      result.current.navigateToQuestion(1);
    });
    
    expect(result.current.state.quizState.currentIndex).toBe(1);
  });

  it('should finish quiz and show results', () => {
    const { result } = hook;
    
    // Setup quiz
    act(() => {
      result.current.loadQuizFromText('Test quiz content');
      result.current.startQuiz();
      result.current.updateResponse(0, 0); // Answer first question
    });
    
    // Finish quiz
    act(() => {
      result.current.finishQuiz();
    });
    
    expect(result.current.state.currentView).toBe('results');
    expect(result.current.state.results).toBeDefined();
  });

  it('should reset quiz to initial state', () => {
    const { result } = hook;
    
    // Setup quiz and make some changes
    act(() => {
      result.current.loadQuizFromText('Test quiz content');
      result.current.startQuiz();
      result.current.updateResponse(0, 1);
    });
    
    expect(result.current.state.currentView).toBe('quiz');
    
    // Reset
    act(() => {
      result.current.resetQuiz();
    });
    
    expect(result.current.state.currentView).toBe('uploader');
    expect(result.current.state.quizState.questions).toHaveLength(0);
    expect(result.current.state.quizState.responses.size).toBe(0);
  });
});
