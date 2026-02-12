import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TenantProvider } from './contexts/TenantContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { LoginPage } from './components/auth/LoginPage';
import { RegisterPage } from './components/auth/RegisterPage';
import { Dashboard } from './components/details/Dashboard';
import { DetailViewer } from './components/details/DetailViewer';

type Page = 'login' | 'register' | 'dashboard' | 'viewer';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [page, setPage] = useState<Page>(isAuthenticated ? 'dashboard' : 'login');
  const [selectedDetailId, setSelectedDetailId] = useState<string | null>(null);

  // Redirect to dashboard on auth state change
  React.useEffect(() => {
    if (isAuthenticated && (page === 'login' || page === 'register')) {
      setPage('dashboard');
    } else if (!isAuthenticated && page !== 'login' && page !== 'register') {
      setPage('login');
    }
  }, [isAuthenticated]);

  const openDetail = (id: string) => {
    setSelectedDetailId(id);
    setPage('viewer');
  };

  const goToDashboard = () => {
    setSelectedDetailId(null);
    setPage('dashboard');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <Header />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {page === 'login' && (
          <LoginPage onSwitchToRegister={() => setPage('register')} />
        )}
        {page === 'register' && (
          <RegisterPage onSwitchToLogin={() => setPage('login')} />
        )}
        {page === 'dashboard' && (
          <Dashboard onOpenDetail={openDetail} />
        )}
        {page === 'viewer' && selectedDetailId && (
          <DetailViewer detailId={selectedDetailId} onBack={goToDashboard} />
        )}
      </div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TenantProvider>
        <AppContent />
      </TenantProvider>
    </AuthProvider>
  );
}
