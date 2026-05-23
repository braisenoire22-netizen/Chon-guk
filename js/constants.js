/* ============================================================
   CONSTANTES
   ============================================================ */
const C = {
  DUREE_JOUR_MS:   12 * 60 * 1000,   // 12 min réelles = 1 jour ingame
  FAIM_PAR_JOUR:   10,
  SOIF_PAR_JOUR:   33,
  SALAIRES: {
    textile:     45,
    conserves:   38,
    metallurgie: 55,
    agriculture: 32,
    nettoyage:   28,
    imprimerie:  50,
  },
  LOYERS:   { 1: 5,  2: 12, 3: 25, 4: 50 },
  STOCKAGE: { 1: 10, 2: 18, 3: 30, 4: 45 },
  PRIX_BASE: { riz: 8, eau: 6, savon: 15, medicament: 40 },
  MAX_HEURES_SUP: 3,
  BONUS_LIEN_WONS: 50,
  PROBA_MALADIE_BASE: 0.05,
  INTERVALLE_FETE: 7,
  // Paliers d'offrandes → taille de brosse portrait
  PALIERS_DONS: [
    { total: 0,    nom: 'Fidèle',                  emoji: '🕯️', rayon: 32  },
    { total: 50,   nom: 'Dévoué·e',                emoji: '🙏', rayon: 46  },
    { total: 200,  nom: 'Bienfaiteur·ice',          emoji: '💫', rayon: 62  },
    { total: 600,  nom: 'Mécène du Régime',         emoji: '⭐', rayon: 82  },
    { total: 1500, nom: 'Pilier de la République',  emoji: '👑', rayon: 110 },
  ],
  // Montants d'offrande → note citoyenne gagnée
  OFFR_MONTANTS: [
    { wons: 10,  note: 3  },
    { wons: 30,  note: 10 },
    { wons: 100, note: 38 },
  ],
  NOMS_FETES: [
    'Défilé de la Fondation Républicaine',
    'Défilé de la Victoire Populaire',
    'Fête du Travail Patriotique',
    'Commémoration de la Grande Maréchale',
    'Journée de l\'Unité Nationale',
    'Défilé des Forces de Défense',
    'Célébration de la Reconstruction',
  ],
  // Coût vital du travail
  TRAVAIL_FAIM:      20,   // pointage journalier
  TRAVAIL_SOIF:      25,
  HEURES_SUP_FAIM:   10,   // par session d'heures sup
  HEURES_SUP_SOIF:   15,

  // Prêt citoyen
  PRET_MONTANT:             100,
  PRET_REMBOURSEMENT_JOUR:  11,
  PRET_DUREE:               10,

  // Multiplicateur de salaire par rang de citoyenneté (rang 0 → 7)
  COEFF_SALAIRE: [1.00, 1.10, 1.22, 1.36, 1.55, 1.80, 2.15, 2.60],
};

const METIERS = [
  { id: 'textile',     nom: "Ouvrier·ère — Usine de Textiles d'État n°3",   bloc: 7,  secteur: 4 },
  { id: 'conserves',   nom: "Ouvrier·ère — Usine de Conserves d'État n°7",  bloc: 14, secteur: 2 },
  { id: 'metallurgie', nom: "Ouvrier·ère — Usine de Métallurgie d'État n°2",bloc: 3,  secteur: 1 },
  { id: 'agriculture', nom: "Travailleur·se — Coopérative Agricole n°5",    bloc: 9,  secteur: 3 },
  { id: 'nettoyage',   nom: "Agent·e d'Entretien des Espaces Publics",      bloc: 2,  secteur: 6 },
  { id: 'imprimerie',  nom: "Ouvrier·ère — Imprimerie d'État",              bloc: 11, secteur: 2 },
];

const LOGEMENTS = [
  { niveau: 1, type: "Chambre collective — 3 occupants",       taille: "18m²", confort: "Toilettes communes au couloir" },
  { niveau: 2, type: "Studio individuel standard",             taille: "22m²", confort: "Toilettes partagées au palier" },
  { niveau: 3, type: "Appartement amélioré",                   taille: "28m²", confort: "Cuisine séparée — eau courante" },
  { niveau: 4, type: "Appartement Serviteur Méritant",         taille: "35m²", confort: "Fenêtre sur avenue — chauffage" },
];

const PALIERS = [
  { note: 0,    nom: "Citoyen Novice",            rang: 0 },
  { note: 50,   nom: "Citoyen Enregistré",        rang: 1 },
  { note: 150,  nom: "Citoyen Méritant",          rang: 2 },
  { note: 350,  nom: "Serviteur de la République",rang: 3 },
  { note: 700,  nom: "Serviteur Dévoué",          rang: 4 },
  { note: 1200, nom: "Serviteur d'Élite",         rang: 5 },
  { note: 2000, nom: "Candidat à La Sélection",   rang: 6 },
  { note: 3500, nom: "Serviteur du Palais",        rang: 7 },
];