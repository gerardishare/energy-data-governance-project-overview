/* assets/interoperability.js */
let allInitiatives = [];
let fuse = null;
let sourcesMap = {};

const elQ = document.getElementById('q');
const elStatus = document.getElementById('status');
const elScope = document.getElementById('scope');
const elGrid = document.getElementById('grid');
const elEmpty = document.getElementById('empty');
const elCount = document.getElementById('countLabel');
const elChips = document.getElementById('activeChips');

const overlay = document.getElementById('overlay');
const drawer = document.getElementById('drawer');
const closeBtn = document.getElementById('closeBtn');

const dTitle = document.getElementById('dTitle');
const dSub = document.getElementById('dSub');
const dKv = document.getElementById('dKv');
const dSummary = document.getElementById('dSummary');
const dDevelopmentsSection = document.getElementById('dDevelopmentsSection');
const dDevelopments = document.getElementById('dDevelopments');
const dAdviceSection = document.getElementById('dAdviceSection');
const dAdvice = document.getElementById('dAdvice');
const dRelatedSection = document.getElementById('dRelatedSection');
const dRelated = document.getElementById('dRelated');
const dSources = document.getElementById('dSources');
const dDetail = document.getElementById('dDetail');
const dMeta = document.getElementById('dMeta');


function renderChips(){
  const chips = [];
  const q = elQ.value.trim();
  const st = elStatus.value;
  const sc = elScope.value;

  if (q) chips.push({label:`Zoek: ${q}`, clear: ()=>{ elQ.value=''; apply(); }});
  if (st) chips.push({label:`Status: ${st}`, clear: ()=>{ elStatus.value=''; apply(); }});
  if (sc) chips.push({label:`Scope: ${sc}`, clear: ()=>{ elScope.value=''; apply(); }});

  elChips.innerHTML = '';
  for (const c of chips){
    const btn = document.createElement('button');
    btn.className = 'chip';
    btn.type = 'button';
    btn.textContent = `${c.label} ✕`;
    btn.onclick = c.clear;
    elChips.appendChild(btn);
  }
}

function shortStatus(text){
  if (!text) return '';
  const s = String(text).trim();
  const semi = s.indexOf(';');
  if (semi > 0) return s.slice(0, semi).trim();
  const dot = s.indexOf('.');
  if (dot > 0 && dot < 90) return s.slice(0, dot).trim();
  return s;
}

function mapInitiatives(raw){
  return raw.map(i => {
    const status2026 = i.status_2026 || '';
    const status2023 = i.status_2023 || '';
    const statusLabel = shortStatus(status2026 || status2023);
    const scope = i.familie || '';

    return {
      slug: i.id,
      id: i.id,
      name: i.naam,
      scope,
      geografische_scope: i.geografische_scope || '',
      status: statusLabel,
      status_2023: status2023,
      status_2026: status2026,
      summary: i.korte_omschrijving || '',
      developments: i.ontwikkelingen_sinds_publicatie || '',
      contribution: i.bijdrage_datagovernance_interoperabiliteit || '',
      advice: i.relevantie_en_advies || '',
      related_raw: i.verwante_of_nieuwe_initiatieven || '',
      related: splitRelated(i.verwante_of_nieuwe_initiatieven),
      sourceKeys: Array.isArray(i.bronnen) ? i.bronnen : [],
      tags: []
    };
  });
}

function cardHtml(p){
  const tags = (p.tags || []).slice(0,3).map(t=>`<span class="badge">${escapeHtml(t)}</span>`).join('');
  const meta = `
    ${statusBadgeHtml(p.status)}
    ${p.scope ? `<span class="badge">${escapeHtml(p.scope)}</span>` : ''}
    ${p.geografische_scope ? `<span class="badge">${escapeHtml(p.geografische_scope)}</span>` : ''}
    ${tags}
  `;
  const baseSummary = p.summary || '';
  const summary = escapeHtml(baseSummary).slice(0, 190) + (baseSummary.length > 190 ? '…' : '');
  return `
    <div class="card" data-slug="${escapeHtml(p.slug)}" role="button" tabindex="0" aria-label="Open quick reference: ${escapeHtml(p.name)}">
      <div>
        <h3>${escapeHtml(p.name)}</h3>
        <div class="meta">${meta}</div>
      </div>
      <p class="summary">${summary}</p>
      <div class="footerRow">
        <span class="small">Quick reference →</span>
        <a class="link" href="project-interoperabiliteit.html?slug=${encodeURIComponent(p.slug)}" onclick="event.stopPropagation()">Detail</a>
      </div>
    </div>
  `;
}

function renderGrid(list){
  elGrid.innerHTML = list.map(cardHtml).join('');
  elEmpty.style.display = list.length ? 'none' : 'block';
  elCount.textContent = `${list.length} initiatief${list.length === 1 ? '' : 'en'}`;

  for (const card of elGrid.querySelectorAll('.card')){
    const slug = card.getAttribute('data-slug');
    card.addEventListener('click', ()=> openDrawer(slug));
    card.addEventListener('keydown', (e)=>{
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openDrawer(slug);
      }
    });
  }
}

