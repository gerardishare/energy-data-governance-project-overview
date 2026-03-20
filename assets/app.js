/* assets/app.js */
let selectedYear = 2026;
let allProjects = [];
let fuse = null;

function getDataUrl(){ return `./data/projects_data_sharing_${selectedYear}.json`; }

const elQ = document.getElementById('q');
const elStatus = document.getElementById('status');
const elScope = document.getElementById('scope');
const elGrid = document.getElementById('grid');
const elDiagram = document.getElementById('radialDiagram');
const elEmpty = document.getElementById('empty');
const elCount = document.getElementById('countLabel');
const elChips = document.getElementById('activeChips');
const yearBtns = document.querySelectorAll('.yearBtn');

const overlay = document.getElementById('overlay');
const drawer = document.getElementById('drawer');
const closeBtn = document.getElementById('closeBtn');
const drawerCtl = createDrawerController({ overlay, drawer, closeBtn });

const dTitle = document.getElementById('dTitle');
const dSub = document.getElementById('dSub');
const dKv = document.getElementById('dKv');
const dLists = document.getElementById('dLists');
const dSummary = document.getElementById('dSummary');
const dDevelopmentsSection = document.getElementById('dDevelopmentsSection');
const dDevelopments = document.getElementById('dDevelopments');
const dLinks = document.getElementById('dLinks');
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

function cardHtml(p){
  const tags = (p.tags || []).slice(0,3).map(t=>`<span class="badge">${escapeHtml(t)}</span>`).join('');
  const meta = `
    ${statusBadgeHtml(p.status)}
    <span class="badge">${escapeHtml(p.scope)}</span>
    ${tags}
  `;
  const summarySrc = p.samenvatting || '';
  const summary = escapeHtml(summarySrc).slice(0, 170) + (summarySrc.length > 170 ? '…' : '');
  return `
    <div class="card" data-slug="${escapeHtml(p.id)}" role="button" tabindex="0" aria-label="Open quick reference: ${escapeHtml(p.naam)}">
      <div>
        <h3>${escapeHtml(p.naam)}</h3>
        <div class="meta">${meta}</div>
      </div>
      <p class="summary">${summary}</p>
      <div class="footerRow">
        <span class="small">Quick reference →</span>
        <a class="link" href="project.html?slug=${encodeURIComponent(p.id)}&year=${selectedYear}" onclick="event.stopPropagation()">Detail</a>
      </div>
    </div>
  `;
}

function renderGrid(list){
  elGrid.innerHTML = list.map(cardHtml).join('');
  elEmpty.style.display = list.length ? 'none' : 'block';
  elCount.textContent = `${list.length} initiatief${list.length === 1 ? '' : 'en'}`;

  // click handlers
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

  let list = allProjects;

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
  renderDiagram(list, elDiagram, openDrawer);
}


