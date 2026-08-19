import React, { createContext, useState, useCallback, useContext, useEffect } from 'react';
import { DataContext } from './DataContext';
import { supabase } from '../config/supabaseClient';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children, rafs: propRafs }) => {
  const dataContext = useContext(DataContext);
  const rafs = dataContext?.rafs || propRafs || [];

  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [activeRole, setActiveRole] = useState('agent');
  const [activeSiteId, setActiveSiteId] = useState('paris');
  const [activeAgentId, setActiveAgentId] = useState('agent-1');
  const [activeResponsableId, setActiveResponsableId] = useState('resp-1');
  const [activeRafId, setActiveRafId] = useState('raf-1');

  const applyUserProfile = useCallback((profile) => {
    if (!profile) return;
    if (profile.role) setActiveRole(profile.role);
    const siteId = profile.site_id || profile.siteId;
    if (siteId) setActiveSiteId(siteId);

    if (profile.role === 'agent') {
      setActiveAgentId(profile.id);
    } else if (profile.role === 'responsable') {
      setActiveResponsableId(profile.id);
    } else if (profile.role === 'raf') {
      setActiveRafId(profile.id);
    }
  }, []);

  // Check initial session & subscribe to auth changes
  useEffect(() => {
    let isMounted = true;

    const initSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (initialSession?.user) {
          const { data: userProfileData, error } = await supabase
            .from('utilisateurs')
            .select('*')
            .eq('auth_user_id', initialSession.user.id)
            .maybeSingle();

          if (error || !userProfileData) {
            console.warn('Compte orphelin détecté au démarrage.');
            await supabase.auth.signOut();
            if (isMounted) {
              setSession(null);
              setUserProfile(null);
            }
          } else if (isMounted) {
            setSession(initialSession);
            setUserProfile(userProfileData);
            applyUserProfile(userProfileData);
          }
        } else if (isMounted) {
          setSession(null);
          setUserProfile(null);
        }
      } catch (err) {
        console.error('Erreur d\'initialisation de session:', err);
      } finally {
        if (isMounted) setAuthLoading(false);
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (event === 'SIGNED_OUT' || !currentSession) {
        if (isMounted) {
          setSession(null);
          setUserProfile(null);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [applyUserProfile]);

  const login = async (email, password) => {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return { success: false, message: authError.message };
    }

    const authUser = authData.user;
    if (!authUser) {
      return { success: false, message: 'Erreur lors de la récupération de la session.' };
    }

    // Récupérer la ligne correspondante dans la table utilisateurs par auth_user_id
    const { data: userProfileData, error: userError } = await supabase
      .from('utilisateurs')
      .select('*')
      .eq('auth_user_id', authUser.id)
      .maybeSingle();

    if (userError || !userProfileData) {
      // Cas orphelin : session Supabase valide mais aucun profil dans utilisateurs
      await supabase.auth.signOut();
      setSession(null);
      setUserProfile(null);
      return {
        success: false,
        message: 'Authentification réussie, mais aucun profil utilisateur associé n\'a été trouvé dans le système (auth_user_id orphelin).'
      };
    }

    setSession(authData.session);
    setUserProfile(userProfileData);
    applyUserProfile(userProfileData);

    return { success: true, user: userProfileData };
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Erreur lors de la déconnexion Supabase:', err);
    } finally {
      setSession(null);
      setUserProfile(null);
    }
  };

  const getCurrentSessionOperator = useCallback(() => {
    if (userProfile) {
      if (userProfile.actif === false) {
        return null;
      }
      return { id: userProfile.id, nom: userProfile.nom, role: userProfile.role };
    }
    // Fallback démo prototype si aucun profil Supabase connecté
    if (activeRole === 'pdg') {
      return { id: 'pdg-1', nom: 'Direction Générale (PDG)' };
    } else if (activeRole === 'raf') {
      const currentRaf = rafs.find(r => r.id === activeRafId);
      if (currentRaf && currentRaf.actif !== false) {
        return { id: currentRaf.id, nom: currentRaf.nom };
      }
    }
    return null; // Règle stricte : aucun fallback générique !
  }, [activeRole, activeRafId, rafs, userProfile]);

  return (
    <AuthContext.Provider value={{
      session,
      userProfile,
      authLoading,
      login,
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
    }}>
      {children}
    </AuthContext.Provider>
  );
};