function apply(){
  renderChips();

  const q = elQ.value.trim();
  const st = elStatus.value;
  const sc = elScope.value;

  let list = allInitiatives;

  if (q && fuse){
    list = fuse.search(q).map(r => r.item);
  }

  if (st){
    list = list.filter(p => (p.status || '') === st);
  }
  if (sc){
    list = list.filter(p => (p.scope || '') === sc);
  }

  renderGrid(list);
}

function openDrawer(slug){
  const p = allInitiatives.find(x => x.slug === slug);
  if (!p) return;

  dTitle.textContent = p.name;
  const subParts = [];
  if (p.status) subParts.push(p.status);
  if (p.scope) subParts.push(p.scope);
  if (p.geografische_scope) subParts.push(p.geografische_scope);
  dSub.textContent = subParts.join(' • ');

  dSummary.textContent = p.summary || '';

  const yearsLabel = '—';
  dKv.innerHTML = `
    <div class="k">Rol voor datagovernance/interoperabiliteit</div><div class="v">${escapeHtml(p.contribution || '—')}</div>
    <div class="k">Status 2023</div><div class="v">${escapeHtml(p.status_2023 || '—')}</div>
    <div class="k">Status 2026</div><div class="v">${escapeHtml(p.status_2026 || '—')}</div>
    <div class="k">Scope/familie</div><div class="v">${escapeHtml(p.scope || '—')}</div>
    <div class="k">Geografische scope</div><div class="v">${escapeHtml(p.geografische_scope || '—')}</div>
    <div class="k">Looptijd</div><div class="v">${escapeHtml(yearsLabel)}</div>
  `;

  if (p.developments) {
    dDevelopmentsSection.style.display = '';
    dDevelopments.textContent = p.developments;
  } else {
    dDevelopmentsSection.style.display = 'none';
    dDevelopments.textContent = '';
  }

  if (p.advice) {
    dAdviceSection.style.display = '';
    dAdvice.textContent = p.advice;
  } else {
    dAdviceSection.style.display = 'none';
    dAdvice.textContent = '';
  }

  if (p.related && p.related.length){
    dRelatedSection.style.display = '';
    dRelated.innerHTML = p.related.map(x=>`<li>${escapeHtml(x)}</li>`).join('');
  } else {
    dRelatedSection.style.display = 'none';
    dRelated.innerHTML = '';
  }

  dSources.innerHTML = '';
  const keys = Array.isArray(p.sourceKeys) ? p.sourceKeys : [];
  if (!keys.length){
    dSources.innerHTML = '<li class="small">Geen bronnen opgegeven.</li>';
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
      dSources.appendChild(li);
    }
  }

  dDetail.href = `project-interoperabiliteit.html?slug=${encodeURIComponent(p.slug)}`;
  dMeta.textContent = `ID: ${p.id}`;

  overlay.classList.add('open');
  drawer.classList.add('open');
  overlay.setAttribute('aria-hidden','false');
  drawer.setAttribute('aria-hidden','false');

  document.addEventListener('keydown', onEsc);
}

function closeDrawer(){
  overlay.classList.remove('open');
  drawer.classList.remove('open');
  overlay.setAttribute('aria-hidden','true');
  drawer.setAttribute('aria-hidden','true');
  document.removeEventListener('keydown', onEsc);
}

function onEsc(e){
  if (e.key === 'Escape') closeDrawer();
}

overlay.addEventListener('click', closeDrawer);
closeBtn.addEventListener('click', closeDrawer);

async function loadData(){
  const dataUrl = './data/projects_interoperability.json';
  const res = await fetch(dataUrl, {cache:'no-store'});
  if (!res.ok) throw new Error(`Failed to load ${dataUrl}`);
  const data = await res.json();
  if (!data || !Array.isArray(data.initiatieven)) {
    throw new Error(`Unexpected data format in ${dataUrl}`);
  }
  sourcesMap = data.bronnen || {};
  allInitiatives = mapInitiatives(data.initiatieven);

  fuse = new Fuse(allInitiatives, {
    includeScore: true,
    threshold: 0.32,
    keys: [
      {name:'name', weight: 0.5},
      {name:'summary', weight: 0.35},
      {name:'scope', weight: 0.2},
      {name:'geografische_scope', weight: 0.15},
      {name:'contribution', weight: 0.15},
      {name:'advice', weight: 0.12},
      {name:'related_raw', weight: 0.08}
    ]
  });

  elStatus.innerHTML = '<option value="">Status (alle)</option>';
  elScope.innerHTML = '<option value="">Scope (alle)</option>';
  buildSelectOptions(elStatus, uniqSorted(allInitiatives.map(p=>p.status)));
  buildSelectOptions(elScope, uniqSorted(allInitiatives.map(p=>p.scope)));

  apply();
}

async function init(){
  elQ.addEventListener('input', apply);
  elStatus.addEventListener('change', apply);
  elScope.addEventListener('change', apply);

  try{
    await loadData();
  } catch (err){
    console.error(err);
    elGrid.innerHTML = `<div class="empty">Kon ./data/projects_interoperability.json niet laden. Check of het bestand beschikbaar is.</div>`;
  }
}

init();

