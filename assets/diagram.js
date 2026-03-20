/* assets/diagram.js — radiaal diagram voor initiatieven per scope */

/**
 * Rendert een radiaal SVG-diagram in `container`.
 *
 * Structuur:
 *   Binnenste ring  → 'Energiedomein'
 *   Middelste ring  → 'Gerelateerde sector'
 *   Buitenste ring  → 'Generiek initiatief'
 *
 * Elk initiatief verschijnt als een klikbaar punt met een label.
 * Labels aan de linker- en rechterkant worden verticaal uitgespreid
 * zodat ze elkaar niet overlappen.
 *
 * @param {Array}       projects    - Gefilterde projecten (met .id, .naam, .scope)
 * @param {HTMLElement} container   - Element waarin het SVG wordt geplaatst
 * @param {Function}    onItemClick - Callback(slug) bij klik op een diagram-item
 */
function renderDiagram(projects, container, onItemClick) {
  if (!container) return;

  const list = Array.isArray(projects) ? projects : [];
  if (!list.length) {
    container.innerHTML = '<p class="small">Geen initiatieven om weer te geven.</p>';
    return;
  }

  // --- Groepeer per scope -------------------------------------------------
  const byScope = {
    'Energiedomein': [],
    'Gerelateerde sector': [],
    'Generiek initiatief': []
  };
  for (const p of list) {
    if (byScope[p.scope]) byScope[p.scope].push(p);
  }

  // --- Geometrie -----------------------------------------------------------
  const size = 420;
  const center = size / 2;

  // Stralen van de zichtbare ringen (achtergrondcirkels)
  const ringRadii = { inner: 60, middle: 95, outer: 130 };

  // Stralen waarop de datapunten worden geplaatst (midden van elke ring)
  const dotRadii = {
    inner: ringRadii.inner * 0.6,
    middle: (ringRadii.inner + ringRadii.middle) / 2,
    outer: (ringRadii.middle + ringRadii.outer) / 2
  };

  /**
   * Berekent (x, y) voor elk item op een cirkel met de gegeven straal.
   * Starthoek is boven (-π/2) zodat het eerste item bovenaan staat.
   * Geeft ook de label-positie (lx, ly) en tekst-anchor terug.
   */
  function pointsFor(items, radius) {
    const n = items.length;
    if (!n) return [];
    return items.map((p, i) => {
      const angle = (2 * Math.PI * i / n) - Math.PI / 2;
      const x = center + radius * Math.cos(angle);
      const y = center + radius * Math.sin(angle);
      const isRight = Math.cos(angle) >= 0;
      const lx = x + (isRight ? 10 : -10);
      return {
        p,
        x, y,
        lx, ly: y,
        anchor: isRight ? 'start' : 'end',
        side: isRight ? 'right' : 'left'
      };
    });
  }

  const innerPts  = pointsFor(byScope['Energiedomein'],      dotRadii.inner);
  const middlePts = pointsFor(byScope['Gerelateerde sector'], dotRadii.middle);
  const outerPts  = pointsFor(byScope['Generiek initiatief'], dotRadii.outer);

  // --- Label-botsing voorkomen --------------------------------------------
  // Sorteer labels per zijde op y-positie en duw overlappende labels omlaag.
  const allPts = [...innerPts, ...middlePts, ...outerPts];
  const minLabelGap = 8; // minimale verticale ruimte tussen labels (px in viewBox)

  function spreadLabels(side) {
    const pts = allPts
      .filter(pt => pt.side === side)
      .sort((a, b) => a.ly - b.ly);
    for (let i = 1; i < pts.length; i++) {
      if (pts[i].ly < pts[i - 1].ly + minLabelGap) {
        pts[i].ly = pts[i - 1].ly + minLabelGap;
      }
    }
  }
  spreadLabels('left');
  spreadLabels('right');

  // --- SVG opbouwen -------------------------------------------------------
  // viewBox snoeit de lege ruimte boven en onder het diagram af
  const viewBoxY = 70;
  const viewBoxH = size - 140;
  let svg = `<svg viewBox="0 ${viewBoxY} ${size} ${viewBoxH}" role="img" aria-label="Overzicht initiatieven per scope">`;

  // Achtergrondringen (gevuld, geen zichtbare randen)
  svg += `
    <circle cx="${center}" cy="${center}" r="${ringRadii.outer}" fill="rgba(22,40,70,.75)"/>
    <circle cx="${center}" cy="${center}" r="${ringRadii.middle}" fill="rgba(18,32,60,.9)"/>
    <circle cx="${center}" cy="${center}" r="${ringRadii.inner}" fill="rgba(14,26,48,1)"/>
  `;

  /**
   * Rendert een reeks punten als klikbare SVG-groepen met label.
   * @param {Array}  points - Uitvoer van pointsFor()
   * @param {string} color  - Kleur van het datapunt (CSS-kleur string)
   */
  function renderLayer(points, color) {
    return points.map(pt => `
      <g class="diagramItem" data-slug="${escapeHtml(pt.p.id)}">
        <circle cx="${pt.x}" cy="${pt.y}" r="3.2" fill="${color}"/>
        <text x="${pt.lx}" y="${pt.ly}" fill="rgba(255,255,255,.9)" font-size="6"
              text-anchor="${pt.anchor}" dominant-baseline="middle">
          ${escapeHtml(pt.p.naam)}
        </text>
      </g>
    `).join('');
  }

  svg += renderLayer(innerPts,  'rgb(110, 220, 190)'); // Energiedomein      → groen
  svg += renderLayer(middlePts, 'rgb(130, 190, 255)'); // Gerelateerde sector → blauw
  svg += renderLayer(outerPts,  'rgb(195, 190, 255)'); // Generiek initiatief → paars

  svg += '</svg>';
  container.innerHTML = svg;

  // --- Klik- en toetsenbordafhandeling ------------------------------------
  for (const el of container.querySelectorAll('.diagramItem')) {
    const slug = el.getAttribute('data-slug');
    if (!slug) continue;
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    el.addEventListener('click', () => onItemClick(slug));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onItemClick(slug);
      }
    });
  }
}
