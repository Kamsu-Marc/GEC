import { useContext, useCallback } from 'react';
import { DataContext } from '../context/DataContext';
import { useAuth } from './useAuth';

export function useUsers() {
  const { agents, setAgents, responsables, setResponsables, rafs, setRafs, showToast } = useContext(DataContext);
  const { getCurrentSessionOperator, activeAgentId, setActiveAgentId, activeResponsableId, setActiveResponsableId, activeRafId, setActiveRafId } = useAuth();

  const getAgent = useCallback((id) => agents.find(a => a.id === id), [agents]);
  const getResponsable = useCallback((id) => responsables.find(r => r.id === id), [responsables]);
  const getRaf = useCallback((id) => rafs.find(r => r.id === id), [rafs]);

  const softDeleteUser = useCallback((userId, role) => {
    const operator = getCurrentSessionOperator();
    if (!operator) {
      showToast('Action impossible : Vous devez être connecté avec un profil RAF ou PDG actif pour modifier le statut du personnel.', '🚫');
      return false;
    }

    let u = null;
    if (role === 'agent') u = getAgent(userId);
    else if (role === 'responsable') u = getResponsable(userId);
    else if (role === 'raf') u = getRaf(userId);

    if (!u) return false;

    const now = new Date().toISOString();
    const historyEntry = {
      action: 'desactivation',
      date: now,
      parId: operator.id,
      parNom: operator.nom
    };

    if (role === 'agent') {
      setAgents(prev => prev.map(a => a.id === userId ? {
        ...a,
        actif: false,
        dateDesactivation: now,
        historique: [historyEntry, ...(a.historique || [])]
      } : a));
      if (activeAgentId === userId) setActiveAgentId(null);
    } else if (role === 'responsable') {
      setResponsables(prev => prev.map(r => r.id === userId ? {
        ...r,
        actif: false,
        dateDesactivation: now,
        historique: [historyEntry, ...(r.historique || [])]
      } : r));
      if (activeResponsableId === userId) setActiveResponsableId(null);
    } else if (role === 'raf') {
      setRafs(prev => prev.map(rf => rf.id === userId ? {
        ...rf,
        actif: false,
        dateDesactivation: now,
        historique: [historyEntry, ...(rf.historique || [])]
      } : rf));
      if (activeRafId === userId) setActiveRafId(null);
    }

    showToast(`Compte de "${u.nom}" désactivé par ${operator.nom}. Mode déconnecté activé.`, '🔒');
    return true;
  }, [getCurrentSessionOperator, getAgent, getResponsable, getRaf, setAgents, setResponsables, setRafs, activeAgentId, setActiveAgentId, activeResponsableId, setActiveResponsableId, activeRafId, setActiveRafId, showToast]);

  const reactivateUser = useCallback((userId, role) => {
    const operator = getCurrentSessionOperator();
    if (!operator) {
      showToast('Action impossible : Vous devez être connecté avec un profil RAF ou PDG actif pour modifier le statut du personnel.', '🚫');
      return false;
    }

    let u = null;
    if (role === 'agent') u = getAgent(userId);
    else if (role === 'responsable') u = getResponsable(userId);
    else if (role === 'raf') u = getRaf(userId);

    if (!u) return false;

    const now = new Date().toISOString();
    const historyEntry = {
      action: 'reactivation',
      date: now,
      parId: operator.id,
      parNom: operator.nom
    };

    if (role === 'agent') {
      setAgents(prev => prev.map(a => a.id === userId ? {
        ...a,
        actif: true,
        dateDesactivation: null,
        historique: [historyEntry, ...(a.historique || [])]
      } : a));
    } else if (role === 'responsable') {
      setResponsables(prev => prev.map(r => r.id === userId ? {
        ...r,
        actif: true,
        dateDesactivation: null,
        historique: [historyEntry, ...(r.historique || [])]
      } : r));
    } else if (role === 'raf') {
      setRafs(prev => prev.map(rf => rf.id === userId ? {
        ...rf,
        actif: true,
        dateDesactivation: null,
        historique: [historyEntry, ...(rf.historique || [])]
      } : rf));
    }

    showToast(`Compte de "${u.nom}" réactivé par ${operator.nom}. (Connexion manuelle requise)`, '✅');
    return true;
  }, [getCurrentSessionOperator, getAgent, getResponsable, getRaf, setAgents, setResponsables, setRafs, showToast]);

  return {
    agents,
    responsables,
    rafs,
    getAgent,
    getResponsable,
    getRaf,
    softDeleteUser,
    reactivateUser
  };
}
