function rafraichirMessages() {
  const body = document.getElementById('messages-body');
  if (G.messages.length === 0) {
    body.innerHTML = `<div class="placeholder-bloc"><span class="placeholder-icon">✉️</span><div class="placeholder-title">Aucun message</div></div>`;
    return;
  }
  let html = '';
  [...G.messages].reverse().forEach(m => {
    html += `<div class="message-item ${m.lu ? 'read' : 'unread'}" onclick="lireMessage(${m.id})">
      <div class="message-header">
        <div class="message-sender">
          ${!m.lu ? '<div class="sender-dot"></div>' : ''}
          ${m.expediteur}
        </div>
        <div class="message-date">${m.date}</div>
      </div>
      <div class="message-subject">${m.sujet}</div>
      <div class="message-preview">${m.corps.substring(0, 80)}...</div>
    </div>`;
  });
  body.innerHTML = html;
}

function lireMessage(id) {
  const m = G.messages.find(x => x.id === id);
  if (!m) return;
  m.lu = true;
  sauvegarder();
  mettreAJourBadges();

  // Ouvrir en modal simple (TODO: écran dédié)
  const body = document.getElementById('messages-body');
  body.innerHTML = `
    <div style="margin-bottom:12px;">
      <button class="btn-secondary" onclick="rafraichirMessages()">← Retour</button>
    </div>
    <div class="card">
      <div class="card-header">
        <span class="card-header-label">${m.expediteur}</span>
        <span style="font-size:11px; color:var(--texte-dim);">${m.date}</span>
      </div>
      <div class="card-body">
        <div style="font-size:15px; font-weight:600; color:var(--texte); margin-bottom:12px;">${m.sujet}</div>
        <div style="font-size:13px; color:var(--texte-dim); line-height:1.8; white-space:pre-line;">${m.corps}</div>
      </div>
    </div>`;
}