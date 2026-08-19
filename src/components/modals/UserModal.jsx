import React, { useState, useEffect, useContext } from 'react';
import { DataContext } from '../../context/DataContext';
import { AuthContext } from '../../context/AuthContext';

export const UserModal = ({ isOpen, onClose, editUserData = null }) => {
  const { sites, services, agents, setAgents, responsables, setResponsables, rafs, setRafs, showToast } = useContext(DataContext);
  const { activeSiteId, getCurrentSessionOperator } = useContext(AuthContext);

  const [role, setRole] = useState('agent');
  const [siteId, setSiteId] = useState(activeSiteId);
  const [serviceId, setServiceId] = useState('');
  const [nom, setNom] = useState('');

  useEffect(() => {
    if (editUserData) {
      setRole(editUserData.roleKey || 'agent');
      setSiteId(editUserData.siteId || activeSiteId);
      setServiceId(editUserData.serviceId || '');
      setNom(editUserData.nom || '');
    } else {
      setRole('agent');
      setSiteId(activeSiteId);
      setServiceId('');
      setNom('');
    }
  }, [editUserData, activeSiteId, isOpen]);

  if (!isOpen) return null;

  const activeSiteServices = services.filter(s => s.siteId === siteId && s.actif !== false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const operator = getCurrentSessionOperator();
    if (!operator) {
      showToast('Action impossible : Vous devez être connecté avec un profil RAF ou PDG actif.', '🚫');
      return;
    }

    if (!nom.trim()) {
      showToast('Veuillez saisir un nom complet.', '⚠️');
      return;
    }

    if (role === 'responsable' && !serviceId) {
      showToast('Veuillez sélectionner un service pour le responsable.', '⚠️');
      return;
    }

    const now = new Date().toISOString();

    if (editUserData) {
      // Édition
      const userId = editUserData.id;
      const originalRole = editUserData.roleKey;

      if (originalRole === 'agent') setAgents(prev => prev.filter(a => a.id !== userId));
      else if (originalRole === 'responsable') setResponsables(prev => prev.filter(r => r.id !== userId));
      else if (originalRole === 'raf') setRafs(prev => prev.filter(r => r.id !== userId));

      const updatedUser = {
        id: userId,
        nom: nom.trim(),
        siteId,
        serviceId: role === 'responsable' ? serviceId : null,
        actif: editUserData.actif !== false,
        dateDesactivation: editUserData.dateDesactivation || null,
        historique: [
          { action: 'modification', date: now, parId: operator.id, parNom: operator.nom },
          ...(editUserData.historique || [])
        ]
      };

      if (role === 'agent') setAgents(prev => [...prev, updatedUser]);
      else if (role === 'responsable') setResponsables(prev => [...prev, updatedUser]);
      else if (role === 'raf') setRafs(prev => [...prev, updatedUser]);

      showToast(`Compte de "${nom.trim()}" mis à jour par ${operator.nom}.`, '✏️');
    } else {
      // Création
      let newId = '';
      if (role === 'agent') newId = `agent-${agents.length + 10}`;
      else if (role === 'responsable') newId = `resp-${responsables.length + 10}`;
      else if (role === 'raf') newId = `raf-${rafs.length + 10}`;

      const newUser = {
        id: newId,
        nom: nom.trim(),
        siteId,
        serviceId: role === 'responsable' ? serviceId : null,
        actif: true,
        dateDesactivation: null,
        historique: [
          { action: 'creation', date: now, parId: operator.id, parNom: operator.nom }
        ]
      };

      if (role === 'agent') setAgents(prev => [...prev, newUser]);
      else if (role === 'responsable') setResponsables(prev => [...prev, newUser]);
      else if (role === 'raf') setRafs(prev => [...prev, newUser]);

      showToast(`Compte "${nom.trim()}" créé avec succès par ${operator.nom}.`, '👤');
    }

    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h3>{editUserData ? `✏️ Modifier le Compte (${editUserData.nom})` : '👤 Nouveau Compte Utilisateur'}</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="modal-user-role">Rôle de l'utilisateur *</label>
              <select
                id="modal-user-role"
                className="form-control"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="agent">Agent Courrier</option>
                <option value="responsable">Responsable de Service</option>
                <option value="raf">Responsable Admin &amp; Financier (RAF)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="modal-user-site">Site de rattachement *</label>
              <select
                id="modal-user-site"
                className="form-control"
                value={siteId}
                onChange={(e) => setSiteId(e.target.value)}
                required
              >
                {sites.map(s => (
                  <option key={s.id} value={s.id}>{s.nom}</option>
                ))}
              </select>
            </div>

            {role === 'responsable' && (
              <div className="form-group">
                <label htmlFor="modal-user-service">Service géré *</label>
                <select
                  id="modal-user-service"
                  className="form-control"
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                  required
                >
                  <option value="">-- Sélectionner un service --</option>
                  {activeSiteServices.map(s => (
                    <option key={s.id} value={s.id}>{s.nom}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="modal-user-name">Nom complet *</label>
              <input
                type="text"
                id="modal-user-name"
                className="form-control"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Ex: Jean Dupont"
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-primary">
              {editUserData ? 'Enregistrer les modifications' : 'Créer le compte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
