(() => {
  'use strict';
  const root = document.documentElement;
  const themeButton = document.querySelector('.theme-toggle');
  const updateThemeLabel = () => {
    const dark = root.dataset.theme === 'dark';
    themeButton.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    themeButton.title = dark ? 'Switch to light theme' : 'Switch to dark theme';
  };
  themeButton.hidden = false;
  updateThemeLabel();
  themeButton.addEventListener('click', () => {
    const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.dataset.theme = nextTheme;
    try { localStorage.setItem('weizhen-theme', nextTheme); } catch (_) { /* File previews may disable storage. */ }
    updateThemeLabel();
  });

  const filters = document.querySelector('.filters');
  const publications = [...document.querySelectorAll('.publication')];
  filters.hidden = false;
  filters.addEventListener('click', (event) => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    filters.querySelectorAll('button').forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
    let visible = 0;
    publications.forEach((paper) => {
      paper.hidden = button.dataset.filter !== 'all' && paper.dataset.type !== button.dataset.filter;
      if (!paper.hidden) visible += 1;
    });
    document.querySelector('#publication-count').textContent = `${visible} of ${publications.length} works`;
  });

  document.querySelectorAll('.bib-toggle').forEach((button) => {
    button.hidden = false;
    button.addEventListener('click', () => {
      const panel = document.getElementById(button.getAttribute('aria-controls'));
      panel.hidden = !panel.hidden;
      button.setAttribute('aria-expanded', String(!panel.hidden));
    });
  });
  document.querySelectorAll('.copy-citation').forEach((button) => {
    button.addEventListener('click', async () => {
      const code = button.parentElement.querySelector('pre');
      button.textContent = 'Copying…';
      try {
        await Promise.race([
          navigator.clipboard.writeText(code.textContent),
          new Promise((_, reject) => window.setTimeout(() => reject(new Error('Clipboard unavailable')), 1500))
        ]);
        button.textContent = 'Copied!';
        window.setTimeout(() => { button.textContent = 'Copy citation'; }, 1800);
      } catch (_) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(code);
        selection.removeAllRanges();
        selection.addRange(range);
        button.textContent = 'Text selected — press Ctrl/Cmd+C';
      }
    });
  });

  const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-10% 0px -65% 0px', threshold: 0 });
    navLinks.forEach((link) => {
      const section = document.querySelector(link.hash);
      if (section) observer.observe(section);
    });
  }
})();
