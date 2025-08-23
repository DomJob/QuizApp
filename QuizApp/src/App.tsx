import { useQuizState } from './hooks/useQuizState';
import { Spinner } from './components/Spinner';
import { Uploader } from './components/Uploader';
import { Settings } from './components/Settings';
import { Quiz } from './components/Quiz/Quiz';
import { Results } from './components/Results';
import { GitHubLink } from './components/GitHubLink';

function App() {
  const {
    state,
    setView,
    setUploadStatus,
    updateSettings,
    loadQuizFromText,
    startQuiz,
    updateResponse,
    toggleReveal,
    navigateToQuestion,
    finishQuiz,
    resetQuiz,
  } = useQuizState();

  const handleLoadQuiz = (text: string) => {
    setView('loading');
    // Small delay to show loading state
    setTimeout(() => {
      loadQuizFromText(text);
    }, 100);
  };

  const handleShowSpinner = () => {
    setView('loading');
    setUploadStatus('');
  };

  const renderCurrentView = () => {
    switch (state.currentView) {
      case 'loading':
        return <Spinner />;
      
      case 'uploader':
        return (
          <Uploader
            onLoadQuiz={handleLoadQuiz}
            onShowSpinner={handleShowSpinner}
            uploadStatus={state.uploadStatus}
          />
        );
      
      case 'settings':
        return (
          <Settings
            settings={state.settings}
            onUpdateSettings={updateSettings}
            onStartQuiz={startQuiz}
            onBackToUpload={() => setView('uploader')}
          />
        );
      
      case 'quiz':
        return (
          <Quiz
            quizState={state.quizState}
            settings={state.settings}
            onUpdateResponse={updateResponse}
            onToggleReveal={toggleReveal}
            onNavigateToQuestion={navigateToQuestion}
            onFinishQuiz={finishQuiz}
          />
        );
      
      case 'results':
        return state.results ? (
          <Results
            results={state.results}
            onRestart={resetQuiz}
          />
        ) : null;
      
      default:
        return null;
    }
  };

  return (
    <>
      {renderCurrentView()}
      <GitHubLink />
    </>
  );
}

export default App;
