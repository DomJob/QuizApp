import { describe, it, expect } from 'vitest';
import { parseMarkdown } from '../markdownParser';

describe('markdownParser', () => {
  describe('parseMarkdown', () => {
    it('should return empty string for empty input', () => {
      expect(parseMarkdown('')).toBe('');
      expect(parseMarkdown(null as any)).toBe('');
      expect(parseMarkdown(undefined as any)).toBe('');
    });

    it('should parse bold text', () => {
      expect(parseMarkdown('This is **bold** text')).toBe('This is <b>bold</b> text');
    });

    it('should parse italic text', () => {
      expect(parseMarkdown('This is *italic* text')).toBe('This is <i>italic</i> text');
    });

    it('should parse inline code', () => {
      expect(parseMarkdown('Use `console.log()` to debug')).toBe('Use <code>console.log()</code> to debug');
    });

    it('should parse code blocks', () => {
      const input = '```javascript\nconsole.log("Hello");\n```';
      const output = parseMarkdown(input);
      expect(output).toContain('<pre><code class="language-javascript">');
      expect(output).toContain('console.log(&quot;Hello&quot;);');
      expect(output).toContain('</code></pre>');
    });

    it('should parse code blocks without language', () => {
      const input = '```\nsome code\n```';
      const output = parseMarkdown(input);
      expect(output).toContain('<pre><code>');
      expect(output).toContain('some code');
      expect(output).toContain('</code></pre>');
    });

    it('should convert newlines to br tags', () => {
      expect(parseMarkdown('Line 1\nLine 2')).toBe('Line 1<br/>Line 2');
      expect(parseMarkdown('Para 1\n\nPara 2')).toBe('Para 1<br/><br />Para 2');
    });

    it('should handle mixed markdown elements', () => {
      const input = 'This is **bold** and *italic* with `code`\nNew line';
      const output = parseMarkdown(input);
      expect(output).toBe('This is <b>bold</b> and <i>italic</i> with <code>code</code><br/>New line');
    });

    it('should handle CRLF line endings', () => {
      const input = 'Line 1\r\nLine 2';
      const output = parseMarkdown(input);
      expect(output).toBe('Line 1<br/>Line 2');
    });

    it('should preserve code block content without further markdown parsing', () => {
      const input = '```\n**bold** *italic* `code`\n```';
      const output = parseMarkdown(input);
      expect(output).toContain('**bold** *italic* `code`');
      expect(output).not.toContain('<b>bold</b>');
    });
  });
});
