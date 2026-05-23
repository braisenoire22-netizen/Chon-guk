/* ============================================================
   RAFRAICHIR APPS (placeholder — sera complété par phase)
   ============================================================ */
function rafraichirApp(app) {
  if (!G.initialise) return;

  if (app === 'identity') rafraichirIdentite();
  if (app === 'work')     rafraichirTravail();
  if (app === 'market')   rafraichirMarche();
  if (app === 'housing')  rafraichirLogement();
  if (app === 'messages') rafraichirMessages();
  if (app === 'news')     rafraichirActualites();
  if (app === 'portrait') rafraichirPortrait();
  if (app === 'banque')   rafraichirBanque();
  if (app === 'galerie')  rafraichirGalerie();
}

/* ============================================================
   DEMARRAGE
   ============================================================ */
function demarrer() {
  // Tick heure en temps réel
  setInterval(mettreAJourHeures, 1000);
  setInterval(tick, 1000);
  mettreAJourHeures();

  // Boot animation
  const fill = document.getElementById('boot-bar-fill');
  let pct = 0;
  const bootInterval = setInterval(() => {
    pct += Math.random() * 12 + 3;
    if (pct >= 100) {
      pct = 100;
      clearInterval(bootInterval);
      setTimeout(() => {
        // Vérifier si une save existe
        if (chargerSave()) {
          // Partie existante — aller au lock screen
          mettreAJourBadges();
          afficherEcran('screen-lock');
        } else {
          // Nouvelle partie — onboarding
          afficherEcran('screen-onboarding');
        }
      }, 400);
    }
    fill.style.width = pct + '%';
  }, 120);
}

/* ============================================================
   BONUS LIENS EXTERNES (une seule fois par vie)
   ============================================================ */
function bonusLien(type) {
  const urls = {
    patreon: 'https://www.patreon.com/cw/BraiseNoire',
    kdp:     'https://www.amazon.fr/stores/Braise-Noire/author/B0GXN7XHTT',
  };
  window.open(urls[type], '_blank');

  if (!G.initialise) return;

  const flag = type === 'patreon' ? 'aCliquePat' : 'aCliqueKdp';
  if (G[flag]) return;

  G[flag] = true;
  G.wons += C.BONUS_LIEN_WONS;
  sauvegarder();
  push('Chŏn-guk OS', 'Signal extérieur capté', `+${C.BONUS_LIEN_WONS} wons crédités sur votre compte citoyen.`, '🌐');
  mettreAJourWons();
  mettreAJourIconesLiens();
}

function mettreAJourWons() {
  const el = document.getElementById('home-wons-val');
  if (el) el.textContent = G.wons + ' w';
}

function mettreAJourIconesLiens() {
  const pat = document.getElementById('icon-wrap-patreon');
  const kdp = document.getElementById('icon-wrap-kdp');
  if (pat) pat.style.opacity = G.aCliquePat ? '0.4' : '';
  if (kdp) kdp.style.opacity = G.aCliqueKdp ? '0.4' : '';
}

demarrer();