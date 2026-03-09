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
  if (v === 'actief') return 'badgeStatus--active';
  if (v === 'pilot') return 'badgeStatus--pilot';
  if (v === 'afgerond') return 'badgeStatus--completed';
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
  renderDiagram(list);
}

function renderDiagram(projects){
  if (!elDiagram) return;
  const list = Array.isArray(projects) ? projects : [];
  if (!list.length){
    elDiagram.innerHTML = '<p class="small">Geen initiatieven om weer te geven.</p>';
    return;
  }

  const byScope = {
    'Energiedomein': [],
    'Gerelateerde sector': [],
    'Generiek initiatief': []
  };
  for (const p of list){
    if (byScope[p.scope]) byScope[p.scope].push(p);
  }

  const size = 420;
  const center = size / 2;
  const radii = {
    inner: 60,
    middle: 95,
    outer: 130
  };
  const dotRadii = {
    inner: radii.inner * 0.6,
    middle: (radii.inner + radii.middle) / 2,
    outer: (radii.middle + radii.outer) / 2
  };

  function pointsFor(list, radius){
    const n = list.length;
    if (!n) return [];
    const pts = [];
    for (let i=0; i<n; i++){
      const angle = (2 * Math.PI * i / n) - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      const isRight = Math.cos(angle) >= 0;
      const side = isRight ? 'right' : 'left';
      const anchor = isRight ? 'start' : 'end';
      const offset = 10;
      const lx = x + (isRight ? offset : -offset);
      const ly = y;
      pts.push({p: list[i], x, y, lx, ly, anchor, side});
    }
    return pts;
  }

  const innerPts = pointsFor(byScope['Energiedomein'], dotRadii.inner);
  const middlePts = pointsFor(byScope['Gerelateerde sector'], dotRadii.middle);
  const outerPts = pointsFor(byScope['Generiek initiatief'], dotRadii.outer);

  // eenvoudige label-collision-resolutie per zijde (links/rechts)
  const allPts = [...innerPts, ...middlePts, ...outerPts];
  const minLabelGap = 8;
  function adjustLabels(side){
    const pts = allPts.filter(pt => pt.side === side).sort((a,b)=>a.ly - b.ly);
    for (let i = 1; i < pts.length; i++){
      const prev = pts[i-1];
      const curr = pts[i];
      if (curr.ly < prev.ly + minLabelGap){
        curr.ly = prev.ly + minLabelGap;
      }
    }
  }
  adjustLabels('left');
  adjustLabels('right');

  const viewBoxY = 70;
  const viewBoxH = size - 140;
  let svg = `<svg viewBox="0 ${viewBoxY} ${size} ${viewBoxH}" role="img" aria-label="Overzicht initiatieven per scope">`;
  // achtergrondcirkels (gevuld, geen lijnen)
  svg += `
    <circle cx="${center}" cy="${center}" r="${radii.outer}" fill="rgba(22,40,70,.75)"/>
    <circle cx="${center}" cy="${center}" r="${radii.middle}" fill="rgba(18,32,60,.9)"/>
    <circle cx="${center}" cy="${center}" r="${radii.inner}" fill="rgba(14,26,48,1)"/>
  `;

  function renderLayer(points, color){
    let out = '';
    for (const pt of points){
      out += `
        <g class="diagramItem" data-slug="${escapeHtml(pt.p.id)}">
          <circle cx="${pt.x}" cy="${pt.y}" r="3.2" fill="${color}"/>
          <text x="${pt.lx}" y="${pt.ly}" fill="rgba(255,255,255,.9)" font-size="6" text-anchor="${pt.anchor}" dominant-baseline="middle">
            ${escapeHtml(pt.p.naam)}
          </text>
        </g>
      `;
    }
    return out;
  }

  svg += renderLayer(innerPts, 'rgb(110, 220, 190)');
  svg += renderLayer(middlePts, 'rgb(130, 190, 255)');
  svg += renderLayer(outerPts, 'rgb(195, 190, 255)');

  svg += '</svg>';
  elDiagram.innerHTML = svg;

  // Maak namen in de schietschaaf klikbaar (zelfde gedrag als kaarten)
  for (const el of elDiagram.querySelectorAll('.diagramItem')){
    const slug = el.getAttribute('data-slug');
    if (!slug) continue;
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    el.addEventListener('click', () => openDrawer(slug));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openDrawer(slug);
      }
    });
  }
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