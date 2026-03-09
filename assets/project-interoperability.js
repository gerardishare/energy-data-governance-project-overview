/* assets/project-interoperability.js */

function getSlug(){
  const url = new URL(window.location.href);
  return url.searchParams.get('slug') || '';
}

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
  if (v.includes('in werking')) return 'badgeStatus--active';
  if (v.includes('actief') || v.includes('doorontwikkeling') || v.includes('doorlopende updates')) return 'badgeStatus--active';
  if (v.includes('pilot')) return 'badgeStatus--pilot';
  if (v.includes('afgerond')) return 'badgeStatus--completed';
  return 'badgeStatus--default';
}

function statusBadgeHtml(s){
  const text = s && String(s).trim() ? escapeHtml(s) : '—';
  return `<span class="badge badgeStatus ${statusClass(s)}">${text}</span>`;
}

function splitRelated(text){
  if (!text) return [];
  return String(text)
    .split(/[;,]/)
    .map(x => x.trim())
    .filter(Boolean);
}

async function init(){
  const slug = getSlug();
  const dataUrl = './data/projects_interoperability.json';
  const res = await fetch(dataUrl, {cache:'no-store'});
  if (!res.ok) throw new Error(`Failed to load ${dataUrl}`);
  const data = await res.json();
  if (!data || !Array.isArray(data.initiatieven)) {
    throw new Error(`Unexpected data format in ${dataUrl}`);
  }

  const initiatives = data.initiatieven;
  const p = initiatives.find(x => x.id === slug);

  const pTitle = document.getElementById('pTitle');
  const pSub = document.getElementById('pSub');
  const pSummary = document.getElementById('pSummary');
  const pKv = document.getElementById('pKv');
  const pDevelopmentsSection = document.getElementById('pDevelopmentsSection');
  const pDevelopments = document.getElementById('pDevelopments');
  const pAdviceSection = document.getElementById('pAdviceSection');
  const pAdvice = document.getElementById('pAdvice');
  const pRelatedSection = document.getElementById('pRelatedSection');
  const pRelated = document.getElementById('pRelated');
  const pSources = document.getElementById('pSources');
  const pMeta = document.getElementById('pMeta');

  if (!p){
    document.title = 'Initiatief niet gevonden';
    pTitle.textContent = 'Initiatief niet gevonden';
    pSub.textContent = 'Controleer de URL (slug).';
    pSummary.textContent = '';
    return;
  }

  const sourcesMap = data.bronnen || {};

  document.title = `${p.naam} — Initiatief interoperabiliteit`;
  pTitle.textContent = p.naam;
  const subParts = [];
  if (p.familie) subParts.push(p.familie);
  if (p.geografische_scope) subParts.push(p.geografische_scope);
  pSub.textContent = subParts.join(' • ');

  pSummary.textContent = p.korte_omschrijving || '';

  const status2023 = p.status_2023 || '';
  const status2026 = p.status_2026 || '';

  pKv.innerHTML = `
    <div class="k">Rol voor datagovernance/interoperabiliteit</div><div class="v">${escapeHtml(p.bijdrage_datagovernance_interoperabiliteit || '—')}</div>
    <div class="k">Status 2023</div><div class="v">${statusBadgeHtml(status2023)}</div>
    <div class="k">Status 2026</div><div class="v">${statusBadgeHtml(status2026)}</div>
    <div class="k">Scope/familie</div><div class="v">${escapeHtml(p.familie || '—')}</div>
    <div class="k">Geografische scope</div><div class="v">${escapeHtml(p.geografische_scope || '—')}</div>
  `;

  if (p.ontwikkelingen_sinds_publicatie){
    pDevelopmentsSection.style.display = '';
    pDevelopments.textContent = p.ontwikkelingen_sinds_publicatie;
  } else {
    pDevelopmentsSection.style.display = 'none';
    pDevelopments.textContent = '';
  }

  if (p.relevantie_en_advies){
    pAdviceSection.style.display = '';
    pAdvice.textContent = p.relevantie_en_advies;
  } else {
    pAdviceSection.style.display = 'none';
    pAdvice.textContent = '';
  }

  const relatedList = splitRelated(p.verwante_of_nieuwe_initiatieven);
  if (relatedList.length){
    pRelatedSection.style.display = '';
    pRelated.innerHTML = relatedList.map(x=>`<li>${escapeHtml(x)}</li>`).join('');
  } else {
    pRelatedSection.style.display = 'none';
    pRelated.innerHTML = '';
  }

  pSources.innerHTML = '';
  const keys = Array.isArray(p.bronnen) ? p.bronnen : [];
  if (!keys.length){
    pSources.innerHTML = '<li class="small">Geen bronnen opgegeven.</li>';
  } else {
    for (const key of keys){
      const val = sourcesMap[key] || '';
      const label = val || key;
      const li = document.createElement('li');
      if (typeof val === 'string' && /^https?:\/\//.test(val)){
        const a = document.createElement('a');
        a.href = val;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = label;
        li.appendChild(a);
      } else {
        li.textContent = label;
      }
      pSources.appendChild(li);
    }
  }

  const tags = [];
  if (p.familie) tags.push(p.familie);
  if (p.geografische_scope) tags.push(p.geografische_scope);

  pMeta.innerHTML = `
    <div class="k">ID</div><div class="v">${escapeHtml(p.id || '')}</div>
    <div class="k">Tags</div><div class="v">${escapeHtml(tags.join(', ') || '—')}</div>
  `;
}

init().catch(err=>{
  console.error(err);
  document.getElementById('pTitle').textContent = 'Fout bij laden';
  document.getElementById('pSub').textContent = 'Kon ./data/projects_interoperability.json niet laden.';
});

