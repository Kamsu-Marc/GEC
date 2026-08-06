(() => {
  'use strict';

  // ══════════════════════════════════════════════════════════════════
  // SYSTEM DATA & STATE — MULTI-SITES, SERVICES, AGENTS & RESPONSABLES
  // ══════════════════════════════════════════════════════════════════

  const SITES = [
    { id: 'paris', nom: 'Paris — Siège Social' },
    { id: 'lyon', nom: 'Lyon — Agence Rhône-Alpes' },
    { id: 'marseille', nom: 'Marseille — Agence PACA' }
  ];

  let SERVICES = [
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

  let TYPES_COURRIER = [
    { id: 'administratif', label: '📄 Administratif' },
    { id: 'financier', label: '💶 Financier' },
    { id: 'technique', label: '🔧 Technique' }
  ];

  // Soft Delete model on Responsables (actif: boolean, dateDesactivation: string|null, historique: Array)
  let RESPONSABLES = [
    { id: 'resp-1', nom: 'Thomas Dupont', siteId: 'paris', serviceId: 'rh-paris', actif: true, dateDesactivation: null, historique: [] },
    { id: 'resp-2', nom: 'Julie Moreau', siteId: 'paris', serviceId: 'rh-paris', actif: true, dateDesactivation: null, historique: [] },
    { id: 'resp-3', nom: 'Marc Vasseur', siteId: 'paris', serviceId: 'fin-paris', actif: true, dateDesactivation: null, historique: [] },
    { id: 'resp-4', nom: 'Sarah Cohen', siteId: 'paris', serviceId: 'it-paris', actif: true, dateDesactivation: null, historique: [] },
    { id: 'resp-5', nom: 'Antoine Bernard', siteId: 'lyon', serviceId: 'rh-lyon', actif: true, dateDesactivation: null, historique: [] },
    { id: 'resp-6', nom: 'Élodie Petit', siteId: 'marseille', serviceId: 'tech-marseille', actif: true, dateDesactivation: null, historique: [] }
  ];

  // Soft Delete model on Agents (actif: boolean, dateDesactivation: string|null, historique: Array)
  let AGENTS = [
    { id: 'agent-1', nom: 'Sophie Martin', siteId: 'paris', actif: true, dateDesactivation: null, historique: [] },
    { id: 'agent-2', nom: 'Lucas Bernard', siteId: 'paris', actif: true, dateDesactivation: null, historique: [] },
    { id: 'agent-3', nom: 'Amélie Petit', siteId: 'lyon', actif: true, dateDesactivation: null, historique: [] },
    { id: 'agent-4', nom: 'Julien Moreau', siteId: 'marseille', actif: true, dateDesactivation: null, historique: [] }
  ];

  // Soft Delete model on RAF (actif: boolean, dateDesactivation: string|null, historique: Array)
  let RAF_LIST = [
    { id: 'raf-1', nom: 'Nadia Benali', siteId: 'paris', actif: true, dateDesactivation: null, historique: [] },
    { id: 'raf-2', nom: 'Karim Mansouri', siteId: 'lyon', actif: true, dateDesactivation: null, historique: [] },
    { id: 'raf-3', nom: 'Valérie Dupont', siteId: 'marseille', actif: true, dateDesactivation: null, historique: [] }
  ];

  const UTILISATEURS = {
    agent: { roleLabel: 'Agent Courrier' },
    responsable: { roleLabel: 'Responsable de Service' },
    raf: { roleLabel: 'Responsable Admin. & Financier (RAF)' },
    pdg: { nom: 'Philippe Leroy', roleLabel: 'Président Directeur Général (PDG)' }
  };

  const now = new Date();

  function hoursAgoISO(hours) {
    const d = new Date(now.getTime() - hours * 60 * 60 * 1000);
    return d.toISOString();
  }

  // Realistic mock mail records with full traceability:
  // - agentId & agentNom (Captured at creation)
  // - estDecharge, dateDecharge, dechargeParId, dechargeParNom (Captured at discharge)
  let courriers = [
    {
      id: 'CR-2026-001',
      siteId: 'paris',
      serviceIds: ['rh-paris', 'fin-paris'],
      expediteur: 'URSSAF Île-de-France',
      type: 'administratif',
      cotation: 'URSSAF-2026-0142',
      dateReception: hoursAgoISO(120), // >48h non traité -> RETARD
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
      dateReception: hoursAgoISO(72), // >48h -> RETARD
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
      dateReception: hoursAgoISO(54), // >48h -> RETARD
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
    },
    {
      id: 'CR-2026-008',
      siteId: 'lyon',
      serviceIds: ['rh-lyon', 'fin-lyon'],
      expediteur: 'MSA Rhône-Alpes',
      type: 'administratif',
      cotation: 'MSA-RH-882',
      dateReception: hoursAgoISO(144), // >48h -> RETARD
      statut: 'reçu',
      commentaire: 'Relance sur dossier cotisations',
      fichier: 'declaration_msa.pdf',
      agentId: 'agent-3',
      agentNom: 'Amélie Petit',
      estDecharge: false,
      dateDecharge: null,
      dechargeParId: null,
      dechargeParNom: null
    },
    {
      id: 'CR-2026-009',
      siteId: 'lyon',
      serviceIds: ['fin-lyon'],
      expediteur: 'Crédit Agricole Centre-Est',
      type: 'financier',
      cotation: 'CA-EXT-2026-03',
      dateReception: hoursAgoISO(110),
      statut: 'distribué',
      commentaire: 'Extrait de compte trimestriel transmis au comptable',
      fichier: 'extrait_compte.pdf',
      agentId: 'agent-3',
      agentNom: 'Amélie Petit',
      estDecharge: true,
      dateDecharge: hoursAgoISO(100),
      dechargeParId: 'resp-5',
      dechargeParNom: 'Antoine Bernard'
    },
    {
      id: 'CR-2026-010',
      siteId: 'lyon',
      serviceIds: ['com-lyon'],
      expediteur: 'Agence RP & Influence Lyon',
      type: 'administratif',
      cotation: 'RPC-DEV-2026',
      dateReception: hoursAgoISO(30),
      statut: 'en cours',
      commentaire: 'Proposition commerciale campagne salon',
      fichier: 'devis_rp.pdf',
      agentId: 'agent-3',
      agentNom: 'Amélie Petit',
      estDecharge: true,
      dateDecharge: hoursAgoISO(28),
      dechargeParId: 'resp-5',
      dechargeParNom: 'Antoine Bernard'
    },
    {
      id: 'CR-2026-011',
      siteId: 'lyon',
      serviceIds: ['rh-lyon'],
      expediteur: 'Inspection du Travail Lyon 3',
      type: 'administratif',
      cotation: 'INSP-TRAV-772',
      dateReception: hoursAgoISO(12),
      statut: 'reçu',
      commentaire: '',
      fichier: 'convocation_inspection.pdf',
      agentId: 'agent-3',
      agentNom: 'Amélie Petit',
      estDecharge: false,
      dateDecharge: null,
      dechargeParId: null,
      dechargeParNom: null
    },
    {
      id: 'CR-2026-012',
      siteId: 'marseille',
      serviceIds: ['tech-marseille', 'fin-marseille'],
      expediteur: 'EDF Entreprises PACA',
      type: 'technique',
      cotation: 'EDF-CONT-2026',
      dateReception: hoursAgoISO(168), // >48h -> RETARD
      statut: 'reçu',
      commentaire: 'Avenant contrat d\'énergie agence',
      fichier: 'contrat_edf.pdf',
      agentId: 'agent-4',
      agentNom: 'Julien Moreau',
      estDecharge: false,
      dateDecharge: null,
      dechargeParId: null,
      dechargeParNom: null
    },
    {
      id: 'CR-2026-013',
      siteId: 'marseille',
      serviceIds: ['fin-marseille'],
      expediteur: 'Cabinet Audit & Expertise Marseille',
      type: 'financier',
      cotation: 'EC-BILAN-2025',
      dateReception: hoursAgoISO(90),
      statut: 'distribué',
      commentaire: 'Bilan comptable révisé',
      fichier: 'bilan_2025.pdf',
      agentId: 'agent-4',
      agentNom: 'Julien Moreau',
      estDecharge: true,
      dateDecharge: hoursAgoISO(85),
      dechargeParId: 'resp-6',
      dechargeParNom: 'Élodie Petit'
    },
    {
      id: 'CR-2026-014',
      siteId: 'marseille',
      serviceIds: ['rh-marseille'],
      expediteur: 'OPCO Atlas Formations',
      type: 'administratif',
      cotation: 'OPCO-FORM-118',
      dateReception: hoursAgoISO(80),
      statut: 'traité',
      commentaire: 'Prise en charge validée et classée',
      fichier: 'convention_formation.pdf',
      agentId: 'agent-4',
      agentNom: 'Julien Moreau',
      estDecharge: true,
      dateDecharge: hoursAgoISO(75),
      dechargeParId: 'resp-6',
      dechargeParNom: 'Élodie Petit'
    },
    {
      id: 'CR-2026-015',
      siteId: 'marseille',
      serviceIds: ['tech-marseille'],
      expediteur: 'Veolia Environnement Méditerranée',
      type: 'technique',
      cotation: 'VEO-FAC-3301',
      dateReception: hoursAgoISO(4),
      statut: 'reçu',
      commentaire: '',
      fichier: 'facture_veolia.pdf',
      agentId: 'agent-4',
      agentNom: 'Julien Moreau',
      estDecharge: false,
      dateDecharge: null,
      dechargeParId: null,
      dechargeParNom: null
    },
    {
      id: 'CR-2026-016',
      siteId: 'paris',
      serviceIds: ['it-paris'],
      expediteur: 'Microsoft France Cloud',
      type: 'technique',
      cotation: 'MS-LIC-REN-2026',
      dateReception: hoursAgoISO(42),
      statut: 'traité',
      commentaire: 'Renouvellement 365 effectif',
      fichier: 'licence_ms.pdf',
      agentId: 'agent-2',
      agentNom: 'Lucas Bernard',
      estDecharge: true,
      dateDecharge: hoursAgoISO(40),
      dechargeParId: 'resp-4',
      dechargeParNom: 'Sarah Cohen'
    }
  ];

  let nextCounter = 17;
  let activeRole = 'agent';
  let activeSiteId = 'paris';
  let activeServiceId = 'rh-paris';

  // Active Users — null represents explicit LOGOUT state (NO FALLBACKS!)
  let activeAgentId = 'agent-1';
  let activeResponsableId = 'resp-1';
  let activeRafId = 'raf-1';

  let respFilter = 'all';
  let pendingModalMailId = null;

  // Multi-site Scope State for Service CRUD
  let pendingServiceAction = null; // 'create' | 'edit' | 'delete'
  let pendingServiceScopeData = null;

  // ══════════════════════════════════════════════════════════════════
  // HELPER UTILITIES
  // ══════════════════════════════════════════════════════════════════

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => document.querySelectorAll(selector);

  function getSite(id) {
    return SITES.find((s) => s.id === id) || SITES[0];
  }

  function getService(id) {
    return SERVICES.find((s) => s.id === id);
  }

  function getResponsable(id) {
    if (!id) return null;
    return RESPONSABLES.find((r) => r.id === id) || null;
  }

  function getAgent(id) {
    if (!id) return null;
    return AGENTS.find((a) => a.id === id) || null;
  }

  function getRaf(id) {
    if (!id) return null;
    return RAF_LIST.find((r) => r.id === id) || null;
  }

  function formatDateFull(isoStr) {
    if (!isoStr) return '—';
    const d = new Date(isoStr);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function formatDateShort(isoStr) {
    if (!isoStr) return '—';
    const d = new Date(isoStr);
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  function getHoursElapsed(isoStr) {
    const d = new Date(isoStr);
    return (now.getTime() - d.getTime()) / (1000 * 60 * 60);
  }

  function isMailOverdue(mail) {
    return mail.statut !== 'traité' && getHoursElapsed(mail.dateReception) > 48;
  }

  function formatDelayText(isoStr) {
    const hours = Math.floor(getHoursElapsed(isoStr));
    if (hours < 24) return `${hours} h`;
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return remHours > 0 ? `${days} j ${remHours} h` : `${days} j`;
  }

  const STATUS_LABELS = {
    'reçu': 'Reçu',
    'distribué': 'Déchargé',
    'en cours': 'En cours',
    'traité': 'Traité'
  };

  function renderStatusPill(statut) {
    const cssClass = {
      'reçu': 'status-recu',
      'distribué': 'status-distribue',
      'en cours': 'status-encours',
      'traité': 'status-traite'
    }[statut] || 'status-recu';

    const icon = {
      'reçu': '📥',
      'distribué': '📬',
      'en cours': '⏳',
      'traité': '✅'
    }[statut] || '';

    return `<span class="status-pill ${cssClass}">${icon} ${STATUS_LABELS[statut] || statut}</span>`;
  }

  function renderTypeLabel(typeId) {
    const found = TYPES_COURRIER.find(t => t.id === typeId);
    if (found) return found.label;
    return `📄 ${typeId.charAt(0).toUpperCase() + typeId.slice(1)}`;
  }

  function renderServiceBadges(serviceIds) {
    if (!serviceIds || !serviceIds.length) return '—';
    return serviceIds.map(sId => {
      const s = getService(sId);
      return `<span class="service-badge-tag">${s ? escapeHtml(s.nom) : sId}</span>`;
    }).join(' ');
  }

  function renderUserBadgeWithStatus(name, userId, userType) {
    if (!name && !userId) return '<span class="inactive-tag">Inconnu</span>';
    const user = userType === 'agent' ? getAgent(userId) : getResponsable(userId);
    const isInactive = user && user.actif === false;
    return `${escapeHtml(name || (user ? user.nom : 'Utilisateur'))} ${isInactive ? '<span class="inactive-tag">(inactif)</span>' : ''}`;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function showToast(message, icon = 'ℹ️') {
    const container = $('#toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.innerHTML = `<span>${icon}</span> <span>${escapeHtml(message)}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  function triggerBellPulse() {
    const counter = $('#notif-count');
    if (counter) {
      counter.classList.add('pulse');
      setTimeout(() => counter.classList.remove('pulse'), 500);
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // DROPDOWNS & ACTIVE SELECTION (SITE-SCOPED & PRIORITY LOGOUT)
  // ══════════════════════════════════════════════════════════════════

  function populateTypesDropdown() {
    const typeSelect = $('#type-courrier');
    if (typeSelect) {
      typeSelect.innerHTML = '<option value="">-- Choisir le type --</option>' +
        TYPES_COURRIER.map(t => `<option value="${t.id}">${t.label}</option>`).join('');
    }
  }

  function populateContextDropdowns() {
    const siteSelect = $('#ctx-site-select');
    const pdgSiteFilter = $('#pdg-site-filter');
    const pdgServiceFilter = $('#pdg-service-filter');

    if (siteSelect) {
      siteSelect.innerHTML = SITES.map(s => `<option value="${s.id}">${s.nom}</option>`).join('');
      siteSelect.value = activeSiteId;
    }

    if (pdgSiteFilter) {
      pdgSiteFilter.innerHTML = '<option value="all">Tous les sites (Global Groupe)</option>' +
        SITES.map(s => `<option value="${s.id}">${s.nom}</option>`).join('');
    }

    populateTypesDropdown();
    updateServicesForActiveSite();
    populateAgentsDropdown();
    populateResponsablesDropdown();
    populateRafDropdown();

    if (pdgServiceFilter) {
      pdgServiceFilter.innerHTML = '<option value="all">Tous les services (Global)</option>' +
        SERVICES.map(s => `<option value="${s.id}">${s.nom} (${getSite(s.siteId).nom.split(' ')[0]})</option>`).join('');
    }
  }

  // POPULATE AGENTS: Restrict to activeSiteId & Preserve activeAgentId === null (LOGOUT)
  function populateAgentsDropdown() {
    const agentSelect = $('#ctx-agent-select');
    if (!agentSelect) return;

    // Filter active agents for the ACTIVE SITE ONLY
    const siteAgents = AGENTS.filter(a => a.siteId === activeSiteId && a.actif !== false);
    const activeAgentObj = getAgent(activeAgentId);

    // Auto-reassignment logic: ONLY if activeAgentId was NOT null, but user is deactivated or no longer on this site
    if (activeAgentId !== null) {
      const isCurrentValidForSite = siteAgents.some(a => a.id === activeAgentId);
      if (!isCurrentValidForSite) {
        if (siteAgents.length > 0) {
          activeAgentId = siteAgents[0].id; // Reassign to first valid agent on new site
        } else {
          // No active agents exist on this site -> Force logged out state
          activeAgentId = null;
        }
      }
    }

    // Build Dropdown HTML with optgroups and Action options
    let optionsHtml = '';

    if (siteAgents.length === 0) {
      optionsHtml += `<option value="__logout_state" ${activeAgentId === null ? 'selected' : ''}>🔒 Aucun agent actif sur ce site</option>`;
    } else {
      optionsHtml += `<option value="__logout_state" ${activeAgentId === null ? 'selected' : ''}>🔒 Non connecté (Choisir un compte...)</option>`;
      optionsHtml += `<optgroup label="Personnel actif (${getSite(activeSiteId).nom.split(' ')[0]})">`;
      optionsHtml += siteAgents.map(a => `<option value="${a.id}" ${a.id === activeAgentId ? 'selected' : ''}>${escapeHtml(a.nom)}</option>`).join('');
      optionsHtml += `</optgroup>`;
    }

    optionsHtml += `<optgroup label="⚡ Actions">`;
    optionsHtml += `<option value="__action_add">➕ Ajouter un agent sur ce site...</option>`;
    if (activeAgentId && activeAgentObj) {
      optionsHtml += `<option value="__action_edit">✏️ Modifier la fiche de ${escapeHtml(activeAgentObj.nom)}</option>`;
      optionsHtml += `<option value="__action_logout">🚪 Se déconnecter (${escapeHtml(activeAgentObj.nom)})</option>`;
    }
    optionsHtml += `</optgroup>`;

    agentSelect.innerHTML = optionsHtml;
    agentSelect.value = activeAgentId ? activeAgentId : '__logout_state';
  }

  // POPULATE RESPONSABLES: Restrict to activeSiteId & Preserve activeResponsableId === null (LOGOUT)
  function populateResponsablesDropdown() {
    const respSelect = $('#ctx-resp-select');
    if (!respSelect) return;

    // Filter active responsables for the ACTIVE SITE ONLY
    const siteResponsables = RESPONSABLES.filter(r => r.siteId === activeSiteId && r.actif !== false);
    const activeRespObj = getResponsable(activeResponsableId);

    // Auto-reassignment logic: ONLY if activeResponsableId was NOT null, but user is deactivated or no longer on this site
    if (activeResponsableId !== null) {
      const isCurrentValidForSite = siteResponsables.some(r => r.id === activeResponsableId);
      if (!isCurrentValidForSite) {
        if (siteResponsables.length > 0) {
          activeResponsableId = siteResponsables[0].id;
          activeServiceId = siteResponsables[0].serviceId;
        } else {
          // No active responsables exist on this site -> Force logged out state
          activeResponsableId = null;
        }
      }
    }

    // Build Dropdown HTML with optgroups and Action options
    let optionsHtml = '';

    if (siteResponsables.length === 0) {
      optionsHtml += `<option value="__logout_state" ${activeResponsableId === null ? 'selected' : ''}>🔒 Aucun responsable actif sur ce site</option>`;
    } else {
      optionsHtml += `<option value="__logout_state" ${activeResponsableId === null ? 'selected' : ''}>🔒 Non connecté (Choisir un compte...)</option>`;
      optionsHtml += `<optgroup label="Personnel actif (${getSite(activeSiteId).nom.split(' ')[0]})">`;
      optionsHtml += siteResponsables.map(r => {
        const s = getService(r.serviceId);
        return `<option value="${r.id}" ${r.id === activeResponsableId ? 'selected' : ''}>${escapeHtml(r.nom)} — ${s ? escapeHtml(s.nom) : 'Sans service'}</option>`;
      }).join('');
      optionsHtml += `</optgroup>`;
    }

    optionsHtml += `<optgroup label="⚡ Actions">`;
    optionsHtml += `<option value="__action_add">➕ Ajouter un responsable sur ce site...</option>`;
    if (activeResponsableId && activeRespObj) {
      optionsHtml += `<option value="__action_edit">✏️ Modifier la fiche de ${escapeHtml(activeRespObj.nom)}</option>`;
      optionsHtml += `<option value="__action_logout">🚪 Se déconnecter (${escapeHtml(activeRespObj.nom)})</option>`;
    }
    optionsHtml += `</optgroup>`;

    respSelect.innerHTML = optionsHtml;
    respSelect.value = activeResponsableId ? activeResponsableId : '__logout_state';
  }

  // POPULATE RAF: Restrict to activeSiteId & Preserve activeRafId === null (LOGOUT)
  function populateRafDropdown() {
    const rafSelect = $('#ctx-raf-select');
    if (!rafSelect) return;

    // Filter active RAFs for the ACTIVE SITE ONLY
    const siteRafs = RAF_LIST.filter(r => r.siteId === activeSiteId && r.actif !== false);
    const activeRafObj = getRaf(activeRafId);

    // Auto-reassignment logic: ONLY if activeRafId was NOT null, but user is deactivated or no longer on this site
    if (activeRafId !== null) {
      const isCurrentValidForSite = siteRafs.some(r => r.id === activeRafId);
      if (!isCurrentValidForSite) {
        if (siteRafs.length > 0) {
          activeRafId = siteRafs[0].id;
        } else {
          // No active RAFs exist on this site -> Force logged out state
          activeRafId = null;
        }
      }
    }

    // Build Dropdown HTML with optgroups and Action options
    let optionsHtml = '';

    if (siteRafs.length === 0) {
      optionsHtml += `<option value="__logout_state" ${activeRafId === null ? 'selected' : ''}>🔒 Aucun RAF actif sur ce site</option>`;
    } else {
      optionsHtml += `<option value="__logout_state" ${activeRafId === null ? 'selected' : ''}>🔒 Non connecté (Choisir un compte...)</option>`;
      optionsHtml += `<optgroup label="Personnel actif (${getSite(activeSiteId).nom.split(' ')[0]})">`;
      optionsHtml += siteRafs.map(r => `<option value="${r.id}" ${r.id === activeRafId ? 'selected' : ''}>${escapeHtml(r.nom)}</option>`).join('');
      optionsHtml += `</optgroup>`;
    }

    optionsHtml += `<optgroup label="⚡ Actions">`;
    optionsHtml += `<option value="__action_add">➕ Ajouter un RAF sur ce site...</option>`;
    if (activeRafId && activeRafObj) {
      optionsHtml += `<option value="__action_edit">✏️ Modifier la fiche de ${escapeHtml(activeRafObj.nom)}</option>`;
      optionsHtml += `<option value="__action_logout">🚪 Se déconnecter (${escapeHtml(activeRafObj.nom)})</option>`;
    }
    optionsHtml += `</optgroup>`;

    rafSelect.innerHTML = optionsHtml;
    rafSelect.value = activeRafId ? activeRafId : '__logout_state';
  }

  function updateServicesForActiveSite() {
    const serviceSelect = $('#ctx-service-select');
    const multiBox = $('#service-dest-multi-box');
    const rafServiceFilter = $('#raf-service-filter');

    const availableServices = SERVICES.filter(s => s.siteId === activeSiteId && s.actif !== false);

    if (serviceSelect) {
      serviceSelect.innerHTML = availableServices.map(s => `<option value="${s.id}">${s.nom}</option>`).join('');
      if (availableServices.some(s => s.id === activeServiceId)) {
        serviceSelect.value = activeServiceId;
      } else if (availableServices.length > 0) {
        activeServiceId = availableServices[0].id;
        serviceSelect.value = activeServiceId;
      }
    }

    // Agent Form Multi-select Checkboxes
    if (multiBox) {
      if (availableServices.length === 0) {
        multiBox.innerHTML = '<p class="empty-state">Aucun service sur ce site. Cliquez sur "+ Créer un service".</p>';
      } else {
        multiBox.innerHTML = availableServices.map((s, idx) => `
          <label class="checkbox-pill">
            <input type="checkbox" name="service-dest-check" value="${s.id}" ${idx === 0 ? 'checked' : ''}>
            <span>${escapeHtml(s.nom)}</span>
          </label>
        `).join('');
      }
    }

    if (rafServiceFilter) {
      rafServiceFilter.innerHTML = '<option value="all">Tous les services du site</option>' +
        availableServices.map(s => `<option value="${s.id}">${s.nom}</option>`).join('');
    }
  }

  function updateNotificationBadges() {
    const agentNew = courriers.filter(c => c.siteId === activeSiteId && c.statut === 'reçu').length;
    const respNew = courriers.filter(c => c.serviceIds.includes(activeServiceId) && c.statut === 'reçu').length;
    const rafOverdue = courriers.filter(c => c.siteId === activeSiteId && isMailOverdue(c)).length;
    const pdgOverdue = courriers.filter(isMailOverdue).length;

    const badgeResp = $('#badge-resp-tab');
    if (badgeResp) {
      badgeResp.textContent = respNew;
      badgeResp.classList.toggle('hidden', respNew === 0);
    }

    const badgeRaf = $('#badge-raf-tab');
    if (badgeRaf) {
      badgeRaf.textContent = rafOverdue;
      badgeRaf.classList.toggle('hidden', rafOverdue === 0);
    }

    const badgePdg = $('#badge-pdg-tab');
    if (badgePdg) {
      badgePdg.textContent = pdgOverdue;
      badgePdg.classList.toggle('hidden', pdgOverdue === 0);
    }

    let currentRoleNotifCount = 0;
    if (activeRole === 'agent') currentRoleNotifCount = agentNew;
    else if (activeRole === 'responsable') currentRoleNotifCount = respNew;
    else if (activeRole === 'raf') currentRoleNotifCount = rafOverdue;
    else if (activeRole === 'pdg') currentRoleNotifCount = pdgOverdue;

    const notifCountEl = $('#notif-count');
    if (notifCountEl) {
      notifCountEl.textContent = currentRoleNotifCount;
      notifCountEl.style.display = currentRoleNotifCount > 0 ? 'flex' : 'none';
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // ROLE SWITCHING & LOGOUT USER LOGIC (NO HARDCODED FALLBACKS!)
  // ══════════════════════════════════════════════════════════════════

  function logoutUser() {
    if (activeRole === 'agent') {
      activeAgentId = null;
      showToast('Vous êtes maintenant déconnecté (mode Agent).', '🚪');
    } else if (activeRole === 'responsable') {
      activeResponsableId = null;
      showToast('Vous êtes maintenant déconnecté (mode Responsable).', '🚪');
    } else if (activeRole === 'raf') {
      activeRafId = null;
      showToast('Vous êtes maintenant déconnecté (mode RAF).', '🚪');
    }
    populateContextDropdowns();
    renderCurrentDashboard();
  }

  function switchRole(role) {
    activeRole = role;

    $$('.role-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.role === role);
    });

    const roleSelect = $('#role-select');
    if (roleSelect && roleSelect.value !== role) {
      roleSelect.value = role;
    }

    $$('.dashboard-view').forEach(view => view.classList.remove('active'));
    const targetView = $(`#view-${role}`);
    if (targetView) targetView.classList.add('active');

    const siteField = $('#ctx-site-field');
    const serviceField = $('#ctx-service-field');
    const agentField = $('#ctx-agent-field');
    const respField = $('#ctx-responsable-field');
    const rafField = $('#ctx-raf-field');
    const logoutBtnHeader = $('#btn-logout-header');
    const userSummary = $('#user-profile-summary');

    if (role === 'agent') {
      siteField.style.display = 'flex';
      serviceField.style.display = 'none';
      agentField.style.display = 'flex';
      respField.style.display = 'none';
      if (rafField) rafField.style.display = 'none';
      if (logoutBtnHeader) logoutBtnHeader.style.display = 'inline-flex';

      const currentAgent = getAgent(activeAgentId);
      if (currentAgent && currentAgent.actif !== false) {
        activeSiteId = currentAgent.siteId;
        $('#ctx-site-select').value = activeSiteId;
        updateServicesForActiveSite();
      }
    } else if (role === 'responsable') {
      siteField.style.display = 'flex';
      serviceField.style.display = 'flex';
      agentField.style.display = 'none';
      respField.style.display = 'flex';
      if (rafField) rafField.style.display = 'none';
      if (logoutBtnHeader) logoutBtnHeader.style.display = 'inline-flex';

      const currentResp = getResponsable(activeResponsableId);
      if (currentResp && currentResp.actif !== false) {
        activeSiteId = currentResp.siteId;
        activeServiceId = currentResp.serviceId;
        $('#ctx-site-select').value = activeSiteId;
        updateServicesForActiveSite();
      }
    } else if (role === 'raf') {
      siteField.style.display = 'flex';
      serviceField.style.display = 'none';
      agentField.style.display = 'none';
      respField.style.display = 'none';
      if (rafField) rafField.style.display = 'flex';
      if (logoutBtnHeader) logoutBtnHeader.style.display = 'inline-flex';

      const currentRaf = getRaf(activeRafId);
      if (currentRaf && currentRaf.actif !== false) {
        activeSiteId = currentRaf.siteId;
        $('#ctx-site-select').value = activeSiteId;
        updateServicesForActiveSite();
      }
    } else if (role === 'pdg') {
      siteField.style.display = 'flex';
      serviceField.style.display = 'none';
      agentField.style.display = 'none';
      respField.style.display = 'none';
      if (rafField) rafField.style.display = 'none';
      // HIDE LOGOUT BUTTON EXCLUSIVELY FOR PDG
      if (logoutBtnHeader) logoutBtnHeader.style.display = 'none';
    }

    const u = UTILISATEURS[role];
    const siteObj = getSite(activeSiteId);
    const serviceObj = getService(activeServiceId);
    const currentResp = getResponsable(activeResponsableId);
    const currentAgent = getAgent(activeAgentId);
    const currentRaf = getRaf(activeRafId);

    if (userSummary) {
      let userName = u.nom;
      if (role === 'agent') userName = currentAgent ? currentAgent.nom : '🔒 Déconnecté';
      if (role === 'responsable') userName = currentResp ? currentResp.nom : '🔒 Déconnecté';
      if (role === 'raf') userName = currentRaf ? currentRaf.nom : '🔒 Déconnecté';

      userSummary.innerHTML = `
        <span class="user-name">👤 ${escapeHtml(userName)}</span>
        <span class="user-role-tag">${u.roleLabel}</span>
        <span>• Site : <strong>${siteObj.nom}</strong></span>
        ${role === 'responsable' && serviceObj ? `<span>• Service : <strong>${serviceObj.nom}</strong></span>` : ''}
      `;
    }

    updateNotificationBadges();
    renderCurrentDashboard();
  }

  function renderCurrentDashboard() {
    updateNotificationBadges();

    if (activeRole === 'agent') renderAgentView();
    else if (activeRole === 'responsable') renderResponsableView();
    else if (activeRole === 'raf') renderRAFView();
    else if (activeRole === 'pdg') renderPDGView();
  }

  // ══════════════════════════════════════════════════════════════════
  // ÉCRAN 1 : AGENT COURRIER (WITH REAL DISCONNECTED STATE LOCK)
  // ══════════════════════════════════════════════════════════════════

  function renderAgentView() {
    const siteObj = getSite(activeSiteId);
    const currentAgent = getAgent(activeAgentId);

    const siteBadge = $('#agent-site-name');
    if (siteBadge) siteBadge.textContent = siteObj.nom;

    const agentBadge = $('#agent-user-badge');
    const submitBtn = $('#btn-submit-agent-form');
    const logoutNotice = $('#agent-logout-notice');

    if (currentAgent) {
      if (agentBadge) {
        const isInactive = currentAgent.actif === false;
        agentBadge.innerHTML = `👤 Agent actif : ${escapeHtml(currentAgent.nom)} ${isInactive ? '<span class="inactive-tag">(inactif)</span>' : ''}`;
      }
      if (submitBtn) submitBtn.disabled = false;
      if (logoutNotice) logoutNotice.classList.add('hidden');
    } else {
      // DISCONNECTED STATE LOCK FOR AGENT
      if (agentBadge) agentBadge.innerHTML = `🔒 <strong class="text-danger">Déconnecté</strong>`;
      if (submitBtn) submitBtn.disabled = true;
      if (logoutNotice) logoutNotice.classList.remove('hidden');
    }

    updateServicesForActiveSite();

    const searchTerm = ($('#agent-search')?.value || '').toLowerCase().trim();

    const siteMails = courriers
      .filter(c => c.siteId === activeSiteId)
      .filter(c => {
        if (!searchTerm) return true;
        const serviceNames = c.serviceIds.map(id => getService(id)?.nom || '').join(' ').toLowerCase();
        return (
          c.id.toLowerCase().includes(searchTerm) ||
          c.expediteur.toLowerCase().includes(searchTerm) ||
          (c.cotation && c.cotation.toLowerCase().includes(searchTerm)) ||
          serviceNames.includes(searchTerm) ||
          c.type.toLowerCase().includes(searchTerm) ||
          (c.agentNom && c.agentNom.toLowerCase().includes(searchTerm))
        );
      })
      .sort((a, b) => new Date(b.dateReception) - new Date(a.dateReception));

    const tbody = $('#agent-table tbody');
    const emptyEl = $('#agent-empty');

    if (tbody) {
      tbody.innerHTML = siteMails.map(c => {
        return `
          <tr>
            <td><strong>${c.id}</strong></td>
            <td>${escapeHtml(c.expediteur)}</td>
            <td>${renderTypeLabel(c.type)}</td>
            <td>${renderServiceBadges(c.serviceIds)}</td>
            <td>${formatDateShort(c.dateReception)}</td>
            <td><code>${escapeHtml(c.cotation || '—')}</code></td>
            <td>${renderUserBadgeWithStatus(c.agentNom || 'Agent Inconnu', c.agentId, 'agent')}</td>
            <td>${renderStatusPill(c.statut)}</td>
          </tr>
        `;
      }).join('');
    }

    if (emptyEl) {
      emptyEl.classList.toggle('hidden', siteMails.length > 0);
    }
  }

  function handleAgentFormSubmit(e) {
    e.preventDefault();

    const currentAgent = getAgent(activeAgentId);

    // REAL LOCK: NO SILENT FALLBACK TO 'agent-1'!
    if (!currentAgent || currentAgent.actif === false) {
      showToast('Action impossible : Veuillez vous connecter avec un profil Agent valide dans la barre supérieure.', '🚫');
      return;
    }

    const expediteur = $('#expediteur').value.trim();
    const type = $('#type-courrier').value;
    const cotation = $('#cotation').value.trim() || '—';
    const checkedServices = $$('input[name="service-dest-check"]:checked');
    const fileInput = $('#fichier');

    const serviceIds = Array.from(checkedServices).map(cb => cb.value);

    if (!expediteur || !type || serviceIds.length === 0) {
      showToast('Veuillez remplir l\'expéditeur, le type et au moins 1 service destinataire.', '⚠️');
      return;
    }

    const newId = `CR-2026-${String(nextCounter++).padStart(3, '0')}`;
    const newMail = {
      id: newId,
      siteId: activeSiteId,
      serviceIds: serviceIds,
      expediteur: expediteur,
      type: type,
      cotation: cotation,
      dateReception: new Date().toISOString(),
      statut: 'reçu',
      commentaire: '',
      fichier: fileInput?.files[0] ? fileInput.files[0].name : 'scan_doc.pdf',
      // NO FALLBACK: Uses strict validated currentAgent
      agentId: currentAgent.id,
      agentNom: currentAgent.nom,
      estDecharge: false,
      dateDecharge: null,
      dechargeParId: null,
      dechargeParNom: null
    };

    courriers.unshift(newMail);

    e.target.reset();
    const fileNameEl = $('#upload-filename');
    if (fileNameEl) fileNameEl.textContent = '';

    showToast(`Courrier ${newId} enregistré par ${newMail.agentNom} !`, '✅');
    triggerBellPulse();
    renderCurrentDashboard();
  }

  // ══════════════════════════════════════════════════════════════════
  // ÉCRAN 2 : RESPONSABLE DE SERVICE (WITH REAL DISCONNECTED STATE LOCK)
  // ══════════════════════════════════════════════════════════════════

  function renderResponsableView() {
    const siteObj = getSite(activeSiteId);
    const serviceObj = getService(activeServiceId);
    const currentResp = getResponsable(activeResponsableId);

    const siteBadge = $('#resp-site-badge');
    const serviceBadge = $('#resp-service-badge');
    const userBadge = $('#resp-user-badge');
    const subtitleManager = $('#resp-subtitle-manager');
    const logoutBanner = $('#resp-logout-banner');

    if (siteBadge) siteBadge.textContent = siteObj.nom;
    if (serviceBadge) serviceBadge.textContent = serviceObj ? serviceObj.nom : 'Sans service';

    if (currentResp) {
      const isRespInactive = currentResp.actif === false;
      if (userBadge) {
        userBadge.innerHTML = `👤 Responsable : ${escapeHtml(currentResp.nom)} ${isRespInactive ? '<span class="inactive-tag">(inactif)</span>' : ''}`;
      }
      if (subtitleManager) {
        subtitleManager.textContent = `Dossier de service géré par ${currentResp.nom}`;
      }
      if (logoutBanner) logoutBanner.classList.add('hidden');
    } else {
      // DISCONNECTED STATE LOCK FOR RESPONSABLE
      if (userBadge) userBadge.innerHTML = `🔒 <strong class="text-danger">Non connecté</strong>`;
      if (subtitleManager) subtitleManager.textContent = `Aucun responsable connecté — Mode consultation seule`;
      if (logoutBanner) logoutBanner.classList.remove('hidden');
    }

    const serviceMails = courriers
      .filter(c => c.serviceIds.includes(activeServiceId))
      .sort((a, b) => new Date(b.dateReception) - new Date(a.dateReception));

    const newCount = serviceMails.filter(c => c.statut === 'reçu').length;
    const newCounterPill = $('#resp-new-count');
    if (newCounterPill) {
      newCounterPill.textContent = `${newCount} nouveau(x)`;
    }

    const filteredMails = serviceMails.filter(c => {
      if (respFilter === 'all') return true;
      return c.statut === respFilter;
    });

    const tbody = $('#resp-table tbody');
    const emptyEl = $('#resp-empty');

    if (tbody) {
      tbody.innerHTML = filteredMails.map(c => {
        const isNew = c.statut === 'reçu';

        const canAccuse = c.statut === 'reçu' && currentResp; // Block if disconnected!
        const canEncours = c.statut === 'distribué' && currentResp; // GATEKEEPER
        const canTraite = (c.statut === 'en cours' || c.statut === 'distribué') && currentResp;

        return `
          <tr class="${isNew ? 'row-new' : ''} ${isMailOverdue(c) ? 'row-overdue' : ''}">
            <td><strong>${c.id}</strong></td>
            <td>${escapeHtml(c.expediteur)}</td>
            <td>${renderTypeLabel(c.type)}</td>
            <td>${formatDateShort(c.dateReception)}</td>
            <td>${renderStatusPill(c.statut)}</td>
            <td>
              <input type="text" class="input-inline-comment" data-mail-id="${c.id}"
                placeholder="Ajouter un commentaire..." value="${escapeHtml(c.commentaire)}" ${!currentResp ? 'disabled' : ''}>
              ${c.estDecharge ? `<div class="decharge-info-sub">✓ Déchargé le ${formatDateFull(c.dateDecharge)} par ${renderUserBadgeWithStatus(c.dechargeParNom, c.dechargeParId, 'responsable')}</div>` : ''}
            </td>
            <td>
              <div class="btn-group-inline">
                ${canAccuse ? `<button type="button" class="btn btn-sm btn-outline-primary btn-accuse" data-id="${c.id}">
                  📩 Accuser réception
                </button>` : ''}
                ${canEncours ? `<button type="button" class="btn btn-sm btn-secondary btn-encours" data-id="${c.id}">
                  ⏳ En cours
                </button>` : ''}
                ${canTraite ? `<button type="button" class="btn btn-sm btn-success btn-traite" data-id="${c.id}">
                  ✅ Traité
                </button>` : ''}
                ${!currentResp ? '<span class="inactive-tag">🔒 Connexion requise</span>' : ''}
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }

    if (emptyEl) {
      emptyEl.classList.toggle('hidden', filteredMails.length > 0);
    }

    bindResponsableRowEvents();
  }

  function bindResponsableRowEvents() {
    $$('.btn-accuse').forEach(btn => {
      btn.onclick = () => openAccuseModal(btn.dataset.id);
    });

    $$('.btn-encours').forEach(btn => {
      btn.onclick = () => {
        const mail = courriers.find(x => x.id === btn.dataset.id);
        if (mail) {
          mail.statut = 'en cours';
          showToast(`Courrier ${mail.id} passé en cours de traitement.`, '⏳');
          renderCurrentDashboard();
        }
      };
    });

    $$('.btn-traite').forEach(btn => {
      btn.onclick = () => {
        const mail = courriers.find(x => x.id === btn.dataset.id);
        if (mail) {
          mail.statut = 'traité';
          showToast(`Courrier ${mail.id} marqué comme TRAITÉ.`, '✅');
          renderCurrentDashboard();
        }
      };
    });

    $$('.input-inline-comment').forEach(input => {
      input.onchange = () => {
        const mail = courriers.find(x => x.id === input.dataset.mailId);
        if (mail) {
          mail.commentaire = input.value;
          showToast(`Commentaire mis à jour pour ${mail.id}`, '💬');
        }
      };
    });
  }

  function openAccuseModal(mailId) {
    const mail = courriers.find(x => x.id === mailId);
    const currentResp = getResponsable(activeResponsableId);

    // REAL LOCK: CANNOT DISCHARGE IF DISCONNECTED!
    if (!mail || !currentResp || currentResp.actif === false) {
      showToast('Action impossible : Vous devez être connecté en tant que Responsable actif pour décharger du courrier.', '🚫');
      return;
    }

    pendingModalMailId = mailId;

    const detailBox = $('#modal-detail');
    if (detailBox) {
      detailBox.innerHTML = `
        <strong>Réf : ${mail.id}</strong><br>
        <strong>Expéditeur :</strong> ${escapeHtml(mail.expediteur)}<br>
        <strong>Type :</strong> ${renderTypeLabel(mail.type)}<br>
        <strong>Services destinataires :</strong> ${renderServiceBadges(mail.serviceIds)}<br>
        <strong>Enregistré le :</strong> ${formatDateFull(mail.dateReception)} par ${renderUserBadgeWithStatus(mail.agentNom, mail.agentId, 'agent')}<br><br>
        <div class="decharge-signature-notice">
          🔒 <strong>Reconnaissance numérique interne :</strong> Cette décharge sera enregistrée au nom de <strong>${escapeHtml(currentResp.nom)}</strong> avec horodatage certifié.
        </div>
      `;
    }

    const overlay = $('#modal-overlay');
    if (overlay) overlay.classList.remove('hidden');
  }

  function closeModal() {
    pendingModalMailId = null;
    pendingServiceAction = null;
    pendingServiceScopeData = null;
    pendingMultiSiteDeleteData = null;
    $$('.modal-backdrop').forEach(el => el.classList.add('hidden'));
  }

  function confirmAccuseReceipt() {
    if (!pendingModalMailId) return;

    const mail = courriers.find(x => x.id === pendingModalMailId);
    const currentResp = getResponsable(activeResponsableId);

    // STRICT LOCK: NO SILENT FALLBACK TO 'resp-1'!
    if (!currentResp || currentResp.actif === false) {
      showToast('Erreur : Aucun responsable valide connecté pour signer la décharge.', '🚫');
      closeModal();
      return;
    }

    if (mail) {
      mail.statut = 'distribué';
      mail.estDecharge = true;
      mail.dateDecharge = new Date().toISOString();
      mail.dechargeParId = currentResp.id;
      mail.dechargeParNom = currentResp.nom;

      showToast(`Décharge numérique enregistrée pour le courrier ${mail.id} par ${mail.dechargeParNom}.`, '📬');
      closeModal();
      renderCurrentDashboard();
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // ÉCRAN 3 : RAF (RESPONSABLE ADMIN & FINANCIER)
  // ══════════════════════════════════════════════════════════════════

  function renderRAFView() {
    const siteObj = getSite(activeSiteId);
    const currentRaf = getRaf(activeRafId);

    const siteBadge = $('#raf-site-badge');
    if (siteBadge) siteBadge.textContent = siteObj.nom;

    const userBadge = $('#raf-user-badge');
    if (userBadge) {
      if (currentRaf) {
        const isInactive = currentRaf.actif === false;
        userBadge.innerHTML = `👤 RAF actif : ${escapeHtml(currentRaf.nom)} ${isInactive ? '<span class="inactive-tag">(inactif)</span>' : ''}`;
      } else {
        userBadge.innerHTML = `🔒 <strong class="text-danger">Non connecté</strong>`;
      }
    }

    const rafServiceFilter = $('#raf-service-filter')?.value || 'all';

    let siteMails = courriers.filter(c => c.siteId === activeSiteId);
    if (rafServiceFilter !== 'all') {
      siteMails = siteMails.filter(c => c.serviceIds.includes(rafServiceFilter));
    }

    const totalCount = siteMails.length;
    const pendingCount = siteMails.filter(c => c.statut !== 'traité').length;
    const doneCount = siteMails.filter(c => c.statut === 'traité').length;
    const overdueMails = siteMails.filter(isMailOverdue);

    $('#raf-stat-total').textContent = totalCount;
    $('#raf-stat-pending').textContent = pendingCount;
    $('#raf-stat-done').textContent = doneCount;
    $('#raf-stat-retard').textContent = overdueMails.length;

    const retardPill = $('#raf-retard-pill');
    if (retardPill) retardPill.textContent = `${overdueMails.length} courrier(s) en retard`;

    const rTableBody = $('#raf-retard-table tbody');
    const rEmpty = $('#raf-retard-empty');

    if (rTableBody) {
      rTableBody.innerHTML = overdueMails.map(c => {
        return `
          <tr class="row-overdue">
            <td><strong>${c.id}</strong></td>
            <td>${escapeHtml(c.expediteur)}</td>
            <td>${renderServiceBadges(c.serviceIds)}</td>
            <td>${formatDateShort(c.dateReception)} par ${renderUserBadgeWithStatus(c.agentNom, c.agentId, 'agent')}</td>
            <td><strong class="text-danger">⚠️ ${formatDelayText(c.dateReception)}</strong></td>
            <td>${renderStatusPill(c.statut)}</td>
          </tr>
        `;
      }).join('');
    }

    if (rEmpty) rEmpty.classList.toggle('hidden', overdueMails.length > 0);

    const siteServices = SERVICES.filter(s => s.siteId === activeSiteId);
    const breakdownContainer = $('#raf-service-breakdown');

    if (breakdownContainer) {
      breakdownContainer.innerHTML = siteServices.map(service => {
        const isActif = service.actif !== false;
        const sMails = courriers.filter(c => c.serviceIds.includes(service.id));
        const sDone = sMails.filter(c => c.statut === 'traité').length;
        const sPending = sMails.filter(c => c.statut !== 'traité').length;
        const sOverdue = sMails.filter(isMailOverdue).length;
        const rate = sMails.length ? Math.round((sDone / sMails.length) * 100) : 0;

        const statusBadge = isActif
          ? ''
          : `<span class="status-pill status-distribue" style="font-size: 0.7rem; background:#f1f5f9; color:#64748b;">○ Inactif (${formatDateShort(service.dateDesactivation)})</span>`;

        const actionButtons = isActif
          ? `<button type="button" class="btn-icon-xs btn-edit-service" data-id="${service.id}" title="Éditer le service">✏️</button>
             <button type="button" class="btn-icon-xs btn-delete-service" data-id="${service.id}" title="Désactiver le service">🔒</button>
             <button type="button" class="btn-icon-xs btn-history-service" data-id="${service.id}" title="Consulter l'historique du service">📜</button>`
          : `<button type="button" class="btn-icon-xs btn-reactivate-service" data-id="${service.id}" title="Réactiver le service" style="background:#ecfdf5; color:#059669; border-color:#a7f3d0;">🔄</button>
             <button type="button" class="btn-icon-xs btn-history-service" data-id="${service.id}" title="Consulter l'historique du service">📜</button>`;

        return `
          <div class="stat-item-card ${!isActif ? 'card-inactive' : ''}">
            <div class="flex-between">
              <h4>${escapeHtml(service.nom)} ${statusBadge}</h4>
              <div class="service-actions-mini">
                ${actionButtons}
              </div>
            </div>
            <div class="stat-row"><span>Total courriers :</span><strong>${sMails.length}</strong></div>
            <div class="stat-row"><span>En attente :</span><strong>${sPending}</strong></div>
            <div class="stat-row"><span>Traités :</span><strong>${sDone}</strong></div>
            <div class="stat-row"><span>En retard (>48h) :</span><strong class="${sOverdue > 0 ? 'text-danger' : ''}">${sOverdue}</strong></div>
            <div class="stat-row"><span>Taux traitement :</span><strong>${rate}%</strong></div>
            <div class="progress-track">
              <div class="progress-bar-fill" style="width: ${rate}%;"></div>
            </div>
          </div>
        `;
      }).join('');

      $$('.btn-edit-service').forEach(btn => btn.onclick = () => openEditServiceModal(btn.dataset.id));
      $$('.btn-delete-service').forEach(btn => btn.onclick = () => handleDeleteServiceRequest(btn.dataset.id));
      $$('.btn-reactivate-service').forEach(btn => btn.onclick = () => reactivateService(btn.dataset.id));
      $$('.btn-history-service').forEach(btn => btn.onclick = () => openServiceHistoryModal(btn.dataset.id));
    }

    const allTableBody = $('#raf-all-table tbody');
    if (allTableBody) {
      allTableBody.innerHTML = siteMails
        .sort((a, b) => new Date(b.dateReception) - new Date(a.dateReception))
        .map(c => {
          return `
            <tr class="${isMailOverdue(c) ? 'row-overdue' : ''}">
              <td><strong>${c.id}</strong></td>
              <td>${escapeHtml(c.expediteur)}</td>
              <td>${renderTypeLabel(c.type)}</td>
              <td>${renderServiceBadges(c.serviceIds)}</td>
              <td>${formatDateShort(c.dateReception)}</td>
              <td>${renderStatusPill(c.statut)}</td>
            </tr>
          `;
        }).join('');
    }

    renderUsersTable();
  }

  // ══════════════════════════════════════════════════════════════════
  // ÉCRAN 4 : PDG (DIRECTION GÉNÉRALE)
  // ══════════════════════════════════════════════════════════════════

  function renderPDGView() {
    const pdgSiteFilter = $('#pdg-site-filter')?.value || 'all';
    const pdgServiceFilter = $('#pdg-service-filter')?.value || 'all';

    let targetMails = courriers;

    if (pdgSiteFilter !== 'all') {
      targetMails = targetMails.filter(c => c.siteId === pdgSiteFilter);
    }
    if (pdgServiceFilter !== 'all') {
      targetMails = targetMails.filter(c => c.serviceIds.includes(pdgServiceFilter));
    }

    const totalCount = targetMails.length;
    const pendingCount = targetMails.filter(c => c.statut !== 'traité').length;
    const doneCount = targetMails.filter(c => c.statut === 'traité').length;
    const globalOverdue = (pdgSiteFilter === 'all' ? courriers : targetMails).filter(isMailOverdue);
    const overallRate = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;

    $('#pdg-stat-total').textContent = totalCount;
    $('#pdg-stat-pending').textContent = pendingCount;
    $('#pdg-stat-rate').textContent = `${overallRate}%`;
    $('#pdg-stat-retard').textContent = globalOverdue.length;

    const pdgPill = $('#pdg-retard-pill');
    if (pdgPill) pdgPill.textContent = `${globalOverdue.length} dossier(s) en retard Groupe`;

    const siteComparisonContainer = $('#pdg-site-breakdown');
    if (siteComparisonContainer) {
      siteComparisonContainer.innerHTML = SITES.map(site => {
        const scMails = courriers.filter(c => c.siteId === site.id);
        const scDone = scMails.filter(c => c.statut === 'traité').length;
        const scPending = scMails.filter(c => c.statut !== 'traité').length;
        const scOverdue = scMails.filter(isMailOverdue).length;
        const rate = scMails.length ? Math.round((scDone / scMails.length) * 100) : 0;

        return `
          <div class="stat-item-card">
            <h4>🏢 ${escapeHtml(site.nom)}</h4>
            <div class="stat-row"><span>Volume total reçus :</span><strong>${scMails.length}</strong></div>
            <div class="stat-row"><span>En attente :</span><strong>${scPending}</strong></div>
            <div class="stat-row"><span>Dossiers traités :</span><strong>${scDone}</strong></div>
            <div class="stat-row"><span>Retards (>48h) :</span><strong class="${scOverdue > 0 ? 'text-danger' : ''}">${scOverdue}</strong></div>
            <div class="stat-row"><span>Taux d'efficacité :</span><strong>${rate}%</strong></div>
            <div class="progress-track">
              <div class="progress-bar-fill" style="width: ${rate}%;"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    const pTableBody = $('#pdg-retard-table tbody');
    const pEmpty = $('#pdg-retard-empty');

    if (pTableBody) {
      pTableBody.innerHTML = globalOverdue
        .sort((a, b) => new Date(a.dateReception) - new Date(a.dateReception))
        .map(c => {
          const siteObj = getSite(c.siteId);
          return `
            <tr class="row-overdue">
              <td><strong>${c.id}</strong></td>
              <td><span class="badge badge-site">${siteObj ? escapeHtml(siteObj.nom.split(' ')[0]) : '—'}</span></td>
              <td>${renderServiceBadges(c.serviceIds)}</td>
              <td>${escapeHtml(c.expediteur)}</td>
              <td>${formatDateShort(c.dateReception)}</td>
              <td><strong class="text-danger">🚨 ${formatDelayText(c.dateReception)}</strong></td>
              <td>${renderStatusPill(c.statut)}</td>
            </tr>
          `;
        }).join('');
    }

    if (pEmpty) pEmpty.classList.toggle('hidden', globalOverdue.length > 0);
  }

  // ══════════════════════════════════════════════════════════════════
  // POINT 0 & 4 : CRUD SERVICES WITH REALLOCATION (MAILS & RESPONSABLES) & MULTI-SITE SCOPE
  // ══════════════════════════════════════════════════════════════════

  function getTargetSiteIdsFromScope(scopeType, singleSiteId, selectedSitesCheckboxesName) {
    if (scopeType === 'current') {
      return [singleSiteId];
    } else if (scopeType === 'all') {
      return SITES.map(s => s.id);
    } else if (scopeType === 'selected') {
      const checked = $$(`input[name="${selectedSitesCheckboxesName}"]:checked`);
      return Array.from(checked).map(cb => cb.value);
    }
    return [singleSiteId];
  }

  let pendingMultiSiteDeleteData = null;

  function handleDeleteServiceRequest(serviceId) {
    openDeleteServiceScopeModal(serviceId);
  }

  function openDeleteServiceScopeModal(serviceId) {
    const service = getService(serviceId);
    if (!service) return;

    const siteObj = getSite(service.siteId);

    $('#delete-service-id').value = service.id;

    const infoP = $('#delete-service-scope-info');
    if (infoP) {
      infoP.innerHTML = `Suppression du service <strong>« ${escapeHtml(service.nom)} »</strong> (Site d'origine : ${escapeHtml(siteObj ? siteObj.nom : service.siteId)})`;
    }

    const siteBox = $('#delete-service-sites-box');
    if (siteBox) {
      siteBox.innerHTML = SITES.map(s => `
        <label class="checkbox-pill">
          <input type="checkbox" name="delete-service-site-check" value="${s.id}" ${s.id === service.siteId ? 'checked' : ''}>
          <span>${escapeHtml(s.nom)}</span>
        </label>
      `).join('');
    }

    const currentRadio = $('input[name="delete-service-scope"][value="current"]');
    if (currentRadio) currentRadio.checked = true;

    const sitesBoxWrapper = $('#delete-service-sites-box-wrapper');
    if (sitesBoxWrapper) sitesBoxWrapper.style.display = 'none';

    $('#modal-delete-service-scope-overlay')?.classList.remove('hidden');
  }

  function handleDeleteServiceScopeSubmit(e) {
    e.preventDefault();
    const operator = getCurrentSessionOperator();
    if (!operator) {
      showToast('Action impossible : Vous devez être connecté avec un profil RAF ou PDG actif pour modifier les services.', '🚫');
      return;
    }

    const originServiceId = $('#delete-service-id').value;
    const originService = getService(originServiceId);
    if (!originService) return;

    const scopeRadio = $('input[name="delete-service-scope"]:checked')?.value || 'current';
    if (scopeRadio === 'selected') {
      const checkedSites = $$('input[name="delete-service-site-check"]:checked');
      if (checkedSites.length === 0) {
        showToast('Veuillez sélectionner au moins un site.', '⚠️');
        return;
      }
    }

    const targetSiteIds = getTargetSiteIdsFromScope(scopeRadio, originService.siteId, 'delete-service-site-check');
    closeModal();

    const unaffectedSites = [];
    const blockedSites = [];
    const directSites = [];
    const reallocSites = [];

    targetSiteIds.forEach(sId => {
      const siteObj = getSite(sId);
      const siteService = SERVICES.find(s => s.siteId === sId && s.nom.trim().toLowerCase() === originService.nom.trim().toLowerCase() && s.actif !== false);

      if (!siteService) {
        unaffectedSites.push({
          siteId: sId,
          siteNom: siteObj ? siteObj.nom : sId,
          reason: `aucun service actif nommé « ${originService.nom} » trouvé`
        });
      } else {
        const siteActiveServicesCount = SERVICES.filter(s => s.siteId === sId && s.actif !== false).length;

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
          const attachedResponsables = RESPONSABLES.filter(r => r.serviceId === siteService.id && r.actif !== false);
          const otherServices = SERVICES.filter(s => s.siteId === sId && s.id !== siteService.id && s.actif !== false);

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

    if (reallocSites.length === 0) {
      const succeededSites = [];
      directSites.forEach(ds => {
        const sObj = getService(ds.serviceId);
        if (sObj) {
          const now = new Date().toISOString();
          sObj.actif = false;
          sObj.dateDesactivation = now;
          if (!Array.isArray(sObj.historique)) sObj.historique = [];
          sObj.historique.push({
            action: 'desactivation',
            date: now,
            parId: operator.id,
            parNom: operator.nom
          });
        }
        succeededSites.push(ds);
      });

      populateContextDropdowns();
      renderCurrentDashboard();

      showMultiCategoryDeleteSummary(succeededSites, blockedSites, unaffectedSites, originService.nom);
    } else {
      pendingMultiSiteDeleteData = {
        originServiceName: originService.nom,
        directSites,
        reallocSites,
        blockedSites,
        unaffectedSites
      };

      openMultiSiteReallocationModal();
    }
  }

  function openMultiSiteReallocationModal() {
    if (!pendingMultiSiteDeleteData) return;

    const { originServiceName, reallocSites } = pendingMultiSiteDeleteData;
    const infoText = $('#modal-realloc-info');
    if (infoText) {
      infoText.innerHTML = `
        La désactivation du service <strong>« ${escapeHtml(originServiceName)} »</strong> nécessite une réaffectation d'éléments sur <strong>${reallocSites.length} site(s)</strong> :<br>
        Veuillez choisir un service de remplacement pour chaque site concerné ci-dessous :
      `;
    }

    const container = $('#realloc-sites-container');
    if (container) {
      container.innerHTML = reallocSites.map(rs => {
        return `
          <div class="card-panel" style="margin-bottom: 1rem; padding: 1rem; border: 1px solid var(--color-border); background-color: #f8fafc;">
            <h4 style="margin-bottom: 0.5rem; color: var(--color-primary);">🏢 ${escapeHtml(rs.siteNom)}</h4>
            <p style="font-size: 0.875rem; margin-bottom: 0.75rem;">
              Éléments à réaffecter pour <strong>${escapeHtml(rs.serviceNom)}</strong> :<br>
              • <strong>${rs.attachedMails.length} courrier(s)</strong><br>
              • <strong>${rs.attachedResponsables.length} responsable(s) actif(s)</strong> (${rs.attachedResponsables.map(r => escapeHtml(r.nom)).join(', ') || 'Aucun'})
            </p>
            <div class="form-group">
              <label for="realloc-select-${rs.siteId}">Service de remplacement (${escapeHtml(rs.siteNom)}) *</label>
              <select id="realloc-select-${rs.siteId}" class="form-control realloc-select-per-site" data-site-id="${rs.siteId}" data-service-id="${rs.serviceId}" required>
                ${rs.otherServices.map(s => `<option value="${s.id}">${escapeHtml(s.nom)}</option>`).join('')}
              </select>
            </div>
          </div>
        `;
      }).join('');
    }

    $('#modal-realloc-overlay')?.classList.remove('hidden');
  }

  function handleConfirmReallocation(e) {
    e.preventDefault();
    const operator = getCurrentSessionOperator();
    if (!operator) {
      showToast('Action impossible : Vous devez être connecté avec un profil RAF ou PDG actif pour modifier les services.', '🚫');
      return;
    }

    const { originServiceName, directSites, reallocSites, blockedSites, unaffectedSites } = pendingMultiSiteDeleteData;
    const succeededSites = [...directSites];

    const selectElements = $$('.realloc-select-per-site');
    selectElements.forEach(selectEl => {
      const siteId = selectEl.dataset.siteId;
      const serviceId = selectEl.dataset.serviceId;
      const targetServiceId = selectEl.value;

      const rSite = reallocSites.find(rs => rs.serviceId === serviceId);
      if (!targetServiceId || !rSite) return;

      courriers.forEach(c => {
        if (c.serviceIds.includes(serviceId)) {
          c.serviceIds = c.serviceIds.filter(id => id !== serviceId);
          if (!c.serviceIds.includes(targetServiceId)) {
            c.serviceIds.push(targetServiceId);
          }
        }
      });

      RESPONSABLES.forEach(r => {
        if (r.serviceId === serviceId) {
          r.serviceId = targetServiceId;
        }
      });

      const sObj = getService(serviceId);
      if (sObj) {
        const now = new Date().toISOString();
        sObj.actif = false;
        sObj.dateDesactivation = now;
        if (!Array.isArray(sObj.historique)) sObj.historique = [];
        sObj.historique.push({
          action: 'desactivation',
          date: now,
          parId: operator.id,
          parNom: operator.nom
        });
      }
      succeededSites.push(rSite);
    });

    directSites.forEach(ds => {
      const sObj = getService(ds.serviceId);
      if (sObj) {
        const now = new Date().toISOString();
        sObj.actif = false;
        sObj.dateDesactivation = now;
        if (!Array.isArray(sObj.historique)) sObj.historique = [];
        sObj.historique.push({
          action: 'desactivation',
          date: now,
          parId: operator.id,
          parNom: operator.nom
        });
      }
    });

    pendingMultiSiteDeleteData = null;
    closeModal();

    populateContextDropdowns();
    renderCurrentDashboard();

    showMultiCategoryDeleteSummary(succeededSites, blockedSites, unaffectedSites, originServiceName);
  }

  function reactivateService(serviceId) {
    const operator = getCurrentSessionOperator();
    if (!operator) {
      showToast('Action impossible : Vous devez être connecté avec un profil RAF ou PDG actif pour modifier les services.', '🚫');
      return;
    }

    const service = getService(serviceId);
    if (!service) return;

    if (confirm(`Voulez-vous réactiver le service « ${service.nom} » ?`)) {
      const now = new Date().toISOString();
      service.actif = true;
      service.dateDesactivation = null;

      if (!Array.isArray(service.historique)) service.historique = [];
      service.historique.push({
        action: 'reactivation',
        date: now,
        parId: operator.id,
        parNom: operator.nom
      });

      populateContextDropdowns();
      renderCurrentDashboard();
      showToast(`Service « ${service.nom} » réactivé avec succès par ${operator.nom}.`, '🔄');
    }
  }

  function openServiceHistoryModal(serviceId) {
    const service = getService(serviceId);
    if (!service) return;

    $('#modal-history-title').textContent = `📜 Historique du Service — ${service.nom}`;
    const contentBox = $('#modal-history-content');

    const historyList = Array.isArray(service.historique) ? service.historique : [];

    if (historyList.length === 0) {
      contentBox.innerHTML = `
        <div class="empty-state" style="padding: 1.5rem 0;">
          Aucune modification de statut enregistrée pour ce service.<br>
          <small class="text-muted">Statut actuel : ${service.actif !== false ? 'Actif' : 'Inactif'}</small>
        </div>
      `;
    } else {
      contentBox.innerHTML = `
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Date &amp; Heure</th>
                <th>Effectué par</th>
              </tr>
            </thead>
            <tbody>
              ${historyList.slice().reverse().map(h => {
                const isDesact = h.action === 'desactivation';
                const actionBadge = isDesact
                  ? `<span class="status-pill status-recu" style="background:#fef2f2; color:#dc2626;">🔒 Désactivation</span>`
                  : `<span class="status-pill status-recu" style="background:#ecfdf5; color:#059669;">🔄 Réactivation</span>`;
                return `
                  <tr>
                    <td>${actionBadge}</td>
                    <td>${formatDateFull(h.date)}</td>
                    <td><strong>${escapeHtml(h.parNom || 'Non renseigné')}</strong></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    $('#modal-history-overlay')?.classList.remove('hidden');
  }

  function showMultiCategoryDeleteSummary(succeeded, blocked, unaffected, serviceName) {
    if (succeeded.length > 0) {
      const siteList = succeeded.map(s => s.siteNom).join(', ');
      showToast(`Désactivation de « ${serviceName} » réussie sur (${succeeded.length} site(s)) : ${siteList}`, '✅');
    }

    if (blocked.length > 0) {
      const siteList = blocked.map(s => `${s.siteNom} (dernier service du site)`).join(', ');
      showToast(`Désactivation de « ${serviceName} » bloquée sur (${blocked.length} site(s)) : ${siteList}`, '🚫');
    }

    if (unaffected.length > 0) {
      const siteList = unaffected.map(s => `${s.siteNom} (service non présent)`).join(', ');
      showToast(`Non concerné par « ${serviceName} » (${unaffected.length} site(s)) : ${siteList}`, 'ℹ️');
    }

    if (succeeded.length === 0 && blocked.length === 0 && unaffected.length === 0) {
      showToast('Aucun site sélectionné.', '⚠️');
    }
  }

  function openEditServiceModal(serviceId) {
    const service = getService(serviceId);
    if (!service) return;

    $('#edit-service-id').value = service.id;
    $('#edit-service-name').value = service.nom;

    // Populate scope site checkboxes for Edit
    const siteBox = $('#edit-service-sites-box');
    if (siteBox) {
      siteBox.innerHTML = SITES.map(s => `
        <label class="checkbox-pill">
          <input type="checkbox" name="edit-service-site-check" value="${s.id}" ${s.id === service.siteId ? 'checked' : ''}>
          <span>${escapeHtml(s.nom)}</span>
        </label>
      `).join('');
    }

    $('#modal-edit-service-overlay')?.classList.remove('hidden');
  }

  function handleEditServiceSubmit(e) {
    e.preventDefault();
    const id = $('#edit-service-id').value;
    const newName = $('#edit-service-name').value.trim();
    const targetService = getService(id);

    if (!targetService || !newName) return;

    const scopeRadio = $('input[name="edit-service-scope"]:checked')?.value || 'current';
    const targetSiteIds = getTargetSiteIdsFromScope(scopeRadio, targetService.siteId, 'edit-service-site-check');

    let updatedCount = 0;
    SERVICES.forEach(s => {
      if (targetSiteIds.includes(s.siteId) && s.nom.toLowerCase() === targetService.nom.toLowerCase()) {
        s.nom = newName;
        updatedCount++;
      }
    });

    closeModal();
    populateContextDropdowns();
    showToast(`Service renommé en « ${newName} » sur ${updatedCount} site(s).`, '✏️');
    renderCurrentDashboard();
  }

  function handleAddServiceSubmit(e) {
    e.preventDefault();
    const currentSiteId = $('#new-service-site').value;
    const serviceName = $('#new-service-name').value.trim();

    if (!currentSiteId || !serviceName) return;

    const scopeRadio = $('input[name="new-service-scope"]:checked')?.value || 'current';
    const targetSiteIds = getTargetSiteIdsFromScope(scopeRadio, currentSiteId, 'new-service-site-check');

    let createdCount = 0;
    targetSiteIds.forEach(sId => {
      const serviceId = `${serviceName.toLowerCase().replace(/[^a-z0-9]/g, '_')}-${sId}`;
      if (!SERVICES.some(s => s.id === serviceId)) {
        SERVICES.push({
          id: serviceId,
          siteId: sId,
          nom: serviceName,
          actif: true,
          dateDesactivation: null,
          historique: []
        });
        createdCount++;
      }
    });

    populateContextDropdowns();
    closeModal();
    showToast(`Nouveau service « ${serviceName} » créé sur ${createdCount} site(s) !`, '🏬');
    renderCurrentDashboard();
  }

  // ══════════════════════════════════════════════════════════════════
  // CRUD RESPONSABLES & AGENTS — FULL EDIT & SOFT DELETE
  // ══════════════════════════════════════════════════════════════════

  function softDeleteResponsable(respId) {
    const r = getResponsable(respId);
    if (!r) return;

    if (confirm(`Voulez-vous désactiver le responsable "${r.nom}" ? (Son historique de décharge sera préservé)`)) {
      r.actif = false;
      r.dateDesactivation = new Date().toISOString();

      // If deactivated user was currently active, reset selection
      if (activeResponsableId === respId) {
        const remainingSiteResps = RESPONSABLES.filter(x => x.siteId === activeSiteId && x.actif !== false);
        activeResponsableId = remainingSiteResps.length > 0 ? remainingSiteResps[0].id : null;
      }

      populateResponsablesDropdown();
      showToast(`Responsable "${r.nom}" désactivé (passé en inactif).`, '👤');
      switchRole('responsable');
    }
  }

  function openEditResponsableModal(respId) {
    const r = getResponsable(respId);
    if (!r) return;

    $('#edit-resp-id').value = r.id;
    $('#edit-resp-name').value = r.nom;

    const siteSel = $('#edit-resp-site');
    const serviceSel = $('#edit-resp-service');

    if (siteSel) {
      siteSel.innerHTML = SITES.map(s => `<option value="${s.id}">${s.nom}</option>`).join('');
      siteSel.value = r.siteId;

      const updateEditRespServices = () => {
        const sList = SERVICES.filter(s => s.siteId === siteSel.value);
        serviceSel.innerHTML = sList.map(s => `<option value="${s.id}">${s.nom}</option>`).join('');
      };

      siteSel.onchange = updateEditRespServices;
      updateEditRespServices();
      serviceSel.value = r.serviceId;
    }

    $('#modal-edit-resp-overlay')?.classList.remove('hidden');
  }

  function handleEditResponsableSubmit(e) {
    e.preventDefault();
    const id = $('#edit-resp-id').value;
    const newName = $('#edit-resp-name').value.trim();
    const newSiteId = $('#edit-resp-site').value;
    const newServiceId = $('#edit-resp-service').value;

    const r = getResponsable(id);
    if (r && newName && newSiteId && newServiceId) {
      r.nom = newName;
      r.siteId = newSiteId;
      r.serviceId = newServiceId;

      closeModal();
      populateResponsablesDropdown();
      showToast(`Fiche responsable de "${newName}" mise à jour.`, '✏️');
      switchRole('responsable');
    }
  }

  // ══════════════════════════════════════════════════════════════════
  // GESTION DU PERSONNEL & UTILISATEURS (CRUD + SOFT DELETE + HISTORIQUE)
  // ══════════════════════════════════════════════════════════════════

  function getCurrentSessionOperator() {
    if (activeRole === 'pdg') {
      return { id: 'pdg-1', nom: 'Direction Générale (PDG)' };
    } else if (activeRole === 'raf') {
      const currentRaf = getRaf(activeRafId);
      if (currentRaf && currentRaf.actif !== false) {
        return { id: currentRaf.id, nom: currentRaf.nom };
      }
    }
    return null; // Strict: No generic fallback!
  }

  function renderUsersTable() {
    const tableBody = $('#users-table tbody');
    if (!tableBody) return;

    const siteAgents = AGENTS.filter(a => a.siteId === activeSiteId);
    const siteResps = RESPONSABLES.filter(r => r.siteId === activeSiteId);
    const siteRafs = RAF_LIST.filter(r => r.siteId === activeSiteId);

    const allSiteUsers = [
      ...siteAgents.map(a => ({ ...a, roleKey: 'agent', roleLabel: 'Agent Courrier' })),
      ...siteResps.map(r => ({ ...r, roleKey: 'responsable', roleLabel: 'Responsable de Service' })),
      ...siteRafs.map(r => ({ ...r, roleKey: 'raf', roleLabel: 'RAF (Admin Site)' }))
    ];

    if (allSiteUsers.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted" style="padding: 1.5rem;">Aucun compte utilisateur sur ce site.</td></tr>`;
      return;
    }

    tableBody.innerHTML = allSiteUsers.map(u => {
      const isActif = u.actif !== false;
      const serviceObj = u.serviceId ? getService(u.serviceId) : null;
      const serviceName = serviceObj ? serviceObj.nom : '—';
      const siteObj = getSite(u.siteId);
      const siteName = siteObj ? siteObj.nom : u.siteId;

      const statusBadge = isActif
        ? `<span class="status-pill status-recu">● Actif</span>`
        : `<span class="status-pill status-distribue" style="background:#f1f5f9; color:#64748b;" title="Désactivé le ${formatDateFull(u.dateDesactivation)}">○ Inactif (désactivé le ${formatDateShort(u.dateDesactivation)})</span>`;

      const actionButtons = isActif
        ? `<button type="button" class="btn btn-xs btn-outline-primary btn-edit-user" data-id="${u.id}" data-role="${u.roleKey}">✏️ Modifier</button>
           <button type="button" class="btn btn-xs btn-danger btn-deactivate-user" data-id="${u.id}" data-role="${u.roleKey}">🔒 Désactiver</button>`
        : `<button type="button" class="btn btn-xs btn-outline-primary btn-edit-user" data-id="${u.id}" data-role="${u.roleKey}">✏️ Modifier</button>
           <button type="button" class="btn btn-xs btn-success btn-reactivate-user" data-id="${u.id}" data-role="${u.roleKey}">🔄 Réactiver</button>`;

      const historyBtn = `<button type="button" class="btn btn-xs btn-secondary btn-history-user" data-id="${u.id}" data-role="${u.roleKey}" title="Consulter l'historique des statuts">📜 Historique</button>`;

      return `
        <tr class="${!isActif ? 'row-inactive' : ''}">
          <td><strong>${escapeHtml(u.nom)}</strong></td>
          <td><span class="user-role-tag">${u.roleLabel}</span></td>
          <td>${escapeHtml(siteName)}</td>
          <td>${escapeHtml(serviceName)}</td>
          <td>${statusBadge}</td>
          <td>
            <div class="btn-group-inline">
              ${actionButtons}
              ${historyBtn}
            </div>
          </td>
        </tr>
      `;
    }).join('');

    $$('#users-table .btn-edit-user').forEach(btn => {
      btn.onclick = () => openEditUserModal(btn.dataset.id, btn.dataset.role);
    });

    $$('#users-table .btn-deactivate-user').forEach(btn => {
      btn.onclick = () => softDeleteUser(btn.dataset.id, btn.dataset.role);
    });

    $$('#users-table .btn-reactivate-user').forEach(btn => {
      btn.onclick = () => reactivateUser(btn.dataset.id, btn.dataset.role);
    });

    $$('#users-table .btn-history-user').forEach(btn => {
      btn.onclick = () => openHistoryModal(btn.dataset.id, btn.dataset.role);
    });
  }

  function softDeleteUser(userId, role) {
    const operator = getCurrentSessionOperator();
    if (!operator) {
      showToast('Action impossible : Vous devez être connecté avec un profil RAF ou PDG actif pour modifier le statut du personnel.', '🚫');
      return;
    }

    let u = null;
    if (role === 'agent') u = getAgent(userId);
    else if (role === 'responsable') u = getResponsable(userId);
    else if (role === 'raf') u = getRaf(userId);

    if (!u) return;

    if (confirm(`Voulez-vous désactiver le compte de "${u.nom}" ?\nSon historique d'actions sera conservé (Désactivation logique).`)) {
      const now = new Date().toISOString();
      u.actif = false;
      u.dateDesactivation = now;

      if (!Array.isArray(u.historique)) u.historique = [];
      u.historique.push({
        action: 'desactivation',
        date: now,
        parId: operator.id,
        parNom: operator.nom
      });

      // STRICT RULE: Reset active session to null if deactivated user was logged in (NO AUTO-REALLOCATION)
      if (role === 'agent' && activeAgentId === userId) activeAgentId = null;
      if (role === 'responsable' && activeResponsableId === userId) activeResponsableId = null;
      if (role === 'raf' && activeRafId === userId) activeRafId = null;

      populateContextDropdowns();
      renderCurrentDashboard();
      renderUsersTable();
      showToast(`Compte de "${u.nom}" désactivé par ${operator.nom}. Mode déconnecté activé.`, '🔒');
    }
  }

  function reactivateUser(userId, role) {
    const operator = getCurrentSessionOperator();
    if (!operator) {
      showToast('Action impossible : Vous devez être connecté avec un profil RAF ou PDG actif pour modifier le statut du personnel.', '🚫');
      return;
    }

    let u = null;
    if (role === 'agent') u = getAgent(userId);
    else if (role === 'responsable') u = getResponsable(userId);
    else if (role === 'raf') u = getRaf(userId);

    if (!u) return;

    if (confirm(`Voulez-vous réactiver le compte de "${u.nom}" ?`)) {
      const now = new Date().toISOString();
      u.actif = true;
      u.dateDesactivation = null;

      if (!Array.isArray(u.historique)) u.historique = [];
      u.historique.push({
        action: 'reactivation',
        date: now,
        parId: operator.id,
        parNom: operator.nom
      });

      // STRICT RULE: NO auto-reallocation to active session on reactivation
      populateContextDropdowns();
      renderCurrentDashboard();
      renderUsersTable();
      showToast(`Compte de "${u.nom}" réactivé par ${operator.nom}. (Connexion manuelle requise)`, '✅');
    }
  }

  function openHistoryModal(userId, role) {
    let u = null;
    if (role === 'agent') u = getAgent(userId);
    else if (role === 'responsable') u = getResponsable(userId);
    else if (role === 'raf') u = getRaf(userId);

    if (!u) return;

    $('#modal-history-title').textContent = `📜 Historique des Statuts — ${u.nom}`;
    const contentBox = $('#modal-history-content');

    const historyList = Array.isArray(u.historique) ? u.historique : [];

    if (historyList.length === 0) {
      contentBox.innerHTML = `
        <div class="empty-state" style="padding: 1.5rem 0;">
          Aucune modification de statut enregistrée pour ce compte.<br>
          <small class="text-muted">Statut actuel : ${u.actif !== false ? 'Actif' : 'Inactif'}</small>
        </div>
      `;
    } else {
      contentBox.innerHTML = `
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Action</th>
                <th>Date &amp; Heure</th>
                <th>Effectué par</th>
              </tr>
            </thead>
            <tbody>
              ${historyList.slice().reverse().map(h => {
                const isDesact = h.action === 'desactivation';
                const actionBadge = isDesact
                  ? `<span class="status-pill status-recu" style="background:#fef2f2; color:#dc2626;">🔒 Désactivation</span>`
                  : `<span class="status-pill status-recu" style="background:#ecfdf5; color:#059669;">🔄 Réactivation</span>`;
                return `
                  <tr>
                    <td>${actionBadge}</td>
                    <td>${formatDateFull(h.date)}</td>
                    <td><strong>${escapeHtml(h.parNom || 'Non renseigné')}</strong></td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    $('#modal-history-overlay')?.classList.remove('hidden');
  }

  function softDeleteAgent(agentId) {
    softDeleteUser(agentId, 'agent');
  }

  function softDeleteRaf(rafId) {
    softDeleteUser(rafId, 'raf');
  }

  function openAddUserModal() {
    $('#user-id').value = '';
    $('#user-original-role').value = '';
    $('#user-name').value = '';
    $('#modal-user-title').textContent = '👤 Nouveau Compte Utilisateur';
    $('#btn-save-user').textContent = 'Créer le compte';

    const roleSel = $('#user-role');
    const siteSel = $('#user-site');
    const serviceSel = $('#user-service');
    const serviceWrapper = $('#user-service-wrapper');

    roleSel.disabled = false;
    roleSel.value = 'agent';

    siteSel.innerHTML = SITES.map(s => `<option value="${s.id}">${s.nom}</option>`).join('');
    siteSel.value = activeSiteId;

    const updateServiceOptions = () => {
      const selectedRole = roleSel.value;
      if (selectedRole === 'responsable') {
        serviceWrapper.style.display = 'block';
        const sList = SERVICES.filter(s => s.siteId === siteSel.value);
        serviceSel.innerHTML = sList.map(s => `<option value="${s.id}">${s.nom}</option>`).join('');
      } else {
        serviceWrapper.style.display = 'none';
      }
    };

    roleSel.onchange = updateServiceOptions;
    siteSel.onchange = updateServiceOptions;
    updateServiceOptions();

    $('#modal-user-overlay')?.classList.remove('hidden');
  }

  function openEditUserModal(userId, role) {
    let u = null;
    if (role === 'agent') u = getAgent(userId);
    else if (role === 'responsable') u = getResponsable(userId);
    else if (role === 'raf') u = getRaf(userId);

    if (!u) return;

    $('#user-id').value = u.id;
    $('#user-original-role').value = role;
    $('#user-name').value = u.nom;
    $('#modal-user-title').textContent = `✏️ Modifier le Compte (${u.nom})`;
    $('#btn-save-user').textContent = 'Enregistrer les modifications';

    const roleSel = $('#user-role');
    const siteSel = $('#user-site');
    const serviceSel = $('#user-service');
    const serviceWrapper = $('#user-service-wrapper');

    roleSel.value = role;
    roleSel.disabled = true;

    siteSel.innerHTML = SITES.map(s => `<option value="${s.id}">${s.nom}</option>`).join('');
    siteSel.value = u.siteId;

    const updateServiceOptions = () => {
      if (role === 'responsable') {
        serviceWrapper.style.display = 'block';
        const sList = SERVICES.filter(s => s.siteId === siteSel.value);
        serviceSel.innerHTML = sList.map(s => `<option value="${s.id}">${s.nom}</option>`).join('');
        if (u.serviceId) serviceSel.value = u.serviceId;
      } else {
        serviceWrapper.style.display = 'none';
      }
    };

    siteSel.onchange = updateServiceOptions;
    updateServiceOptions();

    $('#modal-user-overlay')?.classList.remove('hidden');
  }

  function handleSaveUserSubmit(e) {
    e.preventDefault();
    const id = $('#user-id').value;
    const originalRole = $('#user-original-role').value;
    const name = $('#user-name').value.trim();
    const role = $('#user-role').value;
    const siteId = $('#user-site').value;
    const serviceId = $('#user-service').value;

    if (!name || !siteId) return;

    if (id) {
      let u = null;
      if (originalRole === 'agent') u = getAgent(id);
      else if (originalRole === 'responsable') u = getResponsable(id);
      else if (originalRole === 'raf') u = getRaf(id);

      if (u) {
        u.nom = name;
        u.siteId = siteId;
        if (originalRole === 'responsable') u.serviceId = serviceId;
        showToast(`Fiche utilisateur de "${name}" mise à jour.`, '✏️');
      }
    } else {
      const newId = `${role}-${Date.now().toString().slice(-4)}`;
      const newUser = {
        id: newId,
        nom: name,
        siteId: siteId,
        actif: true,
        dateDesactivation: null,
        historique: []
      };

      if (role === 'agent') {
        AGENTS.push(newUser);
      } else if (role === 'responsable') {
        newUser.serviceId = serviceId;
        RESPONSABLES.push(newUser);
      } else if (role === 'raf') {
        RAF_LIST.push(newUser);
      }
      showToast(`Nouveau compte ${role.toUpperCase()} "${name}" créé !`, '👤');
    }

    closeModal();
    populateContextDropdowns();
    renderCurrentDashboard();
    renderUsersTable();
  }

  function openEditRafModal(rafId) {
    const r = getRaf(rafId);
    if (!r) return;

    $('#edit-raf-id').value = r.id;
    $('#edit-raf-name').value = r.nom;

    const siteSel = $('#edit-raf-site');
    if (siteSel) {
      siteSel.innerHTML = SITES.map(s => `<option value="${s.id}">${s.nom}</option>`).join('');
      siteSel.value = r.siteId;
    }

    $('#modal-edit-raf-overlay')?.classList.remove('hidden');
  }

  function handleEditRafSubmit(e) {
    e.preventDefault();
    const id = $('#edit-raf-id').value;
    const newName = $('#edit-raf-name').value.trim();
    const newSiteId = $('#edit-raf-site').value;

    const r = getRaf(id);
    if (r && newName && newSiteId) {
      r.nom = newName;
      r.siteId = newSiteId;

      closeModal();
      populateRafDropdown();
      showToast(`Fiche RAF de "${newName}" mise à jour.`, '✏️');
      switchRole('raf');
    }
  }

  function openEditAgentModal(agentId) {
    const a = getAgent(agentId);
    if (!a) return;

    $('#edit-agent-id').value = a.id;
    $('#edit-agent-name').value = a.nom;

    const siteSel = $('#edit-agent-site');
    if (siteSel) {
      siteSel.innerHTML = SITES.map(s => `<option value="${s.id}">${s.nom}</option>`).join('');
      siteSel.value = a.siteId;
    }

    $('#modal-edit-agent-overlay')?.classList.remove('hidden');
  }

  function handleEditAgentSubmit(e) {
    e.preventDefault();
    const id = $('#edit-agent-id').value;
    const newName = $('#edit-agent-name').value.trim();
    const newSiteId = $('#edit-agent-site').value;

    const a = getAgent(id);
    if (a && newName && newSiteId) {
      a.nom = newName;
      a.siteId = newSiteId;

      closeModal();
      populateAgentsDropdown();
      showToast(`Fiche agent de "${newName}" mise à jour.`, '✏️');
      switchRole('agent');
    }
  }

  function handleAddAgentSubmit(e) {
    e.preventDefault();
    const name = $('#new-agent-name').value.trim();
    const siteId = $('#new-agent-site').value;

    if (!name || !siteId) return;

    const newAgentId = `agent-${AGENTS.length + 1}`;
    const newAgent = {
      id: newAgentId,
      nom: name,
      siteId: siteId,
      actif: true,
      dateDesactivation: null
    };

    AGENTS.push(newAgent);
    activeAgentId = newAgentId;

    closeModal();
    populateAgentsDropdown();
    showToast(`Agent "${name}" créé et connecté !`, '📥');
    switchRole('agent');
  }

  function handleAddRespSubmit(e) {
    e.preventDefault();
    const respName = $('#new-resp-name').value.trim();
    const siteId = $('#new-resp-site').value;
    const serviceId = $('#new-resp-service').value;

    if (!respName || !siteId || !serviceId) return;

    const newRespId = `resp-${RESPONSABLES.length + 1}`;
    const newResp = {
      id: newRespId,
      nom: respName,
      siteId: siteId,
      serviceId: serviceId,
      actif: true,
      dateDesactivation: null
    };

    RESPONSABLES.push(newResp);
    activeResponsableId = newRespId;

    closeModal();
    populateResponsablesDropdown();
    showToast(`Responsable "${respName}" créé et connecté !`, '👤');
    switchRole('responsable');
  }

  function handleAddRafSubmit(e) {
    e.preventDefault();
    const name = $('#new-raf-name').value.trim();
    const siteId = $('#new-raf-site').value;

    if (!name || !siteId) return;

    const newRafId = `raf-${RAF_LIST.length + 1}`;
    const newRaf = {
      id: newRafId,
      nom: name,
      siteId: siteId,
      actif: true,
      dateDesactivation: null
    };

    RAF_LIST.push(newRaf);
    activeRafId = newRafId;

    closeModal();
    populateRafDropdown();
    showToast(`RAF "${name}" créé et connecté !`, '📊');
    switchRole('raf');
  }

  function handleAddTypeSubmit(e) {
    e.preventDefault();
    const typeName = $('#new-type-name').value.trim();

    if (!typeName) return;

    const typeId = typeName.toLowerCase().replace(/[^a-z0-9]/g, '_');
    if (TYPES_COURRIER.some(t => t.id === typeId)) {
      showToast('Ce type de courrier existe déjà.', '⚠️');
      return;
    }

    TYPES_COURRIER.push({
      id: typeId,
      label: `📄 ${typeName}`
    });

    populateTypesDropdown();
    $('#type-courrier').value = typeId;
    closeModal();
    showToast(`Nouveau type « ${typeName} » créé et sélectionné !`, '🏷️');
    renderCurrentDashboard();
  }

  // ══════════════════════════════════════════════════════════════════
  // SIMULATION & UPLOAD HANDLERS
  // ══════════════════════════════════════════════════════════════════

  function initDropzone() {
    const zone = $('#upload-zone');
    const input = $('#fichier');
    const nameLabel = $('#upload-filename');

    if (!zone || !input) return;

    zone.addEventListener('click', () => input.click());

    input.addEventListener('change', () => {
      if (input.files.length) {
        nameLabel.textContent = `📎 ${input.files[0].name}`;
      }
    });

    zone.addEventListener('dragover', (e) => {
      e.preventDefault();
      zone.classList.add('dragover');
    });

    zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));

    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('dragover');
      if (e.dataTransfer.files.length) {
        input.files = e.dataTransfer.files;
        nameLabel.textContent = `📎 ${e.dataTransfer.files[0].name}`;
      }
    });
  }

  function simulateIncomingMail() {
    const currentAgent = getAgent(activeAgentId);

    if (!currentAgent || currentAgent.actif === false) {
      showToast('Simulation impossible : Veuillez vous connecter avec un profil Agent valide.', '🚫');
      return;
    }

    const senders = [
      'Cabinet Notarial Maître Roche',
      'URSSAF Auvergne-Rhône-Alpes',
      'SFR Business PACA',
      'DREAL Office Environnement',
      'Banque de France'
    ];

    const randomSender = senders[Math.floor(Math.random() * senders.length)];
    const randomTypeObj = TYPES_COURRIER[Math.floor(Math.random() * TYPES_COURRIER.length)];
    const randomSite = SITES[Math.floor(Math.random() * SITES.length)];
    const siteServices = SERVICES.filter(s => s.siteId === randomSite.id);
    const randomService = siteServices[Math.floor(Math.random() * siteServices.length)];

    const newId = `CR-2026-${String(nextCounter++).padStart(3, '0')}`;

    const newMail = {
      id: newId,
      siteId: randomSite.id,
      serviceIds: [randomService.id],
      expediteur: randomSender,
      type: randomTypeObj.id,
      cotation: `SIMU-${Math.floor(1000 + Math.random() * 9000)}`,
      dateReception: new Date().toISOString(),
      statut: 'reçu',
      commentaire: 'Courrier reçu en simulation',
      fichier: 'document_scanne.pdf',
      agentId: currentAgent.id,
      agentNom: currentAgent.nom,
      estDecharge: false,
      dateDecharge: null,
      dechargeParId: null,
      dechargeParNom: null
    };

    courriers.unshift(newMail);
    showToast(`Nouveau courrier ${newId} simulé par ${newMail.agentNom} !`, '⚡');
    triggerBellPulse();
    renderCurrentDashboard();
  }

  // ══════════════════════════════════════════════════════════════════
  // EVENT LISTENERS & INITIALIZATION (WITH SELECT ACTION HANDLERS)
  // ══════════════════════════════════════════════════════════════════

  function initEvents() {
    $$('.role-tab').forEach(tab => {
      tab.addEventListener('click', () => switchRole(tab.dataset.role));
    });

    const roleSelect = $('#role-select');
    if (roleSelect) roleSelect.addEventListener('change', (e) => switchRole(e.target.value));

    // Context Site Switcher
    const siteSelect = $('#ctx-site-select');
    if (siteSelect) {
      siteSelect.addEventListener('change', (e) => {
        activeSiteId = e.target.value;
        updateServicesForActiveSite();
        switchRole(activeRole);
      });
    }

    // Context Service Switcher
    const serviceSelect = $('#ctx-service-select');
    if (serviceSelect) {
      serviceSelect.addEventListener('change', (e) => {
        activeServiceId = e.target.value;
        switchRole(activeRole);
      });
    }

    // POINT 2: Context Agent Switcher Change with Action Optgroups
    const agentSelect = $('#ctx-agent-select');
    if (agentSelect) {
      agentSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === '__action_add') {
          openAddAgentModal();
          agentSelect.value = activeAgentId ? activeAgentId : '__logout_state';
        } else if (val === '__action_edit') {
          if (activeAgentId) openEditAgentModal(activeAgentId);
          agentSelect.value = activeAgentId ? activeAgentId : '__logout_state';
        } else if (val === '__action_logout') {
          logoutUser();
        } else if (val === '__logout_state') {
          activeAgentId = null;
          switchRole('agent');
        } else {
          activeAgentId = val;
          const currentAgent = getAgent(activeAgentId);
          if (currentAgent) {
            activeSiteId = currentAgent.siteId;
            $('#ctx-site-select').value = activeSiteId;
            updateServicesForActiveSite();
          }
          switchRole('agent');
        }
      });
    }

    // POINT 2: Context Responsable Switcher Change with Action Optgroups
    const respSelect = $('#ctx-resp-select');
    if (respSelect) {
      respSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === '__action_add') {
          openAddRespModal();
          respSelect.value = activeResponsableId ? activeResponsableId : '__logout_state';
        } else if (val === '__action_edit') {
          if (activeResponsableId) openEditResponsableModal(activeResponsableId);
          respSelect.value = activeResponsableId ? activeResponsableId : '__logout_state';
        } else if (val === '__action_logout') {
          logoutUser();
        } else if (val === '__logout_state') {
          activeResponsableId = null;
          switchRole('responsable');
        } else {
          activeResponsableId = val;
          const currentResp = getResponsable(activeResponsableId);
          if (currentResp) {
            activeSiteId = currentResp.siteId;
            activeServiceId = currentResp.serviceId;
            $('#ctx-site-select').value = activeSiteId;
            updateServicesForActiveSite();
          }
          switchRole('responsable');
        }
      });
    }

    // Context RAF Switcher Change with Action Optgroups
    const rafSelect = $('#ctx-raf-select');
    if (rafSelect) {
      rafSelect.addEventListener('change', (e) => {
        const val = e.target.value;
        if (val === '__action_add') {
          openAddRafModal();
          rafSelect.value = activeRafId ? activeRafId : '__logout_state';
        } else if (val === '__action_edit') {
          if (activeRafId) openEditRafModal(activeRafId);
          rafSelect.value = activeRafId ? activeRafId : '__logout_state';
        } else if (val === '__action_logout') {
          logoutUser();
        } else if (val === '__logout_state') {
          activeRafId = null;
          switchRole('raf');
        } else {
          activeRafId = val;
          const currentRaf = getRaf(activeRafId);
          if (currentRaf) {
            activeSiteId = currentRaf.siteId;
            $('#ctx-site-select').value = activeSiteId;
            updateServicesForActiveSite();
          }
          switchRole('raf');
        }
      });
    }

    // Header Logout Button Trigger
    $('#btn-logout-header')?.addEventListener('click', logoutUser);

    // Responsable Filter Pills
    $$('#resp-filter-pills .pill-filter').forEach(pill => {
      pill.addEventListener('click', () => {
        $$('#resp-filter-pills .pill-filter').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        respFilter = pill.dataset.filter;
        renderResponsableView();
      });
    });

    // RAF & PDG Filters
    $('#raf-service-filter')?.addEventListener('change', renderRAFView);
    $('#pdg-site-filter')?.addEventListener('change', renderPDGView);
    $('#pdg-service-filter')?.addEventListener('change', renderPDGView);

    // Agent Form Submit & Search
    $('#form-courrier')?.addEventListener('submit', handleAgentFormSubmit);
    $('#agent-search')?.addEventListener('input', renderAgentView);

    // Modals Open Triggers
    $('#btn-open-add-agent')?.addEventListener('click', openAddAgentModal);
    $('#btn-open-add-resp')?.addEventListener('click', openAddRespModal);
    $('#btn-add-service-inline')?.addEventListener('click', openAddServiceModal);
    $('#btn-open-add-service')?.addEventListener('click', openAddServiceModal);
    $('#btn-add-type-inline')?.addEventListener('click', () => {
      $('#modal-type-overlay')?.classList.remove('hidden');
    });

    function openAddAgentModal() {
      const siteSel = $('#new-agent-site');
      if (siteSel) {
        siteSel.innerHTML = SITES.map(s => `<option value="${s.id}">${s.nom}</option>`).join('');
        siteSel.value = activeSiteId;
      }
      $('#modal-agent-overlay')?.classList.remove('hidden');
    }

    function openAddRespModal() {
      const siteSel = $('#new-resp-site');
      const serviceSel = $('#new-resp-service');

      if (siteSel) {
        siteSel.innerHTML = SITES.map(s => `<option value="${s.id}">${s.nom}</option>`).join('');
        siteSel.value = activeSiteId;

        const updateRespServices = () => {
          const sList = SERVICES.filter(s => s.siteId === siteSel.value);
          serviceSel.innerHTML = sList.map(s => `<option value="${s.id}">${s.nom}</option>`).join('');
        };

        siteSel.onchange = updateRespServices;
        updateRespServices();
      }
      $('#modal-resp-overlay')?.classList.remove('hidden');
    }

    function openAddRafModal() {
      const siteSel = $('#new-raf-site');
      if (siteSel) {
        siteSel.innerHTML = SITES.map(s => `<option value="${s.id}">${s.nom}</option>`).join('');
        siteSel.value = activeSiteId;
      }
      $('#modal-raf-overlay')?.classList.remove('hidden');
    }

    function openAddServiceModal() {
      const siteSel = $('#new-service-site');
      const siteBox = $('#new-service-sites-box');

      if (siteSel) {
        siteSel.innerHTML = SITES.map(s => `<option value="${s.id}">${s.nom}</option>`).join('');
        siteSel.value = activeSiteId;
      }
      if (siteBox) {
        siteBox.innerHTML = SITES.map(s => `
          <label class="checkbox-pill">
            <input type="checkbox" name="new-service-site-check" value="${s.id}" ${s.id === activeSiteId ? 'checked' : ''}>
            <span>${escapeHtml(s.nom)}</span>
          </label>
        `).join('');
      }

      $('#modal-service-overlay')?.classList.remove('hidden');
    }

    // Toggle multi-site checkboxes visibility in service modals based on scope radio
    $$('input[name="new-service-scope"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        const sitesBox = $('#new-service-sites-box-wrapper');
        if (sitesBox) sitesBox.style.display = e.target.value === 'selected' ? 'block' : 'none';
      });
    });

    $$('input[name="edit-service-scope"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        const sitesBox = $('#edit-service-sites-box-wrapper');
        if (sitesBox) sitesBox.style.display = e.target.value === 'selected' ? 'block' : 'none';
      });
    });

    $$('input[name="delete-service-scope"]').forEach(radio => {
      radio.addEventListener('change', (e) => {
        const sitesBox = $('#delete-service-sites-box-wrapper');
        if (sitesBox) sitesBox.style.display = e.target.value === 'selected' ? 'block' : 'none';
      });
    });

    // Form Modals Submits
    $('#btn-open-add-user')?.addEventListener('click', openAddUserModal);
    $('#form-user')?.addEventListener('submit', handleSaveUserSubmit);

    $('#form-add-type')?.addEventListener('submit', handleAddTypeSubmit);
    $('#form-add-service')?.addEventListener('submit', handleAddServiceSubmit);
    $('#form-edit-service')?.addEventListener('submit', handleEditServiceSubmit);
    $('#form-delete-service-scope')?.addEventListener('submit', handleDeleteServiceScopeSubmit);
    $('#form-realloc-service')?.addEventListener('submit', handleConfirmReallocation);

    $('#form-add-agent')?.addEventListener('submit', handleAddAgentSubmit);
    $('#form-edit-agent')?.addEventListener('submit', handleEditAgentSubmit);

    $('#form-add-resp')?.addEventListener('submit', handleAddRespSubmit);
    $('#form-edit-resp')?.addEventListener('submit', handleEditResponsableSubmit);

    $('#form-add-raf')?.addEventListener('submit', handleAddRafSubmit);
    $('#form-edit-raf')?.addEventListener('submit', handleEditRafSubmit);

    // Modal Close Triggers
    $('#modal-cancel')?.addEventListener('click', closeModal);
    $('#modal-close')?.addEventListener('click', closeModal);
    $('#modal-confirm')?.addEventListener('click', confirmAccuseReceipt);

    $$('.modal-backdrop').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModal();
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

    // Simulation Button Event (Moved into Agent View)
    $('#btn-simu-courrier')?.addEventListener('click', simulateIncomingMail);

    initDropzone();
  }

  function initApp() {
    populateContextDropdowns();
    initEvents();
    switchRole('agent');
  }

  document.addEventListener('DOMContentLoaded', initApp);
})();
