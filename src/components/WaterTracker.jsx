import React, { useState, useEffect } from 'react';
import { api } from '../lib/api';

const WaterTracker = ({ patientId, dateStr }) => {
  const [glasses, setGlasses] = useState(0);
  const [loading, setLoading] = useState(true);
  const maxGlasses = 8;

  useEffect(() => {
    const fetchWater = async () => {
      setLoading(true);
      const { data } = await api.getWaterLog(patientId, dateStr);
      setGlasses(data || 0);
      setLoading(false);
    };
    if (patientId && dateStr) {
      fetchWater();
    }
  }, [patientId, dateStr]);

  const handleGlassClick = async (index) => {
    // If clicking the current exact score, subtract 1 (toggle off). Otherwise, set score to index + 1
    const newScore = index + 1 === glasses ? index : index + 1;
    setGlasses(newScore);
    await api.setWaterLog(patientId, dateStr, newScore);
  };

  return (
    <div className="glass-panel p-4 animate-fade-in" style={{ marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', backgroundColor: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
      <div className="flex-between">
        <h4 style={{ margin: 0, color: 'var(--text-color)' }}>🌊 Consumo de Agua</h4>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{glasses} / {maxGlasses} vasos</span>
      </div>
      
      {loading ? (
        <div className="flex-center p-2"><span className="text-muted animate-pulse-slow" style={{fontSize: '0.9rem'}}>Cargando...</span></div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem' }}>
          {Array.from({ length: maxGlasses }).map((_, index) => {
            const isFilled = index < glasses;
            return (
              <button
                key={index}
                onClick={() => handleGlassClick(index)}
                title={`Vaso ${index + 1}`}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0.2rem',
                  transition: 'transform 0.2s',
                  transform: isFilled ? 'scale(1.1)' : 'scale(1)',
                  filter: isFilled ? 'none' : 'grayscale(100%) opacity(0.4)',
                }}
              >
                💧
              </button>
            );
          })}
        </div>
      )}
      <div style={{ width: '100%', height: '4px', backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: '2px', overflow: 'hidden', marginTop: '0.5rem' }}>
        <div style={{ width: `${(glasses / maxGlasses) * 100}%`, height: '100%', backgroundColor: '#3b82f6', transition: 'width 0.3s ease' }} />
      </div>
    </div>
  );
};

export default WaterTracker;
