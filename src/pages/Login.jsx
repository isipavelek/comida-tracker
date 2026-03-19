import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogIn, UserPlus, AlertCircle } from 'lucide-react';

export default function Login() {
  const { signIn, signUp, isMockMode } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('patient');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isRegister) {
        if (!fullName.trim()) throw new Error('El nombre es obligatorio para registrarse.');
        result = await signUp(email, password, role, fullName);
      } else {
        result = await signIn(email, password);
      }

      if (result.error) {
        throw result.error;
      }
      
    } catch (err) {
      setError(err.message || 'Ocurrió un error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-center w-full h-full" style={{ minHeight: '80vh' }}>
      <div className="glass-panel p-6 animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="text-center mb-6">
          <h1 className="text-gradient mb-2">{isRegister ? 'Crear Cuenta' : 'Bienvenido'}</h1>
          <p>{isRegister ? 'Ingresa tus datos para registrarte' : 'Inicia sesión para continuar'}</p>
        </div>

        {error && (
          <div className="glass-card p-4 mb-6 flex-center" style={{ borderLeftColor: 'var(--danger)', color: 'var(--danger)', gap: '0.5rem' }}>
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {isMockMode && (
          <div className="mb-6 p-3 text-sm" style={{ background: 'rgba(255,165,0,0.1)', color: 'orange', borderRadius: 'var(--radius-sm)' }}>
            Modo de Prueba Local Activo. Cualquier email funciona. 
            Agrega "nutri" o "psico" al email para entrar como Profesional.
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {isRegister && (
            <div>
              <label className="mb-1" style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Nombre Completo</label>
              <input 
                type="text" 
                className="glass-input" 
                placeholder="Ej. Juan Pérez"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required={isRegister}
              />
            </div>
          )}

          <div>
            <label className="mb-1" style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Correo Electrónico</label>
            <input 
              type="email" 
              className="glass-input" 
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-1" style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Contraseña</label>
            <input 
              type="password" 
              className="glass-input" 
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {isRegister && (
            <div>
              <label className="mb-1" style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Soy un...</label>
              <select 
                className="glass-input" 
                value={role} 
                onChange={e => setRole(e.target.value)}
                style={{ appearance: 'none', backgroundColor: '#1e293b' }}
              >
                <option value="patient">Paciente</option>
                <option value="professional">Profesional (Nutri/Psico)</option>
              </select>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary mt-4" 
            disabled={loading}
          >
            {loading ? 'Cargando...' : (isRegister ? <><UserPlus size={18} /> Registrarme</> : <><LogIn size={18} /> Entrar</>)}
          </button>
        </form>

        <div className="text-center mt-6">
          <button 
            onClick={() => setIsRegister(!isRegister)} 
            className="text-gradient" 
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.9rem' }}
          >
            {isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </button>
        </div>
      </div>
    </div>
  );
}
