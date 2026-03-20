/**
 * Verwacht `data/recommendations_2023.json` met:
 * - legend: { key, label, description }
 * - recommendations: { overallStatusKey, overallStatusLabel, subRecommendations: { statusKey, statusLabel, ... } }
 * Toegestane keys (CSS: .statusDot--*): realized | partial | none
 */
const STATUS_KEYS = new Set(['realized', 'partial', 'none']);

function coerceStatusKey(key) {
  const k = String(key ?? '').trim();
  return STATUS_KEYS.has(k) ? k : 'none';
}

function statusDotHtml(statusKey) {
  const kind = coerceStatusKey(statusKey);
  return `
    <span class="statusDot statusDot--${escapeHtml(kind)}" aria-hidden="true"></span>
  `;
}

function statusLegendItemHtml(legendRow) {
  const key = coerceStatusKey(legendRow?.key);
  const label = legendRow?.label ?? '';
  const description = legendRow?.description ?? '';
  return `
    <div class="legendItem">
      <div class="legendStatus">
        <span class="legendStatusPill legendStatusPill--${escapeHtml(key)}">
          ${statusDotHtml(key)}
          <span class="legendStatusText">${escapeHtml(label)}</span>
        </span>
      </div>
      <div class="legendDesc">${escapeHtml(description)}</div>
    </div>
  `;
}

function renderInlineAsterisksEm(text) {
  const escaped = escapeHtml(text ?? '');
  return escaped.replace(/\*(.+?)\*/g, '<em>$1</em>');
}

/** Gezet in loadRecommendations2023 na makeDrawerElements */
let recsDrawerCtl = null;

function makeDrawerElements() {
  const overlay = document.createElement('div');
  overlay.id = 'recsOverlay';
  overlay.className = 'overlay';
  overlay.setAttribute('aria-hidden', 'true');

  const drawer = document.createElement('aside');
  drawer.id = 'recsDrawer';
  drawer.className = 'drawer';
  drawer.setAttribute('aria-hidden', 'true');
  drawer.setAttribute('aria-label', 'Status details');

  drawer.innerHTML = `
    <div class="drawerHeader">
      <div>
        <h2 id="recsDrawerTitle"></h2>
        <p class="sub" id="recsDrawerSub"></p>
      </div>
      <button type="button" class="iconBtn iconBtn--drawerClose" id="recsDrawerClose" aria-label="Sluiten">
        <svg class="drawerCloseIcon" width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
      </button>
    </div>
    <div class="drawerBody">
      <div class="section">
        <div id="recsDrawerQuote" class="recsDrawerText"></div>
        <hr class="sep"/>
        <h4>Toelichting op de status</h4>
        <div id="recsDrawerExplanation" class="recsDrawerText"></div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(drawer);

  const closeBtn = document.getElementById('recsDrawerClose');
  recsDrawerCtl = createDrawerController({ overlay, drawer, closeBtn });
}

function openDrawerFor(subrec) {
  if (!recsDrawerCtl) return;

  const titleEl = document.getElementById('recsDrawerTitle');
  const subEl = document.getElementById('recsDrawerSub');
  const quoteEl = document.getElementById('recsDrawerQuote');
  const explanationEl = document.getElementById('recsDrawerExplanation');

  if (titleEl) titleEl.textContent = subrec.title ?? '';
  if (subEl) {
    const key = coerceStatusKey(subrec?.statusKey);
    const label = subrec?.statusLabel ?? '';
    const line = `Status: ${label}`;
    subEl.innerHTML = `${statusDotHtml(key)} <span class="recsDrawerStatusText">${escapeHtml(line)}</span>`;
  }
  if (quoteEl) quoteEl.innerHTML = `<div class="recsDrawerBlock">${renderInlineAsterisksEm(subrec.quote ?? '')}</div>`;
  if (explanationEl) explanationEl.innerHTML = `<div class="recsDrawerBlock">${renderInlineAsterisksEm(subrec.statusExplanation ?? '')}</div>`;

  recsDrawerCtl.open();
}

async function loadRecommendations2023() {
  const container = document.getElementById('recommendations2023');
  if (!container) return;

  const res = await fetch('./data/recommendations_2023.json', { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load ./data/recommendations_2023.json`);

  const data = await res.json();
  if (!data || typeof data !== 'object') throw new Error('Unexpected data format');

  const legend = Array.isArray(data.legend) ? data.legend : [];
  const recs = Array.isArray(data.recommendations) ? data.recommendations : [];

  makeDrawerElements();

  container.innerHTML = `
    <div class="recsLayout">
      ${legend.length ? `
        <div class="recsLegend" role="note" aria-label="Status legenda">
          ${legend.map(statusLegendItemHtml).join('')}
        </div>
      ` : ''}

      <div class="recsColumns">
        ${recs.map(renderRecommendationColumn).join('')}
      </div>
    </div>
  `;

  for (const btn of container.querySelectorAll('[data-sub-id]')) {
    btn.addEventListener('click', () => {
      const subId = btn.getAttribute('data-sub-id');
      const subrec = recs.flatMap(r => r.subRecommendations || []).find(s => s.id === subId);
      if (subrec) openDrawerFor(subrec);
    });
  }
}

function renderRecommendationColumn(rec) {
  const overallKey = coerceStatusKey(rec?.overallStatusKey);
  const subs = Array.isArray(rec.subRecommendations) ? rec.subRecommendations : [];

  return `
    <div class="recsColumn">
      <div class="recsMainCard">
        <div class="recsMainHeader">
          <div class="recsMainTitle">${escapeHtml(rec.header ?? '')}</div>
          <div class="recsMainOverall">
            ${statusDotHtml(overallKey)}
          </div>
        </div>

        <div class="recsSubList" role="list" aria-label="${escapeHtml(rec.header ?? '')} deelaanbevelingen">
          ${subs.map(s => {
            const sk = coerceStatusKey(s?.statusKey);
            return `
            <button type="button" class="recsSubButton" data-sub-id="${escapeHtml(s.id ?? '')}" role="listitem">
              <span class="recsSubButton-status">${statusDotHtml(sk)}</span>
              <span class="recsSubButton-text">${escapeHtml(s.title ?? '')}</span>
            </button>
          `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
}

document.addEventListener('DOMContentLoaded', () => {
  loadRecommendations2023().catch(err => {
    console.error(err);
    const c = document.getElementById('recommendations2023');
    if (c) c.innerHTML = '<div class="empty">Kon ./data/recommendations_2023.json niet laden.</div>';
  });
});
