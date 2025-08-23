import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GitHubLink } from '../GitHubLink';

describe('GitHubLink', () => {
  it('should render link to GitHub repository', () => {
    render(<GitHubLink />);
    
    const link = screen.getByLabelText('View on GitHub');
    expect(link).toHaveAttribute('href', 'https://github.com/DomJob/QuizApp');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should have correct CSS class', () => {
    render(<GitHubLink />);
    
    const link = screen.getByLabelText('View on GitHub');
    expect(link).toHaveClass('github-link');
  });

  it('should contain SVG icon', () => {
    render(<GitHubLink />);
    
    const svg = screen.getByLabelText('View on GitHub').querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });
});
