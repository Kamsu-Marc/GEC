import React, { useState, useEffect } from 'react';

export const ReallocationModal = ({ isOpen, onClose, pendingData, onConfirmReallocation }) => {
  const [selections, setSelections] = useState({});

  useEffect(() => {
    if (pendingData && pendingData.reallocSites) {
      const initialMap = {};
      pendingData.reallocSites.forEach(rs => {
        if (rs.otherServices.length > 0) {
          initialMap[rs.siteId] = rs.otherServices[0].id;
        }
      });
      setSelections(initialMap);
    }
  }, [pendingData]);

  if (!isOpen || !pendingData) return null;

  const { originServiceName, reallocSites } = pendingData;

  const handleSelectChange = (siteId, value) => {
    setSelections(prev => ({ ...prev, [siteId]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = reallocSites.map(rs => ({
      siteId: rs.siteId,
      oldServiceId: rs.serviceId,
      newServiceId: selections[rs.siteId]
    }));
    onConfirmReallocation(result);
  };

  return (
    <div id="modal-realloc-overlay" className="modal-backdrop">
      <div className="modal-card" style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <h3>🔀 Réaffectation requise des courriers &amp; responsables</h3>
        </div>
        <form id="form-realloc-service" onSubmit={handleSubmit}>
          <div className="modal-body">
            <p style={{ marginBottom: '1rem', fontSize: '0.88rem' }}>
              La désactivation du service <strong>« {originServiceName} »</strong> nécessite une réaffectation d'éléments sur <strong>{reallocSites.length} site(s)</strong> :<br />
              Veuillez choisir un service de remplacement pour chaque site concerné ci-dessous :
            </p>

            {reallocSites.map(rs => (
              <div key={rs.siteId} className="card-panel" style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid var(--color-border)', backgroundColor: '#f8fafc' }}>
                <h4 style={{ marginBottom: '0.5rem', color: 'var(--color-primary)' }}>🏢 {rs.siteNom}</h4>
                <p style={{ fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                  Éléments à réaffecter pour <strong>{rs.serviceNom}</strong> :<br />
                  • <strong>{rs.attachedMails.length} courrier(s)</strong><br />
                  • <strong>{rs.attachedResponsables.length} responsable(s) actif(s)</strong> ({rs.attachedResponsables.map(r => r.nom).join(', ') || 'Aucun'})
                </p>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label htmlFor={`realloc-select-${rs.siteId}`}>Service de remplacement ({rs.siteNom}) *</label>
                  <select
                    id={`realloc-select-${rs.siteId}`}
                    className="form-control"
                    value={selections[rs.siteId] || ''}
                    onChange={(e) => handleSelectChange(rs.siteId, e.target.value)}
                    required
                  >
                    {rs.otherServices.map(s => (
                      <option key={s.id} value={s.id}>{s.nom}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-primary">Confirmer la réaffectation &amp; Désactiver</button>
          </div>
        </form>
      </div>
    </div>
  );
};
