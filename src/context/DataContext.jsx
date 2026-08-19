import React, { createContext, useState, useCallback } from 'react';

export const DataContext = createContext(null);

const INITIAL_SITES = [
  { id: 'paris', nom: 'Paris — Siège Social' },
  { id: 'lyon', nom: 'Lyon — Agence Rhône-Alpes' },
  { id: 'marseille', nom: 'Marseille — Agence PACA' }
];

const INITIAL_SERVICES = [
  // Site Paris
  { id: 'rh-paris', siteId: 'paris', nom: 'Ressources Humaines', actif: true, dateDesactivation: null, historique: [] },
  { id: 'fin-paris', siteId: 'paris', nom: 'Finance & Comptabilité', actif: true, dateDesactivation: null, historique: [] },
  { id: 'it-paris', siteId: 'paris', nom: 'Informatique & SI', actif: true, dateDesactivation: null, historique: [] },
  { id: 'dir-paris', siteId: 'paris', nom: 'Direction Générale', actif: true, dateDesactivation: null, historique: [] },
  // Site Lyon
  { id: 'rh-lyon', siteId: 'lyon', nom: 'Ressources Humaines', actif: true, dateDesactivation: null, historique: [] },
  { id: 'fin-lyon', siteId: 'lyon', nom: 'Finance & Comptabilité', actif: true, dateDesactivation: null, historique: [] },
  { id: 'com-lyon', siteId: 'lyon', nom: 'Communication & Ventes', actif: true, dateDesactivation: null, historique: [] },
  // Site Marseille
  { id: 'rh-marseille', siteId: 'marseille', nom: 'Ressources Humaines', actif: true, dateDesactivation: null, historique: [] },
  { id: 'tech-marseille', siteId: 'marseille', nom: 'Technique & Operations', actif: true, dateDesactivation: null, historique: [] },
  { id: 'fin-marseille', siteId: 'marseille', nom: 'Finance & Comptabilité', actif: true, dateDesactivation: null, historique: [] }
];

const INITIAL_TYPES_COURRIER = [
  { id: 'administratif', label: '📄 Administratif' },
  { id: 'financier', label: '💶 Financier' },
  { id: 'technique', label: '🔧 Technique' }
];

const INITIAL_RESPONSABLES = [
  { id: 'resp-1', nom: 'Thomas Dupont', siteId: 'paris', serviceId: 'rh-paris', actif: true, dateDesactivation: null, historique: [] },
  { id: 'resp-2', nom: 'Julie Moreau', siteId: 'paris', serviceId: 'rh-paris', actif: true, dateDesactivation: null, historique: [] },
  { id: 'resp-3', nom: 'Marc Vasseur', siteId: 'paris', serviceId: 'fin-paris', actif: true, dateDesactivation: null, historique: [] },
  { id: 'resp-4', nom: 'Sarah Cohen', siteId: 'paris', serviceId: 'it-paris', actif: true, dateDesactivation: null, historique: [] },
  { id: 'resp-5', nom: 'Antoine Bernard', siteId: 'lyon', serviceId: 'rh-lyon', actif: true, dateDesactivation: null, historique: [] },
  { id: 'resp-6', nom: 'Élodie Petit', siteId: 'marseille', serviceId: 'tech-marseille', actif: true, dateDesactivation: null, historique: [] }
];

const INITIAL_AGENTS = [
  { id: 'agent-1', nom: 'Sophie Martin', siteId: 'paris', actif: true, dateDesactivation: null, historique: [] },
  { id: 'agent-2', nom: 'Lucas Bernard', siteId: 'paris', actif: true, dateDesactivation: null, historique: [] },
  { id: 'agent-3', nom: 'Amélie Petit', siteId: 'lyon', actif: true, dateDesactivation: null, historique: [] },
  { id: 'agent-4', nom: 'Julien Moreau', siteId: 'marseille', actif: true, dateDesactivation: null, historique: [] }
];

const INITIAL_RAF_LIST = [
  { id: 'raf-1', nom: 'Nadia Benali', siteId: 'paris', actif: true, dateDesactivation: null, historique: [] },
  { id: 'raf-2', nom: 'Karim Mansouri', siteId: 'lyon', actif: true, dateDesactivation: null, historique: [] },
  { id: 'raf-3', nom: 'Valérie Dupont', siteId: 'marseille', actif: true, dateDesactivation: null, historique: [] }
];

const now = new Date();
function hoursAgoISO(hours) {
  return new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
}

