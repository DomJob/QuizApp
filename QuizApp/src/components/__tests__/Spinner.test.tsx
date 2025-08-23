import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner } from '../Spinner';

describe('Spinner', () => {
  it('should render spinner with default classes', () => {
    render(<Spinner />);
    
    const spinnerContainer = screen.getByText('Loading…').closest('.card');
    expect(spinnerContainer).toHaveClass('card', 'spinner-wrap');
    
    const spinner = screen.getByText('Loading…').previousElementSibling;
    expect(spinner).toHaveClass('spinner');
  });

  it('should apply custom className', () => {
    render(<Spinner className="custom-class" />);
    
    const spinnerContainer = screen.getByText('Loading…').closest('.card');
    expect(spinnerContainer).toHaveClass('card', 'spinner-wrap', 'custom-class');
  });

  it('should have accessibility attributes', () => {
    render(<Spinner />);
    
    expect(screen.getByText('Loading…')).toHaveClass('sr-only');
    expect(screen.getByText('Loading…').previousElementSibling).toHaveAttribute('aria-hidden', 'true');
  });
});
