/* ============================================================
   TICK ENGINE
   ============================================================ */
function tick() {
  if (!G.initialise) return;

  const now = Date.now();
  // Cap à 30s pour éviter les sauts aberrants (onglet inactif)
  const deltaMs = Math.min(now - G.dernierTick, 30000);
  G.dernierTick = now;
  const deltaJours = deltaMs / C.DUREE_JOUR_MS;

  // Décrémenter faim
  G.faim = Math.max(0, G.faim - C.FAIM_PAR_JOUR * deltaJours);

  // Décrémenter soif — sauf si eau courante (logement niv 3+)
  if (G.logementNiveau < 3) {
    G.soif = Math.max(0, G.soif - C.SOIF_PAR_JOUR * deltaJours);
  }

  // Vérifier états critiques
  verifierEtatsCritiques();

  // Mise à jour UI en temps réel
  rafraichirUIEnTempsReel();

  mettreAJourHeures();

  // Sauvegarder toutes les 10 secondes
  if (Math.floor(now / 10000) !== Math.floor((now - deltaMs) / 10000)) {
    sauvegarder();
  }
}

function nouveauJour(n) {
  G.jour = n;

  // Pénalité défilé non assisté (si hier était jour de fête)
  if (G.estJourFete && !G.aAssiste && n > 1) {
    G.noteCitoyenne -= 20;
    push('Comité Civique', 'Absence au défilé', 'Vous n\'avez pas assisté au défilé. -20 Note citoyenne.', '🚨');
  }

  // Maladie persistante — drain supplémentaire si non traitée
  if (G.estMalade) {
    G.joursMalade = (G.joursMalade || 0) + 1;
    G.noteCitoyenne -= 3;
    G.faim = Math.max(0, G.faim - 8);
    G.soif = Math.max(0, G.soif - 10);
  }

  // Pénalité portrait non nettoyé hier (sauf jour 1)
  if (n > 2 && !G.aNettoyePortrait) {
    G.noteCitoyenne -= 5;
    push('Portrait', 'Négligence signalée', 'Portrait non entretenu hier. -5 Note citoyenne.', '🖼️');
  }

  // Pénalité actus non lues hier (sauf jour 1)
  if (n > 2 && !G.aLuActu) {
    G.noteCitoyenne -= 8;
    push('Actualités', 'Manquement civique', 'Actualités non lues hier. -8 Note citoyenne.', '📰');
  }

  // Pénalité travail non pointé hier (sauf jour 1)
  if (n > 1 && !G.aPointe) {
    G.noteCitoyenne -= 5;
    push('Travail', 'Absence non justifiée', 'Absence au poste hier. -5 Note citoyenne.', '⚙️');
  }

  // Streak travail : calculer avant reset
  if (G.aPointe) {
    G.streakTravail = (G.streakTravail || 0) + 1;
    if (G.streakTravail > 0 && G.streakTravail % 5 === 0) {
      G.noteCitoyenne += 10;
      push('Travail', 'Assiduité récompensée', G.streakTravail + ' jours consécutifs. +10 Note citoyenne.', '⭐');
    }
  } else {
    G.streakTravail = 0;
  }

  // Suivi note négative consécutive
  if (G.noteCitoyenne < 0) {
    G.joursNoteNegative = (G.joursNoteNegative || 0) + 1;
  } else {
    G.joursNoteNegative = 0;
  }

  // Réinitialiser flags journaliers
  G.aPointe           = false;
  G.aLuActu           = false;
  G.aNettoyePortrait  = false;
  G.heuresSup         = 0;
  G.aAssiste          = false;
  G.estJourFete       = (n % C.INTERVALLE_FETE === 0);
  G.alerteFaim        = false;
  G.alerteSoif        = false;
  G.alerteNote        = false;
  G.actualitesLues    = [];

  // Messages routiniers du Comité tous les 3 jours
  if (n > 1 && n % 3 === 0) {
    const msgRoutiniers = [
      'Le Comité de Quartier vous rappelle que la Grande Maréchale So-min-ae veille sur chacun de vos faits et gestes. Continuez à servir la République avec dévotion.',
      'La production nationale a atteint ses objectifs ce trimestre grâce à des citoyens comme vous. La Grande Maréchale So-min-ae vous remercie de votre contribution.',
      'Rappel : le nettoyage quotidien du portrait officiel est un devoir civique. Toute négligence sera notée dans votre dossier citoyen.',
      'Le Comité Central vous informe que des inspections aléatoires de conformité civique auront lieu cette semaine. Veillez à respecter vos obligations.',
      'La Grande Maréchale So-min-ae a prononcé un discours ce matin. Son contenu sera diffusé dans les Actualités officielles.',
    ];
    const msg = msgRoutiniers[Math.floor(n / 3) % msgRoutiniers.length];
    ajouterMessage('Comité de Quartier', 'Communication officielle — Jour ' + n, msg);
  }

  // Remboursement prêt citoyen
  if (G.pretActif) {
    const mensualite = C.PRET_REMBOURSEMENT_JOUR;
    if (G.wons >= mensualite) {
      G.wons -= mensualite;
      G.pretJoursRestants--;
      if (G.pretJoursRestants <= 0) {
        G.pretActif = false;
        G.pretJoursRestants = 0;
        push('Banque Citoyenne', 'Prêt entièrement remboursé', 'Votre prêt de 100 wons est soldé. Crédit citoyen préservé.', '🏦');
      }
    } else {
      G.noteCitoyenne -= 8;
      push('Banque Citoyenne', 'Échéance impayée', `Fonds insuffisants — remboursement de ${mensualite} ₩ manquant. -8 Note citoyenne.`, '🏦');
    }
  }

  // Prélever loyer
  const loyer = C.LOYERS[G.logementNiveau];
  if (G.wons >= loyer) {
    G.wons -= loyer;
    G.alerteLoyer = 0;
  } else {
    G.alerteLoyer = (G.alerteLoyer || 0) + 1;
    G.noteCitoyenne = Math.max(0, G.noteCitoyenne - 15);
    if (G.alerteLoyer >= 3 && G.logementNiveau > 1) {
      G.logementNiveau--;
      G.alerteLoyer = 0;
      push('Logement', 'Expulsion', 'Loyer impayé 3 jours. Rétrogradé niveau ' + G.logementNiveau + '.', '🏠');
    } else {
      push('Logement', 'Loyer impayé', G.alerteLoyer + '/3 — ' + loyer + ' wons manquants. -15 Note.', '🏠');
    }
  }

  // Vérifier montée de palier
  const palier = getPalierActuel();
  if (palier.rang > G.palierPrecedent) {
    G.palierPrecedent = palier.rang;
    ajouterMessage(
      'Comité d\'Évaluation',
      'Promotion — ' + palier.nom,
      'Camarade ' + G.prenom + ' ' + G.nom.toUpperCase() + ',\n\nVotre dévotion a été reconnue. Vous êtes désormais classé·e : ' + palier.nom + '.\n\nLa Grande Maréchale So-min-ae a été informée de votre progression.\n\n— Le Comité Central d\'Évaluation'
    );
    push('Comité Central', 'Promotion !', 'Vous êtes désormais : ' + palier.nom, '⭐');
  }

  // Historique graphique
  if (!G.historiqueNote) G.historiqueNote = [];
  if (!G.historiqueWons)  G.historiqueWons  = [];
  G.historiqueNote.push(G.noteCitoyenne);
  G.historiqueWons.push(G.wons);
  if (G.historiqueNote.length > 20) { G.historiqueNote.shift(); G.historiqueWons.shift(); }

  // Roll maladie si pas déjà malade
  if (!G.estMalade) {
    const prob = _probaMaladie();
    if (Math.random() < prob) {
      G.estMalade   = true;
      G.joursMalade = 0;
      push('Santé', 'Vous tombez malade', 'Impossible de travailler sans médicament. Consultez le Marché.', '🤒');
    }
  }

  // Notification fête nationale
  if (G.estJourFete) {
    const nomFete = C.NOMS_FETES[Math.floor((n / C.INTERVALLE_FETE - 1)) % C.NOMS_FETES.length];
    push('Comité Civique', nomFete, 'Travail suspendu. Présence au défilé obligatoire.', '🎖️');
  }

  // Nouvelles actualités du jour
  genererActualitesDuJour();

  push('Chŏn-guk OS', 'Jour ' + G.jour, 'Nouveau jour. Lisez les actualités et pointez au travail.', '📅');
  mettreAJourBadges();
  sauvegarder();
}

