/* assets/project.js */
const DATA_URL = './projects.json';

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

async function init(){
  const slug = getSlug();
  const res = await fetch(DATA_URL, {cache:'no-store'});
  if (!res.ok) throw new Error(`Failed to load ${DATA_URL}`);
  const projects = await res.json();
  const p = projects.find(x => x.slug === slug);

  const pTitle = document.getElementById('pTitle');
  const pSub = document.getElementById('pSub');
  const pSummary = document.getElementById('pSummary');
  const pKv = document.getElementById('pKv');
  const pLists = document.getElementById('pLists');
  const pLinks = document.getElementById('pLinks');
  const pMeta = document.getElementById('pMeta');

  if (!p){
    document.title = 'Project niet gevonden';
    pTitle.textContent = 'Project niet gevonden';
    pSub.textContent = 'Controleer de URL (slug).';
    pSummary.textContent = '';
    return;
  }

  document.title = `${p.name} — Project`;
  pTitle.textContent = p.name;
  const subParts = [];
  if (p.status) subParts.push(p.status);
  if (p.scope) subParts.push(p.scope);
  if (p.geografical_scope) subParts.push(p.geografical_scope);
  if (p.year_start || p.year_end) {
    subParts.push(`${p.year_start ?? '—'}–${p.year_end ?? '—'}`);
  }
  if (p.owner) subParts.push(p.owner);
  pSub.textContent = subParts.join(' • ');
  pSummary.textContent = p.summary || '';

  const qr = p.quick_reference || {};
  const yearsLabel = (p.year_start || p.year_end)
    ? `${p.year_start ?? '—'}–${p.year_end ?? '—'}`
    : '—';
  pKv.innerHTML = `
    <div class="k">Doel</div><div class="v">${escapeHtml(qr.primary_goal || '—')}</div>
    <div class="k">Status</div><div class="v">${escapeHtml(p.status || '—')}</div>
    <div class="k">Scope</div><div class="v">${escapeHtml(p.scope || '—')}</div>
    <div class="k">Geografische scope</div><div class="v">${escapeHtml(p.geografical_scope || '—')}</div>
    <div class="k">Looptijd</div><div class="v">${escapeHtml(yearsLabel)}</div>
    <div class="k">Owner</div><div class="v">${escapeHtml(p.owner || '—')}</div>
  `;

  const outputs = (qr.key_outputs || []);
  const users = (qr.target_users || []);
  pLists.innerHTML = `
    ${outputs.length ? `<div class="small" style="margin-top:10px;">Key outputs</div><ul class="list">${outputs.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul>` : ''}
    ${users.length ? `<div class="small" style="margin-top:10px;">Target users</div><ul class="list">${users.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul>` : ''}
  `;

  // links
  pLinks.innerHTML = '';
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

  // metadata
  const tags = (p.tags || []).join(', ');
  pMeta.innerHTML = `
    <div class="k">Slug</div><div class="v">${escapeHtml(p.slug)}</div>
    <div class="k">Tags</div><div class="v">${escapeHtml(tags || '—')}</div>
  `;
}

init().catch(err=>{
  console.error(err);
  document.getElementById('pTitle').textContent = 'Fout bij laden';
  document.getElementById('pSub').textContent = 'Kon projects.json niet laden.';
});