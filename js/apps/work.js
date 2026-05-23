/* ============================================================
   TRAVAIL — routage selon l'état du joueur
   ============================================================ */
function rafraichirTravail() {
  if (!G.initialise) return;
  const body = document.getElementById('work-body');
  if (G.estJourFete)  { _afficherDefilé(body);        return; }
  if (G.estMalade)    { _afficherMaladie(body);        return; }
  _afficherTravailNormal(body);
}

/* ============================================================
   ETAT : TRAVAIL NORMAL
   ============================================================ */
function _afficherTravailNormal(body) {
  const palier       = getPalierActuel();
  const salaireBase  = C.SALAIRES[G.metier.id];
  const salaire      = getSalaireEffectif();
  const coeff        = C.COEFF_SALAIRE[palier.rang] || 1;
  const primeStr     = palier.rang > 0 ? `+${Math.round((coeff - 1) * 100)}% prime mérite` : 'Aucune prime — progressez';
  const heuresSup    = G.heuresSup || 0;
  const maxSup       = C.MAX_HEURES_SUP;
  const bonus        = Math.floor(salaire * 0.3);
  const supRestantes = maxSup - heuresSup;
  const peutPointer  = !G.aPointe && G.faim > C.TRAVAIL_FAIM && G.soif > C.TRAVAIL_SOIF;
  const peutHSup     = G.aPointe && heuresSup < maxSup
                       && G.faim > C.HEURES_SUP_FAIM && G.soif > C.HEURES_SUP_SOIF;

  const labelPointer = G.aPointe
    ? 'Déjà pointé aujourd\'hui'
    : !peutPointer
      ? 'Réserves insuffisantes pour travailler'
      : `Pointer — +${salaire} wons &nbsp;|&nbsp; -${C.TRAVAIL_FAIM}🍚 -${C.TRAVAIL_SOIF}💧`;

  const labelHSup = heuresSup >= maxSup
    ? 'Maximum atteint — repos obligatoire'
    : !peutHSup && G.aPointe
      ? 'Trop épuisé·e pour continuer'
      : `Heures sup. (+${bonus} wons) — -${C.HEURES_SUP_FAIM}🍚 -${C.HEURES_SUP_SOIF}💧 — ${supRestantes} restante${supRestantes > 1 ? 's' : ''}`;

  body.innerHTML = `
    <div class="work-post-card">
      <div class="post-title">${G.metier.nom}</div>
      <div class="post-location">Bloc ${G.metier.bloc} — Secteur ${G.metier.secteur}</div>
      <div class="salary-display">
        <div class="salary-amount">${salaire}</div>
        <div class="salary-unit">wons / jour</div>
      </div>
      <div class="cycle-info">
        Base ${salaireBase} ₩ — ${palier.emoji} ${palier.nom} — <span style="color:var(--or)">${primeStr}</span>
      </div>
    </div>
    <div class="card">
      <div class="card-body">
        <div class="stat-row">
          <span class="stat-row-label">Statut aujourd'hui</span>
          <span class="stat-row-value ${G.aPointe ? 'vert' : 'rouge'}">${G.aPointe ? 'Pointé ✓' : 'Absent'}</span>
        </div>
        <div class="stat-row">
          <span class="stat-row-label">Faim</span>
          <span class="stat-row-value ${G.faim < 30 ? 'rouge' : G.faim < 50 ? 'or' : 'vert'}">${Math.round(G.faim)}%</span>
        </div>
        <div class="stat-row">
          <span class="stat-row-label">Soif</span>
          <span class="stat-row-value ${G.soif < 30 ? 'rouge' : G.soif < 50 ? 'or' : 'vert'}">${Math.round(G.soif)}%</span>
        </div>
        <div class="stat-row">
          <span class="stat-row-label">Heures supplémentaires</span>
          <span class="stat-row-value ${heuresSup >= maxSup ? 'rouge' : ''}">${heuresSup} / ${maxSup}</span>
        </div>
      </div>
    </div>
    <button class="btn-primary" ${(G.aPointe || !peutPointer) ? 'disabled' : ''} onclick="actionPointer()" style="margin-top:8px;">
      ${labelPointer}
    </button>
    <div style="margin-top:10px;">
      <button class="btn-secondary" onclick="actionHeuresSup()" ${!peutHSup ? 'disabled' : ''}>
        ${labelHSup}
      </button>
    </div>`;
}

/* ============================================================
   ETAT : MALADIE
   ============================================================ */
