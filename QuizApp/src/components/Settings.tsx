import { QuizSettings } from '../types/quiz';

interface SettingsProps {
  settings: QuizSettings;
  onUpdateSettings: (settings: Partial<QuizSettings>) => void;
  onStartQuiz: () => void;
  onBackToUpload: () => void;
}

export function Settings({ settings, onUpdateSettings, onStartQuiz, onBackToUpload }: SettingsProps) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="source">
          <span className="dot"></span>Quiz Settings
        </div>
      </div>
      <div className="card-body">
        <div style={{ display: 'grid', gap: '16px' }}>
          <label
            className="setting-item"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={settings.shuffleQuestions}
              onChange={(e) => onUpdateSettings({ shuffleQuestions: e.target.checked })}
              style={{ marginTop: '2px' }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                Randomize the order of questions
              </div>
            </div>
          </label>
          <label
            className="setting-item"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={settings.removeNumbersFromSources}
              onChange={(e) => onUpdateSettings({ removeNumbersFromSources: e.target.checked })}
              style={{ marginTop: '2px' }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                Clean up source display
              </div>
            </div>
          </label>
        </div>
      </div>
      <div className="controls">
        <div className="left-controls">
          <button className="secondary" type="button" onClick={onBackToUpload}>
            ←
          </button>
        </div>
        <div className="right-controls">
          <button type="button" onClick={onStartQuiz}>
            Start
          </button>
        </div>
      </div>
    </div>
  );
}
