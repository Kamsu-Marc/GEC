import React, { useState, useContext } from 'react';
import { DataContext } from '../../context/DataContext';

export const DeleteServiceScopeModal = ({ isOpen, onClose, targetService, onSubmitScope }) => {
  const { sites } = useContext(DataContext);
  const [scopeOption, setScopeOption] = useState('current');
  const [selectedSiteIds, setSelectedSiteIds] = useState([]);

  if (!isOpen || !targetService) return null;

  const handleToggleSite = (siteId) => {
    setSelectedSiteIds(prev => 
      prev.includes(siteId) ? prev.filter(id => id !== siteId) : [...prev, siteId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (scopeOption === 'selected' && selectedSiteIds.length === 0) {
      alert('Veuillez sélectionner au moins un site.');
      return;
    }
    onSubmitScope(scopeOption, selectedSiteIds);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h3>🗑️ Désactiver le service « {targetService.nom} »</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
              Veuillez sélectionner le périmètre d'application de cette désactivation :
            </p>
            <div className="radio-group-vertical">
              <label className="radio-pill">
                <input
                  type="radio"
                  name="delete-scope"
                  value="current"
                  checked={scopeOption === 'current'}
                  onChange={() => setScopeOption('current')}
                />
                <span>Uniquement sur le site actuel ({targetService.siteId})</span>
              </label>

              <label className="radio-pill">
                <input
                  type="radio"
                  name="delete-scope"
                  value="all"
                  checked={scopeOption === 'all'}
                  onChange={() => setScopeOption('all')}
                />
                <span>Sur tous les sites du réseau ({sites.length} sites)</span>
              </label>

              <label className="radio-pill">
                <input
                  type="radio"
                  name="delete-scope"
                  value="selected"
                  checked={scopeOption === 'selected'}
                  onChange={() => setScopeOption('selected')}
                />
                <span>Sélectionner des sites spécifiques...</span>
              </label>
            </div>

            {scopeOption === 'selected' && (
              <div className="multi-select-box" style={{ marginTop: '0.75rem' }}>
                {sites.map(s => (
                  <label key={s.id} className="checkbox-pill">
                    <input
                      type="checkbox"
                      checked={selectedSiteIds.includes(s.id)}
                      onChange={() => handleToggleSite(s.id)}
                    />
                    <span>{s.nom}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-danger">Continuer</button>
          </div>
        </form>
      </div>
    </div>
  );
};