const INITIAL_COURRIERS = [
  {
    id: 'CR-2026-001',
    siteId: 'paris',
    serviceIds: ['rh-paris', 'fin-paris'],
    expediteur: 'URSSAF Île-de-France',
    type: 'administratif',
    cotation: 'URSSAF-2026-0142',
    dateReception: hoursAgoISO(120),
    statut: 'reçu',
    commentaire: 'Vérifier la déclaration du T1 avec la comptabilité',
    fichier: 'attestation_urssaf.pdf',
    agentId: 'agent-1',
    agentNom: 'Sophie Martin',
    estDecharge: false,
    dateDecharge: null,
    dechargeParId: null,
    dechargeParNom: null
  },
  {
    id: 'CR-2026-002',
    siteId: 'paris',
    serviceIds: ['fin-paris'],
    expediteur: 'Banque Populaire',
    type: 'financier',
    cotation: 'BP-RELEVE-JAN',
    dateReception: hoursAgoISO(96),
    statut: 'distribué',
    commentaire: 'Relevé mensuel de compte principal',
    fichier: 'releve_janvier.pdf',
    agentId: 'agent-1',
    agentNom: 'Sophie Martin',
    estDecharge: true,
    dateDecharge: hoursAgoISO(90),
    dechargeParId: 'resp-3',
    dechargeParNom: 'Marc Vasseur'
  },
  {
    id: 'CR-2026-003',
    siteId: 'paris',
    serviceIds: ['it-paris'],
    expediteur: 'Orange Business Services',
    type: 'technique',
    cotation: 'OB-FAC-8821',
    dateReception: hoursAgoISO(72),
    statut: 'en cours',
    commentaire: 'Facture fibre optique en cours de validation',
    fichier: 'facture_orange.pdf',
    agentId: 'agent-2',
    agentNom: 'Lucas Bernard',
    estDecharge: true,
    dateDecharge: hoursAgoISO(65),
    dechargeParId: 'resp-4',
    dechargeParNom: 'Sarah Cohen'
  },
  {
    id: 'CR-2026-004',
    siteId: 'paris',
    serviceIds: ['dir-paris', 'fin-paris'],
    expediteur: 'Ministère de l\'Économie',
    type: 'administratif',
    cotation: 'MINECO-DG-2026-07',
    dateReception: hoursAgoISO(54),
    statut: 'reçu',
    commentaire: 'Urgent à faire lire par la direction',
    fichier: 'circulaire_ministere.pdf',
    agentId: 'agent-1',
    agentNom: 'Sophie Martin',
    estDecharge: false,
    dateDecharge: null,
    dechargeParId: null,
    dechargeParNom: null
  },
  {
    id: 'CR-2026-005',
    siteId: 'paris',
    serviceIds: ['rh-paris'],
    expediteur: 'CPAM Paris Extra-Muros',
    type: 'administratif',
    cotation: 'CPAM-AT-445',
    dateReception: hoursAgoISO(40),
    statut: 'distribué',
    commentaire: '',
    fichier: 'arret_travail.pdf',
    agentId: 'agent-1',
    agentNom: 'Sophie Martin',
    estDecharge: true,
    dateDecharge: hoursAgoISO(36),
    dechargeParId: 'resp-1',
    dechargeParNom: 'Thomas Dupont'
  },
  {
    id: 'CR-2026-006',
    siteId: 'paris',
    serviceIds: ['fin-paris'],
    expediteur: 'DGFiP - Centre des Impôts',
    type: 'financier',
    cotation: 'DGFIP-TAXE-2026',
    dateReception: hoursAgoISO(18),
    statut: 'reçu',
    commentaire: '',
    fichier: 'avis_imposition.pdf',
    agentId: 'agent-2',
    agentNom: 'Lucas Bernard',
    estDecharge: false,
    dateDecharge: null,
    dechargeParId: null,
    dechargeParNom: null
  },
  {
    id: 'CR-2026-007',
    siteId: 'paris',
    serviceIds: ['rh-paris'],
    expediteur: 'France Travail (Pôle Emploi)',
    type: 'administratif',
    cotation: 'FT-ATTEST-991',
    dateReception: hoursAgoISO(6),
    statut: 'reçu',
    commentaire: '',
    fichier: null,
    agentId: 'agent-1',
    agentNom: 'Sophie Martin',
    estDecharge: false,
    dateDecharge: null,
    dechargeParId: null,
    dechargeParNom: null
  }
];

export const DataProvider = ({ children }) => {
  const [sites] = useState(INITIAL_SITES);
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [typesCourrier, setTypesCourrier] = useState(INITIAL_TYPES_COURRIER);
  const [responsables, setResponsables] = useState(INITIAL_RESPONSABLES);
  const [agents, setAgents] = useState(INITIAL_AGENTS);
  const [rafs, setRafs] = useState(INITIAL_RAF_LIST);
  const [courriers, setCourriers] = useState(INITIAL_COURRIERS);

  // Toast state
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((msg, icon = 'ℹ️') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, msg, icon }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  return (
    <DataContext.Provider value={{
      sites,
      services,
      setServices,
      typesCourrier,
      setTypesCourrier,
      responsables,
      setResponsables,
      agents,
      setAgents,
      rafs,
      setRafs,
      courriers,
      setCourriers,
      toasts,
      showToast
    }}>
      {children}
    </DataContext.Provider>
  );
};
