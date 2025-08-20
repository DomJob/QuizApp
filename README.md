# Quiz App

This is a very simple quiz app to help you study stuff – simply download and open `quiz.html` in any modern browser (no local server required)

## Quiz file format:

The format of quiz files is designed to be as simple as possible to allow LLMs to easily generate questions based on study material you give it (see prompt.txt for an example of the type of prompt I use)

Supported types of questions:

- Single-answer questions (rendered as a radio button)
- Multiple-answer questions (rendered as checkboxes)
- Ordered list (rendered as list with elements you can drag-and-drop)
- Term-definition mapping (rendered as a list of dropdown elements)

Each question are separated by 5 dashes. See example.quiz for an overview of the format

## Keyboard navigation

- Left/right arrows to navigate between questions
- Space bar to reveal the answer
- Number keys to select/unselect choices, in the case of single and multiple choice questions
