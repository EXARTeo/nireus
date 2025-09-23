document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('nav');
  const btn = document.querySelector('.mobile-toggle');
  if (nav && btn) {
    btn.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }
});
