import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export function LoginView() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password) {
      setErrorMsg('Veuillez renseigner votre adresse e-mail et votre mot de passe.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(email.trim(), password);
      if (!res.success) {
        setErrorMsg(res.message || 'Échec de la connexion. Veuillez vérifier vos identifiants.');
      }
    } catch (err) {
      setErrorMsg('Une erreur inattendue est survenue : ' + (err.message || 'Connexion impossible'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
      padding: '1.5rem',
      fontFamily: 'inherit'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
        background: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
        padding: '2.5rem 2rem',
        boxSizing: 'border-box'
      }}>
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            fontSize: '3rem',
            lineHeight: 1,
            marginBottom: '0.75rem'
          }}>📬</div>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            color: '#0f172a',
            margin: '0 0 0.5rem 0'
          }}>Gestion Courrier Entrant</h2>
          <p style={{
            fontSize: '0.875rem',
            color: '#64748b',
            margin: 0
          }}>Connexion à votre espace de travail</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label htmlFor="login-email" style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: '#334155', marginBottom: '0.5rem' }}>
              Adresse E-mail
            </label>
            <input
              id="login-email"
              type="email"
              className="form-control"
              placeholder="ex: agent@test.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              autoFocus
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.95rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="login-password" style={{ display: 'block', fontWeight: 600, fontSize: '0.875rem', color: '#334155', marginBottom: '0.5rem' }}>
              Mot de passe
            </label>
            <input
              id="login-password"
              type="password"
              className="form-control"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              required
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '0.95rem',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fca5a5',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              color: '#dc2626',
              fontSize: '0.875rem',
              lineHeight: 1.4,
              marginBottom: '1.25rem',
              fontWeight: 500
            }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: isSubmitting ? '#94a3b8' : '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s ease',
              boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.2)'
            }}
          >
            {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginView;
