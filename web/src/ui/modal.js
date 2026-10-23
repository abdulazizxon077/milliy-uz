const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const returnFocus = new Map();

const byId = (id) => document.getElementById(id);

export const isOpen = (id) => {
  const el = byId(id);
  return Boolean(el) && !el.classList.contains('hidden');
};

function syncScrollLock() {
  const anyOpen = document.querySelector('[aria-modal="true"]:not(.hidden)');
  document.body.classList.toggle('overflow-hidden', Boolean(anyOpen));
}

export function focusables(container) {
  return [...container.querySelectorAll(FOCUSABLE)].filter(
    (el) => el.offsetParent !== null || el === document.activeElement,
  );
}

export function openModal(id, { focus = true } = {}) {
  const el = byId(id);
  if (!el) return;
  if (el.classList.contains('hidden') && document.activeElement !== document.body) {
    returnFocus.set(id, document.activeElement);
  }
  el.classList.remove('hidden');
  syncScrollLock();
  if (focus && !el.contains(document.activeElement)) {
    // Skip the close button so screen readers land on the content first.
    const target = focusables(el).find((f) => f.getAttribute('aria-label') !== 'Yopish');
    (target ?? focusables(el)[0])?.focus({ preventScroll: true });
  }
}

export function closeModal(id) {
  const el = byId(id);
  if (!el || el.classList.contains('hidden')) return;
  el.classList.add('hidden');
  syncScrollLock();
  const previous = returnFocus.get(id);
  returnFocus.delete(id);
  if (previous?.isConnected) previous.focus({ preventScroll: true });
}

/** Keeps Tab / Shift+Tab inside the top-most open dialog. */
export function trapFocus(event) {
  if (event.key !== 'Tab') return;
  const dialogs = [...document.querySelectorAll('[aria-modal="true"]:not(.hidden)')];
  if (!dialogs.length) return;
  const top = dialogs.reduce((a, b) =>
    Number(getComputedStyle(b).zIndex) >= Number(getComputedStyle(a).zIndex) ? b : a,
  );
  const items = focusables(top);
  if (!items.length) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (!top.contains(document.activeElement)) {
    event.preventDefault();
    first.focus();
  } else if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}
