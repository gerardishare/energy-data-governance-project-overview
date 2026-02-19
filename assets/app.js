/* assets/app.js */
const DATA_URL = './projects.json';

let allProjects = [];
let fuse = null;

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
const dLists = document.getElementById('dLists');
const dSummary = document.getElementById('dSummary');
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
    <span class="badge">${escapeHtml(p.status)}</span>
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
        <a class="link" href="project.html?slug=${encodeURIComponent(p.slug)}" onclick="event.stopPropagation()">Detail</a>
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
  dSub.textContent = `${p.status} • ${p.scope} • start ${p.year_start ?? '—'} • ${p.owner ?? ''}`.replace(/\s•\s$/,'');
  dSummary.textContent = p.summary || '';

  // key/values
  const qr = p.quick_reference || {};
  dKv.innerHTML = `
    <div class="k">Doel</div><div class="v">${escapeHtml(qr.primary_goal || '—')}</div>
    <div class="k">Status</div><div class="v">${escapeHtml(p.status || '—')}</div>
    <div class="k">Scope</div><div class="v">${escapeHtml(p.scope || '—')}</div>
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
  const linkDefs = [
    {label:'Website', url: p.website},
    {label:'Repository', url: p.repo}
  ].filter(x => x.url && String(x.url).trim().length);

  if (!linkDefs.length){
    dLinks.innerHTML = `<span class="small">Geen links opgegeven.</span>`;
  } else {
    for (const l of linkDefs){
      const a = document.createElement('a');
      a.className = 'button';
      a.href = l.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = l.label;
      dLinks.appendChild(a);
    }
  }

  dDetail.href = `project.html?slug=${encodeURIComponent(p.slug)}`;
  const tagText = (p.tags || []).join(', ');
  dMeta.textContent = tagText ? `Tags: ${tagText}` : '';

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

async function init(){
  const res = await fetch(DATA_URL, {cache:'no-store'});
  if (!res.ok) throw new Error(`Failed to load ${DATA_URL}`);
  allProjects = await res.json();

  // init Fuse
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

  // fill filter values
  buildSelectOptions(elStatus, uniqSorted(allProjects.map(p=>p.status)));
  buildSelectOptions(elScope, uniqSorted(allProjects.map(p=>p.scope)));

  // listeners
  elQ.addEventListener('input', apply);
  elStatus.addEventListener('change', apply);
  elScope.addEventListener('change', apply);

  apply();
}

init().catch(err=>{
  console.error(err);
  elGrid.innerHTML = `<div class="empty">Kon projects.json niet laden. Check of alle bestanden op GitHub Pages staan.</div>`;
});