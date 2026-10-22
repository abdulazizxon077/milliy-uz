let timer;

export function showToast(message, duration = 2200) {
  const el = document.getElementById('app-toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('visible');
  clearTimeout(timer);
  timer = setTimeout(() => el.classList.remove('visible'), duration);
}
