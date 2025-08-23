import { useState } from 'react';
import { QuizResults } from '../types/quiz';
import { escapeHtml } from '../utils/htmlUtils';

interface ResultsProps {
  results: QuizResults;
  onRestart: () => void;
}

export function Results({ results, onRestart }: ResultsProps) {
  const [showReview, setShowReview] = useState(true);
  const { correctCount, total, percent, wrong, skipped } = results;

  const buildResultsContent = () => {
    const reviewItems = wrong.map((w, i) => {
      if (w.type === 'select') {
        const rowsHtml = w.details.rows!
          .slice()
          .sort((a, b) => {
            // Try to sort numerically if possible, else lexically
            const aNum = parseFloat(a.correct);
            const bNum = parseFloat(b.correct);
            if (!isNaN(aNum) && !isNaN(bNum)) {
              return aNum - bNum;
            }
            return String(a.correct).localeCompare(String(b.correct));
          })
          .map((r) => (
            <tr key={r.text}>
              <td style={{ verticalAlign: 'top', padding: '6px 8px 6px 0', width: '55%' }}>
                <div dangerouslySetInnerHTML={{ __html: r.text }} />
              </td>
              <td style={{ verticalAlign: 'top', padding: '6px 8px', color: 'var(--red)' }}>
                {escapeHtml(r.your || '(no selection)')}
              </td>
              <td style={{ verticalAlign: 'top', padding: '6px 0', color: 'var(--green)' }}>
                {escapeHtml(r.correct)}
              </td>
            </tr>
          ));

        return (
          <div key={i} className="card-body" style={{ borderTop: '1px solid var(--border)' }}>
            <div className="question-text" style={{ marginBottom: '8px' }}>
              <b>Question {w.questionIndex + 1}:</b>
              <br />
              <div dangerouslySetInnerHTML={{ __html: w.question }} />
            </div>
            <div style={{ overflow: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '6px 8px 6px 0', color: 'var(--muted)', fontWeight: 600 }}>
                      Choice
                    </th>
                    <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--muted)', fontWeight: 600 }}>
                      Your answer
                    </th>
                    <th style={{ textAlign: 'left', padding: '6px 0', color: 'var(--muted)', fontWeight: 600 }}>
                      Correct
                    </th>
                  </tr>
                </thead>
                <tbody>{rowsHtml}</tbody>
              </table>
            </div>
          </div>
        );
      }

      return (
        <div key={i} className="card-body" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="question-text" style={{ marginBottom: '8px' }}>
            <b>Question {w.questionIndex + 1}:</b>
            <br />
            <div dangerouslySetInnerHTML={{ __html: w.question }} />
          </div>
          <div style={{ display: 'grid', gap: '4px', fontSize: '14px' }}>
            <div>
              <b>Your answer:</b>
              <br />
              <div dangerouslySetInnerHTML={{ __html: w.details.your || '' }} />
            </div>
            <div>
              <b>Correct answer:</b>
              <br />
              <div dangerouslySetInnerHTML={{ __html: w.details.correct || '' }} />
            </div>
          </div>
        </div>
      );
    });

    return reviewItems;
  };

  const reviewItems = buildResultsContent();

  return (
    <div className="card">
      <div className="card-header">
        <div className="source">
          <span className="dot"></span>Results
        </div>
        <div className="progress">
          Score: {correctCount}/{total} ({percent}%)
        </div>
      </div>
      
      <div className="card-body">
        <div className="question-text" style={{ margin: 0 }}>
          Your score: <b>{percent}%</b> ({correctCount} / {total}).
          <br />
          <span style={{ color: 'var(--muted)', fontSize: '13px' }}>
            {skipped} question{skipped === 1 ? '' : 's'} skipped
          </span>
        </div>
      </div>

      {showReview && reviewItems}

      <div className="controls">
        <div className="left-controls">
          <button className="secondary" type="button" onClick={onRestart}>
            Restart
          </button>
        </div>
        <div className="right-controls">
          <div className="status"></div>
          {wrong.length > 0 ? (
            <button type="button" onClick={() => setShowReview(!showReview)}>
              {showReview ? 'Hide review' : 'Show review'}
            </button>
          ) : (
            <button type="button" onClick={onRestart}>
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
