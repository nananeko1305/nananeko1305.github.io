// The language itself is picked in <head> before the first paint; this file
// wires the SR | EN buttons, the terminal typing, live app versions and the
// highlighted link in the top bar.

const TITLE = {
  sr: 'Petar Ćoćić — React i React Native developer',
  en: 'Petar Ćoćić — React & React Native Developer',
};

function setLang(lang) {
  const root = document.documentElement;
  root.dataset.lang = lang;
  root.lang = lang === 'sr' ? 'sr-Latn' : 'en';
  document.title = TITLE[lang];
  for (const b of document.querySelectorAll('[data-lang]')) {
    if (b !== root) b.setAttribute('aria-pressed', String(b.dataset.lang === lang));
  }
}

for (const b of document.querySelectorAll('button[data-lang]')) {
  b.addEventListener('click', () => {
    setLang(b.dataset.lang);
    try { localStorage.setItem('lang', b.dataset.lang); } catch (_) {}
  });
}
setLang(document.documentElement.dataset.lang === 'sr' ? 'sr' : 'en');

// Terminal: type each command, then show its output. The full text is in the
// HTML, so without JavaScript (or with reduced motion) it is simply all there.
function typeTerminal(term) {
  const lines = [...term.querySelectorAll('p')];
  const cmds = lines.map((l) => l.querySelector('.cmd'));
  const texts = cmds.map((c) => (c ? c.textContent : ''));
  lines.forEach((l, i) => {
    l.classList.add('hide');
    if (cmds[i]) cmds[i].textContent = '';
  });

  let i = 0;
  const next = () => {
    if (i >= lines.length) return;
    const line = lines[i];
    const cmd = cmds[i];
    const text = texts[i];
    i += 1;
    line.classList.remove('hide');
    if (!cmd) {
      setTimeout(next, 140);
      return;
    }
    cmd.classList.add('typing');
    let n = 0;
    const tick = () => {
      n += 1;
      cmd.textContent = text.slice(0, n);
      if (n < text.length) {
        setTimeout(tick, 40 + Math.random() * 50);
      } else {
        cmd.classList.remove('typing');
        setTimeout(next, 320);
      }
    };
    setTimeout(tick, 280);
  };
  next();
}

const term = document.getElementById('term');
if (term && !matchMedia('(prefers-reduced-motion: reduce)').matches) typeTerminal(term);

// Each app's download page shows its newest version, so read it from there
// and the cards never go stale. The numbers in the HTML are the fallback.
for (const app of document.querySelectorAll('.app[href^="https://nananeko1305.github.io/"]')) {
  fetch(app.href, { cache: 'no-cache' })
    .then((r) => (r.ok ? r.text() : Promise.reject(r.status)))
    .then((html) => {
      const m = html.match(/class="chip">v([0-9.]+)</);
      if (m) app.querySelector('.ver').textContent = 'v' + m[1];
    })
    .catch(() => {});
}

// Top bar: mark the link of the section in the middle of the screen.
const navLinks = new Map(
  [...document.querySelectorAll('.links a')].map((a) => [a.hash.slice(1), a]),
);
const spy = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (!e.isIntersecting) continue;
    for (const a of navLinks.values()) a.removeAttribute('aria-current');
    navLinks.get(e.target.id)?.setAttribute('aria-current', 'location');
  }
}, { rootMargin: '-45% 0px -50% 0px' });
for (const id of navLinks.keys()) {
  const s = document.getElementById(id);
  if (s) spy.observe(s);
}