function _afficherMaladie(body) {
  const qte = G.inventaire.medicament || 0;
  const jours = G.joursMalade || 0;

  body.innerHTML = `
    <div class="work-etat-card work-etat-maladie">
      <div class="work-etat-icon">🤒</div>
      <div class="work-etat-titre">Incapacité de travail</div>
      <div class="work-etat-desc">
        Votre état de santé vous empêche de pointer.
        Un médicament est nécessaire pour reprendre le service.
        ${jours > 0 ? `<br><br>Jours de maladie consécutifs : <strong style="color:#FF3B30">${jours}</strong>` : ''}
      </div>
    </div>
    <div class="card">
      <div class="card-body">
        <div class="stat-row">
          <span class="stat-row-label">Médicaments en stock</span>
          <span class="stat-row-value ${qte === 0 ? 'rouge' : 'vert'}">${qte}</span>
        </div>
        <div class="stat-row">
          <span class="stat-row-label">Pénalité journalière</span>
          <span class="stat-row-value rouge">-3 Note  -8🍚  -10💧</span>
        </div>
      </div>
    </div>
    <button class="btn-primary" onclick="actionPrendreMedicament()" ${qte === 0 ? 'disabled' : ''} style="margin-top:8px;">
      ${qte === 0 ? '💊 Aucun médicament — achetez au Marché' : '💊 Prendre un médicament'}
    </button>`;
}

/* ============================================================
   ETAT : FÊTE NATIONALE / DÉFILÉ
   ============================================================ */
function _afficherDefilé(body) {
  const idx  = Math.max(0, Math.floor(G.jour / C.INTERVALLE_FETE) - 1) % C.NOMS_FETES.length;
  const nom  = C.NOMS_FETES[idx];

  body.innerHTML = `
    <div class="work-etat-card work-etat-fete">
      <div class="work-etat-icon">🎖️</div>
      <div class="work-etat-titre">${nom}</div>
      <div class="work-etat-desc">
        Le travail est suspendu aujourd'hui. La présence au défilé militaire est
        <strong>obligatoire</strong>. Toute absence sera notée dans votre dossier citoyen.
        <br><br>Pénalité d'absence : <strong style="color:#FF3B30">-20 Note citoyenne</strong>
      </div>
    </div>
    ${!G.aAssiste ? `
    <div style="margin-top:12px;">
      <button class="btn-primary" onclick="actionAssisterDefilé()">
        🪖 Se mettre au garde-à-vous
      </button>
    </div>` : `
    <div class="card" style="margin-top:12px;">
      <div class="card-body">
        <div class="stat-row">
          <span class="stat-row-label">Présence au défilé</span>
          <span class="stat-row-value vert">✓ Enregistrée — +15 Note citoyenne</span>
        </div>
      </div>
    </div>`}`;
}

/* ============================================================
   ACTIONS
   ============================================================ */
function _lancerAnimTravail(label, subtitle, barClass, dureeMs, callback) {
  const body = document.getElementById('work-body');
  body.innerHTML = `
    <div class="work-anim-card">
      <div class="work-anim-icon">⚙️</div>
      <div class="work-anim-label">${label}</div>
      <div class="work-anim-subtitle">${subtitle}</div>
      <div class="work-anim-bar-wrap">
        <div class="work-anim-bar ${barClass}" id="work-anim-bar"></div>
      </div>
      <div class="work-anim-status" id="work-anim-status">En cours...</div>
    </div>`;

  const bar  = document.getElementById('work-anim-bar');
  const step = 100 / (dureeMs / 30);
  let   prog = 0;
  const iv   = setInterval(() => {
    prog = Math.min(100, prog + step);
    if (bar) bar.style.width = prog + '%';
    if (prog >= 100) clearInterval(iv);
  }, 30);

  setTimeout(() => {
    const result = callback();
    const status = document.getElementById('work-anim-status');
    if (status) { status.textContent = result.texte; status.style.color = result.couleur; }
    sauvegarder();
    mettreAJourBadges();
    setTimeout(() => rafraichirTravail(), 1000);
  }, dureeMs);
}

function actionPointer() {
  if (G.aPointe || G.faim <= C.TRAVAIL_FAIM || G.soif <= C.TRAVAIL_SOIF) return;
  const salaire = getSalaireEffectif();
  _lancerAnimTravail('En service', G.metier.nom, '', 1500, () => {
    G.wons += salaire; G.noteCitoyenne += 5; G.aPointe = true;
    G.faim  = Math.max(0, G.faim - C.TRAVAIL_FAIM);
    G.soif  = Math.max(0, G.soif - C.TRAVAIL_SOIF);
    push('Travail', 'Salaire versé', `+${salaire} wons. -${C.TRAVAIL_FAIM}% faim, -${C.TRAVAIL_SOIF}% soif.`, '⚙️');
    return { texte: `✓ +${salaire} wons  |  -${C.TRAVAIL_FAIM}🍚 -${C.TRAVAIL_SOIF}💧`, couleur: '#30D158' };
  });
}

