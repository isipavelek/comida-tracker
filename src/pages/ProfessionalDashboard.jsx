import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Users, ChevronRight, Loader2 } from 'lucide-react';

export default function ProfessionalDashboard() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.getPatients().then(({ data }) => {
      setPatients(data || []);
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div className="flex-between">
        <h2 className="text-gradient" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users /> Mis Pacientes
        </h2>
      </div>

      {loading ? (
        <div className="flex-center p-6"><Loader2 className="animate-pulse-slow" size={32} /></div>
      ) : patients.length === 0 ? (
        <div className="glass-panel p-6 text-center animate-fade-in">
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>No tienes pacientes asignados aún.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {patients.map(p => (
            <div 
              key={p.id} 
              className="glass-card p-4 flex-between animate-fade-in" 
              onClick={() => navigate(`/professional/patient/${p.id}`)}
              style={{ cursor: 'pointer' }}
            >
              <div>
                <h3 style={{ fontSize: '1.1rem', margin: '0 0 0.2rem 0' }}>{p.full_name}</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ver registro y dejar comentarios</span>
              </div>
              <ChevronRight color="var(--primary)" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
