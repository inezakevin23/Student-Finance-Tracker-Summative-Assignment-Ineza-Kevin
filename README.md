# Student Finance Tracker

## Theme

- **Modern Minimal**: Clean layout, high contrast, readable fonts, and responsive design.
- **Accessible Colors**: Meets WCAG AA contrast standards.

---

## Features

- Dashboard with balance, income, and expenses
- Add, edit, delete transactions
- Transactions as cards (mobile) and table (desktop)
- Regex-powered search and validation
- Import/export data (JSON)
- Settings and theme toggle
- ARIA live updates for status and validation
- Keyboard navigation and skip links
- Accessible forms and headings
- Developer-focused test page for regex validation

---

## Regex Catalog

| Field       | Pattern (JS)                       | Example Valid   | Example Invalid          |
| ----------- | ---------------------------------- | --------------- | ------------------------ | --------- | ------------ | ------------ |
| Description | `/^\S(?:.*\S)?$/`                  | `Lunch at cafe` | ` leading` / `trailing ` |
| Amount      | `/^(?=.+)(?!0\d)\d+(\.\d{1,2})?$/` | `12.50`, `100`  | `001.00`, `abc`          |
| Date        | `/^\d{4}-(0[1-9]                   | 1[0-2])-(0[1-9] | [12]\d                   | 3[01])$/` | `2025-10-16` | `2025-13-01` |
| Category    | `/^[A-Za-z]+(?:[ -][A-Za-z]+)*$/`  | `food-drink`    | `123`, `food_drink`      |
| No Repeat   | `/\b(\w+)\b\s+\1\b/i`              | `lunch at cafe` | `food food`              |

---

## Keyboard Map

- **Tab**: Move between inputs, buttons, and links
- **Enter**: Activate buttons (e.g., Run Tests, Return)
- **Esc**: Close dialogs (where applicable)
- **Arrow keys**: Navigate table cells (desktop)
- **Skip to main**: Use skip link at top for screen readers

---

## Accessibility (a11y) Notes

- All forms and headings use semantic HTML
- ARIA live regions (`aria-live="polite"`) for status and validation feedback
- Focus management: Results heading is focused after running tests; input is focused after returning
- Sufficient color contrast and visible focus indicators
- All interactive elements are keyboard accessible
- No reliance on color alone for status
- Screen reader-friendly labels and instructions

---

## How to Run Tests

1. **Start a local server** (required for ES module imports):
   - With Python: `python3 -m http.server`
   - With Node: `npx serve .`
2. **Open `tests.html` in your browser**
3. **Fill in the form and click "Run Tests"**
4. **Review results and sample cases**
5. **Click "Return" to test again**

---

## Quick Links

- [Live Deployment](https://inezakevin23.github.io/Student-Finance-Tracker-Summative-Assignment-Ineza-Kevin/)
- [Regex Validators Test Page](./tests.html)
- [Main App](./index.html) -[Demo video](https://youtu.be/wS39qfVOh9o)
