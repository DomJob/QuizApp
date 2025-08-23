import { useState, useRef } from 'react';
import { Choice, SelectResponse } from '../../types/quiz';
import { isChoiceCorrect } from '../../utils/quizUtils';

interface SelectChoiceProps {
  choices: Choice[];
  selectOptions: string[];
  response: SelectResponse;
  onResponseChange: (response: SelectResponse) => void;
  isRevealed: boolean;
}

export function SelectChoice({
  choices,
  selectOptions,
  response,
  onResponseChange,
  isRevealed,
}: SelectChoiceProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Check if this is a drag-and-drop ordering scenario
  const isNumeric = selectOptions.every((v) => /^-?\d+(\.\d+)?$/.test(String(v)));
  const expectedCount = choices.length;
  const numericSorted = isNumeric
    ? selectOptions.map(Number).sort((a, b) => a - b)
    : [];
  const isPermutationOneToN =
    isNumeric &&
    numericSorted.length === expectedCount &&
    numericSorted.every((v, i) => v === i + 1);

  if (isPermutationOneToN && !isRevealed) {
    // Drag and drop ordering UI
    const items = choices
      .slice()
      .sort(
        (a, b) =>
          Number(response.get(a.originalIndex) || 0) -
          Number(response.get(b.originalIndex) || 0)
      );

    const handleDragStart = (e: React.DragEvent, index: number) => {
      setDraggedIndex(index);
      e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      if (draggedIndex === null) return;

      const newItems = [...items];
      const [draggedItem] = newItems.splice(draggedIndex, 1);
      newItems.splice(dropIndex, 0, draggedItem);

      // Update response map
      const newResponse = new Map(response);
      newItems.forEach((item, idx) => {
        newResponse.set(item.originalIndex, String(idx + 1));
      });
      onResponseChange(newResponse);
      setDraggedIndex(null);
    };

    return (
      <div className="choices" ref={containerRef}>
        {items.map((choice, idx) => {
          let choiceClass = 'choice dnd-item';
          if (isRevealed) {
            const correct = isChoiceCorrect(
              { type: 'select', choices } as any,
              choice,
              response
            );
            const incorrect = !correct;
            if (correct) choiceClass += ' correct';
            if (incorrect) choiceClass += ' incorrect';
          }

          return (
            <div
              key={choice.originalIndex}
              className={choiceClass}
              draggable={!isRevealed}
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, idx)}
            >
              <div className="dnd-handle" aria-hidden="true">
                ≡
              </div>
              <div className="label" style={{ flex: 1 }}>
                <div
                  className="text"
                  dangerouslySetInnerHTML={{ __html: choice.text }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  } else {
    // Dropdown UI
    return (
      <div className="choices">
        {choices.map((choice) => {
          const current = response.get(choice.originalIndex) || '';
          
          let choiceClass = 'choice';
          if (isRevealed) {
            const correct = isChoiceCorrect(
              { type: 'select', choices } as any,
              choice,
              response
            );
            const incorrect = !correct && current !== '';
            if (correct) choiceClass += ' correct';
            if (incorrect) choiceClass += ' incorrect';
          }

          return (
            <div key={choice.originalIndex} className={choiceClass}>
              <div
                className="label"
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  width: '100%',
                }}
              >
                <div
                  className="text"
                  style={{ flex: 1 }}
                  dangerouslySetInnerHTML={{ __html: choice.text }}
                />
                <div>
                  <select
                    aria-label="Select answer"
                    value={current}
                    onChange={(e) => {
                      const newResponse = new Map(response);
                      newResponse.set(choice.originalIndex, e.target.value);
                      onResponseChange(newResponse);
                    }}
                  >
                    <option value="">Select…</option>
                    {selectOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
}
