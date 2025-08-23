import { RawQuestion, Question, QuestionType, Choice, QuestionResponse, QuizResults, WrongAnswer } from '../types/quiz';

export function shuffle<T>(array: T[]): T[] {
  const arr = array.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function isX(value: string): boolean {
  return String(value || "")
    .trim()
    .toLowerCase() === "x";
}

export function detectType(q: RawQuestion): QuestionType {
  const answers = q.choices
    .map((c) => c.answer)
    .filter((a) => String(a).trim() !== "");
  const xCount = answers.filter(isX).length;
  const hasNonX = answers.some((a) => !isX(a));
  if (answers.length > 0 && hasNonX && xCount === 0) return "select";
  if (xCount <= 1) return "single";
  return "multiple";
}

export function buildSelectOptions(choices: Choice[]): string[] {
  const distinct = Array.from(
    new Set(choices.map((c) => String(c.answer).trim()).filter(Boolean))
  );
  const allNumeric = distinct.every((v) => /^-?\d+(\.\d+)?$/.test(v));
  if (allNumeric) {
    return distinct.sort((a, b) => Number(a) - Number(b));
  }
  return distinct.sort((a, b) => a.localeCompare(b));
}

export function naturalSort(a: string, b: string): number {
  // Split by pipe and trim whitespace
  const partsA = a.split('|').map(part => part.trim());
  const partsB = b.split('|').map(part => part.trim());
  
  // Compare each part
  const maxLength = Math.max(partsA.length, partsB.length);
  
  for (let i = 0; i < maxLength; i++) {
    const partA = partsA[i] || '';
    const partB = partsB[i] || '';
    
    // Extract numbers from the beginning of each part
    const numMatchA = partA.match(/^(\d+)/);
    const numMatchB = partB.match(/^(\d+)/);
    
    if (numMatchA && numMatchB) {
      // Both parts start with numbers, compare numerically
      const numA = parseInt(numMatchA[1], 10);
      const numB = parseInt(numMatchB[1], 10);
      if (numA !== numB) {
        return numA - numB;
      }
      // Numbers are equal, compare the rest of the part
      const restA = partA.substring(numMatchA[1].length);
      const restB = partB.substring(numMatchB[1].length);
      if (restA !== restB) {
        return restA.localeCompare(restB);
      }
    } else if (numMatchA) {
      // Only partA starts with a number, it comes first
      return -1;
    } else if (numMatchB) {
      // Only partB starts with a number, it comes first
      return 1;
    } else {
      // Neither part starts with a number, compare lexicographically
      if (partA !== partB) {
        return partA.localeCompare(partB);
      }
    }
  }
  
  // All parts are equal
  return 0;
}

export function buildQuizData(raw: RawQuestion[], shouldShuffle = true): Question[] {
  let processedQuestions: RawQuestion[];
  if (shouldShuffle) {
    processedQuestions = shuffle(raw);
  } else {
    // Sort naturally by source property (handles numerical sorting)
    processedQuestions = raw.slice().sort((a, b) => {
      const sourceA = (a.source || "").toLowerCase();
      const sourceB = (b.source || "").toLowerCase();
      return naturalSort(sourceA, sourceB);
    });
  }
  
  return processedQuestions.map((q, idx) => {
    const type = detectType(q);
    const choices = shuffle(
      q.choices.map((c, i) => ({ ...c, originalIndex: i }))
    );
    const selectOptions = type === "select" ? buildSelectOptions(choices) : [];
    return { ...q, type, choices, selectOptions, index: idx };
  });
}

export function isQuestionAnswered(q: Question, resp: QuestionResponse): boolean {
  if (q.type === "single") {
    return typeof resp === "number" && resp >= 0;
  }
  if (q.type === "multiple") {
    return resp instanceof Set && resp.size > 0;
  }
  if (q.type === "select") {
    const map = resp instanceof Map ? resp : new Map();
    for (const v of map.values()) {
      if (String(v || "").trim() !== "") return true;
    }
    return false;
  }
  return false;
}

export function isChoiceCorrect(q: Question, choice: Choice, resp: QuestionResponse): boolean {
  if (q.type === "single" || q.type === "multiple")
    return isX(choice.answer);
  if (q.type === "select") {
    const map = resp instanceof Map ? resp : new Map();
    const selected = map.get(choice.originalIndex) || "";
    return String(selected) === String(choice.answer);
  }
  return false;
}

export function getQuestionCorrectness(q: Question, resp: QuestionResponse): boolean {
  if (q.type === "single") {
    if (typeof resp !== "number" || resp < 0) return false;
    const choice = q.choices[resp];
    return !!choice && isX(choice.answer);
  }
  if (q.type === "multiple") {
    const selected = resp instanceof Set ? resp : new Set();
    const correctIdx = new Set(
      q.choices
        .map((c, i) => (isX(c.answer) ? i : -1))
        .filter((i) => i !== -1)
    );
    if (selected.size !== correctIdx.size) return false;
    for (const i of selected) {
      if (!correctIdx.has(Number(i))) return false;
    }
    return true;
  }
  if (q.type === "select") {
    const map = resp instanceof Map ? resp : new Map();
    // All rows must match their expected answer
    return q.choices.every(
      (c) => String(map.get(c.originalIndex) || "") === String(c.answer)
    );
  }
  return false;
}

export function computeResults(
  questions: Question[], 
  responses: Map<number, QuestionResponse>
): QuizResults {
  let correctCount = 0;
  let answeredCount = 0;
  let skipped = 0;
  const wrong: WrongAnswer[] = [];
  
  questions.forEach((q, idx) => {
    const resp = responses.get(idx);
    const answered = resp !== undefined && isQuestionAnswered(q, resp);
    if (!answered) {
      skipped += 1;
      return;
    }
    answeredCount += 1;
    const isCorrect = getQuestionCorrectness(q, resp!);
    if (isCorrect) {
      correctCount += 1;
    } else {
      // Build details for review (exclude skipped)
      if (q.type === "single") {
        const selectedIdx = typeof resp === "number" ? resp : -1;
        const your = selectedIdx >= 0 ? q.choices[selectedIdx]?.text || "" : "";
        const correct = q.choices.find((c) => isX(c.answer))?.text || "";
        wrong.push({
          questionIndex: idx,
          question: q.question,
          type: q.type,
          details: { your, correct },
        });
      } else if (q.type === "multiple") {
        const selected = resp instanceof Set ? Array.from(resp) : [];
        const your = selected
          .map((i) => q.choices[i]?.text || "")
          .join("<br/>");
        const correct = q.choices
          .map((c, i) => (isX(c.answer) ? q.choices[i].text : null))
          .filter(Boolean)
          .join("<br/>");
        wrong.push({
          questionIndex: idx,
          question: q.question,
          type: q.type,
          details: { your, correct },
        });
      } else if (q.type === "select") {
        const map = resp instanceof Map ? resp : new Map();
        const rows = q.choices.map((c) => ({
          text: c.text,
          your: String(map.get(c.originalIndex) || ""),
          correct: String(c.answer),
        }));
        wrong.push({
          questionIndex: idx,
          question: q.question,
          type: q.type,
          details: { rows },
        });
      }
    }
  });
  
  const total = answeredCount;
  const percent = total > 0 ? Math.round((correctCount / total) * 100) : 0;
  return { correctCount, total, percent, wrong, skipped };
}
