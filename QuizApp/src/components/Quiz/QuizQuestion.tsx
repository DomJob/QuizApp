import { Question, QuestionResponse, SingleResponse, MultipleResponse, SelectResponse } from '../../types/quiz';
import { SingleChoice } from './SingleChoice';
import { MultipleChoice } from './MultipleChoice';
import { SelectChoice } from './SelectChoice';

interface QuizQuestionProps {
  question: Question;
  response: QuestionResponse;
  onResponseChange: (response: QuestionResponse) => void;
  isRevealed: boolean;
}

export function QuizQuestion({
  question,
  response,
  onResponseChange,
  isRevealed,
}: QuizQuestionProps) {
  const renderChoices = () => {
    switch (question.type) {
      case 'single':
        return (
          <SingleChoice
            choices={question.choices}
            response={(response as SingleResponse) ?? -1}
            onResponseChange={onResponseChange}
            isRevealed={isRevealed}
            questionIndex={question.index}
          />
        );
      case 'multiple':
        return (
          <MultipleChoice
            choices={question.choices}
            response={(response as MultipleResponse) ?? new Set()}
            onResponseChange={onResponseChange}
            isRevealed={isRevealed}
            questionIndex={question.index}
          />
        );
      case 'select':
        return (
          <SelectChoice
            choices={question.choices}
            selectOptions={question.selectOptions}
            response={(response as SelectResponse) ?? new Map()}
            onResponseChange={onResponseChange}
            isRevealed={isRevealed}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="card-body">
      <div
        className="question-text"
        dangerouslySetInnerHTML={{ __html: question.question || '' }}
      />
      {renderChoices()}
    </div>
  );
}
