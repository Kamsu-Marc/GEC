import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { useCourriers } from '../hooks/useCourriers';

export const ResponsableView = () => {
  const { userProfile, activeSiteId, activeResponsableId, getCurrentSessionOperator } = useContext(AuthContext);
  const { responsables, services, showToast } = useContext(DataContext);
  const { courriers, accuseReceipt, updateStatutCourrier } = useCourriers();

  const operator = getCurrentSessionOperator();
  const activeResp = (userProfile && userProfile.role === 'responsable' && userProfile.actif !== false)
    ? userProfile
    : (operator ? { id: operator.id, nom: operator.nom, serviceId: userProfile?.service_id || userProfile?.serviceId } : responsables.find(r => r.id === activeResponsableId && r.actif !== false));

  const respServiceId = activeResp ? (activeResp.service_id || activeResp.serviceId) : null;
  const respService = respServiceId 
    ? services.find(s => s.id === respServiceId) 
    : (services.find(s => s.siteId === activeSiteId && s.actif !== false) || services[0] || null);

  // Courriers multi-services rattachés au service du responsable
  const serviceCourriers = respService 
    ? courriers.filter(c => c.siteId === activeSiteId && c.serviceIds.includes(respService.id))
    : [];

  const pendingSignatureCourriers = serviceCourriers.filter(c => !c.estDecharge);
  const activeCourriers = serviceCourriers.filter(c => c.estDecharge && c.statut !== 'traité');

  const handleSignAccuse = (courrierId) => {
    if (!activeResp) {
      showToast('Action impossible : Aucun responsable actif connecté.', '🚫');
      return;
    }
    accuseReceipt(courrierId, activeResp.id);
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

  return (
    <div className="dashboard-view active">
      <div className="view-header">
        <div>
          <h2>👔 Vue Responsable — Service {respService ? respService.nom : '—'}</h2>
          <p className="view-subtitle">Accusé de réception des plis remis et traitement interne du courrier du service.</p>
        </div>
      </div>

      {!activeResp ? (
        <div className="card-panel alert-notice-banner">
          ⚠️ Aucun responsable connecté sur ce site. Veuillez vérifier la connexion du compte.
        </div>
      ) : (
        <>
          {/* Unsigned Courriers Alert Section */}
          {pendingSignatureCourriers.length > 0 && (
            <div className="card-panel" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--color-warning)' }}>
              <h3>✍️ Remises de Courriers à Signer ({pendingSignatureCourriers.length})</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                L'agent a déposé des courriers à l'attention de votre service. Confirmez la réception physique ci-dessous :
              </p>
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Réf. Courrier</th>
                      <th>Expéditeur</th>
                      <th>Cotation</th>
                      <th>Agent Déposant</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingSignatureCourriers.map(c => (
                      <tr key={c.id}>
                        <td><strong>{c.id}</strong></td>
                        <td>{c.expediteur}</td>
                        <td>{c.cotation}</td>
                        <td>{c.agentNom}</td>
                        <td>
                          <button
                            type="button"
                            className="btn btn-sm btn-success"
                            onClick={() => handleSignAccuse(c.id)}
                          >
                            ✍️ Signer l'Accusé de Réception
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Active Courriers Table */}
          <div className="card-panel">
            <h3>📋 Courriers en cours de traitement ({activeCourriers.length})</h3>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Réf. &amp; Date</th>
                    <th>Expéditeur</th>
                    <th>Statut Actuel</th>
                    <th>Commentaire / Instruction</th>
                    <th>Changer le Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {activeCourriers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="empty-state">
                        Aucun courrier en cours de traitement dans ce service.
                      </td>
                    </tr>
                  ) : (
                    activeCourriers.map(c => (
                      <tr key={c.id}>
                        <td>
                          <strong>{c.id}</strong><br />
                          <small className="text-muted">{formatDateShort(c.dateReception)}</small>
                        </td>
                        <td>
                          <strong>{c.expediteur}</strong><br />
                          <small className="text-muted">{c.cotation}</small>
                        </td>
                        <td>
                          <span className={`status-pill status-${c.statut === 'reçu' ? 'recu' : c.statut === 'distribué' ? 'distribue' : 'traite'}`}>
                            ● {c.statut.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '0.85rem' }}>{c.commentaire || '—'}</span>
                        </td>
                        <td>
                          <div className="btn-group-inline">
                            <button
                              type="button"
                              className="btn btn-xs btn-outline-primary"
                              onClick={() => updateStatutCourrier(c.id, 'en cours')}
                            >
                              ⏳ En cours
                            </button>
                            <button
                              type="button"
                              className="btn btn-xs btn-success"
                              onClick={() => updateStatutCourrier(c.id, 'traité')}
                            >
                              ✅ Classer Traité
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
