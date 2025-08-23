import { describe, it, expect, beforeEach } from 'vitest';
import {
  shuffle,
  isX,
  detectType,
  buildSelectOptions,
  naturalSort,
  buildQuizData,
  isQuestionAnswered,
  isChoiceCorrect,
  getQuestionCorrectness,
  computeResults,
} from '../quizUtils';
import { RawQuestion, Question, Choice } from '../../types/quiz';

describe('quizUtils', () => {
  describe('shuffle', () => {
    it('should return array with same length', () => {
      const input = [1, 2, 3, 4, 5];
      const result = shuffle(input);
      expect(result).toHaveLength(input.length);
    });

    it('should contain all original elements', () => {
      const input = [1, 2, 3, 4, 5];
      const result = shuffle(input);
      expect(result.sort()).toEqual(input.sort());
    });

    it('should not modify original array', () => {
      const input = [1, 2, 3, 4, 5];
      const original = [...input];
      shuffle(input);
      expect(input).toEqual(original);
    });
  });

  describe('isX', () => {
    it('should return true for "x" and "X"', () => {
      expect(isX('x')).toBe(true);
      expect(isX('X')).toBe(true);
      expect(isX(' x ')).toBe(true);
      expect(isX(' X ')).toBe(true);
    });

    it('should return false for non-x values', () => {
      expect(isX('a')).toBe(false);
      expect(isX('1')).toBe(false);
      expect(isX('')).toBe(false);
      expect(isX('xx')).toBe(false);
    });

    it('should handle null and undefined', () => {
      expect(isX(null as any)).toBe(false);
      expect(isX(undefined as any)).toBe(false);
    });
  });

  describe('detectType', () => {
    it('should detect single choice questions', () => {
      const question: RawQuestion = {
        source: 'Test',
        question: 'Question?',
        choices: [
          { text: 'A', answer: 'x' },
          { text: 'B', answer: '' },
          { text: 'C', answer: '' },
        ],
        originalBlock: '',
      };
      expect(detectType(question)).toBe('single');
    });

    it('should detect multiple choice questions', () => {
      const question: RawQuestion = {
        source: 'Test',
        question: 'Question?',
        choices: [
          { text: 'A', answer: 'x' },
          { text: 'B', answer: 'x' },
          { text: 'C', answer: '' },
        ],
        originalBlock: '',
      };
      expect(detectType(question)).toBe('multiple');
    });

    it('should detect select questions', () => {
      const question: RawQuestion = {
        source: 'Test',
        question: 'Question?',
        choices: [
          { text: 'A', answer: '1' },
          { text: 'B', answer: '2' },
          { text: 'C', answer: '3' },
        ],
        originalBlock: '',
      };
      expect(detectType(question)).toBe('select');
    });

    it('should default to single for no correct answers', () => {
      const question: RawQuestion = {
        source: 'Test',
        question: 'Question?',
        choices: [
          { text: 'A', answer: '' },
          { text: 'B', answer: '' },
          { text: 'C', answer: '' },
        ],
        originalBlock: '',
      };
      expect(detectType(question)).toBe('single');
    });
  });

  describe('buildSelectOptions', () => {
    it('should sort numeric options numerically', () => {
      const choices: Choice[] = [
        { text: 'A', answer: '10', originalIndex: 0 },
        { text: 'B', answer: '2', originalIndex: 1 },
        { text: 'C', answer: '1', originalIndex: 2 },
      ];
      const result = buildSelectOptions(choices);
      expect(result).toEqual(['1', '2', '10']);
    });

    it('should sort text options alphabetically', () => {
      const choices: Choice[] = [
        { text: 'A', answer: 'zebra', originalIndex: 0 },
        { text: 'B', answer: 'apple', originalIndex: 1 },
        { text: 'C', answer: 'banana', originalIndex: 2 },
      ];
      const result = buildSelectOptions(choices);
      expect(result).toEqual(['apple', 'banana', 'zebra']);
    });

    it('should handle duplicate answers', () => {
      const choices: Choice[] = [
        { text: 'A', answer: 'same', originalIndex: 0 },
        { text: 'B', answer: 'same', originalIndex: 1 },
        { text: 'C', answer: 'different', originalIndex: 2 },
      ];
      const result = buildSelectOptions(choices);
      expect(result).toEqual(['different', 'same']);
    });
  });

  describe('naturalSort', () => {
    it('should sort numerically when strings start with numbers', () => {
      expect(naturalSort('1. First', '10. Tenth')).toBeLessThan(0);
      expect(naturalSort('2. Second', '1. First')).toBeGreaterThan(0);
    });

    it('should sort alphabetically when no numbers', () => {
      expect(naturalSort('apple', 'banana')).toBeLessThan(0);
      expect(naturalSort('zebra', 'apple')).toBeGreaterThan(0);
    });

    it('should handle pipe-separated values', () => {
      expect(naturalSort('1|first', '2|second')).toBeLessThan(0);
      expect(naturalSort('a|1', 'a|10')).toBeLessThan(0);
    });
  });

  describe('isQuestionAnswered', () => {
    it('should detect answered single choice questions', () => {
      const question: Question = {
        type: 'single',
        choices: [],
        selectOptions: [],
        index: 0,
        source: '',
        question: '',
      };
      expect(isQuestionAnswered(question, 0)).toBe(true);
      expect(isQuestionAnswered(question, -1)).toBe(false);
    });

    it('should detect answered multiple choice questions', () => {
      const question: Question = {
        type: 'multiple',
        choices: [],
        selectOptions: [],
        index: 0,
        source: '',
        question: '',
      };
      expect(isQuestionAnswered(question, new Set([0, 1]))).toBe(true);
      expect(isQuestionAnswered(question, new Set())).toBe(false);
    });

    it('should detect answered select questions', () => {
      const question: Question = {
        type: 'select',
        choices: [],
        selectOptions: [],
        index: 0,
        source: '',
        question: '',
      };
      const map = new Map([[0, '1']]);
      expect(isQuestionAnswered(question, map)).toBe(true);
      expect(isQuestionAnswered(question, new Map())).toBe(false);
    });
  });

  describe('getQuestionCorrectness', () => {
    it('should check single choice correctness', () => {
      const question: Question = {
        type: 'single',
        choices: [
          { text: 'A', answer: 'x', originalIndex: 0 },
          { text: 'B', answer: '', originalIndex: 1 },
        ],
        selectOptions: [],
        index: 0,
        source: '',
        question: '',
      };
      expect(getQuestionCorrectness(question, 0)).toBe(true);
      expect(getQuestionCorrectness(question, 1)).toBe(false);
    });

    it('should check multiple choice correctness', () => {
      const question: Question = {
        type: 'multiple',
        choices: [
          { text: 'A', answer: 'x', originalIndex: 0 },
          { text: 'B', answer: 'x', originalIndex: 1 },
          { text: 'C', answer: '', originalIndex: 2 },
        ],
        selectOptions: [],
        index: 0,
        source: '',
        question: '',
      };
      expect(getQuestionCorrectness(question, new Set([0, 1]))).toBe(true);
      expect(getQuestionCorrectness(question, new Set([0]))).toBe(false);
      expect(getQuestionCorrectness(question, new Set([0, 1, 2]))).toBe(false);
    });

    it('should check select question correctness', () => {
      const question: Question = {
        type: 'select',
        choices: [
          { text: 'A', answer: '1', originalIndex: 0 },
          { text: 'B', answer: '2', originalIndex: 1 },
        ],
        selectOptions: ['1', '2'],
        index: 0,
        source: '',
        question: '',
      };
      const correctMap = new Map([[0, '1'], [1, '2']]);
      const incorrectMap = new Map([[0, '2'], [1, '1']]);
      expect(getQuestionCorrectness(question, correctMap)).toBe(true);
      expect(getQuestionCorrectness(question, incorrectMap)).toBe(false);
    });
  });

  describe('computeResults', () => {
    let questions: Question[];
    let responses: Map<number, any>;

    beforeEach(() => {
      questions = [
        {
          type: 'single',
          choices: [
            { text: 'A', answer: 'x', originalIndex: 0 },
            { text: 'B', answer: '', originalIndex: 1 },
          ],
          selectOptions: [],
          index: 0,
          source: 'Test 1',
          question: 'Question 1?',
        },
        {
          type: 'multiple',
          choices: [
            { text: 'A', answer: 'x', originalIndex: 0 },
            { text: 'B', answer: 'x', originalIndex: 1 },
            { text: 'C', answer: '', originalIndex: 2 },
          ],
          selectOptions: [],
          index: 1,
          source: 'Test 2',
          question: 'Question 2?',
        },
      ];
      responses = new Map();
    });

    it('should compute results with all correct answers', () => {
      responses.set(0, 0); // Correct single choice
      responses.set(1, new Set([0, 1])); // Correct multiple choice

      const results = computeResults(questions, responses);
      expect(results.correctCount).toBe(2);
      expect(results.total).toBe(2);
      expect(results.percent).toBe(100);
      expect(results.wrong).toHaveLength(0);
      expect(results.skipped).toBe(0);
    });

    it('should compute results with some wrong answers', () => {
      responses.set(0, 1); // Wrong single choice
      responses.set(1, new Set([0])); // Partial multiple choice

      const results = computeResults(questions, responses);
      expect(results.correctCount).toBe(0);
      expect(results.total).toBe(2);
      expect(results.percent).toBe(0);
      expect(results.wrong).toHaveLength(2);
      expect(results.skipped).toBe(0);
    });

    it('should handle skipped questions', () => {
      responses.set(0, 0); // Only answer first question

      const results = computeResults(questions, responses);
      expect(results.correctCount).toBe(1);
      expect(results.total).toBe(1);
      expect(results.percent).toBe(100);
      expect(results.wrong).toHaveLength(0);
      expect(results.skipped).toBe(1);
    });
  });
});
