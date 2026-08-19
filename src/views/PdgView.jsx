import React, { useContext } from 'react';
import { DataContext } from '../context/DataContext';
import { StatCard } from '../components/common/StatCard';

export const PdgView = () => {
  const { sites, services, agents, responsables, rafs, courriers } = useContext(DataContext);

  const totalCourriers = courriers.length;
  const overdueCourriers = courriers.filter(c => {
    if (c.statut === 'traité') return false;
    const diffHours = (new Date() - new Date(c.dateReception)) / (1000 * 60 * 60);
    return diffHours > 48;
  }).length;

  const totalUsers = agents.length + responsables.length + rafs.length;
  const activeUsers = [
    ...agents.filter(a => a.actif !== false),
    ...responsables.filter(r => r.actif !== false),
    ...rafs.filter(r => r.actif !== false)
  ].length;

  return (
    <div className="dashboard-view active">
      <div className="view-header">
        <div>
          <h2>⭐ Vue PDG — Direction Générale &amp; Supervision Réseau</h2>
          <p className="view-subtitle">Vue consolidée multi-sites, indicateurs clés de performance et métriques globales d'activité.</p>
        </div>
      </div>

      {/* Global KPIs */}
      <div className="kpi-grid">
        <StatCard label="Total Courriers Réseau" value={totalCourriers} />
        <StatCard label="Courriers en Retard (>48h)" value={overdueCourriers} type={overdueCourriers > 0 ? 'danger' : 'success'} />
        <StatCard label="Sites Rattachés" value={sites.length} />
        <StatCard label="Personnel Actif Réseau" value={`${activeUsers} / ${totalUsers}`} type="success" />
      </div>

      {/* Site breakdown cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {sites.map(site => {
          const siteCourriers = courriers.filter(c => c.siteId === site.id);
          const siteServices = services.filter(s => s.siteId === site.id && s.actif !== false);
          const siteAgents = agents.filter(a => a.siteId === site.id && a.actif !== false);
          const siteResps = responsables.filter(r => r.siteId === site.id && r.actif !== false);
          const siteRafs = rafs.filter(r => r.siteId === site.id && r.actif !== false);

          const siteOverdue = siteCourriers.filter(c => {
            if (c.statut === 'traité') return false;
            const diffHours = (new Date() - new Date(c.dateReception)) / (1000 * 60 * 60);
            return diffHours > 48;
          }).length;

          return (
            <div key={site.id} className="card-panel">
              <h3>🏢 {site.nom}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '1rem', fontSize: '0.9rem' }}>
                <div className="stat-row">
                  <span>Courriers enregistrés :</span>
                  <strong>{siteCourriers.length}</strong>
                </div>
                <div className="stat-row">
                  <span>En retard (&gt;48h) :</span>
                  <strong style={{ color: siteOverdue > 0 ? 'var(--color-danger)' : 'var(--color-success)' }}>
                    {siteOverdue}
                  </strong>
                </div>
                <div className="stat-row">
                  <span>Services actifs :</span>
                  <strong>{siteServices.length}</strong>
                </div>
                <div className="stat-row">
                  <span>Agents courrier :</span>
                  <strong>{siteAgents.length}</strong>
                </div>
                <div className="stat-row">
                  <span>Responsables :</span>
                  <strong>{siteResps.length}</strong>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
