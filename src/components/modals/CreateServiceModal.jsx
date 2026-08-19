import React, { useState, useEffect, useContext } from 'react';
import { DataContext } from '../../context/DataContext';
import { AuthContext } from '../../context/AuthContext';
import { supabase } from '../../config/supabaseClient';

export const CreateServiceModal = ({ isOpen, onClose }) => {
  const { setServices, showToast } = useContext(DataContext);
  const { activeSiteId, sites, getCurrentSessionOperator } = useContext(AuthContext);

  const [nom, setNom] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNom('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const activeSiteObj = sites?.find(s => s.id === activeSiteId);
  const siteName = activeSiteObj ? activeSiteObj.nom : (activeSiteId || 'Site actif');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const operator = getCurrentSessionOperator();

    if (!nom.trim()) {
      showToast('Veuillez saisir un nom de service.', '⚠️');
      return;
    }

    setLoading(true);

    try {
      // Insertion stricte dans Supabase avec récupération du tuple créé
      const { data, error } = await supabase
        .from('services')
        .insert([
          {
            site_id: activeSiteId,
            nom: nom.trim(),
            actif: true
          }
        ])
        .select();

      // 1. Si Supabase renvoie une erreur (RLS, contrainte, réseau, etc.)
      if (error) {
        showToast(`Erreur lors de la création du service : ${error.message}`, '❌');
        return; // On arrête l'exécution sans fermer la modal ni modifier le state local
      }

      // 3. Vérification que data contient la ligne insérée
      if (!data || data.length === 0) {
        showToast('Erreur lors de la création du service : Aucune donnée retournée par Supabase.', '❌');
        return; // On n'ajoute rien au state local
      }

      const insertedService = data[0];
      const now = new Date().toISOString();

      // 4. Utilisation stricte de l'UUID généré par Supabase (data[0].id)
      const newService = {
        id: insertedService.id,
        siteId: insertedService.site_id || activeSiteId,
        nom: insertedService.nom || nom.trim(),
        actif: insertedService.actif !== undefined ? insertedService.actif : true,
        dateDesactivation: null,
        historique: [
          { action: 'creation', date: now, parId: operator?.id || 'raf', parNom: operator?.nom || 'RAF' }
        ]
      };

      // Succès confirmé : mise à jour de l'état local et fermeture de la modal
      setServices(prev => [...prev, newService]);
      showToast(`Service « ${newService.nom} » créé avec succès.`, '🏢');
      onClose();
    } catch (err) {
      // 2. Erreur réseau ou exception inattendue : aucun fallback local trompeur
      console.error('Erreur inattendue lors de la création du service:', err);
      showToast(`Erreur lors de la création du service : ${err.message || 'Erreur réseau/inconnue'}`, '❌');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-header">
          <h3>🏢 Nouveau Service du Site</h3>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label htmlFor="modal-service-site">Site de rattachement</label>
              <input
                type="text"
                id="modal-service-site"
                className="form-control"
                value={siteName}
                readOnly
                disabled
                style={{ backgroundColor: '#f1f5f9', cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="modal-service-name">Nom du service *</label>
              <input
                type="text"
                id="modal-service-name"
                className="form-control"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Ex: Logistique & Approvisionnement"
                required
                autoFocus
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Création en cours...' : 'Créer le service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
