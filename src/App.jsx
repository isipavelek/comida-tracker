import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import PatientDashboard from './pages/PatientDashboard';
import ProfessionalDashboard from './pages/ProfessionalDashboard';
import PatientDetail from './pages/PatientDetail';
import './App.css';

function AppContent() {
  const { user, profile, signOut } = useAuth();

  return (
    <div className="app-container">
      <header className="mb-6 flex-between animate-fade-in" style={{ padding: '0.5rem 0' }}>
        <h2 style={{ margin: 0 }}><span className="text-gradient">Comida</span>Tracker</h2>
        {user && (
          <div className="flex-center" style={{ gap: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{profile?.full_name?.split(' ')[0]}</span>
            <button onClick={signOut} className="btn-glass btn-icon" title="Cerrar sesión">
              <span style={{ fontSize: '1.2rem' }}>🚪</span>
            </button>
          </div>
        )}
      </header>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {user && !profile ? (
            <div className="flex-center p-6 h-full w-full">
              <span className="text-muted animate-pulse-slow">Cargando perfil...</span>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={
                !user ? <Navigate to="/login" /> : 
                profile?.role === 'patient' ? <Navigate to="/patient" /> : 
                <Navigate to="/professional" />
              } />
              <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
              <Route path="/patient" element={user && profile?.role === 'patient' ? <PatientDashboard /> : <Navigate to="/login" />} />
              <Route path="/professional" element={user && profile?.role === 'professional' ? <ProfessionalDashboard /> : <Navigate to="/login" />} />
              <Route path="/professional/patient/:id" element={user && profile?.role === 'professional' ? <PatientDetail /> : <Navigate to="/login" />} />
            </Routes>
          )}
        </main>
      </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </AuthProvider>
  );
}

export default App;
