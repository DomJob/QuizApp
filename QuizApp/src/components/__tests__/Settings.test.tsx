import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Settings } from '../Settings';
import { QuizSettings } from '../../types/quiz';

describe('Settings', () => {
  const mockSettings: QuizSettings = {
    shuffleQuestions: true,
    removeNumbersFromSources: true,
  };

  const mockProps = {
    settings: mockSettings,
    onUpdateSettings: vi.fn(),
    onStartQuiz: vi.fn(),
    onBackToUpload: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render settings form with current values', () => {
    render(<Settings {...mockProps} />);
    
    expect(screen.getByText('Quiz Settings')).toBeInTheDocument();
    expect(screen.getByText('Randomize the order of questions')).toBeInTheDocument();
    expect(screen.getByText('Clean up source display')).toBeInTheDocument();
    
    const shuffleCheckbox = screen.getByLabelText(/Randomize the order of questions/);
    const cleanupCheckbox = screen.getByLabelText(/Clean up source display/);
    
    expect(shuffleCheckbox).toBeChecked();
    expect(cleanupCheckbox).toBeChecked();
  });

  it('should call onUpdateSettings when shuffle checkbox is changed', () => {
    render(<Settings {...mockProps} />);
    
    const shuffleCheckbox = screen.getByLabelText(/Randomize the order of questions/);
    fireEvent.click(shuffleCheckbox);
    
    expect(mockProps.onUpdateSettings).toHaveBeenCalledWith({ shuffleQuestions: false });
  });

  it('should call onUpdateSettings when cleanup checkbox is changed', () => {
    render(<Settings {...mockProps} />);
    
    const cleanupCheckbox = screen.getByLabelText(/Clean up source display/);
    fireEvent.click(cleanupCheckbox);
    
    expect(mockProps.onUpdateSettings).toHaveBeenCalledWith({ removeNumbersFromSources: false });
  });

  it('should call onStartQuiz when Start button is clicked', () => {
    render(<Settings {...mockProps} />);
    
    const startButton = screen.getByText('Start');
    fireEvent.click(startButton);
    
    expect(mockProps.onStartQuiz).toHaveBeenCalled();
  });

  it('should call onBackToUpload when back button is clicked', () => {
    render(<Settings {...mockProps} />);
    
    const backButton = screen.getByText('←');
    fireEvent.click(backButton);
    
    expect(mockProps.onBackToUpload).toHaveBeenCalled();
  });

  it('should render with unchecked settings', () => {
    const uncheckedSettings: QuizSettings = {
      shuffleQuestions: false,
      removeNumbersFromSources: false,
    };
    
    render(<Settings {...mockProps} settings={uncheckedSettings} />);
    
    const shuffleCheckbox = screen.getByLabelText(/Randomize the order of questions/);
    const cleanupCheckbox = screen.getByLabelText(/Clean up source display/);
    
    expect(shuffleCheckbox).not.toBeChecked();
    expect(cleanupCheckbox).not.toBeChecked();
  });
});