function openDrawer(slug){
  const p = allProjects.find(x => x.id === slug);
  if (!p) return;

  dTitle.textContent = p.naam;
  const subParts = [];
  if (p.status) subParts.push(p.status);
  if (p.scope) subParts.push(p.scope);
  if (p.geografische_scope) subParts.push(p.geografische_scope);
  if (p.jaar_start || p.jaar_einde) {
    subParts.push(`${p.jaar_start ?? '—'}–${p.jaar_einde ?? '—'}`);
  }
  if (p.eigenaar) subParts.push(p.eigenaar);
  dSub.textContent = subParts.join(' • ');
  dSummary.textContent = p.samenvatting || '';

  // key/values
  const qr = p.korte_referentie || {};
  const startYear = p.jaar_start;
  const endYear = p.jaar_einde;
  const yearsLabel = (startYear || endYear)
    ? `${startYear ?? '—'}–${endYear ?? '—'}`
    : '—';
  dKv.innerHTML = `
    <div class="k">Doel</div><div class="v">${escapeHtml(qr.primair_doel || '—')}</div>
    <div class="k">Status</div><div class="v">${statusBadgeHtml(p.status)}</div>
    <div class="k">Scope</div><div class="v">${escapeHtml(p.scope || '—')}</div>
    <div class="k">Geografische scope</div><div class="v">${escapeHtml(p.geografische_scope || '—')}</div>
    <div class="k">Looptijd</div><div class="v">${escapeHtml(yearsLabel)}</div>
    <div class="k">Eigenaar</div><div class="v">${escapeHtml(p.eigenaar || '—')}</div>
  `;

  // lists
  const outputs = (qr.belangrijkste_resultaten || []);
  const users = (qr.doelgebruikers || []);
  dLists.innerHTML = `
    ${outputs.length ? `<div class="small" style="margin-top:10px;">Belangrijkste resultaten</div><ul class="list">${outputs.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul>` : ''}
    ${users.length ? `<div class="small" style="margin-top:10px;">Doelgebruikers</div><ul class="list">${users.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul>` : ''}
  `;

  // links
  dLinks.innerHTML = '';
  const linkDefs = (Array.isArray(p.links) ? p.links : []).filter(
    x => x && x.url && String(x.url).trim().length
  );

  if (!linkDefs.length){
    dLinks.innerHTML = `<span class="small">Geen links opgegeven.</span>`;
  } else {
    for (const l of linkDefs){
      const a = document.createElement('a');
      a.className = 'button';
      a.href = l.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = l.label || l.url;
      dLinks.appendChild(a);
    }
  }

  dDetail.href = `project.html?slug=${encodeURIComponent(p.id)}&year=${selectedYear}`;
  const tagText = (p.tags || []).join(', ');
  dMeta.textContent = tagText ? `Tags: ${tagText}` : '';

  // Ontwikkelingen 2023–2026
  const dev = p.ontwikkelingen_2023_2026;
  if (dev && (dev.samenvatting || (Array.isArray(dev.hoogtepunten) && dev.hoogtepunten.length))) {
    dDevelopmentsSection.style.display = '';
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
    dDevelopments.innerHTML = html;
  } else {
    dDevelopmentsSection.style.display = 'none';
    dDevelopments.innerHTML = '';
  }

  drawerCtl.open();
}

function setYearUI(year){
  selectedYear = year;
  yearBtns.forEach(btn => {
    const y = parseInt(btn.dataset.year, 10);
    btn.classList.toggle('active', y === selectedYear);
  });
  const url = new URL(window.location.href);
  url.searchParams.set('year', String(selectedYear));
  window.history.replaceState(null, '', url);
}

async function loadProjects(year){
  setYearUI(year);
  const dataUrl = getDataUrl();
  const res = await fetch(dataUrl, {cache:'no-store'});
  if (!res.ok) throw new Error(`Failed to load ${dataUrl}`);
  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error(`Unexpected data format in ${dataUrl}`);
  }
  allProjects = data;

  fuse = new Fuse(allProjects, {
    includeScore: true,
    threshold: 0.32,
    keys: [
      {name:'naam', weight: 0.5},
      {name:'samenvatting', weight: 0.35},
      {name:'tags', weight: 0.15},
      {name:'status', weight: 0.08},
      {name:'scope', weight: 0.08}
    ]
  });

  elStatus.innerHTML = '<option value="">Status (alle)</option>';
  elScope.innerHTML = '<option value="">Scope (alle)</option>';
  buildSelectOptions(elStatus, uniqSorted(allProjects.map(p=>p.status)));
  buildSelectOptions(elScope, uniqSorted(allProjects.map(p=>p.scope)));

  apply();
}

function init(){
  const url = new URL(window.location.href);
  const yearParam = url.searchParams.get('year');
  if (yearParam === '2023' || yearParam === '2026') {
    selectedYear = parseInt(yearParam, 10);
    yearBtns.forEach(btn => {
      const y = parseInt(btn.dataset.year, 10);
      btn.classList.toggle('active', y === selectedYear);
    });
  }

  yearBtns.forEach(btn => {
    btn.addEventListener('click', ()=>{
      const y = parseInt(btn.dataset.year, 10);
      loadProjects(y).catch(err=>{
        console.error(err);
        elGrid.innerHTML = `<div class="empty">Kon ${getDataUrl()} niet laden.</div>`;
      });
    });
  });

  elQ.addEventListener('input', apply);
  elStatus.addEventListener('change', apply);
  elScope.addEventListener('change', apply);

  loadProjects(selectedYear).catch(err=>{
    console.error(err);
    elGrid.innerHTML = `<div class="empty">Kon ${getDataUrl()} niet laden. Check of alle bestanden op GitHub Pages staan.</div>`;
  });
}

init();