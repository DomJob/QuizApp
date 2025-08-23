import { Choice, MultipleResponse } from '../../types/quiz';
import { isChoiceCorrect } from '../../utils/quizUtils';

interface MultipleChoiceProps {
  choices: Choice[];
  response: MultipleResponse;
  onResponseChange: (response: MultipleResponse) => void;
  isRevealed: boolean;
  questionIndex: number;
}

export function MultipleChoice({
  choices,
  response,
  onResponseChange,
  isRevealed,
  questionIndex,
}: MultipleChoiceProps) {
  const handleChoiceToggle = (idx: number, checked: boolean) => {
    const newResponse = new Set(response);
    if (checked) {
      newResponse.add(idx);
    } else {
      newResponse.delete(idx);
    }
    onResponseChange(newResponse);
  };

  return (
    <div className="choices">
      {choices.map((choice, idx) => {
        const id = `q${questionIndex}_c${idx}`;
        const isSelected = response.has(idx);
        
        let choiceClass = 'choice';
        if (isRevealed) {
          const correct = isChoiceCorrect(
            { type: 'multiple', choices } as any,
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
              type="checkbox"
              id={id}
              checked={isSelected}
              onChange={(e) => handleChoiceToggle(idx, e.target.checked)}
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
