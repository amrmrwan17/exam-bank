(function () {
  'use strict';
  var app = document.getElementById('app');
  var T = {
    ar: {
      title: 'بنك الامتحانات', sub: 'امتحانات تفاعلية مع الشرح لكل اختيار', pick: 'اختر لغة الامتحانات', pickSub: 'تقدر تغيرها في أي وقت',
      hello: 'اختر الامتحان', q: 'سؤال', of: 'من', marks: 'درجة', marks2: 'درجات', mcq: 'اختياري', essay: 'مقالي',
      start: 'ابدأ', resume: 'أكمل', done: 'تم حله', prev: 'السابق', next: 'التالي', finish: 'النتيجة', home: 'الرئيسية',
      correct: 'إجابة صحيحة', wrong: 'إجابة غير صحيحة', yourPick: 'اخترت', rightIs: 'الإجابة الصحيحة',
      explain: 'الشرح', whyNot: 'لماذا خطأ؟', whyOk: 'صحيحة', show: 'اظهر الإجابة النموذجية', hide: 'إخفاء الإجابة النموذجية',
      model: 'الإجابة النموذجية', tryFirst: 'حاول تحل المقال على ورقة أولًا ثم قارن بالإجابة.', score: 'نتيجتك في الأسئلة الاختيارية',
      retry: 'إعادة الامتحان', review: 'راجع الأخطاء', list: 'قائمة الأسئلة', notAns: 'لم تُحل', ans: 'تمت الإجابة',
      essays: 'الأسئلة المقالية', essaysSeen: 'مقالي تم عرض نموذجه', unanswered: 'أسئلة اختيارية بدون إجابة', lang: 'English',
      noteH: 'ملاحظة', footer: 'المحتوى مأخوذ من منصة تعليمية، والموقع للمذاكرة الشخصية.', reset: 'مسح التقدم', confirmReset: 'مسح كل إجابات هذا الامتحان؟',
      cA: 'صحيح', cB: 'خطأ', cC: 'تمت المشاهدة', cD: 'الحالي', letters: ['أ', 'ب', 'ج', 'د', 'هـ'], pick1: 'اختر إجابة', great: 'ممتاز!', good: 'جيد، راجع الأخطاء', keep: 'كمّل مذاكرة، المراجعة هتفرق معاك'
    },
    en: {
      title: 'Exam Bank', sub: 'Interactive exams with an explanation for every option', pick: 'Choose the exam language', pickSub: 'You can change it any time',
      hello: 'Choose an exam', q: 'Question', of: 'of', marks: 'mark', marks2: 'marks', mcq: 'MCQ', essay: 'Essay',
      start: 'Start', resume: 'Resume', done: 'Completed', prev: 'Previous', next: 'Next', finish: 'Results', home: 'Home',
      correct: 'Correct answer', wrong: 'Wrong answer', yourPick: 'You chose', rightIs: 'Correct answer',
      explain: 'Explanation', whyNot: 'Why not?', whyOk: 'Correct', show: 'Show model answer', hide: 'Hide model answer',
      model: 'Model answer', tryFirst: 'Try to solve the essay on paper first, then compare.', score: 'Your multiple-choice score',
      retry: 'Retake exam', review: 'Review mistakes', list: 'Question list', notAns: 'Not answered', ans: 'Answered',
      essays: 'Essay questions', essaysSeen: 'essay answers viewed', unanswered: 'MCQ unanswered', lang: 'العربية',
      noteH: 'Note', footer: 'Content comes from a learning platform. For personal study.', reset: 'Reset progress', confirmReset: 'Clear all answers for this exam?',
      cA: 'Correct', cB: 'Wrong', cC: 'Viewed', cD: 'Current', letters: ['A', 'B', 'C', 'D', 'E'], pick1: 'Pick an answer', great: 'Excellent!', good: 'Good, review the mistakes', keep: 'Keep studying, review will help'
    }
  };
  var lang = null, index = null, exam = null, examMeta = null, st = null, cur = 0, showMap = false;
  try { lang = localStorage.getItem('eb-lang'); } catch (e) {}
  var qp = location.search.match(/[?&]lang=(ar|en)/); if (qp) { lang = qp[1]; try { localStorage.setItem('eb-lang', lang); } catch (e) {} }
  if (lang !== 'ar' && lang !== 'en') lang = null;
  function t(k) { return T[lang || 'ar'][k]; }

  // ---------- text formatting ----------
  var RUN = /[A-Za-z0-9Δ\[(][A-Za-z0-9Δ_{}\^\[\]()+\-−×÷=<>→⇐·.,:%°\/ ]*[A-Za-z0-9)\]}%°+−]|[A-Za-z0-9Δ]/g;
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function chem(s) { return s.replace(/_\{(.*?)\}/g, '<sub>$1</sub>').replace(/\^\{(.*?)\}/g, '<sup>$1</sup>'); }
  function fmt(s) {
    if (s == null) return '';
    s = String(s).replace(/[\u200e\u200f]/g, '');
    if (lang === 'ar') {
      var out = '', last = 0, m;
      RUN.lastIndex = 0;
      while ((m = RUN.exec(s))) {
        out += esc(s.slice(last, m.index)) + '<span class="ltr">' + chem(esc(m[0])) + '</span>';
        last = m.index + m[0].length;
      }
      return out + esc(s.slice(last));
    }
    return chem(esc(s));
  }
  function L(o) { return o ? (o[lang] != null ? o[lang] : o.en) : ''; }

  // ---------- storage ----------
  function key(id) { return 'eb:' + id; }
  // Progress is intentionally NOT persisted: every visit starts a fresh exam
  // (multi-user device). Only the language choice (eb-lang) is kept.
  try { for (var k = Object.keys(localStorage), ki = 0; ki < k.length; ki++) { if (k[ki].indexOf('eb:') === 0) localStorage.removeItem(k[ki]); } } catch (e) {}
  function load(id) {
    return { a: {}, s: {}, i: 0 };
  }
  function save() { /* no-op: answers are session-only */ }

  function setLang(l) {
    lang = l; try { localStorage.setItem('eb-lang', l); } catch (e) {}
    render();
  }
  function applyDir() {
    var l = lang || 'ar';
    document.documentElement.lang = l; document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
    document.title = (l === 'ar' ? 'بنك الامتحانات' : 'Exam Bank');
  }
  function h(html) { app.innerHTML = html; }
  function langBtn() { return '<button class="ibtn" data-act="lang" aria-label="language">' + (lang === 'ar' ? 'EN' : 'ع') + '</button>'; }

  // ---------- views ----------
  function gate() {
    document.documentElement.lang = 'ar'; document.documentElement.dir = 'rtl';
    h('<div class="gate"><div class="box"><div class="logo">🧪</div><h1>بنك الامتحانات · Exam Bank</h1>' +
      '<p>اختر لغة الامتحانات<br>Choose the exam language</p>' +
      '<button class="lbtn" data-lang="ar">العربية<small>Arabic</small></button>' +
      '<button class="lbtn" data-lang="en">English<small>الإنجليزية</small></button></div></div>');
  }

  function home() {
    var s = '<div class="bar"><div class="wrap"><h1>🧪 ' + t('title') + '</h1>' + langBtn() + '</div></div><div class="wrap">' +
      '<div class="hero"><h2>' + t('hello') + '</h2><p>' + t('sub') + '</p></div>';
    index.subjects.forEach(function (sub) {
      s += '<div class="subj"><span class="ic">' + sub.icon + '</span>' + esc(L(sub.name)) + '</div>';
      sub.units.forEach(function (u) {
        s += '<div class="unit">' + esc(L(u.name)) + '</div>';
        u.exams.forEach(function (ex) {
          var ok = ex.langs.indexOf(lang) >= 0;
          var p = load(ex.id), n = Object.keys(p.a).length, tot = ex.mcq;
          s += '<button class="excard" data-exam="' + ex.id + '"' + (ok ? '' : ' disabled') + '><h3>' + esc(L(ex.title)) + '</h3><div class="chips">' +
            '<span class="chip">' + ex.mcq + ' ' + t('mcq') + '</span><span class="chip">' + ex.essay + ' ' + t('essay') + '</span>' +
            (n ? '<span class="chip g">' + n + '/' + tot + '</span>' : '') + '</div><span class="go">' + (n ? t('resume') : t('start')) + '</span></button>';
        });
      });
    });
    h(s + '<div class="foot">' + t('footer') + '</div></div>');
  }

  function qState(q) {
    if (q.type === 'mcq') {
      var a = st.a[q.n];
      if (a == null) return '';
      return a === q.answer ? 'ok' : 'bad';
    }
    return st.s[q.n] ? 'seen' : '';
  }

  function qView() {
    var q = exam.questions[cur], total = exam.questions.length, L1 = T[lang].letters;
    var answered = Object.keys(st.a).length + Object.keys(st.s).length;
    var s = '<div class="bar"><div class="wrap"><button class="ibtn" data-act="home" aria-label="' + t('home') + '">' + (lang === 'ar' ? '›' : '‹') + '</button>' +
      '<h1>' + esc(L(exam.title)) + '</h1><button class="ibtn" data-act="map">' + (cur + 1) + '/' + total + '</button>' + langBtn() + '</div>' +
      '<div class="prog"><i style="width:' + Math.round((cur + 1) / total * 100) + '%"></i></div></div><div class="wrap">';
    if (showMap) {
      s += '<div class="map">';
      exam.questions.forEach(function (x, i) {
        s += '<button data-go="' + i + '" class="' + (i === cur ? 'cur ' : '') + qState(x) + '">' + x.n + '</button>';
      });
      s += '</div><div class="legend"><span>🟩 ' + t('cA') + '</span><span>🟥 ' + t('cB') + '</span><span>🟪 ' + t('cC') + '</span></div>' +
        '<div class="row2"><button class="btn sec" data-act="reset">' + t('reset') + '</button></div>';
    }
    s += '<div class="qhead"><span class="qnum">' + t('q') + ' ' + q.n + '</span><span class="chip">' + (q.type === 'mcq' ? t('mcq') : t('essay')) + '</span>' +
      '<span class="chip y">' + q.marks + ' ' + (q.marks === 1 ? t('marks') : t('marks2')) + '</span></div>';
    s += '<div class="qcard" dir="' + (lang === 'ar' ? 'rtl' : 'ltr') + '"><p class="qtext">' + fmt(L(q.q)) + '</p>' + (q.diagram || '');
    if (q.type === 'mcq') {
      var a = st.a[q.n], done = a != null;
      s += '<div class="opts">';
      q.options.forEach(function (o, i) {
        var cls = 'opt';
        if (done) { if (i === q.answer) cls += ' ok'; else if (i === a) cls += ' bad'; }
        s += '<button class="' + cls + '" data-opt="' + i + '"' + (done ? ' disabled' : '') + '><div class="row"><span class="l">' + L1[i] + '</span><span class="t">' + fmt(L(o)) + '</span></div>';
        if (done && q.why[i]) s += '<div class="why"><b>' + (i === a ? t('yourPick') + ' · ' : '') + t('whyNot') + '</b> ' + fmt(L(q.why[i])) + '</div>';
        if (done && i === q.answer) s += '<div class="why"><b>✓ ' + t('whyOk') + '</b></div>';
        s += '</button>';
      });
      s += '</div>';
      if (done) {
        var good = a === q.answer;
        s += '<div class="verdict ' + (good ? 'ok' : 'bad') + '">' + (good ? '✅ ' + t('correct') : '❌ ' + t('wrong') + ' · ' + t('rightIs') + ': ' + L1[q.answer]) + '</div>';
        s += '<div class="panel"><h4>💡 ' + t('explain') + '</h4><p>' + fmt(L(q.explain)) + '</p>' + (q.xdiagram || '') + '</div>';
        if (q.note) s += '<div class="panel note"><h4>⚠️ ' + t('noteH') + '</h4><p>' + fmt(L(q.note)) + '</p></div>';
      }
    } else {
      var open = !!st.s[q.n];
      s += '<div class="tip">' + t('tryFirst') + '</div><div style="margin-top:12px"><button class="btn ' + (open ? 'sec' : '') + ' block" data-act="model">' + (open ? t('hide') : t('show')) + '</button></div>';
      if (open) {
        s += '<div class="panel model"><h4>✍️ ' + t('model') + '</h4>' + L(q.model).map(function (l) { return '<div class="ml">' + fmt(l) + '</div>'; }).join('') + '</div>';
      }
    }
    s += '</div></div><div class="nav"><div class="wrap"><button class="btn sec" data-act="prev"' + (cur === 0 ? ' disabled' : '') + '>' + (lang === 'ar' ? '→ ' : '← ') + t('prev') + '</button>' +
      (cur === total - 1 ? '<button class="btn" data-act="finish">' + t('finish') + '</button>' : '<button class="btn" data-act="next">' + t('next') + (lang === 'ar' ? ' ←' : ' →') + '</button>') + '</div></div>';
    h(s);
  }

  function results() {
    var qs = exam.questions, ok = 0, bad = 0, un = 0, mcqs = 0, seen = 0, essays = 0, pts = 0, max = 0;
    qs.forEach(function (q) {
      if (q.type === 'mcq') {
        mcqs++; max += q.marks; var a = st.a[q.n];
        if (a == null) un++; else if (a === q.answer) { ok++; pts += q.marks; } else bad++;
      } else { essays++; if (st.s[q.n]) seen++; }
    });
    var pct = mcqs ? Math.round(ok / mcqs * 100) : 0;
    var msg = pct >= 85 ? t('great') : pct >= 60 ? t('good') : t('keep');
    var s = '<div class="bar"><div class="wrap"><button class="ibtn" data-act="home">' + (lang === 'ar' ? '›' : '‹') + '</button><h1>' + esc(L(exam.title)) + '</h1>' + langBtn() + '</div></div><div class="wrap">' +
      '<div class="qcard res"><h2 style="margin:0">' + t('score') + '</h2><div class="ring" style="--p:' + pct + '"><div><span class="ltr">' + ok + '/' + mcqs + '</span></div></div>' +
      '<div style="font-weight:800;font-size:1.1rem">' + msg + '</div>' +
      '<div class="chips" style="justify-content:center;margin-top:10px"><span class="chip g">✓ ' + ok + '</span><span class="chip" style="background:var(--bad-bg);color:var(--bad)">✗ ' + bad + '</span>' +
      (un ? '<span class="chip y">' + un + ' ' + t('unanswered') + '</span>' : '') + '<span class="chip">' + seen + '/' + essays + ' ' + t('essaysSeen') + '</span></div>' +
      '<div class="tip">' + pts + '/' + max + ' ' + t('marks2') + ' (' + t('mcq') + ')</div>' +
      '<div class="row2">' + (bad + un ? '<button class="btn" data-act="review">' + t('review') + '</button>' : '') + '<button class="btn sec" data-act="reset2">' + t('retry') + '</button></div>' +
      '<div class="row2"><button class="btn sec" data-act="list">' + t('list') + '</button><button class="btn sec" data-act="home">' + t('home') + '</button></div></div></div>';
    h(s);
  }

  // ---------- routing ----------
  function render() {
    applyDir();
    if (!lang) return gate();
    var m = location.hash.match(/^#\/exam\/([\w-]+)(?:\/(\d+))?/);
    if (!index) { fetch('data/index.json').then(function (r) { return r.json(); }).then(function (j) { index = j; render(); }).catch(err); return; }
    if (!m) { exam = null; return home(); }
    var meta = null;
    index.subjects.forEach(function (s) { s.units.forEach(function (u) { u.exams.forEach(function (e) { if (e.id === m[1]) meta = e; }); }); });
    if (!meta) { location.hash = '#/'; return; }
    if (!exam || exam.id !== meta.id) {
      h('<div class="gate"><div class="box"><div class="logo">⏳</div></div></div>');
      fetch(meta.file).then(function (r) { return r.json(); }).then(function (j) {
        exam = j; examMeta = meta; st = load(j.id); cur = Math.min(m[2] ? +m[2] - 1 : (st.i || 0), j.questions.length - 1); showMap = false; render();
      }).catch(err);
      return;
    }
    if (view === 'results') results(); else qView();
    window.scrollTo(0, 0);
  }
  var view = 'q';
  function err() { h('<div class="gate"><div class="box"><div class="logo">⚠️</div><p>تعذر تحميل البيانات · Could not load data</p><button class="lbtn" onclick="location.reload()">↻</button></div></div>'); }

  function go(i) { cur = Math.max(0, Math.min(exam.questions.length - 1, i)); st.i = cur; save(); view = 'q'; showMap = false; render(); }

  app.addEventListener('click', function (e) {
    var el = e.target.closest('[data-lang],[data-act],[data-exam],[data-opt],[data-go]');
    if (!el) return;
    if (el.dataset.lang) return setLang(el.dataset.lang);
    if (el.dataset.exam) { view = 'q'; exam = null; location.hash = '#/exam/' + el.dataset.exam; return; }
    if (el.dataset.go != null) return go(+el.dataset.go);
    if (el.dataset.opt != null) {
      var q = exam.questions[cur]; if (st.a[q.n] != null) return;
      st.a[q.n] = +el.dataset.opt; save(); qView();
      var v = app.querySelector('.verdict'); if (v) v.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return;
    }
    switch (el.dataset.act) {
      case 'lang': return setLang(lang === 'ar' ? 'en' : 'ar');
      case 'home': exam = null; view = 'q'; location.hash = '#/'; return;
      case 'map': showMap = !showMap; return qView();
      case 'prev': return go(cur - 1);
      case 'next': return go(cur + 1);
      case 'finish': view = 'results'; return render();
      case 'model': var qq = exam.questions[cur]; st.s[qq.n] = st.s[qq.n] ? 0 : 1; if (!st.s[qq.n]) delete st.s[qq.n]; save(); return qView();
      case 'reset': case 'reset2': if (confirm(t('confirmReset'))) { st = { a: {}, s: {}, i: 0 }; save(); go(0); } return;
      case 'list': view = 'q'; showMap = true; return render();
      case 'review':
        var f = exam.questions.findIndex(function (x) { return x.type === 'mcq' && st.a[x.n] !== x.answer; });
        return go(f < 0 ? 0 : f);
    }
  });
  document.addEventListener('keydown', function (e) {
    if (!exam || view !== 'q' || e.target.tagName === 'INPUT') return;
    var q = exam.questions[cur];
    if (e.key === 'ArrowRight') go(cur + (lang === 'ar' ? -1 : 1));
    else if (e.key === 'ArrowLeft') go(cur + (lang === 'ar' ? 1 : -1));
    else if (q.type === 'mcq' && /^[1-4]$/.test(e.key) && st.a[q.n] == null) { st.a[q.n] = +e.key - 1; save(); qView(); }
  });
  window.addEventListener('hashchange', function () { if (!/^#\/exam\//.test(location.hash)) { exam = null; } else if (exam) { var mm = location.hash.match(/^#\/exam\/([\w-]+)\/(\d+)/); if (mm && mm[1] === exam.id) { cur = Math.max(0, Math.min(exam.questions.length - 1, +mm[2] - 1)); st.i = cur; } } view = 'q'; showMap = false; render(); });
  render();
})();
