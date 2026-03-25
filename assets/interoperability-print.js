/**
 * Statisch printoverzicht voor initiatieven-interoperabiliteit-print.html
 * (geen klikbare links in de gegenereerde inhoud)
 */
function textBlock(label, value) {
  const t = value != null && String(value).trim() ? String(value) : '';
  if (!t) return '';
  return `<p class="printBlockLabel">${escapeHtml(label)}</p><div class="printBlock">${escapeHtml(t)}</div>`;
}

function listBlock(label, items) {
  if (!Array.isArray(items) || !items.length) return '';
  return `<p class="printBlockLabel">${escapeHtml(label)}</p><ul class="printList">${items.map(x => `<li>${escapeHtml(x)}</li>`).join('')}</ul>`;
}

function resolveBronLines(keys, sourcesMap) {
  return (keys || []).map(k => {
    const v = sourcesMap[k];
    return typeof v === 'string' && v.trim() ? v.trim() : k;
  });
}

function initiativeSection(i, sourcesMap) {
  const naam = i.naam ?? '';
  const metaParts = [i.familie, i.geografische_scope].filter(x => x && String(x).trim());
  const metaHtml = metaParts.length
    ? `<div class="printOverall"><span>${escapeHtml(metaParts.join(' • '))}</span></div>`
    : '';

  const keys = Array.isArray(i.bronnen) ? i.bronnen : [];
  const bronLines = resolveBronLines(keys, sourcesMap);
  const related = splitRelated(i.verwante_of_nieuwe_initiatieven);

  const body = [
    textBlock('Korte omschrijving', i.korte_omschrijving),
    textBlock('Rol voor datagovernance / interoperabiliteit', i.bijdrage_datagovernance_interoperabiliteit),
    textBlock('Status 2023', i.status_2023),
    textBlock('Status 2026', i.status_2026),
    textBlock('Ontwikkelingen sinds publicatie', i.ontwikkelingen_sinds_publicatie),
    textBlock('Relevantie en advies', i.relevantie_en_advies),
    listBlock('Verwante of nieuwe initiatieven', related),
    listBlock('Bronnen', bronLines),
  ].join('');

  return `
    <section class="printRecSection">
      <div class="printRecHeader">
        <h2>${escapeHtml(naam)}</h2>
        ${metaHtml}
      </div>
      ${body}
      <p class="printIdFoot">ID: ${escapeHtml(i.id ?? '')}</p>
    </section>
  `;
}

async function loadInteroperabilityPrint() {
  const root = document.getElementById('interopPrintRoot');
  if (!root) return;

  const dataUrl = './data/projects_interoperability.json';
  const res = await fetch(dataUrl, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to load ${dataUrl}`);

  const data = await res.json();
  if (!data || !Array.isArray(data.initiatieven)) {
    throw new Error('Unexpected data format');
  }

  const sourcesMap = data.bronnen || {};
  const list = data.initiatieven;

  root.innerHTML = list.map(i => initiativeSection(i, sourcesMap)).join('');
}

document.addEventListener('DOMContentLoaded', () => {
  loadInteroperabilityPrint().catch(err => {
    console.error(err);
    const root = document.getElementById('interopPrintRoot');
    if (root) {
      root.innerHTML =
        '<p class="printError">Kon het overzicht niet laden. Controleer of dit bestand via een webserver wordt geopend.</p>';
    }
  });
});
