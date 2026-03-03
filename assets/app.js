/* assets/app.js */
let selectedYear = 2026;
let allProjects = [];
let fuse = null;

function getDataUrl(){ return `./projects_${selectedYear}.json`; }

const elQ = document.getElementById('q');
const elStatus = document.getElementById('status');
const elScope = document.getElementById('scope');
const elGrid = document.getElementById('grid');
const elEmpty = document.getElementById('empty');
const elCount = document.getElementById('countLabel');
const elChips = document.getElementById('activeChips');
const yearBtns = document.querySelectorAll('.yearBtn');

const overlay = document.getElementById('overlay');
const drawer = document.getElementById('drawer');
const closeBtn = document.getElementById('closeBtn');

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

function uniqSorted(values){
  return Array.from(new Set(values.filter(Boolean))).sort((a,b)=>a.localeCompare(b));
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
  if (v === 'active') return 'badgeStatus--active';
  if (v === 'pilot') return 'badgeStatus--pilot';
  if (v === 'completed') return 'badgeStatus--completed';
  return 'badgeStatus--default';
}
function statusBadgeHtml(s){
  const text = s && String(s).trim() ? escapeHtml(s) : '—';
  return `<span class="badge badgeStatus ${statusClass(s)}">${text}</span>`;
}

function buildSelectOptions(selectEl, values){
  for (const v of values){
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v;
    selectEl.appendChild(opt);
  }
}

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
  const summary = escapeHtml(p.summary).slice(0, 170) + (p.summary.length > 170 ? '…' : '');
  return `
    <div class="card" data-slug="${escapeHtml(p.slug)}" role="button" tabindex="0" aria-label="Open quick reference: ${escapeHtml(p.name)}">
      <div>
        <h3>${escapeHtml(p.name)}</h3>
        <div class="meta">${meta}</div>
      </div>
      <p class="summary">${summary}</p>
      <div class="footerRow">
        <span class="small">Quick reference →</span>
        <a class="link" href="project.html?slug=${encodeURIComponent(p.slug)}&year=${selectedYear}" onclick="event.stopPropagation()">Detail</a>
      </div>
    </div>
  `;
}

function renderGrid(list){
  elGrid.innerHTML = list.map(cardHtml).join('');
  elEmpty.style.display = list.length ? 'none' : 'block';
  elCount.textContent = `${list.length} project${list.length === 1 ? '' : 'en'}`;

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
}

function openDrawer(slug){
  const p = allProjects.find(x => x.slug === slug);
  if (!p) return;

  dTitle.textContent = p.name;
  const subParts = [];
  if (p.status) subParts.push(p.status);
  if (p.scope) subParts.push(p.scope);
  if (p.geografical_scope) subParts.push(p.geografical_scope);
  if (p.year_start || p.year_end) {
    subParts.push(`${p.year_start ?? '—'}–${p.year_end ?? '—'}`);
  }
  if (p.owner) subParts.push(p.owner);
  dSub.textContent = subParts.join(' • ');
  dSummary.textContent = p.summary || '';

  // key/values
  const qr = p.quick_reference || {};
  const yearsLabel = (p.year_start || p.year_end)
    ? `${p.year_start ?? '—'}–${p.year_end ?? '—'}`
    : '—';
  dKv.innerHTML = `
    <div class="k">Doel</div><div class="v">${escapeHtml(qr.primary_goal || '—')}</div>
    <div class="k">Status</div><div class="v">${statusBadgeHtml(p.status)}</div>
    <div class="k">Scope</div><div class="v">${escapeHtml(p.scope || '—')}</div>
    <div class="k">Geografische scope</div><div class="v">${escapeHtml(p.geografical_scope || '—')}</div>
    <div class="k">Looptijd</div><div class="v">${escapeHtml(yearsLabel)}</div>
    <div class="k">Owner</div><div class="v">${escapeHtml(p.owner || '—')}</div>
  `;

  // lists
  const outputs = (qr.key_outputs || []);
  const users = (qr.target_users || []);
  dLists.innerHTML = `
    ${outputs.length ? `<div class="small" style="margin-top:10px;">Key outputs</div><ul class="list">${outputs.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul>` : ''}
    ${users.length ? `<div class="small" style="margin-top:10px;">Target users</div><ul class="list">${users.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul>` : ''}
  `;

  // links
  dLinks.innerHTML = '';
  let linkDefs = Array.isArray(p.links) ? p.links : [];
  // fallback voor oudere structuur
  if (!linkDefs.length) {
    linkDefs = [
      {label:'Website', url: p.website},
      {label:'Repository', url: p.repo}
    ];
  }
  linkDefs = linkDefs.filter(x => x && x.url && String(x.url).trim().length);

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

  dDetail.href = `project.html?slug=${encodeURIComponent(p.slug)}&year=${selectedYear}`;
  const tagText = (p.tags || []).join(', ');
  dMeta.textContent = tagText ? `Tags: ${tagText}` : '';

  // Ontwikkelingen 2023–2026
  const dev = p.developments_2023_2026;
  if (dev && (dev.summary || (Array.isArray(dev.highlights) && dev.highlights.length))) {
    dDevelopmentsSection.style.display = '';
    let html = '';
    if (dev.reference_date) {
      html += `<p class="small" style="margin:0 0 8px;">Referentiedatum: ${escapeHtml(dev.reference_date)}</p>`;
    }
    if (dev.summary) {
      html += `<p class="summary" style="margin:0 0 10px;">${escapeHtml(dev.summary)}</p>`;
    }
    if (Array.isArray(dev.highlights) && dev.highlights.length) {
      html += '<ul class="list developmentHighlights">';
      for (const h of dev.highlights) {
        const datePart = h.date ? `<span class="developmentDate">${escapeHtml(h.date)}</span> ` : '';
        html += `<li>${datePart}<strong>${escapeHtml(h.title || '')}</strong>${h.detail ? ` — ${escapeHtml(h.detail)}` : ''}</li>`;
      }
      html += '</ul>';
    }
    dDevelopments.innerHTML = html;
  } else {
    dDevelopmentsSection.style.display = 'none';
    dDevelopments.innerHTML = '';
  }

  overlay.classList.add('open');
  drawer.classList.add('open');
  overlay.setAttribute('aria-hidden','false');
  drawer.setAttribute('aria-hidden','false');

  // Close on ESC
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
  allProjects = await res.json();

  fuse = new Fuse(allProjects, {
    includeScore: true,
    threshold: 0.32,
    keys: [
      {name:'name', weight: 0.5},
      {name:'summary', weight: 0.35},
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