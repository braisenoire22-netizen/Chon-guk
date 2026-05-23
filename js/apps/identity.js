function rafraichirIdentite() {
  const body = document.getElementById('identity-body');
  const log  = LOGEMENTS[G.logementNiveau - 1];
  const palierActuel = getPalierActuel();
  const palierIdx = PALIERS.indexOf(palierActuel);
  const palierSuivant = PALIERS[palierIdx + 1] || null;
  const ptsManquants = palierSuivant ? palierSuivant.note - G.noteCitoyenne : null;
  body.innerHTML = `
    <div class="citizen-card">
      <div class="card-seal">
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="46" fill="none" stroke="#4a8a4a" stroke-width="2"/>
          <polygon points="50,16 56,34 75,34 61,45 66,63 50,52 34,63 39,45 25,34 44,34" fill="#4a8a4a"/>
        </svg>
      </div>
      <div class="citizen-name">${G.prenom} ${G.nom.toUpperCase()}</div>
      <div class="citizen-id">${G.numeroCitoyen}</div>
      <div class="citizen-info-grid">
        <div class="citizen-info-item">
          <div class="info-label">Province</div>
          <div class="info-value">${G.province}</div>
        </div>
        <div class="citizen-info-item">
          <div class="info-label">Poste</div>
          <div class="info-value" style="font-size:11px;">${G.metier.nom.substring(0,35)}...</div>
        </div>
        <div class="citizen-info-item">
          <div class="info-label">Bloc</div>
          <div class="info-value">Bloc ${G.metier.bloc} — S.${G.metier.secteur}</div>
        </div>
        <div class="citizen-info-item">
          <div class="info-label">Jour</div>
          <div class="info-value">Jour ${G.jour}</div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><span class="card-header-label">Ressources vitales</span></div>
      <div class="card-body">
        <div class="vital-bar">
          <div class="vital-bar-header">
            <span class="vital-label">Faim</span>
            <span class="vital-value">${Math.round(G.faim)} / 100</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill ${G.faim > 30 ? 'vert' : 'rouge'}" style="width:${G.faim}%"></div>
          </div>
        </div>
        <div class="vital-bar">
          <div class="vital-bar-header">
            <span class="vital-label">Soif</span>
            <span class="vital-value">${Math.round(G.soif)} / 100</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill ${G.soif > 30 ? 'bleu' : 'rouge'}" style="width:${G.soif}%"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header"><span class="card-header-label">Bilan citoyen</span></div>
      <div class="card-body">
        <div class="stat-row">
          <span class="stat-row-label">Wons en possession</span>
          <span class="stat-row-value or">${G.wons} w</span>
        </div>
        <div class="stat-row">
          <span class="stat-row-label">Note citoyenne</span>
          <span class="stat-row-value">${G.noteCitoyenne} pts</span>
        </div>
        <div class="stat-row">
          <span class="stat-row-label">Rang actuel</span>
          <span class="stat-row-value">${palierActuel.nom}</span>
        </div>
        ${palierSuivant ? `<div class="stat-row">
          <span class="stat-row-label">Prochain rang</span>
          <span class="stat-row-value" style="font-size:11px;">${palierSuivant.nom} <span style="color:var(--texte-dim);">(−${ptsManquants} pts)</span></span>
        </div>` : `<div class="stat-row">
          <span class="stat-row-label">Rang</span>
          <span class="stat-row-value or">Rang maximum atteint</span>
        </div>`}
        <div class="stat-row">
          <span class="stat-row-label">Streak travail</span>
          <span class="stat-row-value">${G.streakTravail || 0} jour(s)</span>
        </div>
        <div class="stat-row">
          <span class="stat-row-label">Logement</span>
          <span class="stat-row-value">${log.taille} — Niv.${G.logementNiveau}</span>
        </div>
      </div>
    </div>`;
}