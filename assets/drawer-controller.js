/* assets/drawer-controller.js — gedeeld overlay + zijpaneel (open/sluiten, Escape, aria-hidden) */

/**
 * @param {{ overlay: HTMLElement | null, drawer: HTMLElement | null, closeBtn?: HTMLElement | null }} els
 * @returns {{ open: () => void, close: () => void, isOpen: () => boolean }}
 */
function createDrawerController(els) {
  const overlay = els?.overlay ?? null;
  const drawer = els?.drawer ?? null;
  const closeBtn = els?.closeBtn ?? null;

  function noop() {}

  if (!overlay || !drawer) {
    return { open: noop, close: noop, isOpen: () => false };
  }

  function onEsc(e) {
    if (e.key === 'Escape') close();
  }

  function open() {
    overlay.classList.add('open');
    drawer.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    drawer.setAttribute('aria-hidden', 'false');
    document.removeEventListener('keydown', onEsc);
    document.addEventListener('keydown', onEsc);
  }

  function close() {
    overlay.classList.remove('open');
    drawer.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    drawer.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', onEsc);
  }

  function isOpen() {
    return drawer.classList.contains('open');
  }

  overlay.addEventListener('click', close);
  if (closeBtn) closeBtn.addEventListener('click', close);

  return { open, close, isOpen };
}
