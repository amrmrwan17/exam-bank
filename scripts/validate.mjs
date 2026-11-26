// Usage: node scripts/validate.mjs
// Checks data/index.json and every exam file it points to.
import fs from 'node:fs';
let bad = 0;
const fail = (m) => { console.error('✗ ' + m); bad++; };
const idx = JSON.parse(fs.readFileSync('data/index.json', 'utf8'));
const bi = (o) => o && typeof o.ar === 'string' && typeof o.en === 'string' && o.ar && o.en;
const ids = new Set();
for (const s of idx.subjects) {
  if (!bi(s.name)) fail(`subject ${s.id}: name needs ar+en`);
  for (const u of s.units) {
    if (!bi(u.name)) fail(`unit ${u.id}: name needs ar+en`);
    for (const e of u.exams) {
      if (ids.has(e.id)) fail(`duplicate exam id ${e.id}`); ids.add(e.id);
      if (!fs.existsSync(e.file)) { fail(`${e.id}: missing file ${e.file}`); continue; }
      const x = JSON.parse(fs.readFileSync(e.file, 'utf8'));
      if (x.id !== e.id) fail(`${e.id}: id inside file is ${x.id}`);
      if (!bi(x.title)) fail(`${e.id}: title needs ar+en`);
      let mcq = 0, essay = 0;
      x.questions.forEach((q, i) => {
        const w = `${e.id} Q${q.n}`;
        if (q.n !== i + 1) fail(`${w}: numbering must be 1..N in order`);
        if (!bi(q.q)) fail(`${w}: q needs ar+en`);
        if (q.type === 'mcq') {
          mcq++;
          if (q.options.length < 2 || !q.options.every(bi)) fail(`${w}: options need ar+en`);
          if (!(q.answer >= 0 && q.answer < q.options.length)) fail(`${w}: answer index out of range`);
          if (!bi(q.explain)) fail(`${w}: explain needs ar+en`);
          if (q.why.length !== q.options.length) fail(`${w}: why must have one entry per option (null for the correct one)`);
          q.why.forEach((y, k) => { if (k === q.answer ? y !== null : !bi(y)) fail(`${w}: why[${k}] wrong`); });
        } else if (q.type === 'essay') {
          essay++;
          if (!q.model || !q.model.ar?.length || !q.model.en?.length) fail(`${w}: model needs ar+en lines`);
        } else fail(`${w}: type must be mcq or essay`);
      });
      if (e.mcq !== mcq || e.essay !== essay) fail(`${e.id}: index says ${e.mcq} mcq / ${e.essay} essay but file has ${mcq} / ${essay}`);
    }
  }
}
if (bad) { console.error(`${bad} problem(s)`); process.exit(1); }
console.log('OK: ' + ids.size + ' exam(s) valid');
