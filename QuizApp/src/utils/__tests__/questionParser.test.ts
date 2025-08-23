import { describe, it, expect } from 'vitest';
import { parseQuestionBlock, parseQuestionsFile } from '../questionParser';

describe('questionParser', () => {
  describe('parseQuestionBlock', () => {
    it('should parse a basic question block', () => {
      const block = `Source: Test Source
Question: What is 2 + 2?
[x] 4
[] 3
[] 5`;

      const result = parseQuestionBlock(block);
      expect(result.source).toBe('Test Source');
      expect(result.question).toContain('What is 2 + 2?');
      expect(result.choices).toHaveLength(3);
      expect(result.choices[0].answer).toBe('x');
      expect(result.choices[1].answer).toBe('');
      expect(result.originalBlock).toBe(block);
    });

    it('should handle question without source', () => {
      const block = `Question: What is the capital of France?
[x] Paris
[] London
[] Berlin`;

      const result = parseQuestionBlock(block);
      expect(result.source).toBe('');
      expect(result.question).toContain('What is the capital of France?');
      expect(result.choices).toHaveLength(3);
    });

    it('should handle multiline question text', () => {
      const block = `Source: Test
Question: This is a long question
that spans multiple lines
and has more content.
[x] Correct answer
[] Wrong answer`;

      const result = parseQuestionBlock(block);
      expect(result.question).toContain('This is a long question');
      expect(result.question).toContain('multiple lines');
      expect(result.question).toContain('more content');
    });

    it('should handle multiline choice text', () => {
      const block = `Question: Choose the correct option
[x] This is the correct answer
that spans multiple lines
[] This is wrong`;

      const result = parseQuestionBlock(block);
      expect(result.choices[0].text).toContain('This is the correct answer');
      expect(result.choices[0].text).toContain('multiple lines');
      expect(result.choices[0].answer).toBe('x');
    });

    it('should handle select-type questions with numbered answers', () => {
      const block = `Question: Order these events
[1] First event
[2] Second event
[3] Third event`;

      const result = parseQuestionBlock(block);
      expect(result.choices).toHaveLength(3);
      expect(result.choices[0].answer).toBe('1');
      expect(result.choices[1].answer).toBe('2');
      expect(result.choices[2].answer).toBe('3');
    });

    it('should preserve markdown in questions and choices', () => {
      const block = `Question: What does **bold** text look like?
[x] It uses **asterisks**
[] It uses \`backticks\``;

      const result = parseQuestionBlock(block);
      expect(result.question).toContain('<b>bold</b>');
      expect(result.choices[0].text).toContain('<b>asterisks</b>');
      expect(result.choices[1].text).toContain('<code>backticks</code>');
    });

    it('should handle empty or malformed blocks gracefully', () => {
      const block = `No question here
Just some random text`;

      const result = parseQuestionBlock(block);
      expect(result.source).toBe('');
      expect(result.question).toBe('');
      expect(result.choices).toHaveLength(0);
    });

    it('should handle Windows line endings', () => {
      const block = `Source: Test\r\nQuestion: Test question?\r\n[x] Answer\r\n[] Wrong`;

      const result = parseQuestionBlock(block);
      expect(result.source).toBe('Test');
      expect(result.question).toContain('Test question?');
      expect(result.choices).toHaveLength(2);
    });
  });

  describe('parseQuestionsFile', () => {
    it('should parse multiple question blocks separated by dashes', () => {
      const content = `Source: Q1
Question: First question?
[x] Correct
[] Wrong

-----

Source: Q2
Question: Second question?
[x] Right
[] Wrong`;

      const result = parseQuestionsFile(content);
      expect(result).toHaveLength(2);
      expect(result[0].source).toBe('Q1');
      expect(result[1].source).toBe('Q2');
    });

    it('should filter out empty blocks', () => {
      const content = `Source: Q1
Question: First question?
[x] Correct

-----

-----

Source: Q2
Question: Second question?
[x] Right

-----`;

      const result = parseQuestionsFile(content);
      expect(result).toHaveLength(2);
    });

    it('should handle content with Windows line endings', () => {
      const content = `Source: Q1\r\nQuestion: First question?\r\n[x] Correct\r\n\r\n-----\r\n\r\nSource: Q2\r\nQuestion: Second question?\r\n[x] Right`;

      const result = parseQuestionsFile(content);
      expect(result).toHaveLength(2);
    });

    it('should handle empty or whitespace-only content', () => {
      expect(parseQuestionsFile('')).toHaveLength(0);
      expect(parseQuestionsFile('   \n\n   ')).toHaveLength(0);
      expect(parseQuestionsFile('-----\n-----')).toHaveLength(0);
    });

    it('should handle single question without separator', () => {
      const content = `Source: Single
Question: Only question?
[x] Answer`;

      const result = parseQuestionsFile(content);
      expect(result).toHaveLength(1);
      expect(result[0].source).toBe('Single');
    });
  });
});
