/* ============================================================
   BANQUE CITOYENNE DE CHON-GUK
   ============================================================ */
function rafraichirBanque() {
  const body      = document.getElementById('banque-body');
  const salaire   = getSalaireEffectif();
  const loyer     = C.LOYERS[G.logementNiveau] || 0;
  const netJour   = salaire - loyer;
  const palier    = getPalierDon();
  const prochainP = getProchainPalierDon();
  const total     = G.totalDons || 0;
  const pctPalier = prochainP
    ? Math.round(((total - palier.total) / (prochainP.total - palier.total)) * 100)
    : 100;

  const montantsHTML = C.OFFR_MONTANTS.map(m => {
    const off = G.wons < m.wons ? 'disabled' : '';
    return `<button class="btn-offrande ${off}" onclick="actionOffrande(${m.wons},${m.note})" ${off}>
      <span class="btn-offrande-wons">${m.wons} ₩</span>
      <span class="btn-offrande-note">+${m.note} ✦</span>
    </button>`;
  }).join('');

  body.innerHTML = `

    <!-- Solde -->
    <div class="banque-solde-card">
      <div class="banque-solde-label">Solde du compte citoyen</div>
      <div class="banque-solde-montant">₩ <span id="banque-wons-live">${G.wons}</span></div>
      <div class="banque-solde-sub">Caisse Centrale — ${G.numeroCitoyen || '—'}</div>
    </div>

    <!-- Flux économiques -->
    <div class="card">
      <div class="card-header">
        <span class="card-header-label">Flux journaliers</span>
      </div>
      <div class="card-body">
        <div class="stat-row">
          <span class="stat-row-label">Salaire brut</span>
          <span class="stat-row-value vert">+${salaire} ₩</span>
        </div>
        <div class="stat-row">
          <span class="stat-row-label">Loyer (niveau ${G.logementNiveau})</span>
          <span class="stat-row-value rouge">−${loyer} ₩</span>
        </div>
        <div class="stat-row">
          <span class="stat-row-label">Balance nette / jour</span>
          <span class="stat-row-value ${netJour >= 0 ? 'vert' : 'rouge'}">${netJour >= 0 ? '+' : ''}${netJour} ₩</span>
        </div>
        <div class="stat-row">
          <span class="stat-row-label">Offrandes totales versées</span>
          <span class="stat-row-value or">${total} ₩</span>
        </div>
      </div>
    </div>

    <!-- Prêt citoyen -->
    <div class="card">
      <div class="card-header">
        <span class="card-header-label">Prêt Citoyen d'État</span>
      </div>
      <div class="card-body">
        ${G.pretActif ? `
        <div class="stat-row">
          <span class="stat-row-label">Remboursements restants</span>
          <span class="stat-row-value rouge">${G.pretJoursRestants} × ${C.PRET_REMBOURSEMENT_JOUR} ₩</span>
        </div>
        <div class="stat-row">
          <span class="stat-row-label">Solde dû</span>
          <span class="stat-row-value rouge">${G.pretJoursRestants * C.PRET_REMBOURSEMENT_JOUR} ₩</span>
        </div>
        <div class="stat-row">
          <span class="stat-row-label">Prochaine échéance</span>
          <span class="stat-row-value">Au réveil (Dormir)</span>
        </div>
        <div style="font-size:10px; color:var(--texte-dim); margin-top:6px; font-family:'Courier Prime',monospace;">
          Échéance impayée : -8 Note citoyenne par jour de retard
        </div>` : `
        <div class="stat-row">
          <span class="stat-row-label">Montant disponible</span>
          <span class="stat-row-value vert">${C.PRET_MONTANT} ₩</span>
        </div>
        <div class="stat-row">
          <span class="stat-row-label">Remboursement</span>
          <span class="stat-row-value">${C.PRET_REMBOURSEMENT_JOUR} ₩ / jour × ${C.PRET_DUREE} jours</span>
        </div>
        <div class="stat-row">
          <span class="stat-row-label">Coût total</span>
          <span class="stat-row-value rouge">${C.PRET_REMBOURSEMENT_JOUR * C.PRET_DUREE} ₩ (${C.PRET_REMBOURSEMENT_JOUR * C.PRET_DUREE - C.PRET_MONTANT} ₩ d'intérêts)</span>
        </div>
        <div style="font-size:10px; color:var(--texte-dim); margin-top:6px; font-family:'Courier Prime',monospace;">
          Tout citoyen de bonne foi peut bénéficier d'un prêt d'urgence de l'État.
        </div>
        <button class="btn-secondary" onclick="actionPrendreEmprunt()" style="margin-top:10px; width:100%;">
          Contracter le prêt (+${C.PRET_MONTANT} ₩)
        </button>`}
      </div>
    </div>

    <!-- Offrandes -->
    <div class="offrande-section">
      <div class="offrande-header">
        <span class="offrande-header-label">Offrandes au Régime</span>
        <span class="offrande-header-total">${total} ₩ déposés</span>
      </div>

      <div class="offrande-billet-wrap" id="offrande-flash">
        <img src="imgs/billet2.png" alt="Billet du Régime" class="offrande-billet">
      </div>

      <div class="offrande-btns">
        ${montantsHTML}
      </div>

      <div class="card" style="margin-top:10px;">
        <div class="card-body">
          <div class="vital-bar">
            <div class="vital-bar-header">
              <span class="vital-label">${palier.emoji} ${palier.nom}</span>
              <span class="vital-value" style="font-size:11px; color:var(--or);">
                Brosse ⌀${palier.rayon * 2}px
              </span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill or" style="width:${pctPalier}%;"></div>
            </div>
          </div>
          ${prochainP ? `
          <div style="font-size:10px; color:var(--texte-dim); margin-top:6px; font-family:'Courier Prime',monospace;">
            ${prochainP.total - total} ₩ manquants → ${prochainP.emoji} ${prochainP.nom}
            (brosse ⌀${prochainP.rayon * 2}px)
          </div>` : `
          <div style="font-size:10px; color:var(--or); margin-top:6px; font-family:'Courier Prime',monospace;">
            👑 Rang maximum atteint — Brosse maximale débloquée
          </div>`}
        </div>
      </div>
    </div>`;
}

/* ============================================================
   ACTION PRÊT
   ============================================================ */
function actionPrendreEmprunt() {
  if (G.pretActif) return;
  G.pretActif        = true;
  G.pretJoursRestants = C.PRET_DUREE;
  G.wons             += C.PRET_MONTANT;
  sauvegarder();
  mettreAJourBadges();
  mettreAJourWons();
  push('Banque Citoyenne', 'Prêt accordé', `+${C.PRET_MONTANT} ₩ crédités. Remboursement : ${C.PRET_REMBOURSEMENT_JOUR} ₩/jour pendant ${C.PRET_DUREE} jours.`, '🏦');
  rafraichirBanque();
}

/* ============================================================
   ACTION OFFRANDE
   ============================================================ */
function actionOffrande(montant, note) {
  if (G.wons < montant) return;

  const ancienPalier  = getPalierDon();
  G.wons             -= montant;
  G.totalDons         = (G.totalDons || 0) + montant;
  G.noteCitoyenne    += note;
  sauvegarder();
  mettreAJourBadges();
  mettreAJourWons();

  const wrap = document.getElementById('offrande-flash');
  if (wrap) {
    wrap.classList.add('offrande-flash');
    setTimeout(() => wrap.classList.remove('offrande-flash'), 600);
  }

  const nouveauPalier = getPalierDon();
  if (nouveauPalier.total > ancienPalier.total) {
    push('Banque', `${nouveauPalier.emoji} ${nouveauPalier.nom}`,
      `Nouveau rang d'offrandes ! Brosse ⌀${nouveauPalier.rayon * 2}px débloquée.`, '🏦');
  } else {
    push('Banque', 'Offrande déposée',
      `+${note} Note citoyenne. Total déposé : ${G.totalDons} ₩.`, '🏦');
  }

  rafraichirBanque();
}
