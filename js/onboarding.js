/* ============================================================
   ONBOARDING
   ============================================================ */
function verifierOnboarding() {
  const prenom = document.getElementById('inp-prenom').value.trim();
  const nom    = document.getElementById('inp-nom').value.trim();
  const prov   = document.getElementById('inp-province').value;
  const o1     = document.getElementById('oath1').checked;
  const o2     = document.getElementById('oath2').checked;
  const o3     = document.getElementById('oath3').checked;
  const ok     = prenom.length >= 2 && nom.length >= 2 && prov && o1 && o2 && o3;
  document.getElementById('btn-submit-onboard').disabled = !ok;
}

// Écouter les inputs texte aussi
['inp-prenom','inp-nom','inp-province'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', verifierOnboarding);
});

function soumettreOnboarding() {
  G.prenom   = document.getElementById('inp-prenom').value.trim();
  G.nom      = document.getElementById('inp-nom').value.trim();
  G.province = document.getElementById('inp-province').value;
  afficherEcran('screen-processing');
  lancerTraitement();
}

function lancerTraitement() {
  const etapes = [
    "Transmission au Comité Central d'Évaluation...",
    "Vérification des antécédents patriotiques...",
    "Consultation du Registre des Citoyens...",
    "Analyse par le Comité d'Idéologie...",
    "La Grande Maréchale So-min-ae examine votre dossier...",
    "Décision en cours...",
  ];
  let i = 0;
  const el = document.getElementById('processing-step');
  const interval = setInterval(() => {
    el.textContent = etapes[i] || '';
    i++;
    if (i >= etapes.length) {
      clearInterval(interval);
      setTimeout(genererAttribution, 1000);
    }
  }, 700);
}

function genererAttribution() {
  // Numéro citoyen
  const num = Math.floor(Math.random() * 89000) + 10000;
  G.numeroCitoyen = 'CIT-' + num.toString().padStart(6, '0');

  // Métier aléatoire
  G.metier = METIERS[Math.floor(Math.random() * METIERS.length)];
  G.logementNiveau = 1;

  // Remplir écran attribution
  document.getElementById('attr-num').textContent  = G.numeroCitoyen;
  document.getElementById('attr-name').textContent = G.prenom + ' ' + G.nom.toUpperCase();
  document.getElementById('attr-job').textContent  = G.metier.nom;
  document.getElementById('attr-bloc').textContent = 'Bloc ' + G.metier.bloc + ' — Secteur ' + G.metier.secteur;
  const log = LOGEMENTS[0];
  document.getElementById('attr-housing').textContent = log.taille + ' — ' + log.type;
  document.getElementById('attr-salary').textContent  = C.SALAIRES[G.metier.id] + ' wons / jour';

  document.getElementById('attr-letter').innerHTML =
    `Camarade <strong>${G.prenom} ${G.nom.toUpperCase()}</strong>,<br><br>
    Le Comité Central d'Évaluation de la République Démocratique et Populaire de Chŏn-guk a examiné votre demande de citoyenneté de service avec l'attention qu'elle méritait. La Grande Maréchale So-min-ae a été informée de votre dévotion.<br><br>
    Votre demande est <strong>acceptée</strong>. Vous êtes désormais un·e citoyen·ne de service de la République. Votre note initiale est fixée à <strong>0</strong>. Servez bien.`;

  afficherEcran('screen-attribution');
}

function lancerJeu() {
  // Initialiser l'état
  G.wons              = 0;
  G.faim              = 100;
  G.soif              = 100;
  G.noteCitoyenne     = 0;
  G.inventaire        = {};
  G.jour              = 1;
  G.debutJeu          = Date.now();
  G.dernierTick       = Date.now();
  G.initialise        = true;
  G.aPointe           = false;
  G.aLuActu           = false;
  G.aNettoyePortrait  = false;
  G.alerteFaim        = false;
  G.alerteSoif        = false;
  G.alerteNote        = false;
  G.alerteLoyer       = 0;
  G.palierPrecedent   = 0;
  G.actualitesDuJour  = [];
  G.actualitesLues    = [];
  G.messages          = [];
  G.prochainMessageId = 2;
  G.modificateurPrix  = {};

  // Générer les actualités du premier jour
  genererActualitesDuJour();

  // Lettre de bienvenue
  G.messages.push({
    id: 1,
    lu: false,
    expediteur: "Comité de Quartier — Bloc " + G.metier.bloc,
    sujet: "Bienvenue, Camarade " + G.prenom,
    date: "Jour 1",
    corps: `Camarade ${G.prenom} ${G.nom.toUpperCase()},\n\nVotre arrivée dans le Bloc ${G.metier.bloc} a été enregistrée. Votre logement est au ${LOGEMENTS[0].taille}. Votre poste débute demain matin.\n\nRappel : vous devez lire les Actualités chaque jour et entretenir le portrait de La Grande Maréchale So-min-ae. Tout manquement sera noté.\n\nLe Comité de Quartier vous surveille et vous protège.\n\n— Le Responsable de Bloc`,
  });

  sauvegarder();
  mettreAJourBadges();
  afficherEcran('screen-lock');
  push('Comité de Quartier', 'Bienvenue', 'Votre citoyenneté est active. Commencez à servir.', '🏛️');
}