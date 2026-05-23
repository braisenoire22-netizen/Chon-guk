function rafraichirMarche() {
  const body = document.getElementById('market-body');
  const storageMax = C.STOCKAGE[G.logementNiveau];
  const storageUsed = Object.values(G.inventaire).reduce((a,b) => a+b, 0);

  const produits = [
    { id: 'riz',        nom: 'Riz',        emoji: '🍚', desc: '1 unite — Satiete +20',  effet: 'faim', val: 20 },
    { id: 'eau',        nom: 'Eau',         emoji: '💧', desc: '1 unite — Soif +30',     effet: 'soif', val: 30 },
    { id: 'savon',      nom: 'Savon',       emoji: '🧼', desc: 'Hygiene — bonus portrait', effet: null, val: 0 },
    { id: 'medicament', nom: 'Médicament',  emoji: '💊', desc: 'Reserve de sante',       effet: null, val: 0 },
  ];

  let html = `<div class="card" style="margin-bottom:12px;">
    <div class="card-body">
      <div class="stat-row">
        <span class="stat-row-label">Wons disponibles</span>
        <span class="stat-row-value or">${G.wons} wons</span>
      </div>
      <div class="stat-row">
        <span class="stat-row-label">Stockage</span>
        <span class="stat-row-value">${storageUsed} / ${storageMax}</span>
      </div>
    </div>
  </div>`;

  produits.forEach(p => {
    const prixBase = C.PRIX_BASE[p.id] || 0;
    const modif    = G.modificateurPrix[p.id] || 1;
    const prix     = Math.round(prixBase * modif);
    const stockQte = G.inventaire[p.id] || 0;
    const modifLabel = modif !== 1 ?
      `<span class="price-modifier ${modif > 1 ? 'up' : 'down'}">${modif > 1 ? '↑' : '↓'}${Math.round(Math.abs(modif-1)*100)}%</span>` : '';

    const boutonConsommer = p.effet
      ? `<button class="btn-use" onclick="consommer('${p.id}')" ${stockQte === 0 ? 'disabled style="opacity:.35"' : ''}>Utiliser</button>`
      : '';
    html += `<div class="market-product">
      <div class="product-icon">${p.emoji}</div>
      <div class="product-info">
        <div class="product-name">${p.nom}</div>
        <div class="product-desc">${p.desc}</div>
        <div class="product-price">${prix} wons ${modifLabel}</div>
        <div style="font-size:11px; color:var(--texte-dim); margin-top:2px;">En stock : ${stockQte}</div>
      </div>
      <div class="product-actions">
        <button class="btn-buy" onclick="acheter('${p.id}', ${prix})" ${G.wons < prix || storageUsed >= storageMax ? 'disabled style="opacity:.35"' : ''}>Acheter</button>
        <button class="btn-sell" onclick="vendre('${p.id}', ${prix})" ${stockQte === 0 ? 'disabled style="opacity:.35"' : ''}>Vendre</button>
        ${boutonConsommer}
      </div>
    </div>`;
  });

  body.innerHTML = html;
}

function acheter(produit, prix) {
  const storageMax  = C.STOCKAGE[G.logementNiveau];
  const storageUsed = Object.values(G.inventaire).reduce((a,b) => a+b, 0);
  if (G.wons < prix || storageUsed >= storageMax) return;
  G.wons -= prix;
  G.inventaire[produit] = (G.inventaire[produit] || 0) + 1;
  sauvegarder();
  push('Marché', 'Achat confirmé', produit + ' acheté pour ' + prix + ' wons.', '🏪');
  rafraichirMarche();
}

function consommer(produit) {
  const effets = { riz: { champ: 'faim', val: 20, label: 'Satiété' }, eau: { champ: 'soif', val: 30, label: 'Hydratation' } };
  const effet = effets[produit];
  if (!effet || !G.inventaire[produit] || G.inventaire[produit] === 0) return;
  G.inventaire[produit]--;
  if (G.inventaire[produit] === 0) delete G.inventaire[produit];
  G[effet.champ] = Math.min(100, G[effet.champ] + effet.val);
  sauvegarder();
  push('Rations', effet.label, '+' + effet.val + ' — ' + effet.champ + ' désormais à ' + Math.round(G[effet.champ]) + '.', '🍽️');
  rafraichirMarche();
}

function vendre(produit, prix) {
  if (!G.inventaire[produit] || G.inventaire[produit] === 0) return;
  const revente = Math.floor(prix * 0.7);
  G.inventaire[produit]--;
  if (G.inventaire[produit] === 0) delete G.inventaire[produit];
  G.wons += revente;
  sauvegarder();
  push('Marché', 'Vente confirmée', produit + ' vendu pour ' + revente + ' wons.', '🏪');
  rafraichirMarche();
}

function upgradeLogement() {
  const couts = { 1: 800, 2: 2500, 3: 6000 };
  const notesRequises = { 1: 0, 2: 200, 3: 600 };
  const cout = couts[G.logementNiveau];
  const noteRequise = notesRequises[G.logementNiveau];
  if (G.logementNiveau >= 4) return;
  if (G.wons < cout) {
    push('Logement', 'Fonds insuffisants', 'Il vous faut ' + cout + ' wons. Vous en avez ' + G.wons + '.', '🏠');
    return;
  }
  if (G.noteCitoyenne < noteRequise) {
    push('Logement', 'Dossier refusé', 'Note citoyenne insuffisante. ' + noteRequise + ' pts requis, vous avez ' + G.noteCitoyenne + '.', '🏠');
    return;
  }
  G.wons -= cout;
  G.logementNiveau++;
  sauvegarder();
  push('Logement', 'Upgrade accordé', 'Assigné au logement de niveau ' + G.logementNiveau + '.', '🏠');
  rafraichirLogement();
}

/* ============================================================
   MINI-JEU NETTOYAGE PORTRAIT
   ============================================================ */