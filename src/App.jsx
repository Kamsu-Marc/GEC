import React, { useState, useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { DataProvider, DataContext } from './context/DataContext';
import { OfflineProvider } from './context/OfflineContext';
import { Header } from './components/common/Header';
import { Toast } from './components/common/Toast';
import { AgentView } from './views/AgentView';
import { ResponsableView } from './views/ResponsableView';
import { RafView } from './views/RafView';
import { PdgView } from './views/PdgView';
import { LoginView } from './views/LoginView';
import { UserModal } from './components/modals/UserModal';
import { HistoryModal } from './components/modals/HistoryModal';
import { DeleteServiceScopeModal } from './components/modals/DeleteServiceScopeModal';
import { ReallocationModal } from './components/modals/ReallocationModal';
import { CreateServiceModal } from './components/modals/CreateServiceModal';
import { useServices } from './hooks/useServices';
import { useAuth } from './hooks/useAuth';

function MainAppContent() {
  const { activeRole } = useContext(AuthContext);
  const { showToast } = useContext(DataContext);
  const { prepareDeleteServiceScope, executeDirectDeactivation, executeReallocationAndDeactivation } = useServices();
  const { getCurrentSessionOperator } = useAuth();

  // User Modal State
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editUserData, setEditUserData] = useState(null);

  // History Modal State
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyTitle, setHistoryTitle] = useState('');
  const [historyList, setHistoryList] = useState([]);
  const [historyCurrentStatus, setHistoryCurrentStatus] = useState('Actif');

  // Service Creation Modal State
  const [isCreateServiceModalOpen, setIsCreateServiceModalOpen] = useState(false);

  // Service Scope Deletion State
  const [isDeleteScopeModalOpen, setIsDeleteScopeModalOpen] = useState(false);
  const [targetService, setTargetService] = useState(null);

  // Multi-site Reallocation State
  const [isReallocationModalOpen, setIsReallocationModalOpen] = useState(false);
  const [pendingReallocationData, setPendingReallocationData] = useState(null);

  const handleOpenUserModal = (user = null) => {
    setEditUserData(user);
    setIsUserModalOpen(true);
  };

  const handleOpenHistoryModal = (title, list, currentStatus) => {
    setHistoryTitle(title);
    setHistoryList(list || []);
    setHistoryCurrentStatus(currentStatus || 'Actif');
    setIsHistoryModalOpen(true);
  };

  const handleOpenCreateServiceModal = () => {
    setIsCreateServiceModalOpen(true);
  };

  const handleOpenDeleteServiceModal = (service) => {
    setTargetService(service);
    setIsDeleteScopeModalOpen(true);
  };

  const handleSubmitDeleteScope = (scopeRadio, selectedSiteIds) => {
    if (!targetService) return;

    const analysis = prepareDeleteServiceScope(targetService.id, scopeRadio, selectedSiteIds);
    setIsDeleteScopeModalOpen(false);

    if (!analysis) return;

    const { reallocSites, directSites, originServiceName } = analysis;
    const operator = getCurrentSessionOperator();

    if (reallocSites.length === 0) {
      executeDirectDeactivation(directSites, operator);
      showToast(`Service « ${originServiceName} » désactivé avec succès sur les sites cibles.`, '🗑️');
    } else {
      setPendingReallocationData(analysis);
      setIsReallocationModalOpen(true);
    }
  };

  const handleConfirmReallocation = (reallocSelections) => {
    if (!pendingReallocationData) return;
    const operator = getCurrentSessionOperator();
    const { directSites, originServiceName } = pendingReallocationData;

    executeReallocationAndDeactivation(reallocSelections, directSites, operator);
    setIsReallocationModalOpen(false);
    setPendingReallocationData(null);
    showToast(`Service « ${originServiceName} » réaffecté et désactivé avec succès.`, '🔀');
  };

  return (
    <div className="app-layout">
      <Header />
      <Toast />

      <main className="main-content">
        {activeRole === 'agent' && <AgentView />}
        {activeRole === 'responsable' && <ResponsableView />}
        {activeRole === 'raf' && (
          <RafView
            onOpenUserModal={handleOpenUserModal}
            onOpenHistoryModal={handleOpenHistoryModal}
            onOpenDeleteServiceModal={handleOpenDeleteServiceModal}
            onOpenServiceModal={handleOpenCreateServiceModal}
          />
        )}
        {activeRole === 'pdg' && <PdgView />}
      </main>

      {/* Modals */}
      <UserModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        editUserData={editUserData}
      />

      <CreateServiceModal
        isOpen={isCreateServiceModalOpen}
        onClose={() => setIsCreateServiceModalOpen(false)}
      />

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title={historyTitle}
        historyList={historyList}
        currentStatus={historyCurrentStatus}
      />

      <DeleteServiceScopeModal
        isOpen={isDeleteScopeModalOpen}
        onClose={() => setIsDeleteScopeModalOpen(false)}
        targetService={targetService}
        onSubmitScope={handleSubmitDeleteScope}
      />

      <ReallocationModal
        isOpen={isReallocationModalOpen}
        onClose={() => setIsReallocationModalOpen(false)}
        pendingData={pendingReallocationData}
        onConfirmReallocation={handleConfirmReallocation}
      />
    </div>
  );
}

function AppContentWrapper() {
  const { session, userProfile, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0f172a',
        color: '#ffffff',
        fontSize: '1.1rem',
        fontWeight: 600
      }}>
        <div>Chargement de la session...</div>
      </div>
    );
  }

  if (!session || !userProfile) {
    return <LoginView />;
  }

  return <MainAppContent />;
}

export function App() {
  return (
    <OfflineProvider>
      <DataProvider>
        <AuthProvider>
          <AppContentWrapper />
        </AuthProvider>
      </DataProvider>
    </OfflineProvider>
  );
}

export default App;
