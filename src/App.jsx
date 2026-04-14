import { HashRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import PatientDashboard from './pages/PatientDashboard';
import ProfessionalDashboard from './pages/ProfessionalDashboard';
import PatientDetail from './pages/PatientDetail';
import { ToastProvider } from './contexts/ToastContext';
import ToastContainer from './components/ToastContainer';
import './App.css';

function AppContent() {
  const { user, profile, signOut } = useAuth();

  return (
    <div className="app-container">
      <header className="mb-6 flex-between animate-fade-in py-1">
        <h2 style={{ margin: 0 }}><span className="text-gradient">Comida</span>Tracker</h2>
        {user && (
          <div className="flex-center gap-4">
            <span className="text-sm text-muted">{profile?.full_name?.split(' ')[0]}</span>
            <button onClick={signOut} className="btn-glass btn-icon" title="Cerrar sesión">
              <span style={{ fontSize: '1.2rem' }}>🚪</span>
            </button>
          </div>
        )}
      </header>

      <main className="flex-col relative" style={{ flex: 1 }}>
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
    <ToastProvider>
      <AuthProvider>
        <HashRouter>
          <AppContent />
        </HashRouter>
      </AuthProvider>
      <ToastContainer />
    </ToastProvider>
  );
}

export default App;
