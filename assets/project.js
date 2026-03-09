/* assets/project.js */
function getSlug(){
  const url = new URL(window.location.href);
  return url.searchParams.get('slug') || '';
}
function getYear(){
  const url = new URL(window.location.href);
  const y = url.searchParams.get('year');
  return y === '2023' ? 2023 : 2026;
}
function getDataUrl(){ return `./data/projects_data_sharing_${getYear()}.json`; }
function escapeHtml(s){
  return String(s ?? '')
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'","&#039;");
}
function statusClass(s){
  const v = (s || '').toLowerCase();
  if (v === 'actief') return 'badgeStatus--active';
  if (v === 'pilot') return 'badgeStatus--pilot';
  if (v === 'afgerond') return 'badgeStatus--completed';
  return 'badgeStatus--default';
}
function statusBadgeHtml(s){
  const text = s && String(s).trim() ? escapeHtml(s) : '—';
  return `<span class="badge badgeStatus ${statusClass(s)}">${text}</span>`;
}

async function init(){
  const slug = getSlug();
  const year = getYear();
  const dataUrl = getDataUrl();
  const res = await fetch(dataUrl, {cache:'no-store'});
  if (!res.ok) throw new Error(`Failed to load ${dataUrl}`);
  const projects = await res.json();
  if (!Array.isArray(projects)) {
    throw new Error(`Unexpected data format in ${dataUrl}`);
  }
  const p = projects.find(x => x.id === slug);

  const pTitle = document.getElementById('pTitle');
  const pSub = document.getElementById('pSub');
  const pSummary = document.getElementById('pSummary');
  const pKv = document.getElementById('pKv');
  const pLists = document.getElementById('pLists');
  const pLinks = document.getElementById('pLinks');
  const pMeta = document.getElementById('pMeta');

  const backLink = document.querySelector('.pageBack');
  if (backLink) backLink.href = `./?year=${year}`;

  if (!p){
    document.title = 'Initiatief niet gevonden';
    pTitle.textContent = 'Initiatief niet gevonden';
    pSub.textContent = 'Controleer de URL (slug).';
    pSummary.textContent = '';
    return;
  }

  document.title = `${p.naam} — Initiatief data delen`;
  pTitle.textContent = p.naam;
  const subParts = [];
  if (p.status) subParts.push(p.status);
  if (p.scope) subParts.push(p.scope);
  if (p.geografische_scope) subParts.push(p.geografische_scope);
  if (p.jaar_start || p.jaar_einde) {
    subParts.push(`${p.jaar_start ?? '—'}–${p.jaar_einde ?? '—'}`);
  }
  if (p.eigenaar) subParts.push(p.eigenaar);
  pSub.textContent = subParts.join(' • ');
  pSummary.textContent = p.samenvatting || '';

  const qr = p.korte_referentie || {};
  const startYear = p.jaar_start;
  const endYear = p.jaar_einde;
  const yearsLabel = (startYear || endYear)
    ? `${startYear ?? '—'}–${endYear ?? '—'}`
    : '—';
  pKv.innerHTML = `
    <div class="k">Doel</div><div class="v">${escapeHtml(qr.primair_doel || '—')}</div>
    <div class="k">Status</div><div class="v">${statusBadgeHtml(p.status)}</div>
    <div class="k">Scope</div><div class="v">${escapeHtml(p.scope || '—')}</div>
    <div class="k">Geografische scope</div><div class="v">${escapeHtml(p.geografische_scope || '—')}</div>
    <div class="k">Looptijd</div><div class="v">${escapeHtml(yearsLabel)}</div>
    <div class="k">Eigenaar</div><div class="v">${escapeHtml(p.eigenaar || '—')}</div>
  `;

  const outputs = (qr.belangrijkste_resultaten || []);
  const users = (qr.doelgebruikers || []);
  pLists.innerHTML = `
    ${outputs.length ? `<div class="small" style="margin-top:10px;">Belangrijkste resultaten</div><ul class="list">${outputs.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul>` : ''}
    ${users.length ? `<div class="small" style="margin-top:10px;">Doelgebruikers</div><ul class="list">${users.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul>` : ''}
  `;

  // links
  pLinks.innerHTML = '';
  const linkDefs = (Array.isArray(p.links) ? p.links : []).filter(
    x => x && x.url && String(x.url).trim().length
  );

  if (!linkDefs.length){
    pLinks.innerHTML = `<span class="small">Geen links opgegeven.</span>`;
  } else {
    for (const l of linkDefs){
      const a = document.createElement('a');
      a.className = 'button';
      a.href = l.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = l.label || l.url;
      pLinks.appendChild(a);
    }
  }

  // Ontwikkelingen 2023–2026
  const pDevelopmentsSection = document.getElementById('pDevelopmentsSection');
  const pDevelopments = document.getElementById('pDevelopments');
  const dev = p.ontwikkelingen_2023_2026;
  if (dev && (dev.samenvatting || (Array.isArray(dev.hoogtepunten) && dev.hoogtepunten.length))) {
    pDevelopmentsSection.style.display = '';
    let html = '';
    if (dev.referentiedatum) {
      html += `<p class="small" style="margin:0 0 8px;">Referentiedatum: ${escapeHtml(dev.referentiedatum)}</p>`;
    }
    if (dev.samenvatting) {
      html += `<p class="summary" style="margin:0 0 10px;">${escapeHtml(dev.samenvatting)}</p>`;
    }
    if (Array.isArray(dev.hoogtepunten) && dev.hoogtepunten.length) {
      html += '<ul class="list developmentHighlights">';
      for (const h of dev.hoogtepunten) {
        const datePart = h.datum ? `<span class="developmentDate">${escapeHtml(h.datum)}</span> ` : '';
        html += `<li>${datePart}<strong>${escapeHtml(h.titel || '')}</strong>${h.detail ? ` — ${escapeHtml(h.detail)}` : ''}</li>`;
      }
      html += '</ul>';
    }
    pDevelopments.innerHTML = html;
  } else {
    pDevelopmentsSection.style.display = 'none';
    pDevelopments.innerHTML = '';
  }

  // metadata
  const tags = (p.tags || []).join(', ');
  pMeta.innerHTML = `
    <div class="k">ID</div><div class="v">${escapeHtml(p.id)}</div>
    <div class="k">Tags</div><div class="v">${escapeHtml(tags || '—')}</div>
  `;
}

init().catch(err=>{
  console.error(err);
  document.getElementById('pTitle').textContent = 'Fout bij laden';
  document.getElementById('pSub').textContent = `Kon ${getDataUrl()} niet laden.`;
});