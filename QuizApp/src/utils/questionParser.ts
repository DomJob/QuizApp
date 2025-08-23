import { RawQuestion, RawChoice } from '../types/quiz';
import { parseMarkdown } from './markdownParser';

export function parseQuestionBlock(block: string): RawQuestion {
  // Preserve blank lines; strip only trailing carriage returns
  const lines = block
    .trim()
    .split("\n")
    .map((l) => l.replace(/\r$/, ""));
  let source = "";
  let question = "";
  const choices: RawChoice[] = [];
  let i = 0;

  // Find source
  if (lines[i] && lines[i].trim().startsWith("Source:")) {
    source = lines[i].trim().replace(/^Source:\s*/, "");
    i++;
  }

  // Find question
  const questionLines: string[] = [];
  // Find the line that starts with "Question:"
  while (i < lines.length && !lines[i].trim().startsWith("Question:")) {
    i++;
  }
  if (i < lines.length && lines[i].trim().startsWith("Question:")) {
    // Remove "Question:" and start collecting question lines (preserving indentation and blanks)
    questionLines.push(lines[i].replace(/^(\s*)Question:\s*/, "$1"));
    i++;
    // Collect all lines until we hit a choice line (starts with [)
    while (i < lines.length && !lines[i].trim().match(/^\[[^\]]*\]/)) {
      questionLines.push(lines[i]);
      i++;
    }
  }
  question = questionLines.join("\n").replace(/^\n+|\n+$/g, "");

  // Parse choices
  while (i < lines.length) {
    // Choices start with [<answer>] <text>
    const match = lines[i].match(/^\s*\[([^\]]*)\]\s?(.*)$/);
    if (match) {
      let answer = match[1].trim();
      let text = match[2] || "";
      // Collect multiline choice text
      i++;
      while (i < lines.length && !lines[i].trim().match(/^\[[^\]]*\]/)) {
        text += "\n" + lines[i];
        i++;
      }
      choices.push({
        text: text.replace(/^\n+|\n+$/g, ""),
        answer: answer,
      });
    } else {
      i++;
    }
  }

  return {
    source,
    question: parseMarkdown(question),
    choices: choices.map((c) => ({
      text: parseMarkdown(c.text),
      answer: c.answer,
    })),
    originalBlock: block.trim(), // Store the original block text
  };
}

export function parseQuestionsFile(content: string): RawQuestion[] {
  return content
    .replace(/\r\n/g, "\n")
    .trim()
    .split("-----")
    .filter((block) => block.trim() !== "")
    .map(parseQuestionBlock);
}
