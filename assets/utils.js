/* assets/utils.js — gedeelde hulpfuncties */

function escapeHtml(s) {
  return String(s ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

/**
 * Geeft de CSS-klasse voor een statusbadge.
 * Werkt voor zowel data-delen ('actief', 'pilot', 'afgerond') als
 * interoperabiliteit ('in werking', 'doorontwikkeling', etc.).
 */
function statusClass(s) {
  const v = (s || '').toLowerCase();
  if (v.includes('in werking')) return 'badgeStatus--active';
  if (v.includes('actief') || v.includes('doorontwikkeling') || v.includes('doorlopende updates')) return 'badgeStatus--active';
  if (v.includes('pilot')) return 'badgeStatus--pilot';
  if (v.includes('afgerond')) return 'badgeStatus--completed';
  return 'badgeStatus--default';
}

function statusBadgeHtml(s) {
  const text = s && String(s).trim() ? escapeHtml(s) : '—';
  return `<span class="badge badgeStatus ${statusClass(s)}">${text}</span>`;
}

/** Verwijdert dubbelen en sorteert alfabetisch. */
function uniqSorted(values) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

/** Vult een <select>-element met opties vanuit een array van strings. */
function buildSelectOptions(selectEl, values) {
  for (const v of values) {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v;
    selectEl.appendChild(opt);
  }
}

/** Splitst een komma- of puntkomma-gescheiden tekst naar een array. */
function splitRelated(text) {
  if (!text) return [];
  return String(text)
    .split(/[;,]/)
    .map(x => x.trim())
    .filter(Boolean);
}
