import { escapeHtml } from './htmlUtils';

interface CodeBlock {
  lang: string;
  code: string;
}

export function parseMarkdown(input: string): string {
  if (!input) return "";

  let text = String(input).replace(/\r\n/g, "\n");

  // Extract fenced code blocks to placeholders to avoid formatting inside them
  const codeBlocks: CodeBlock[] = [];
  text = text.replace(
    /```(\w+)?\s*([\s\S]*?)```/g,
    (_match, lang, code) => {
      const placeholder = `__CODEBLOCK_${codeBlocks.length}__`;
      // Trim extra whitespace from code blocks to prevent unwanted line breaks
      codeBlocks.push({ lang: lang || "", code: code.trim() });
      return placeholder;
    }
  );

  // Inline code
  text = text.replace(
    /`([^`]+)`/g,
    (_m, code) => `<code>${escapeHtml(code)}</code>`
  );

  // Bold
  text = text.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");

  // Italic
  text = text.replace(/\*(.+?)\*/g, "<i>$1</i>");

  // Newlines -> <br/>
  text = text.replace(/\n\n/g, "<br/><br />").replace(/\n/g, "<br/>");

  // Restore code blocks
  text = text.replace(/__CODEBLOCK_(\d+)__/g, (_m, idxStr) => {
    const idx = Number(idxStr);
    const blk = codeBlocks[idx];
    const escaped = escapeHtml(String(blk.code).replace(/\r\n/g, "\n"));
    const langClass = blk.lang ? ` class="language-${blk.lang}"` : "";
    return `<pre><code${langClass}>${escaped}</code></pre>`;
  });

  return text;
}
