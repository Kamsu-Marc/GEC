import React from 'react';

export const HistoryModal = ({ isOpen, onClose, title, historyList = [], currentStatus = 'Actif' }) => {
  if (!isOpen) return null;

  function formatDateFull(isoString) {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('fr-FR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (e) {
      return isoString;
    }
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: '580px' }}>
        <div className="modal-header">
          <h3>{title || '📜 Historique des Statuts'}</h3>
        </div>
        <div className="modal-body">
          {historyList.length === 0 ? (
            <div className="empty-state" style={{ padding: '1.5rem 0' }}>
              Aucune modification de statut enregistrée.<br />
              <small className="text-muted">Statut actuel : {currentStatus}</small>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Action</th>
                    <th>Date &amp; Heure</th>
                    <th>Effectué par</th>
                  </tr>
                </thead>
                <tbody>
                  {historyList.slice().reverse().map((h, idx) => {
                    const isDesact = h.action === 'desactivation';
                    const actionBadge = isDesact
                      ? <span className="status-pill status-recu" style={{ background: '#fef2f2', color: '#dc2626' }}>🔒 Désactivation</span>
                      : <span className="status-pill status-recu" style={{ background: '#ecfdf5', color: '#059669' }}>🔄 Réactivation</span>;
                    return (
                      <tr key={idx}>
                        <td>{actionBadge}</td>
                        <td>{formatDateFull(h.date)}</td>
                        <td><strong>{h.parNom || 'Non renseigné'}</strong></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>Fermer</button>
        </div>
      </div>
    </div>
  );
};
