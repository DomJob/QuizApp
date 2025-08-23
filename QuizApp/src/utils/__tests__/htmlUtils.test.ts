import { describe, it, expect } from 'vitest';
import { escapeHtml } from '../htmlUtils';

describe('htmlUtils', () => {
  describe('escapeHtml', () => {
    it('should escape HTML special characters', () => {
      expect(escapeHtml('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      );
    });

    it('should escape ampersands', () => {
      expect(escapeHtml('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });

    it('should escape quotes', () => {
      expect(escapeHtml('He said "Hello" and she said \'Hi\'')).toBe(
        'He said &quot;Hello&quot; and she said &#39;Hi&#39;'
      );
    });

    it('should handle empty strings', () => {
      expect(escapeHtml('')).toBe('');
    });

    it('should handle strings with no special characters', () => {
      expect(escapeHtml('Hello World')).toBe('Hello World');
    });

    it('should convert non-string values to strings', () => {
      expect(escapeHtml(123 as any)).toBe('123');
      expect(escapeHtml(null as any)).toBe('null');
      expect(escapeHtml(undefined as any)).toBe('undefined');
    });
  });
});