function genererActualitesDuJour() {
  G.modificateurPrix = {};
  const nat   = POOL_ACTUALITES_NAT[Math.floor(Math.random() * POOL_ACTUALITES_NAT.length)];
  let   inter = POOL_ACTUALITES_INT[Math.floor(Math.random() * POOL_ACTUALITES_INT.length)];
  // Eviter doublon si même id (très unlikely mais prudent)
  if (inter.id === nat.id) inter = POOL_ACTUALITES_INT[(POOL_ACTUALITES_INT.indexOf(inter) + 1) % POOL_ACTUALITES_INT.length];
  G.actualitesDuJour = [nat, inter];
}

function verifierEtatsCritiques() {
  // Auto-consommation des stocks si faim/soif critique
  if (G.faim <= 0 && G.inventaire.riz > 0) {
    G.inventaire.riz--;
    if (G.inventaire.riz === 0) delete G.inventaire.riz;
    G.faim = Math.min(100, G.faim + 20);
    push('Survie', 'Ration automatique', 'Votre organisme a puisé dans vos réserves de riz.', '🍚');
  }
  if (G.soif <= 0 && G.inventaire.eau > 0) {
    G.inventaire.eau--;
    if (G.inventaire.eau === 0) delete G.inventaire.eau;
    G.soif = Math.min(100, G.soif + 30);
    push('Survie', 'Ration automatique', 'Votre organisme a puisé dans vos réserves d\'eau.', '💧');
  }

  if (G.faim <= 0)  { gameOver('famine');      return; }
  if (G.soif <= 0)  { gameOver('deshydratation'); return; }

  if (G.faim < 20 && !G.alerteFaim) {
    G.alerteFaim = true;
    push('Alerte', 'Famine imminente', 'Réserves alimentaires critiques. Achetez du riz.', '🍚');
  }
  if (G.soif < 20 && !G.alerteSoif) {
    G.alerteSoif = true;
    push('Alerte', 'Déshydratation', 'Niveau d\'eau critique. Achetez de l\'eau.', '💧');
  }
  if ((G.joursNoteNegative || 0) >= 3) { gameOver('arrestation'); return; }

  if (G.noteCitoyenne < 0 && !G.alerteNote) {
    G.alerteNote = true;
    ajouterMessage(
      'Bureau de Surveillance',
      'Convocation officielle',
      'Camarade ' + G.prenom + ' ' + G.nom.toUpperCase() + ',\n\nVotre Note Citoyenne est passée en territoire négatif. Cela constitue une anomalie grave aux yeux du Comité de Surveillance.\n\nVous disposez de 3 jours pour redresser votre situation. Passé ce délai, des mesures administratives seront prises.\n\n— Bureau de Surveillance de Chŏn-guk'
    );
    push('Bureau de Surveillance', 'Convocation', 'Note citoyenne négative. Redressez-vous.', '⚠️');
  }
}

