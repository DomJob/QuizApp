import { Choice, SingleResponse } from '../../types/quiz';
import { isChoiceCorrect } from '../../utils/quizUtils';

interface SingleChoiceProps {
  choices: Choice[];
  response: SingleResponse;
  onResponseChange: (response: SingleResponse) => void;
  isRevealed: boolean;
  questionIndex: number;
}

export function SingleChoice({
  choices,
  response,
  onResponseChange,
  isRevealed,
  questionIndex,
}: SingleChoiceProps) {
  return (
    <div className="choices">
      {choices.map((choice, idx) => {
        const id = `q${questionIndex}_r${idx}`;
        const isSelected = response === idx;
        
        let choiceClass = 'choice';
        if (isRevealed) {
          const correct = isChoiceCorrect(
            { type: 'single', choices } as any,
            choice,
            response
          );
          const incorrect = isSelected && !correct;
          if (correct) choiceClass += ' correct';
          if (incorrect) choiceClass += ' incorrect';
        }

        return (
          <label key={idx} className={choiceClass}>
            <input
              type="radio"
              name={`q_${questionIndex}`}
              id={id}
              checked={isSelected}
              onChange={() => onResponseChange(idx)}
            />
            <div className="label">
              <div
                className="text"
                dangerouslySetInnerHTML={{ __html: choice.text }}
              />
            </div>
          </label>
        );
      })}
    </div>
  );
}
