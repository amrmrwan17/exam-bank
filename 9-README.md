# Exam Bank · بنك الامتحانات

Interactive exam site (Arabic / English, mobile first, RTL). Static files only, hosted on GitHub Pages.
Pick an answer and see the correct option, the explanation, and why each other option is wrong. Essay questions show a model answer.

## How the site is built

```
index.html            page shell
assets/style.css      look and feel
assets/app.js         the whole app (no build step, no dependencies)
data/index.json       the list shown on the home page (subject > unit > exam)
data/exams/<id>.json  one file per exam (all questions, both languages)
scripts/validate.mjs  checks the data files before you commit
```

Progress is saved in the browser (localStorage). Language is chosen on first visit and can be switched any time
(`?lang=en` or `?lang=ar` in the link also sets it). A link like `#/exam/<id>/12` opens question 12.

## Add a new exam (2 steps)

1. Create `data/exams/<exam-id>.json` (copy the structure below). Use a short id like `phys-u1-midterm`.
2. Add one entry for it in `data/index.json` under the right subject and unit (add a new subject or unit object if needed):

```json
{ "id": "phys-u1-midterm", "file": "data/exams/phys-u1-midterm.json",
  "title": { "ar": "…", "en": "…" }, "mcq": 25, "essay": 10, "langs": ["ar", "en"] }
```

Then run `node scripts/validate.mjs` and open a pull request. When it is merged, GitHub Pages updates in about a minute.

### Exam file format

```json
{
  "id": "phys-u1-midterm", "version": 1,
  "title": { "ar": "…", "en": "…" },
  "questions": [
    {
      "n": 1, "type": "mcq", "marks": 2,
      "q": { "ar": "نص السؤال", "en": "Question text" },
      "diagram": "<svg …>…</svg>",                      // optional, inline SVG
      "options": [ { "ar": "…", "en": "…" }, … ],       // A, B, C, D in order
      "answer": 2,                                      // index of the correct option (0 = first)
      "explain": { "ar": "…", "en": "…" },              // why the correct one is right
      "why": [ { "ar": "…", "en": "…" }, { … }, null, { … } ], // one per option, null for the correct one
      "note": { "ar": "…", "en": "…" }                  // optional warning shown under the explanation
    },
    {
      "n": 26, "type": "essay", "marks": 3,
      "q": { "ar": "…", "en": "…" },
      "model": { "ar": ["line 1", "line 2"], "en": ["line 1", "line 2"] }
    }
  ]
}
```

Rules: questions are numbered 1..N in order; every text has both `ar` and `en`.

Text markup: `H_{2}SO_{4}` gives subscripts, `Fe^{3+}` gives superscripts. In Arabic text, runs of Latin letters, numbers and
formulas are kept left-to-right automatically. Diagrams are inline SVG using the CSS classes `bx` (box), `ln` (line),
`cv` (curve), `gl` (grid line); put both languages in `<text class="t-ar">` and `<text class="t-en">` when a label needs words.

## Content

Exam content comes from a paid learning platform and is for personal study. The site is public: anyone with the link can open it.
