# Quiz App

This is a very simple quiz app to help you study stuff:

- Simply download and open `index.html` in any modern browser (no local server required!)
- Run the deployed app [here](https://quiz.qot.app/)

## Quiz file format

The format of quiz files is designed to be as simple as possible to allow LLMs to efficiently generate questions based on study material you give it. See prompt.txt for an example of the type of prompt I use that works well.

### Supported types of questions:

- Single-answer questions (rendered as radio buttons)
- Multiple-answer questions (rendered as checkboxes)
- Ordered list (rendered as list with elements you can drag-and-drop)
- Term<->definition mapping (rendered as a list of dropdown elements)

Each question are separated by 5 dashes and their type is inferred from the given answers — see example.quiz for an overview of the format.

## Keyboard navigation

- Left/right arrows to navigate between questions
- Space bar to reveal the answer
- Number keys to select/unselect choices, in the case of single and multiple choice questions