function actionHeuresSup() {
  if (!G.aPointe || (G.heuresSup || 0) >= C.MAX_HEURES_SUP) return;
  if (G.faim <= C.HEURES_SUP_FAIM || G.soif <= C.HEURES_SUP_SOIF) return;
  const salaire = getSalaireEffectif();
  const bonus   = Math.floor(salaire * 0.3);
  const session = (G.heuresSup || 0) + 1;
  _lancerAnimTravail('Heures supplémentaires', `Session ${session} / ${C.MAX_HEURES_SUP}`, 'work-anim-bar--sup', 900, () => {
    G.wons += bonus; G.heuresSup = session;
    G.faim  = Math.max(0, G.faim - C.HEURES_SUP_FAIM);
    G.soif  = Math.max(0, G.soif - C.HEURES_SUP_SOIF);
    push('Travail', 'Heures supplémentaires', `+${bonus} wons. -${C.HEURES_SUP_FAIM}% faim, -${C.HEURES_SUP_SOIF}% soif.`, '⚙️');
    return { texte: `✓ +${bonus} wons  |  -${C.HEURES_SUP_FAIM}🍚 -${C.HEURES_SUP_SOIF}💧`, couleur: '#C9A84C' };
  });
}

function actionPrendreMedicament() {
  if (!G.estMalade || !(G.inventaire.medicament > 0)) return;
  const body = document.getElementById('work-body');
  body.innerHTML = `
    <div class="work-anim-card">
      <div class="work-anim-icon" style="animation:none; font-size:44px;">💊</div>
      <div class="work-anim-label">Traitement</div>
      <div class="work-anim-subtitle">Médicament administré</div>
      <div class="work-anim-bar-wrap">
        <div class="work-anim-bar" id="work-anim-bar" style="background:#30D158;"></div>
      </div>
      <div class="work-anim-status" id="work-anim-status">Récupération en cours...</div>
    </div>`;
  const bar  = document.getElementById('work-anim-bar');
  let   prog = 0;
  const iv   = setInterval(() => {
    prog = Math.min(100, prog + 4);
    if (bar) bar.style.width = prog + '%';
    if (prog >= 100) clearInterval(iv);
  }, 20);
  setTimeout(() => {
    G.inventaire.medicament--;
    if (G.inventaire.medicament === 0) delete G.inventaire.medicament;
    G.estMalade   = false;
    G.joursMalade = 0;
    sauvegarder();
    mettreAJourBadges();
    push('Santé', 'Rétabli·e', 'Vous pouvez reprendre le travail.', '💊');
    const status = document.getElementById('work-anim-status');
    if (status) { status.textContent = '✓ Rétabli·e — reprise du service possible'; status.style.color = '#30D158'; }
    setTimeout(() => rafraichirTravail(), 1000);
  }, 900);
}

function actionAssisterDefilé() {
  if (G.aAssiste || !G.estJourFete) return;
  const idx = Math.max(0, Math.floor(G.jour / C.INTERVALLE_FETE) - 1) % C.NOMS_FETES.length;
  const nom = C.NOMS_FETES[idx];
  const body = document.getElementById('work-body');

  body.innerHTML = `
    <div class="work-anim-card parade-anim-card">
      <div class="work-anim-label" style="margin:0 0 8px; font-size:9px;">${nom}</div>
      <div class="parade-march">🪖🪖🪖🪖🪖🪖🪖🪖</div>
      <div class="parade-fanfare">🎺🥁🎺🥁🎺</div>
      <div class="work-anim-bar-wrap" style="margin-top:14px;">
        <div class="work-anim-bar work-anim-bar--sup" id="work-anim-bar"></div>
      </div>
      <div class="work-anim-status" id="work-anim-status">Garde-à-vous — ne bougez pas !</div>
    </div>`;

  const bar  = document.getElementById('work-anim-bar');
  let   prog = 0;
  const iv   = setInterval(() => {
    prog = Math.min(100, prog + 1);
    if (bar) bar.style.width = prog + '%';
    if (prog >= 100) clearInterval(iv);
  }, 30);

  setTimeout(() => {
    G.aAssiste = true;
    G.noteCitoyenne += 15;
    sauvegarder();
    mettreAJourBadges();
    push('Comité Civique', 'Présence enregistrée', 'Merci pour votre dévotion. +15 Note citoyenne.', '🎖️');
    const status = document.getElementById('work-anim-status');
    if (status) { status.textContent = '✓ Vive la Grande Maréchale So-min-ae !'; status.style.color = '#C9A84C'; }
    setTimeout(() => rafraichirTravail(), 1800);
  }, 3200);
}
