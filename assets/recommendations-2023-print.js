/**
 * Statisch printoverzicht voor reflectie-aanbevelingen-2023-print.html
 * (geen knoppen of links in de gegenereerde inhoud)
 */
const STATUS_KEYS_PRINT = new Set(['realized', 'partial', 'none']);

function coerceStatusKeyPrint(key) {
  const k = String(key ?? '').trim();
  return STATUS_KEYS_PRINT.has(k) ? k : 'none';
}

function printDotHtml(statusKey) {
  const kind = coerceStatusKeyPrint(statusKey);
  return `<span class="printDot printDot--${escapeHtml(kind)}" aria-hidden="true"></span>`;
}

function renderInlineAsterisksEmPrint(text) {
  const escaped = escapeHtml(text ?? '');
  return escaped.replace(/\*(.+?)\*/g, '<em>$1</em>');
}

function legendItemHtml(row) {
  const key = coerceStatusKeyPrint(row?.key);
  const label = row?.label ?? '';
  const description = row?.description ?? '';
  return `
    <div class="printLegendItem">
      <div class="printLegendPill printLegendPill--${escapeHtml(key)}">
        ${printDotHtml(key)}
        <span>${escapeHtml(label)}</span>
      </div>
      <div class="printLegendDesc">${escapeHtml(description)}</div>
    </div>
  `;
}

function subBlockHtml(sub) {
  const sk = coerceStatusKeyPrint(sub?.statusKey);
  const title = sub?.title ?? '';
  const label = sub?.statusLabel ?? '';
  const quote = sub?.quote ?? '';
  const explanation = sub?.statusExplanation ?? '';

  return `
    <article class="printSub">
      <div class="printSubTitleRow">
        <h3>${printDotHtml(sk)} ${escapeHtml(title)}</h3>
      </div>
      <p class="printStatusLine">Status: ${escapeHtml(label)}</p>
      <p class="printBlockLabel">Oorspronkelijke aanbeveling (rapport 2023)</p>
      <div class="printBlock">${renderInlineAsterisksEmPrint(quote)}</div>
      <p class="printBlockLabel">Toelichting op de status</p>
      <div class="printBlock">${renderInlineAsterisksEmPrint(explanation)}</div>
    </article>
  `;
}

function sectionHtml(rec) {
  const overallKey = coerceStatusKeyPrint(rec?.overallStatusKey);
  const overallLabel = rec?.overallStatusLabel ?? '';
  const header = rec?.header ?? '';
  const subs = Array.isArray(rec.subRecommendations) ? rec.subRecommendations : [];

  return `
    <section class="printRecSection">
      <div class="printRecHeader">
        <h2>${escapeHtml(header)}</h2>
        <div class="printOverall">
          ${printDotHtml(overallKey)}
          <span>${escapeHtml(overallLabel)}</span>
        </div>
      </div>
      ${subs.map(subBlockHtml).join('')}
    </section>
  `;
}

async function loadRecommendations2023Print() {
  const root = document.getElementById('recommendations2023PrintRoot');
  if (!root) return;

  const res = await fetch('./data/recommendations_2023.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load recommendations JSON');

  const data = await res.json();
  if (!data || typeof data !== 'object') throw new Error('Unexpected data format');

  const legend = Array.isArray(data.legend) ? data.legend : [];
  const recs = Array.isArray(data.recommendations) ? data.recommendations : [];

  const legendHtml = legend.length
    ? `<div class="printLegend" role="note">${legend.map(legendItemHtml).join('')}</div>`
    : '';

  root.innerHTML = `
    ${legendHtml}
    ${recs.map(sectionHtml).join('')}
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  loadRecommendations2023Print().catch(err => {
    console.error(err);
    const root = document.getElementById('recommendations2023PrintRoot');
    if (root) {
      root.innerHTML = '<p class="printError">Kon het overzicht niet laden. Controleer of dit bestand via een webserver wordt geopend.</p>';
    }
  });
});
