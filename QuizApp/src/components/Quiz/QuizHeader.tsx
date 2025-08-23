interface QuizHeaderProps {
  source: string;
  currentIndex: number;
  totalQuestions: number;
  removeNumbersFromSources: boolean;
}

export function QuizHeader({ 
  source, 
  currentIndex, 
  totalQuestions, 
  removeNumbersFromSources 
}: QuizHeaderProps) {
  let formattedSource = source || "";
  if (removeNumbersFromSources) {
    formattedSource = formattedSource.replace(/[0-9]+\.\s/g, "");
  }

  return (
    <div className="card-header">
      <div className="source">
        <span className="dot"></span>
        <span dangerouslySetInnerHTML={{ __html: formattedSource }} />
      </div>
      <div className="progress">
        Question {currentIndex + 1} of {totalQuestions}
      </div>
    </div>
  );
}
