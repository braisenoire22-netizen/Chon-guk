/* ============================================================
   GALERIE OFFICIELLE — Portraits de La Grande Maréchale
   ============================================================ */
const PORTRAITS_GALERIE = [
  { id: '1', label: 'Portrait Officiel n°1' },
  { id: '3', label: 'Portrait Officiel n°3' },
  { id: '4', label: 'Portrait Officiel n°4' },
  { id: '5', label: 'Portrait Officiel n°5' },
  { id: '6', label: 'Portrait Officiel n°6' },
];

function rafraichirGalerie() {
  const body   = document.getElementById('galerie-body');
  const actuel = G.portraitWallpaper || '3';

  const items = PORTRAITS_GALERIE.map(p => `
    <div class="galerie-item ${p.id === actuel ? 'actif' : ''}" onclick="choisirPortrait('${p.id}')">
      <img src="imgs/La selection ${p.id}.jpg" alt="${p.label}">
      <div class="galerie-item-footer">
        <span class="galerie-item-label">${p.label}</span>
        ${p.id === actuel ? '<span class="galerie-item-badge">✓</span>' : ''}
      </div>
    </div>`).join('');

  body.innerHTML = `
    <div style="font-size:11px; color:var(--texte-dim); font-family:'Courier Prime',monospace; margin-bottom:14px; line-height:1.6;">
      Sélectionnez le portrait officiel de La Grande Maréchale So-min-ae à afficher sur votre terminal citoyen.
    </div>
    <div class="galerie-grid">${items}</div>`;
}

function choisirPortrait(id) {
  if (G.portraitWallpaper === id) return;
  G.portraitWallpaper = id;
  sauvegarder();
  appliquerWallpaper();
  push('Galerie Officielle', 'Fond d\'écran mis à jour', 'Portrait n°' + id + ' sélectionné.', '🖼️');
  rafraichirGalerie();
}

function appliquerWallpaper() {
  const src = 'imgs/La selection ' + (G.portraitWallpaper || '3') + '.jpg';
  const home = document.getElementById('home-wallpaper-img');
  const lock = document.getElementById('lock-wallpaper-img');
  if (home) home.src = src;
  if (lock) lock.src = src;
}
