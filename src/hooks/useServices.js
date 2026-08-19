import { useContext, useCallback } from 'react';
import { DataContext } from '../context/DataContext';
import { useAuth } from './useAuth';

export function useServices() {
  const { services, setServices, sites, responsables, setResponsables, courriers, setCourriers, showToast } = useContext(DataContext);
  const { getCurrentSessionOperator } = useAuth();

  const getService = useCallback((id) => services.find(s => s.id === id), [services]);
  const getSite = useCallback((id) => sites.find(s => s.id === id), [sites]);

  const getTargetSiteIdsFromScope = useCallback((scopeRadio, originSiteId, selectedSiteIds = []) => {
    if (scopeRadio === 'all') {
      return sites.map(s => s.id);
    } else if (scopeRadio === 'selected') {
      return selectedSiteIds;
    }
    return [originSiteId];
  }, [sites]);

  // Analyse et prépare la suppression de scope
  const prepareDeleteServiceScope = useCallback((originServiceId, scopeRadio, selectedSiteIds = []) => {
    const operator = getCurrentSessionOperator();
    if (!operator) {
      showToast('Action impossible : Vous devez être connecté avec un profil RAF ou PDG actif.', '🚫');
      return null;
    }

    const originService = getService(originServiceId);
    if (!originService) return null;

    const targetSiteIds = getTargetSiteIdsFromScope(scopeRadio, originService.siteId, selectedSiteIds);

    const unaffectedSites = [];
    const blockedSites = [];
    const directSites = [];
    const reallocSites = [];

    targetSiteIds.forEach(sId => {
      const siteObj = getSite(sId);
      const siteService = services.find(s => s.siteId === sId && s.nom.trim().toLowerCase() === originService.nom.trim().toLowerCase() && s.actif !== false);

      if (!siteService) {
        unaffectedSites.push({
          siteId: sId,
          siteNom: siteObj ? siteObj.nom : sId,
          reason: `aucun service actif nommé « ${originService.nom} » trouvé`
        });
      } else {
        const siteActiveServicesCount = services.filter(s => s.siteId === sId && s.actif !== false).length;

        if (siteActiveServicesCount <= 1) {
          blockedSites.push({
            siteId: sId,
            siteNom: siteObj ? siteObj.nom : sId,
            serviceId: siteService.id,
            serviceNom: siteService.nom,
            reason: 'dernier service du site'
          });
        } else {
          const attachedMails = courriers.filter(c => c.serviceIds.includes(siteService.id));
          const attachedResponsables = responsables.filter(r => r.serviceId === siteService.id && r.actif !== false);
          const otherServices = services.filter(s => s.siteId === sId && s.id !== siteService.id && s.actif !== false);

          if (attachedMails.length > 0 || attachedResponsables.length > 0) {
            reallocSites.push({
              siteId: sId,
              siteNom: siteObj ? siteObj.nom : sId,
              serviceId: siteService.id,
              serviceNom: siteService.nom,
              attachedMails,
              attachedResponsables,
              otherServices
            });
          } else {
            directSites.push({
              siteId: sId,
              siteNom: siteObj ? siteObj.nom : sId,
              serviceId: siteService.id,
              serviceNom: siteService.nom
            });
          }
        }
      }
    });

    return {
      originServiceName: originService.nom,
      targetSiteIds,
      unaffectedSites,
      blockedSites,
      directSites,
      reallocSites
    };
  }, [getCurrentSessionOperator, getService, getSite, getTargetSiteIdsFromScope, services, courriers, responsables, showToast]);

  // Exécute la désactivation sans réaffectation (sites directs)
  const executeDirectDeactivation = useCallback((directSites, operator) => {
    const now = new Date().toISOString();
    const deactivatedServiceIds = directSites.map(ds => ds.serviceId);

    setServices(prev => prev.map(s => {
      if (deactivatedServiceIds.includes(s.id)) {
        return {
          ...s,
          actif: false,
          dateDesactivation: now,
          historique: [
            { action: 'desactivation', date: now, parId: operator.id, parNom: operator.nom },
            ...(s.historique || [])
          ]
        };
      }
      return s;
    }));
  }, [setServices]);

  // Exécute la désactivation avec réaffectation
  const executeReallocationAndDeactivation = useCallback((reallocSelections, directSites, operator) => {
    const now = new Date().toISOString();

    // 1. Réaffecter les courriers et responsables par site
    reallocSelections.forEach(({ siteId, oldServiceId, newServiceId }) => {
      // Réaffecter les courriers
      setCourriers(prev => prev.map(c => {
        if (c.serviceIds.includes(oldServiceId)) {
          const updatedServices = Array.from(new Set(c.serviceIds.map(id => id === oldServiceId ? newServiceId : id)));
          return { ...c, serviceIds: updatedServices };
        }
        return c;
      }));

      // Réaffecter les responsables
      setResponsables(prev => prev.map(r => {
        if (r.serviceId === oldServiceId && r.actif !== false) {
          return { ...r, serviceId: newServiceId };
        }
        return r;
      }));
    });

    // 2. Désactiver tous les services (directs + réaffectés)
    const allServicesToDeactivate = [
      ...directSites.map(ds => ds.serviceId),
      ...reallocSelections.map(rs => rs.oldServiceId)
    ];

    setServices(prev => prev.map(s => {
      if (allServicesToDeactivate.includes(s.id)) {
        return {
          ...s,
          actif: false,
          dateDesactivation: now,
          historique: [
            { action: 'desactivation', date: now, parId: operator.id, parNom: operator.nom },
            ...(s.historique || [])
          ]
        };
      }
      return s;
    }));
  }, [setCourriers, setResponsables, setServices]);

  return {
    services,
    sites,
    getService,
    getSite,
    prepareDeleteServiceScope,
    executeDirectDeactivation,
    executeReallocationAndDeactivation
  };
}