function rafraichirUIEnTempsReel() {
  // Indicateurs vitaux dans toutes les status bars
  const fc = G.faim  < 20 ? '#FF3B30' : G.faim  < 40 ? '#FF9F0A' : '#30D158';
  const sc = G.soif  < 20 ? '#FF3B30' : G.soif  < 40 ? '#FF9F0A' : '#007AFF';
  document.querySelectorAll('.vital-faim').forEach(el => el.style.color = fc);
  document.querySelectorAll('.vital-soif').forEach(el => el.style.color = sc);

  // Vitals mini sur home screen
  const elFaim = document.getElementById('home-faim-val');
  const elSoif = document.getElementById('home-soif-val');
  if (elFaim) elFaim.textContent = Math.round(G.faim) + '%';
  if (elSoif) elSoif.textContent = Math.round(G.soif) + '%';

  // Wons en home screen
  mettreAJourWons();
  mettreAJourIconesLiens();

  // Graphique accueil
  if (ecranActuel === 'screen-home') mettreAJourFinances();

  // Rafraichir l'app ouverte silencieusement
  if (ecranActuel === 'app-identity') rafraichirIdentite();
  rafraichirVerrouillageApps();
}

function ajouterMessage(expediteur, sujet, corps) {
  G.messages.push({
    id: G.prochainMessageId++,
    lu: false,
    expediteur,
    sujet,
    date: 'Jour ' + G.jour,
    corps,
  });
  mettreAJourBadges();
  sauvegarder();
}

