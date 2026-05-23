/* ============================================================
   PORTRAIT — variables chiffon
   ============================================================ */
let chiffonActif    = false;
let chiffonEl       = null;
let chiffonHandlers = null;
let _propreCheck    = 0;

function _rayonChiffon() {
  return getPalierDon().rayon;
}

/* ============================================================
   RENDU
   ============================================================ */
function rafraichirPortrait() {
  relacherChiffon();

  const body = document.getElementById('portrait-body');
  body.innerHTML = `
    <div class="portrait-title">Grande Maréchale So-min-ae — Portrait Officiel n°1</div>

    <div class="portrait-frame" id="portrait-frame">
      <img src="imgs/La selection 5.jpg" alt="Grande Maréchale So-min-ae"
           style="display:block; width:100%; height:100%; object-fit:cover; object-position:top;
                  user-select:none; -webkit-user-drag:none; pointer-events:none;">
      <canvas id="portrait-canvas"
              style="position:absolute; inset:0; width:100%; height:100%;
                     display:${G.aNettoyePortrait ? 'none' : 'block'};"></canvas>
    </div>

    <div class="clean-instruction" id="portrait-instruction">
      ${G.aNettoyePortrait
        ? '✓ Portrait entretenu aujourd\'hui. La Grande Maréchale So-min-ae vous remercie.'
        : 'Saisissez le chiffon puis passez-le sur le portrait pour le nettoyer.'}
    </div>

    <div class="card">
      <div class="card-body">
        <div class="vital-bar">
          <div class="vital-bar-header">
            <span class="vital-label">Propreté du portrait</span>
            <span class="vital-value" id="portrait-pct">${G.aNettoyePortrait ? '100' : '0'}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill or" id="portrait-fill"
                 style="width:${G.aNettoyePortrait ? 100 : 0}%"></div>
          </div>
        </div>
        <div style="margin-top:8px; font-size:10px; color:var(--texte-dim); font-family:'Courier Prime',monospace;">
          Brosse actuelle : ⌀${getPalierDon().rayon * 2}px — ${getPalierDon().emoji} ${getPalierDon().nom}
        </div>
      </div>
    </div>

    ${!G.aNettoyePortrait ? `
    <div style="display:flex; justify-content:center; margin-top:10px; padding-bottom:8px;">
      <button class="btn-chiffon" id="btn-chiffon" onclick="saisirChiffon()">
        🧹 Saisir le chiffon
      </button>
    </div>` : ''}`;

  if (!G.aNettoyePortrait) _initCanvas();
}

/* ============================================================
   INITIALISATION CANVAS (couche de crasse)
   ============================================================ */
function _initCanvas() {
  requestAnimationFrame(() => {
    const canvas = document.getElementById('portrait-canvas');
    const frame  = document.getElementById('portrait-frame');
    if (!canvas || !frame) return;

    const w = frame.offsetWidth  || 345;
    const h = frame.offsetHeight || 460;
    canvas.width  = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(8, 4, 0, 0.58)';
    ctx.fillRect(0, 0, w, h);

    for (let i = 0; i < 18; i++) {
      ctx.fillStyle = `rgba(${20 + Math.random()*25}, ${8 + Math.random()*12}, 0, ${0.25 + Math.random()*0.35})`;
      ctx.beginPath();
      ctx.ellipse(
        Math.random() * w, Math.random() * h,
        18 + Math.random() * 55, 12 + Math.random() * 38,
        Math.random() * Math.PI, 0, Math.PI * 2
      );
      ctx.fill();
    }
  });
}

/* ============================================================
   CHIFFON
   ============================================================ */
function saisirChiffon() {
  if (chiffonActif) { relacherChiffon(); return; }

  chiffonActif = true;
  const btn = document.getElementById('btn-chiffon');
  if (btn) { btn.textContent = '🧹 Reposer le chiffon'; btn.classList.add('actif'); }

  chiffonEl = document.createElement('div');
  chiffonEl.id = 'chiffon-curseur';
  chiffonEl.textContent = '🧹';
  document.body.appendChild(chiffonEl);

  let lastCX = -999, lastCY = -999;

  const onMove = (e) => {
    const cx = e.touches ? e.touches[0].clientX : e.clientX;
    const cy = e.touches ? e.touches[0].clientY : e.clientY;

    if (chiffonEl) { chiffonEl.style.left = cx + 'px'; chiffonEl.style.top = cy + 'px'; }
    if (G.aNettoyePortrait) return;

    const canvas = document.getElementById('portrait-canvas');
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    if (cx < rect.left || cx > rect.right || cy < rect.top || cy > rect.bottom) return;

    const scaleX  = canvas.width  / rect.width;
    const scaleY  = canvas.height / rect.height;
    const canvasX = (cx - rect.left) * scaleX;
    const canvasY = (cy - rect.top)  * scaleY;

    if (Math.abs(canvasX - lastCX) < 3 && Math.abs(canvasY - lastCY) < 3) return;
    lastCX = canvasX; lastCY = canvasY;
    _appliquerChiffon(canvas, canvasX, canvasY);
  };

  document.addEventListener('mousemove', onMove);
  document.addEventListener('touchmove', onMove, { passive: true });
  chiffonHandlers = onMove;
}

function relacherChiffon() {
  if (chiffonEl) { chiffonEl.remove(); chiffonEl = null; }
  if (chiffonHandlers) {
    document.removeEventListener('mousemove', chiffonHandlers);
    document.removeEventListener('touchmove', chiffonHandlers);
    chiffonHandlers = null;
  }
  chiffonActif = false;
  const btn = document.getElementById('btn-chiffon');
  if (btn) { btn.textContent = '🧹 Saisir le chiffon'; btn.classList.remove('actif'); }
}

/* ============================================================
   NETTOYAGE CANVAS
   ============================================================ */
function _appliquerChiffon(canvas, x, y) {
  const ctx = canvas.getContext('2d');
  const r   = _rayonChiffon();

  ctx.globalCompositeOperation = 'destination-out';
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0,   'rgba(0,0,0,1)');
  g.addColorStop(0.6, 'rgba(0,0,0,0.7)');
  g.addColorStop(1,   'rgba(0,0,0,0)');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';

  const now = Date.now();
  if (now - _propreCheck < 150) return;
  _propreCheck = now;

  const data  = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let transparent = 0;
  const step  = 8;
  const total = Math.floor(canvas.width * canvas.height / step);
  for (let i = 3; i < data.length; i += 4 * step) {
    if (data[i] < 30) transparent++;
  }
  const proprete = Math.min(100, Math.round((transparent / total) * 100));

  const fill = document.getElementById('portrait-fill');
  const pct  = document.getElementById('portrait-pct');
  if (fill) fill.style.width = proprete + '%';
  if (pct)  pct.textContent  = proprete + '%';

  if (proprete >= 80) {
    G.aNettoyePortrait = true;
    G.noteCitoyenne   += 10;
    sauvegarder();
    mettreAJourBadges();
    push('Portrait', 'Rituel accompli', '+10 Note citoyenne. La Grande Maréchale So-min-ae est satisfaite.', '🖼️');
    relacherChiffon();

    let step2 = 0;
    const fade = setInterval(() => {
      step2++;
      const ctx2 = canvas.getContext('2d');
      ctx2.globalAlpha = 0.25;
      ctx2.globalCompositeOperation = 'destination-out';
      ctx2.fillRect(0, 0, canvas.width, canvas.height);
      ctx2.globalCompositeOperation = 'source-over';
      ctx2.globalAlpha = 1;
      if (step2 >= 12) { clearInterval(fade); rafraichirPortrait(); }
    }, 40);
  }
}
