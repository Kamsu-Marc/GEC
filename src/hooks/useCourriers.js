import { useContext, useCallback } from 'react';
import { DataContext } from '../context/DataContext';

export function useCourriers() {
  const { courriers, setCourriers, agents, responsables, showToast } = useContext(DataContext);

  const addCourrier = useCallback((newCourrierData) => {
    const nextNum = courriers.length + 1;
    const newId = `CR-2026-${String(nextNum).padStart(3, '0')}`;
    const agentObj = agents.find(a => a.id === newCourrierData.agentId);

    const newRecord = {
      id: newId,
      siteId: newCourrierData.siteId,
      serviceIds: newCourrierData.serviceIds,
      expediteur: newCourrierData.expediteur,
      type: newCourrierData.type,
      cotation: newCourrierData.cotation || 'SANS-COTATION',
      dateReception: new Date().toISOString(),
      statut: 'reçu',
      commentaire: newCourrierData.commentaire || '',
      fichier: newCourrierData.fichier || null,
      agentId: newCourrierData.agentId,
      agentNom: agentObj ? agentObj.nom : 'Agent Inconnu',
      estDecharge: false,
      dateDecharge: null,
      dechargeParId: null,
      dechargeParNom: null
    };

    setCourriers(prev => [newRecord, ...prev]);
    showToast(`Courrier ${newId} enregistré avec succès !`, '✅');
    return newRecord;
  }, [courriers.length, agents, setCourriers, showToast]);

  const updateStatutCourrier = useCallback((courrierId, newStatut, comment) => {
    setCourriers(prev => prev.map(c => {
      if (c.id === courrierId) {
        return {
          ...c,
          statut: newStatut,
          commentaire: comment !== undefined ? comment : c.commentaire
        };
      }
      return c;
    }));
    showToast(`Statut du courrier ${courrierId} mis à jour : ${newStatut}`, '🔄');
  }, [setCourriers, showToast]);

  const accuseReceipt = useCallback((courrierId, responsableId) => {
    const respObj = responsables.find(r => r.id === responsableId);
    if (!respObj) return false;

    const now = new Date().toISOString();

    setCourriers(prev => prev.map(c => {
      if (c.id === courrierId) {
        return {
          ...c,
          statut: c.statut === 'reçu' ? 'distribué' : c.statut,
          estDecharge: true,
          dateDecharge: now,
          dechargeParId: respObj.id,
          dechargeParNom: respObj.nom
        };
      }
      return c;
    }));

    showToast(`Accusé de réception signé pour le courrier ${courrierId} par ${respObj.nom}`, '✍️');
    return true;
  }, [responsables, setCourriers, showToast]);

  return {
    courriers,
    addCourrier,
    updateStatutCourrier,
    accuseReceipt
  };
}
