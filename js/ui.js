/* ============================================================
   HEURE EN TEMPS REEL
   ============================================================ */
function getHeureString() {
  const now = new Date();
  return now.getHours().toString().padStart(2,'0') + ':' +
         now.getMinutes().toString().padStart(2,'0');
}

function mettreAJourHeures() {
  const h = getHeureString();
  document.querySelectorAll('.status-time, #lock-time, #home-time').forEach(el => {
    if (el) el.textContent = h;
  });
  // Date sur lock screen
  const lockDate = document.getElementById('lock-date');
  if (lockDate) {
    const now = new Date();
    const jours = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
    const mois  = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
    lockDate.textContent = jours[now.getDay()] + ' ' + now.getDate() + ' ' + mois[now.getMonth()];
  }
}

/* ============================================================
   PUSH NOTIFICATIONS
   ============================================================ */
function push(app, titre, texte, icone = '📢') {
  const container = document.getElementById('push-notifications');
  const div = document.createElement('div');
  div.className = 'push-notif';
  div.innerHTML = `
    <div class="push-notif-icon">${icone}</div>
    <div class="push-notif-body">
      <div class="push-notif-app">${app}</div>
      <div class="push-notif-title">${titre}</div>
      <div class="push-notif-text">${texte}</div>
    </div>`;
  container.appendChild(div);
  setTimeout(() => {
    div.classList.add('hiding');
    setTimeout(() => div.remove(), 400);
  }, 5000);
}

/* ============================================================
   BADGES
   ============================================================ */
/* ============================================================
   VERROUILLAGE APPS (actus non lues)
   ============================================================ */
function rafraichirVerrouillageApps() {
  const bloque = G.initialise && !G.aLuActu;
  document.querySelectorAll('.app-icon-wrap[data-app]').forEach(el => {
    const app = el.dataset.app;
    if (app !== 'news') el.classList.toggle('app-locked', bloque);
  });
}

/* ============================================================
   WIDGET FINANCES ACCUEIL
   ============================================================ */
function mettreAJourFinances() {
  const el = document.getElementById('home-finances');
  if (!el || !G.initialise) return;

  const salaire = getSalaireEffectif();
  const loyer   = C.LOYERS[G.logementNiveau] || 0;
  const pret    = G.pretActif ? C.PRET_REMBOURSEMENT_JOUR : 0;
  const net     = salaire - loyer - pret;
  const palier  = getPalierActuel();
  const coeff   = C.COEFF_SALAIRE[palier.rang] || 1;
  const prime   = palier.rang > 0 ? `+${Math.round((coeff - 1) * 100)}%` : '—';

  const R = (label, val, color) =>
    `<div style="display:flex;justify-content:space-between;align-items:center;">
      <span style="font-size:13px;color:rgba(255,255,255,0.50);font-family:'Courier Prime',monospace;">${label}</span>
      <span style="font-size:14px;font-weight:700;font-family:'Courier Prime',monospace;color:${color};">${val}</span>
    </div>`;

  const sep = `<div style="border-top:1px solid rgba(255,255,255,0.09);"></div>`;

  el.innerHTML =
    R('Salaire', `+${salaire} ₩`, '#30D158') +
    R('Prime mérite', prime, 'var(--or)') +
    R(`Loyer niv.${G.logementNiveau}`, `-${loyer} ₩`, '#FF3B30') +
    (G.pretActif ? R(`Prêt (${G.pretJoursRestants}j)`, `-${pret} ₩`, '#FF9F0A') : '') +
    sep +
    R('Net / jour', `${net >= 0 ? '+' : ''}${net} ₩`, net >= 0 ? 'var(--or)' : '#FF3B30') +
    sep +
    `<div style="display:flex;justify-content:space-between;align-items:center;">
      <span style="font-size:12px;color:rgba(255,255,255,0.50);font-family:'Courier Prime',monospace;">${palier.emoji} ${palier.nom}</span>
      <span style="font-size:14px;font-weight:700;font-family:'Courier Prime',monospace;color:#C0392B;">${G.noteCitoyenne} ✦</span>
    </div>`;
}

/* ============================================================
   BADGES
   ============================================================ */
function mettreAJourBadges() {
  // Messages non lus
  const nonLus = G.messages.filter(m => !m.lu).length;
  const badgeMsg = document.getElementById('badge-messages');
  if (badgeMsg) {
    badgeMsg.textContent = nonLus || '';
    badgeMsg.classList.toggle('show', nonLus > 0);
  }
  // Actualités non lues
  const badgeNews = document.getElementById('badge-news');
  if (badgeNews) {
    badgeNews.classList.toggle('show', !G.aLuActu && G.initialise);
  }
  // Travail — badge contextuel
  const badgeWork = document.getElementById('badge-work');
  if (badgeWork && G.initialise) {
    if (G.estMalade) {
      badgeWork.textContent = '🤒';
      badgeWork.classList.add('show');
    } else if (G.estJourFete && !G.aAssiste) {
      badgeWork.textContent = '🎖️';
      badgeWork.classList.add('show');
    } else {
      badgeWork.textContent = '!';
      badgeWork.classList.toggle('show', !G.aPointe);
    }
  }
  // Portrait à nettoyer
  const badgePortrait = document.getElementById('badge-portrait');
  if (badgePortrait) {
    badgePortrait.classList.toggle('show', !G.aNettoyePortrait && G.initialise);
    badgePortrait.textContent = '!';
  }
}