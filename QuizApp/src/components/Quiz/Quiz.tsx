import { useEffect } from 'react';
import { QuizState, QuestionResponse, QuizSettings } from '../../types/quiz';
import { isQuestionAnswered } from '../../utils/quizUtils';
import { QuizHeader } from './QuizHeader';
import { QuizQuestion } from './QuizQuestion';
import { QuizControls } from './QuizControls';

interface QuizProps {
  quizState: QuizState;
  settings: QuizSettings;
  onUpdateResponse: (questionIndex: number, response: QuestionResponse) => void;
  onToggleReveal: (questionIndex: number) => void;
  onNavigateToQuestion: (index: number) => void;
  onFinishQuiz: () => void;
}

export function Quiz({
  quizState,
  settings,
  onUpdateResponse,
  onToggleReveal,
  onNavigateToQuestion,
  onFinishQuiz,
}: QuizProps) {
  const { questions, currentIndex, responses, revealed, rawQuestions } = quizState;
  const currentQuestion = questions[currentIndex];
  
  if (!currentQuestion) {
    return null;
  }

  const currentResponse = responses.get(currentIndex);
  const isRevealed = revealed.has(currentIndex);
  
  // Count answered questions
  const answeredCount = questions.reduce((count, q, idx) => {
    const resp = responses.get(idx);
    return count + (resp !== undefined && isQuestionAnswered(q, resp) ? 1 : 0);
  }, 0);

  const canGoNext = currentIndex < questions.length - 1 || answeredCount > 0;

  const handlePrevious = () => {
    if (currentIndex > 0) {
      onNavigateToQuestion(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      onNavigateToQuestion(currentIndex + 1);
    } else if (answeredCount > 0) {
      onFinishQuiz();
    }
  };

  const handleReveal = () => {
    onToggleReveal(currentIndex);
  };

  const handleResponseChange = (response: QuestionResponse) => {
    onUpdateResponse(currentIndex, response);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing in form fields or using modifiers
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      
      const target = e.target as HTMLElement;
      const tag = target?.tagName?.toLowerCase() || '';
      const isTextEntryEl =
        target?.isContentEditable ||
        tag === 'select' ||
        tag === 'textarea' ||
        tag === 'button';

      // Disable native arrow navigation on input elements
      if (
        tag === 'input' &&
        (e.key === 'ArrowLeft' ||
          e.key === 'ArrowRight' ||
          e.key === 'ArrowUp' ||
          e.key === 'ArrowDown')
      ) {
        e.preventDefault();
      }
      
      if (isTextEntryEl) return;

      // Number keys -> toggle/select answers
      if (/^\d$/.test(e.key)) {
        e.preventDefault();
        handleNumericChoiceKey(e.key);
        return;
      }

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        handleReveal();
      }
    };

    const handleNumericChoiceKey = (key: string) => {
      // Map '1'..'9' -> 0..8, '0' -> 9
      const number = Number(key);
      const targetIdx = number === 0 ? 9 : number - 1;
      
      if (targetIdx < 0 || targetIdx >= currentQuestion.choices.length) return;

      if (currentQuestion.type === 'single') {
        const current = responses.get(currentIndex);
        if (current === targetIdx) {
          // Toggle off if same radio pressed
          onUpdateResponse(currentIndex, -1);
        } else {
          onUpdateResponse(currentIndex, targetIdx);
        }
      } else if (currentQuestion.type === 'multiple') {
        const resp = (responses.get(currentIndex) as Set<number>) || new Set();
        const newResp = new Set(resp);
        if (newResp.has(targetIdx)) {
          newResp.delete(targetIdx);
        } else {
          newResp.add(targetIdx);
        }
        onUpdateResponse(currentIndex, newResp);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, currentQuestion, responses, onUpdateResponse, onNavigateToQuestion, onToggleReveal, onFinishQuiz]);

  return (
    <div className="card">
      <QuizHeader
        source={currentQuestion.source}
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        removeNumbersFromSources={settings.removeNumbersFromSources}
      />
      <QuizQuestion
        question={currentQuestion}
        response={currentResponse!}
        onResponseChange={handleResponseChange}
        isRevealed={isRevealed}
      />
      <QuizControls
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        canGoNext={canGoNext}
        isRevealed={isRevealed}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onReveal={handleReveal}
        rawQuestions={rawQuestions}
        currentQuestion={currentQuestion}
      />
    </div>
  );
}
