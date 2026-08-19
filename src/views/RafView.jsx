import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';
import { useUsers } from '../hooks/useUsers';
import { useServices } from '../hooks/useServices';
import { StatCard } from '../components/common/StatCard';

export const RafView = ({ onOpenUserModal, onOpenHistoryModal, onOpenDeleteServiceModal, onOpenServiceModal }) => {
  const { activeSiteId, getCurrentSessionOperator } = useContext(AuthContext);
  const { sites, services, courriers } = useContext(DataContext);
  const { agents, responsables, rafs, softDeleteUser, reactivateUser } = useUsers();
  const { getSite } = useServices();

  const activeSiteObj = getSite(activeSiteId);

  // Users for active site
  const siteAgents = agents.filter(a => a.siteId === activeSiteId);
  const siteResps = responsables.filter(r => r.siteId === activeSiteId);
  const siteRafs = rafs.filter(r => r.siteId === activeSiteId);

  const allSiteUsers = [
    ...siteAgents.map(a => ({ ...a, roleKey: 'agent', roleLabel: 'Agent Courrier' })),
    ...siteResps.map(r => ({ ...r, roleKey: 'responsable', roleLabel: 'Responsable de Service' })),
    ...siteRafs.map(r => ({ ...r, roleKey: 'raf', roleLabel: 'RAF (Admin Site)' }))
  ];

  // Services for active site
  const siteServices = services.filter(s => s.siteId === activeSiteId);

  // Courriers metrics for active site
  const siteCourriers = courriers.filter(c => c.siteId === activeSiteId);
  const overdueCourriersCount = siteCourriers.filter(c => {
    if (c.statut === 'traité') return false;
    const diffHours = (new Date() - new Date(c.dateReception)) / (1000 * 60 * 60);
    return diffHours > 48;
  }).length;

  function formatDateShort(isoString) {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch (e) {
      return isoString;
    }
  }

  return (
    <div className="dashboard-view active">
      <div className="view-header">
        <div>
          <h2>🔑 Vue RAF — Administration du Site ({activeSiteObj ? activeSiteObj.nom : activeSiteId})</h2>
          <p className="view-subtitle">Gestion du personnel du site, création de services et désactivation sécurisée avec soft-delete.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onOpenUserModal(null)}
          >
            ➕ Ajouter un Utilisateur
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onOpenServiceModal}
          >
            🏢 + Ajouter un service
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="kpi-grid">
        <StatCard label="Total Personnel du Site" value={allSiteUsers.length} />
        <StatCard label="Comptes Actifs" value={allSiteUsers.filter(u => u.actif !== false).length} type="success" />
        <StatCard label="Comptes Désactivés" value={allSiteUsers.filter(u => u.actif === false).length} />
        <StatCard label="Courriers en Retard (>48h)" value={overdueCourriersCount} type={overdueCourriersCount > 0 ? 'danger' : 'success'} />
      </div>

      <div className="grid-2col">
        {/* Personnel Table */}
        <div className="card-panel" style={{ gridColumn: '1 / -1' }}>
          <div className="flex-between" style={{ marginBottom: '1rem' }}>
            <h3>👥 Répertoire du Personnel du Site</h3>
            <span className="text-muted" style={{ fontSize: '0.82rem' }}>Désactivation logique conservant l'historique complet</span>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nom Complexe</th>
                  <th>Rôle</th>
                  <th>Site</th>
                  <th>Service</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allSiteUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-state">
                      Aucun compte utilisateur sur ce site.
                    </td>
                  </tr>
                ) : (
                  allSiteUsers.map(u => {
                    const isActif = u.actif !== false;
                    const serviceObj = u.serviceId ? services.find(s => s.id === u.serviceId) : null;
                    const serviceName = serviceObj ? serviceObj.nom : '—';

                    return (
                      <tr key={`${u.roleKey}-${u.id}`} className={!isActif ? 'row-inactive' : ''}>
                        <td><strong>{u.nom}</strong></td>
                        <td><span className="user-role-tag">{u.roleLabel}</span></td>
                        <td>{activeSiteObj ? activeSiteObj.nom : u.siteId}</td>
                        <td>{serviceName}</td>
                        <td>
                          {isActif ? (
                            <span className="status-pill status-recu">● Actif</span>
                          ) : (
                            <span className="status-pill status-distribue" style={{ background: '#f1f5f9', color: '#64748b' }}>
                              ○ Inactif (désactivé le {formatDateShort(u.dateDesactivation)})
                            </span>
                          )}
                        </td>
                        <td>
                          <div className="btn-group-inline">
                            <button
                              type="button"
                              className="btn btn-xs btn-outline-primary"
                              onClick={() => onOpenUserModal(u)}
                            >
                              ✏️ Modifier
                            </button>

                            {isActif ? (
                              <button
                                type="button"
                                className="btn btn-xs btn-danger"
                                onClick={() => softDeleteUser(u.id, u.roleKey)}
                              >
                                🔒 Désactiver
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="btn btn-xs btn-success"
                                onClick={() => reactivateUser(u.id, u.roleKey)}
                              >
                                🔄 Réactiver
                              </button>
                            )}

                            <button
                              type="button"
                              className="btn btn-xs btn-secondary"
                              onClick={() => onOpenHistoryModal(`📜 Historique — ${u.nom}`, u.historique, isActif ? 'Actif' : 'Inactif')}
                              title="Consulter l'historique"
                            >
                              📜 Historique
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Services Table */}
        <div className="card-panel" style={{ gridColumn: '1 / -1' }}>
          <div className="flex-between" style={{ marginBottom: '1rem' }}>
            <h3>🏢 Services du Site ({siteServices.length})</h3>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={onOpenServiceModal}
            >
              ➕ Ajouter un Service
            </button>
          </div>

          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nom du Service</th>
                  <th>Statut</th>
                  <th>Courriers Rattachés</th>
                  <th>Responsables Rattachés</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {siteServices.map(s => {
                  const isActif = s.actif !== false;
                  const attachedMailsCount = courriers.filter(c => c.serviceIds.includes(s.id)).length;
                  const attachedRespsCount = responsables.filter(r => r.serviceId === s.id && r.actif !== false).length;

                  return (
                    <tr key={s.id} className={!isActif ? 'row-inactive' : ''}>
                      <td><strong>{s.nom}</strong></td>
                      <td>
                        {isActif ? (
                          <span className="status-pill status-recu">● Actif</span>
                        ) : (
                          <span className="status-pill status-distribue" style={{ background: '#f1f5f9', color: '#64748b' }}>
                            ○ Inactif
                          </span>
                        )}
                      </td>
                      <td>{attachedMailsCount} courrier(s)</td>
                      <td>{attachedRespsCount} responsable(s)</td>
                      <td>
                        {isActif && (
                          <button
                            type="button"
                            className="btn btn-xs btn-danger"
                            onClick={() => onOpenDeleteServiceModal(s)}
                          >
                            🗑️ Désactiver
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
