/* ============================================================
   SAUVEGARDE / CHARGEMENT
   ============================================================ */
function sauvegarder() {
  try {
    localStorage.setItem('chonguk-save', JSON.stringify(G));
  } catch(e) {}
}

function chargerSave() {
  try {
    const raw = localStorage.getItem('chonguk-save');
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved && saved.initialise) {
        Object.assign(G, saved);
        return true;
      }
    }
  } catch(e) {}
  return false;
}