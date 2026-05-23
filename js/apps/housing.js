function rafraichirLogement() {
  const body = document.getElementById('housing-body');
  const log  = LOGEMENTS[G.logementNiveau - 1];
  const next = LOGEMENTS[G.logementNiveau] || null;
  const storageMax = C.STOCKAGE[G.logementNiveau];
  const storageUsed = Object.values(G.inventaire).reduce((a,b) => a+b, 0);

  // Grille de stockage (items consommables = cliquables)
  const consommables = { riz: true, eau: true };
  const emojisMap = { riz:'🍚', eau:'💧', savon:'🧼', medicament:'💊' };
  let gridHTML = '';
  const items = [];
  Object.entries(G.inventaire).forEach(([k,v]) => {
    for(let i=0; i<v; i++) items.push({ emoji: emojisMap[k] || '📦', produit: k });
  });
  for(let i=0; i<storageMax; i++) {
    const item = items[i];
    if (item && consommables[item.produit]) {
      gridHTML += `<div class="storage-cell filled consommable" onclick="consommerDepuisLogement('${item.produit}')" title="Cliquer pour consommer">${item.emoji}</div>`;
    } else {
      gridHTML += `<div class="storage-cell ${item ? 'filled' : 'empty'}">${item ? item.emoji : ''}</div>`;
    }
  }

  const couts = { 1: 800, 2: 2500, 3: 6000 };
  const notesRequises = { 1: 0, 2: 200, 3: 600 };
  const cout = couts[G.logementNiveau];
  const noteRequise = notesRequises[G.logementNiveau];
  const peutUpgrader = G.wons >= cout && G.noteCitoyenne >= noteRequise;

  let upgradeHTML = '';
  if (next) {
    let conditionsHTML = '';
    if (noteRequise > 0) {
      const noteOk = G.noteCitoyenne >= noteRequise;
      conditionsHTML += `<div class="stat-row">
        <span class="stat-row-label">Note requise</span>
        <span class="stat-row-value ${noteOk ? 'vert' : 'rouge'}">${noteRequise} pts ${noteOk ? '✓' : '(manque ' + (noteRequise - G.noteCitoyenne) + ')'}</span>
      </div>`;
    }
    upgradeHTML = `
      <div class="card" style="margin-top:12px;">
        <div class="card-header"><span class="card-header-label">Amélioration disponible</span></div>
        <div class="card-body">
          <div class="stat-row">
            <span class="stat-row-label">Niveau suivant</span>
            <span class="stat-row-value">${next.taille} — ${next.type}</span>
          </div>
          <div class="stat-row">
            <span class="stat-row-label">Stockage</span>
            <span class="stat-row-value">${C.STOCKAGE[G.logementNiveau+1]} cases</span>
          </div>
          <div class="stat-row">
            <span class="stat-row-label">Loyer</span>
            <span class="stat-row-value rouge">${C.LOYERS[G.logementNiveau+1]} wons/jour</span>
          </div>
          <div class="stat-row">
            <span class="stat-row-label">Coût upgrade</span>
            <span class="stat-row-value ${G.wons >= cout ? 'or' : 'rouge'}">${cout} wons ${G.wons >= cout ? '✓' : '(manque ' + (cout - G.wons) + ')'}</span>
          </div>
          ${conditionsHTML}
        </div>
        <div style="padding:0 16px 16px;">
          <button class="btn-primary" onclick="upgradeLogement()" ${peutUpgrader ? '' : 'disabled'} style="background:#1C3A1C; ${peutUpgrader ? '' : 'opacity:.45;'}">
            Demander l'upgrade — ${cout} wons
          </button>
        </div>
      </div>`;
  }

  body.innerHTML = `
    <div class="housing-card">
      <div class="housing-type">${log.type}</div>
      <div class="housing-desc">${log.taille} — ${log.confort}</div>
      <div class="housing-level">
        <span style="font-size:11px; color:var(--texte-dim); margin-right:6px;">Niveau :</span>
        <div class="level-dots">
          ${[1,2,3,4].map(n => `<div class="level-dot ${n <= G.logementNiveau ? 'active' : ''}"></div>`).join('')}
        </div>
        <span style="font-size:11px; color:var(--or); margin-left:8px;">${G.logementNiveau} / 4</span>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <span class="card-header-label">Stockage — ${storageUsed} / ${storageMax} cases</span>
      </div>
      <div class="storage-grid">${gridHTML}</div>
    </div>

    <div class="card">
      <div class="card-body">
        <div class="stat-row">
          <span class="stat-row-label">Loyer quotidien</span>
          <span class="stat-row-value rouge">${C.LOYERS[G.logementNiveau]} wons/jour</span>
        </div>
        <div class="stat-row">
          <span class="stat-row-label">Eau courante</span>
          <span class="stat-row-value">${G.logementNiveau >= 3 ? '✓ Oui' : '✗ Non'}</span>
        </div>
      </div>
    </div>
    ${upgradeHTML}`;
}

function consommerDepuisLogement(produit) {
  const effets = { riz: { champ: 'faim', val: 20, label: 'Satiété' }, eau: { champ: 'soif', val: 30, label: 'Hydratation' } };
  const effet = effets[produit];
  if (!effet || !G.inventaire[produit] || G.inventaire[produit] === 0) return;
  G.inventaire[produit]--;
  if (G.inventaire[produit] === 0) delete G.inventaire[produit];
  G[effet.champ] = Math.min(100, G[effet.champ] + effet.val);
  sauvegarder();
  push('Rations', effet.label, '+' + effet.val + ' — ' + effet.champ + ' à ' + Math.round(G[effet.champ]) + '.', '🍽️');
  rafraichirLogement();
}