/* ============================================================
   NAVIGATION
   ============================================================ */
let ecranActuel = 'screen-boot';

const ECRANS_SANS_NAV = new Set([
  'screen-boot', 'screen-onboarding', 'screen-processing',
  'screen-attribution', 'screen-lock', 'screen-gameover'
]);

function afficherEcran(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
  ecranActuel = id;

  const nav = document.getElementById('android-nav');
  if (nav) nav.style.display = ECRANS_SANS_NAV.has(id) ? 'none' : 'flex';
}

function ouvrirApp(app) {
  if (G.initialise && !G.aLuActu && app !== 'news') {
    push('Comité de Quartier', 'Accès verrouillé', 'Lisez les actualités du jour avant d\'accéder aux services.', '🔒');
    return;
  }
  afficherEcran('app-' + app);
  rafraichirApp(app);
}

function retourHome() {
  if (typeof relacherChiffon === 'function') relacherChiffon();
  afficherEcran('screen-home');
  mettreAJourFinances();
}

function deverrouiller() {
  appliquerWallpaper();
  afficherEcran('screen-home');
  mettreAJourFinances();
}

function navRetour() {
  if (ecranActuel === 'screen-home') return;
  retourHome();
}

function navAccueil() {
  retourHome();
}