import { useState } from 'react';
import { copyToClipboard } from '../../utils/fileUtils';
import { RawQuestion } from '../../types/quiz';

interface QuizControlsProps {
  currentIndex: number;
  totalQuestions: number;
  canGoNext: boolean;
  isRevealed: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onReveal: () => void;
  rawQuestions: RawQuestion[];
  currentQuestion: { source: string; question: string };
}

export function QuizControls({
  currentIndex,
  totalQuestions,
  canGoNext,
  isRevealed,
  onPrevious,
  onNext,
  onReveal,
  rawQuestions,
  currentQuestion,
}: QuizControlsProps) {
  const [clipboardFeedback, setClipboardFeedback] = useState(false);

  const handleCopyToClipboard = async () => {
    const rawQuestion = rawQuestions.find(
      (q) => q.source === currentQuestion.source && q.question === currentQuestion.question
    );

    if (rawQuestion?.originalBlock) {
      try {
        const blockText = rawQuestion.originalBlock + "\n-----\n";
        await copyToClipboard(blockText);
        
        setClipboardFeedback(true);
        setTimeout(() => setClipboardFeedback(false), 1000);
      } catch (error) {
        console.error('Failed to copy to clipboard:', error);
      }
    }
  };

  const isLast = currentIndex === totalQuestions - 1;

  return (
    <div className="controls">
      <div className="left-controls">
        <button
          className="secondary"
          type="button"
          title="Copy question text to clipboard"
          onClick={handleCopyToClipboard}
          style={{
            background: clipboardFeedback ? 'var(--green)' : '',
            color: clipboardFeedback ? 'white' : '',
          }}
        >
          {clipboardFeedback ? '✓' : '📋'}
        </button>
        <button
          className="secondary"
          type="button"
          disabled={currentIndex === 0}
          onClick={onPrevious}
        >
          Previous
        </button>
        <button className="secondary" type="button" onClick={onReveal}>
          {isRevealed ? 'Unreveal' : 'Reveal'}
        </button>
      </div>
      <div className="right-controls">
        <div className="status"></div>
        <button
          type="button"
          disabled={isLast && !canGoNext}
          onClick={onNext}
        >
          {isLast ? 'Finish' : 'Next'}
        </button>
      </div>
    </div>
  );
}
