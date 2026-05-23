/* ============================================================
   ETAT DU JEU
   ============================================================ */
let G = {
  /* Joueur */
  prenom: '', nom: '', province: '',
  numeroCitoyen: '',
  metier: null,
  logementNiveau: 1,

  /* Ressources */
  wons: 0,
  faim: 100,
  soif: 100,
  noteCitoyenne: 0,
  inventaire: {},

  /* Temps */
  jour: 0,
  dernierTick: 0,
  debutJeu: 0,

  /* Flags journaliers */
  aPointe: false,
  aLuActu: false,
  aNettoyePortrait: false,
  heuresSup: 0,
  aAssiste: false,

  /* Santé */
  estMalade: false,
  joursMalade: 0,

  /* Fête nationale */
  estJourFete: false,

  /* Alertes (anti-spam push) */
  alerteFaim: false,
  alerteSoif: false,
  alerteNote: false,
  alerteLoyer: 0,

  /* Actualités */
  actualitesDuJour: [],
  actualitesLues: [],

  /* Messages */
  messages: [],
  prochainMessageId: 2,

  /* Progression */
  palierPrecedent: 0,
  streakTravail: 0,
  joursNoteNegative: 0,

  /* Inflation en cours */
  modificateurPrix: {},

  /* Historique pour le graphique accueil */
  historiqueNote: [],
  historiqueWons: [],

  /* Fond d'écran */
  portraitWallpaper: '3',

  /* Prêt citoyen */
  pretActif: false,
  pretJoursRestants: 0,

  /* Offrandes cumulées (brosse portrait) */
  totalDons: 0,

  /* Bonus liens externes (une seule fois par vie) */
  aCliquePat: false,
  aCliqueKdp: false,

  /* Partie initialisée ? */
  initialise: false,
};

/* ============================================================
   UTILITAIRES
   ============================================================ */
function recommencer() {
  localStorage.removeItem('chonguk-save');
  location.reload();
}

function getPalierActuel() {
  let p = PALIERS[0];
  for (let i = PALIERS.length - 1; i >= 0; i--) {
    if (G.noteCitoyenne >= PALIERS[i].note) { p = PALIERS[i]; break; }
  }
  return p;
}

function getPalierDon() {
  const total = G.totalDons || 0;
  let p = C.PALIERS_DONS[0];
  for (let i = C.PALIERS_DONS.length - 1; i >= 0; i--) {
    if (total >= C.PALIERS_DONS[i].total) { p = C.PALIERS_DONS[i]; break; }
  }
  return p;
}

function getSalaireEffectif() {
  const base  = C.SALAIRES[G.metier ? G.metier.id : 'nettoyage'] || 0;
  const rang  = getPalierActuel().rang;
  const coeff = C.COEFF_SALAIRE[rang] || 1;
  return Math.round(base * coeff);
}

function getProchainPalierDon() {
  const total = G.totalDons || 0;
  return C.PALIERS_DONS.find(p => p.total > total) || null;
}