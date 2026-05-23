function rafraichirActualites() {
  const body = document.getElementById('news-body');

  if (!G.initialise || G.actualitesDuJour.length === 0) {
    body.innerHTML = `<div class="placeholder-bloc">
      <span class="placeholder-icon">📰</span>
      <div class="placeholder-title">Aucune actualité disponible</div>
      <div>Le Bureau d'Information prépare votre briefing.</div>
    </div>`;
    return;
  }

  const toutesLues = G.actualitesDuJour.every(a => G.actualitesLues.includes(a.id));
  const nbLues = G.actualitesLues.length;

  let html = `<div class="card" style="margin-bottom:14px;">
    <div class="card-body">
      <div class="stat-row">
        <span class="stat-row-label">Statut lecture du jour</span>
        <span class="stat-row-value ${toutesLues ? 'vert' : 'rouge'}">${toutesLues ? '✓ Complet' : nbLues + ' / ' + G.actualitesDuJour.length}</span>
      </div>
      <div class="stat-row">
        <span class="stat-row-label">Jour ingame</span>
        <span class="stat-row-value">Jour ${G.jour}</span>
      </div>
    </div>
  </div>`;

  G.actualitesDuJour.forEach(a => {
    const lu = G.actualitesLues.includes(a.id);
    const impacts = Object.entries(a.impact || {}).map(([k, v]) => {
      const d = Math.round((v - 1) * 100);
      return `<span style="color:${d > 0 ? '#FF3B30' : '#30D158'}">${k} ${d > 0 ? '+' : ''}${d}%</span>`;
    }).join('  ');

    html += `<div class="news-item ${lu ? 'read' : 'unread'}" onclick="lireActualite('${a.id}')">
      <div class="news-item-header">
        <div class="news-headline">${a.titre}</div>
        <span class="news-tag ${a.tag}">${a.tag === 'national' ? 'NAT' : 'INT'}</span>
      </div>
      ${impacts ? `<div style="font-size:11px; margin-top:6px; font-family:'Courier Prime',monospace;">${impacts}</div>` : ''}
      ${!lu
        ? `<div class="news-required">⚠ Lecture obligatoire — +5 Note si tout lu</div>`
        : `<div style="font-size:11px; color:#30D158; margin-top:6px;">✓ Lu</div>`}
    </div>`;
  });

  body.innerHTML = html;
}

function lireActualite(id) {
  const actu = G.actualitesDuJour.find(a => a.id === id);
  if (!actu) return;
  const lu = G.actualitesLues.includes(id);
  const body = document.getElementById('news-body');

  const impactHTML = Object.entries(actu.impact || {}).length > 0
    ? `<div style="margin-top:16px; padding-top:14px; border-top:1px solid var(--gris-border);">
        <div style="font-size:10px; color:var(--texte-dim); letter-spacing:2px; text-transform:uppercase; margin-bottom:8px; font-family:'Courier Prime',monospace;">Impact sur les prix du marché</div>
        ${Object.entries(actu.impact).map(([k, v]) => {
          const d = Math.round((v - 1) * 100);
          return `<div style="font-size:14px; font-weight:600; color:${d > 0 ? '#FF3B30' : '#30D158'}; margin-bottom:4px;">${k.charAt(0).toUpperCase()+k.slice(1)} : ${d > 0 ? '+' : ''}${d}%</div>`;
        }).join('')}
      </div>` : '';

  body.innerHTML = `
    <div style="margin-bottom:12px;">
      <button class="btn-secondary" onclick="rafraichirActualites()">← Retour</button>
    </div>
    <div class="card">
      <div class="card-header">
        <span class="news-tag ${actu.tag}">${actu.tag === 'national' ? 'National' : 'International'}</span>
        <span style="font-size:11px; color:var(--texte-dim);">Jour ${G.jour}</span>
      </div>
      <div class="card-body">
        <div style="font-size:16px; font-weight:700; color:var(--texte); margin-bottom:14px; line-height:1.4;">${actu.titre}</div>
        <div style="font-size:13px; color:var(--texte-dim); line-height:1.85;">${actu.corps}</div>
        ${impactHTML}
      </div>
    </div>
    <div style="margin-top:12px;">
      <button class="btn-primary" onclick="confirmerLecture('${id}')" ${lu ? 'disabled' : ''}>
        ${lu ? '✓ Déjà lu' : 'Marquer comme lu (+effet économique)'}
      </button>
    </div>`;
}

function confirmerLecture(id) {
  if (G.actualitesLues.includes(id)) { rafraichirActualites(); return; }

  const actu = G.actualitesDuJour.find(a => a.id === id);
  if (!actu) return;

  G.actualitesLues.push(id);

  // Appliquer modificateurs de prix
  Object.entries(actu.impact || {}).forEach(([k, v]) => {
    G.modificateurPrix[k] = v;
  });

  // Bonus note si inspection annoncée
  if (actu.bonusNote) {
    G.noteCitoyenne += actu.bonusNote;
  }

  // Toutes les actus du jour lues ?
  const toutesLues = G.actualitesDuJour.every(a => G.actualitesLues.includes(a.id));
  if (toutesLues && !G.aLuActu) {
    G.aLuActu = true;
    G.noteCitoyenne += 5;
    push('Actualités', 'Lecture complète', 'Services déverrouillés. +5 Note citoyenne.', '📰');
    rafraichirVerrouillageApps();
  }

  sauvegarder();
  mettreAJourBadges();
  rafraichirActualites();
}