function dormirJournee() {
  if (!G.initialise) return;

  const overlay = document.getElementById('sleep-overlay');
  overlay.classList.add('visible');

  // Après 2s : avancer le jour, passer au lock screen
  setTimeout(() => {
    nouveauJour(G.jour + 1);
    afficherEcran('screen-lock');

    // Fondu de sortie après encore 0.8s
    setTimeout(() => {
      overlay.classList.remove('visible');
    }, 800);
  }, 2200);
}

function _probaMaladie() {
  let p = C.PROBA_MALADIE_BASE;
  // Faim/soif basses → plus fragile
  if (G.faim < 20)       p += 0.18;
  else if (G.faim < 40)  p += 0.08;
  else if (G.faim < 60)  p += 0.03;
  if (G.soif < 20)       p += 0.20;
  else if (G.soif < 40)  p += 0.10;
  else if (G.soif < 60)  p += 0.04;
  // Bonne note citoyenne → accès aux soins, moins de risque
  if (G.noteCitoyenne >= 1200) p -= 0.03;
  if (G.noteCitoyenne >= 500)  p -= 0.02;
  if (G.noteCitoyenne >= 150)  p -= 0.01;
  if (G.noteCitoyenne < 0)     p += 0.08;
  return Math.max(0.01, Math.min(0.60, p));
}

function gameOver(raison) {
  G.initialise = false;
  sauvegarder();
  const data = {
    famine:          { titre: 'Mort par inanition',       sous: 'Article 44 du Code Sanitaire de Chŏn-guk — Décès par négligence alimentaire' },
    deshydratation:  { titre: 'Mort par déshydratation',  sous: 'Article 44 du Code Sanitaire de Chŏn-guk — Décès par négligence hydrique' },
    arrestation:     { titre: 'Radiée du registre civil', sous: 'Article 7 du Code Pénal de Chŏn-guk — Comportement antisocial aggravé' },
  };
  const d = data[raison] || data.famine;
  document.getElementById('go-titre').textContent  = d.titre;
  document.getElementById('go-sous').textContent   = d.sous;
  document.getElementById('go-citoyen').textContent = G.prenom + ' ' + G.nom.toUpperCase() + ' — ' + G.numeroCitoyen;
  document.getElementById('go-jour').textContent   = 'Durée de service : ' + G.jour + ' jours';
  document.getElementById('go-wons').textContent   = 'Wons accumulés (vie entière) : ' + G.wons;
  document.getElementById('go-note').textContent   = 'Note citoyenne finale : ' + G.noteCitoyenne;
  localStorage.removeItem('chonguk-save');
  afficherEcran('screen-gameover');
}