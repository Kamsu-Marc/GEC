import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { useCourriers } from '../hooks/useCourriers';

export const AgentView = () => {
  const { userProfile, activeSiteId, activeAgentId, getCurrentSessionOperator } = useContext(AuthContext);
  const { sites, services, typesCourrier, agents, responsables, showToast } = useContext(DataContext);
  const { courriers, addCourrier } = useCourriers();

  // Form state
  const [selectedServiceIds, setSelectedServiceIds] = useState([]);
  const [expediteur, setExpediteur] = useState('');
  const [type, setType] = useState('administratif');
  const [cotation, setCotation] = useState('');
  const [commentaire, setCommentaire] = useState('');
  const [fichier, setFichier] = useState('');

  // Filter state
  const [statusFilter, setStatusFilter] = useState('all');

  // Active agent resolution
  const operator = getCurrentSessionOperator();
  const activeAgent = (userProfile && userProfile.role === 'agent' && userProfile.actif !== false)
    ? userProfile
    : (operator ? { id: operator.id, nom: operator.nom } : agents.find(a => a.id === activeAgentId));

  // Active site services
  const siteServices = services.filter(s => s.siteId === activeSiteId && s.actif !== false);

  // Courriers for active site
  const siteCourriers = courriers.filter(c => c.siteId === activeSiteId);
  const filteredCourriers = siteCourriers.filter(c => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'reçu') return c.statut === 'reçu';
    if (statusFilter === 'distribué') return c.statut === 'distribué';
    if (statusFilter === 'traité') return c.statut === 'traité';
    return true;
  });

  const handleToggleService = (sId) => {
    setSelectedServiceIds(prev =>
      prev.includes(sId) ? prev.filter(id => id !== sId) : [...prev, sId]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const currentAgentId = activeAgent ? activeAgent.id : activeAgentId;
    if (!currentAgentId || !activeAgent) {
      showToast('Enregistrement impossible : Aucun agent courrier actif sélectionné.', '🚫');
      return;
    }
    if (selectedServiceIds.length === 0) {
      showToast('Veuillez cocher au moins un service destinataire.', '⚠️');
      return;
    }
    if (!expediteur.trim()) {
      showToast('Veuillez indiquer l\'expéditeur du courrier.', '⚠️');
      return;
    }

    addCourrier({
      siteId: activeSiteId,
      serviceIds: selectedServiceIds,
      expediteur: expediteur.trim(),
      type,
      cotation: cotation.trim(),
      commentaire: commentaire.trim(),
      fichier: fichier ? fichier : null,
      agentId: currentAgentId
    });

    // Reset form
    setSelectedServiceIds([]);
    setExpediteur('');
    setType('administratif');
    setCotation('');
    setCommentaire('');
    setFichier('');
  };

  function formatDateShort(isoString) {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return isoString;
    }
  }

  function isOverdue(isoString, statut) {
    if (statut === 'traité') return false;
    const diffHours = (new Date() - new Date(isoString)) / (1000 * 60 * 60);
    return diffHours > 48;
  }

  return (
    <div className="dashboard-view active">
      <div className="view-header">
        <div>
          <h2>📬 Vue Agent Courrier — Saisie &amp; Distribution</h2>
          <p className="view-subtitle">Enregistrement des nouveaux plis arrivants et remise en main propre contre décharge.</p>
        </div>
      </div>

      <div className="grid-2col">
        {/* Form panel */}
        <div className="card-panel">
          <h3>📥 Nouveau Courrier Entrant</h3>

          {!activeAgent ? (
            <div className="alert-notice-banner">
              ⚠️ Aucun agent connecté sur ce site. Veuillez vérifier la connexion du compte.
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Agent Saisisseur :</label>
                <input type="text" className="form-control" value={activeAgent.nom} disabled />
              </div>

              <div className="form-group">
                <label>Services Destinataires (Multi-Services) *</label>
                <div className="multi-select-box">
                  {siteServices.length === 0 ? (
                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>Aucun service actif sur ce site</span>
                  ) : (
                    siteServices.map(s => (
                      <label key={s.id} className="checkbox-pill">
                        <input
                          type="checkbox"
                          checked={selectedServiceIds.includes(s.id)}
                          onChange={() => handleToggleService(s.id)}
                        />
                        <span>{s.nom}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="agent-expediteur">Expéditeur / Organisme *</label>
                <input
                  type="text"
                  id="agent-expediteur"
                  className="form-control"
                  value={expediteur}
                  onChange={(e) => setExpediteur(e.target.value)}
                  placeholder="Ex: URSSAF, Banque, Client..."
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="agent-type">Nature / Type du courrier *</label>
                <select
                  id="agent-type"
                  className="form-control"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  {typesCourrier.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="agent-cotation">Référence / Cotation</label>
                <input
                  type="text"
                  id="agent-cotation"
                  className="form-control"
                  value={cotation}
                  onChange={(e) => setCotation(e.target.value)}
                  placeholder="Ex: REF-2026-99"
                />
              </div>

              <div className="form-group">
                <label htmlFor="agent-commentaire">Instruction / Commentaire</label>
                <textarea
                  id="agent-commentaire"
                  className="form-control"
                  rows="2"
                  value={commentaire}
                  onChange={(e) => setCommentaire(e.target.value)}
                  placeholder="Remarques éventuelles..."
                />
              </div>

              <div className="form-group">
                <label>Numérisation (Optionnel)</label>
                <input
                  type="text"
                  className="form-control"
                  value={fichier}
                  onChange={(e) => setFichier(e.target.value)}
                  placeholder="Nom du fichier joint (ex: document.pdf)"
                />
              </div>

              <button type="submit" className="btn btn-primary btn-full">
                📩 Enregistrer le Courrier
              </button>
            </form>
          )}
        </div>

        {/* Courriers table panel */}
        <div className="card-panel">
          <div className="flex-between" style={{ marginBottom: '1rem' }}>
            <h3>Registre des Courriers du Site ({siteCourriers.length})</h3>
            <div className="filter-pills">
              <button
                type="button"
                className={`pill-filter ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                Tous ({siteCourriers.length})
              </button>
              <button
                type="button"
                className={`pill-filter ${statusFilter === 'reçu' ? 'active' : ''}`}
                onClick={() => setStatusFilter('reçu')}
              >
                À Distribuer
              </button>
              <button
                type="button"
                className={`pill-filter ${statusFilter === 'distribué' ? 'active' : ''}`}
                onClick={() => setStatusFilter('distribué')}
              >
                Distribués
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Réf. &amp; Date</th>
                  <th>Expéditeur</th>
                  <th>Services Destinataires</th>
                  <th>Statut</th>
                  <th>Accusé de Décharge</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourriers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="empty-state">
                      Aucun courrier enregistré sur ce site pour ce filtre.
                    </td>
                  </tr>
                ) : (
                  filteredCourriers.map(c => {
                    const overdue = isOverdue(c.dateReception, c.statut);
                    const attachedServices = services.filter(s => c.serviceIds.includes(s.id));

                    return (
                      <tr key={c.id} className={overdue ? 'row-overdue' : ''}>
                        <td>
                          <strong>{c.id}</strong><br />
                          <small className="text-muted">{formatDateShort(c.dateReception)}</small>
                          {overdue && <span className="status-pill status-recu" style={{ background: '#fef2f2', color: '#dc2626', display: 'block', width: 'fit-content', marginTop: '2px' }}>🚨 Retard &gt;48h</span>}
                        </td>
                        <td>
                          <strong>{c.expediteur}</strong><br />
                          <small className="text-muted">Réf: {c.cotation}</small>
                        </td>
                        <td>
                          {attachedServices.map(s => (
                            <span key={s.id} className="service-badge-tag">{s.nom}</span>
                          ))}
                        </td>
                        <td>
                          <span className={`status-pill status-${c.statut === 'reçu' ? 'recu' : c.statut === 'distribué' ? 'distribue' : 'traite'}`}>
                            ● {c.statut.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          {c.estDecharge ? (
                            <div className="decharge-signature-notice">
                              ✍️ Signé par <strong>{c.dechargeParNom}</strong><br />
                              <small>{formatDateShort(c.dateDecharge)}</small>
                            </div>
                          ) : (
                            <span className="text-muted" style={{ fontSize: '0.8rem' }}>En attente de remise</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
