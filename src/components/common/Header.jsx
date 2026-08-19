import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { DataContext } from '../../context/DataContext';
import { OfflineContext } from '../../context/OfflineContext';

export const Header = () => {
  const {
    userProfile,
    logout,
    activeRole,
    activeSiteId,
    setActiveSiteId,
    activeAgentId,
    setActiveAgentId,
    activeResponsableId,
    setActiveResponsableId,
    activeRafId,
    setActiveRafId,
    getCurrentSessionOperator
  } = useContext(AuthContext);

  const { sites, agents, responsables, rafs } = useContext(DataContext);
  const { isOnline } = useContext(OfflineContext);

  const currentOperator = getCurrentSessionOperator();

  // Active site lists (for prototype fallback)
  const siteAgents = agents.filter(a => a.siteId === activeSiteId && a.actif !== false);

  const roleBadges = {
    agent: '👤 Agent Courrier',
    responsable: '👔 Responsable Service',
    raf: '🔑 RAF (Admin Site)',
    pdg: '⭐ PDG (Direction Générale)'
  };

  return (
    <header>
      <div className="top-header">
        <div className="header-container">
          <div className="brand-section">
            <div className="brand-icon">📬</div>
            <div className="brand-text">
              <h1>Gestion Courrier Entrant</h1>
              <span className="brand-subtitle">Système de Suivi Multi-Sites &amp; Multi-Services</span>
            </div>
          </div>

          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {!isOnline && (
              <span style={{ fontSize: '0.75rem', background: '#fef2f2', color: '#dc2626', padding: '0.2rem 0.6rem', borderRadius: '999px', fontWeight: 700, border: '1px solid #fca5a5' }}>
                ⚡ Mode Hors-Ligne
              </span>
            )}
            
            {userProfile && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                background: 'rgba(255, 255, 255, 0.15)',
                padding: '0.4rem 0.8rem',
                borderRadius: '8px',
                backdropFilter: 'blur(4px)'
              }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#ffffff' }}>
                    {userProfile.nom}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#cbd5e1', fontWeight: 600 }}>
                    {roleBadges[userProfile.role] || userProfile.role}
                  </div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={logout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#ef4444',
                color: '#ffffff',
                border: 'none',
                padding: '0.5rem 0.9rem',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              title="Se déconnecter de la session Supabase"
            >
              <span>🚪</span>
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>

      {/* Context Sub-Bar */}
      <div className="context-bar">
        <div className="context-container">
          <div className="context-selector-group">
            <div className="context-field">
              <label htmlFor="header-site-select">🏢 Site :</label>
              <select
                id="header-site-select"
                className="ctx-select"
                value={activeSiteId}
                onChange={(e) => setActiveSiteId(e.target.value)}
              >
                {sites.map(s => (
                  <option key={s.id} value={s.id}>{s.nom}</option>
                ))}
              </select>
            </div>

            {userProfile ? (
              <div className="context-field" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#f8fafc', padding: '0.3rem 0.75rem', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Connecté :</span>
                <span style={{ fontSize: '0.875rem', color: '#0f172a', fontWeight: 700 }}>{userProfile.nom}</span>
              </div>
            ) : (
              activeRole === 'agent' && (
                <div className="context-field">
                  <label htmlFor="header-agent-select">👤 Agent Connecté :</label>
                  <select
                    id="header-agent-select"
                    className="ctx-select"
                    value={activeAgentId || ''}
                    onChange={(e) => setActiveAgentId(e.target.value || null)}
                  >
                    {siteAgents.length === 0 ? (
                      <option value="">Aucun agent actif sur ce site</option>
                    ) : (
                      siteAgents.map(a => (
                        <option key={a.id} value={a.id}>{a.nom}</option>
                      ))
                    )}
                  </select>
                </div>
              )
            )}
          </div>

          <div className="user-profile-summary">
            <span>Opérateur Session :</span>
            <span className="user-name">
              {currentOperator ? currentOperator.nom : '🔒 Déconnecté / Inactif'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
