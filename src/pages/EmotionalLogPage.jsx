import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../lib/api';
import { format, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Loader2, Heart, Trash2, ArrowLeft, ChevronDown, ChevronUp, MessageSquare, Edit2 } from 'lucide-react';
import EmotionalLogForm from '../components/EmotionalLogForm';
import { useNavigate } from 'react-router-dom';

const excitacionColor = (n) => {
  if (n <= 3) return '#10b981';
  if (n <= 6) return '#f59e0b';
  if (n <= 8) return '#f97316';
  return '#ef4444';
};

const excitacionLabel = (n) => {
  if (n <= 2) return 'Muy baja';
  if (n <= 4) return 'Baja';
  if (n <= 6) return 'Moderada';
  if (n <= 8) return 'Alta';
  return 'Muy alta';
};

function EmotionalLogCard({ log, onDelete, onEdit }) {
  const [open, setOpen] = useState(false);
  const color = excitacionColor(log.nivel_excitacion);

  return (
    <div className="emotional-card animate-fade-in" style={{ borderLeft: `3px solid ${color}` }}>
      <div className="emotional-card-header" onClick={() => setOpen(!open)}>
        <div className="flex-center gap-3">
          <div className="excitacion-badge" style={{ background: color + '22', color }}>
            {log.nivel_excitacion}/10 · {excitacionLabel(log.nivel_excitacion)}
          </div>
          <span className="text-sm text-muted">🕐 {log.time}</span>
        </div>
        <div className="flex-center gap-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(log); }}
            className="btn-glass btn-icon"
            style={{ color: 'var(--primary)', width: '2rem', height: '2rem' }}
            title="Editar registro"
          >
            <Edit2 size={14} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(log.id); }}
            className="btn-glass btn-icon"
            style={{ color: 'var(--danger)', width: '2rem', height: '2rem' }}
            title="Eliminar registro"
          >
            <Trash2 size={14} />
          </button>
          {open ? <ChevronUp size={18} color="var(--text-muted)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
        </div>
      </div>

      {open && (
        <div className="emotional-card-body animate-fade-in">
          {log.auto_percepcion && (
            <div className="elf-field">
              <span className="elf-field-label">🌿 Auto-percepción</span>
              <p className="elf-field-value">{log.auto_percepcion}</p>
            </div>
          )}
          {log.presentacion && (
            <div className="elf-field">
              <span className="elf-field-label">💭 Presentación</span>
              <p className="elf-field-value">{log.presentacion}</p>
            </div>
          )}
          {log.tipo_persona_atraida && (
            <div className="elf-field">
              <span className="elf-field-label">✨ Tipo de persona atraída</span>
              <p className="elf-field-value">{log.tipo_persona_atraida}</p>
            </div>
          )}
          {log.conducta && (
            <div className="elf-field">
              <span className="elf-field-label">👗 Conducta</span>
              <p className="elf-field-value">{log.conducta}</p>
            </div>
          )}
          <div className="elf-field">
            <span className="elf-field-label">🧠 Pensamiento automático</span>
            <p className="elf-field-value">
              {log.pensamiento_automatico
                ? `Sí — ${log.pensamiento_descripcion || '(sin descripción)'}`
                : 'No'}
            </p>
          </div>
          {log.trabajar_en_sesion && (
            <div className="elf-field">
              <span className="elf-field-label">🎯 Trabajar en sesión</span>
              <p className="elf-field-value">{log.trabajar_en_sesion}</p>
            </div>
          )}
          {log.observaciones && (
            <div className="elf-field">
              <span className="elf-field-label">📝 Observaciones</span>
              <p className="elf-field-value">{log.observaciones}</p>
            </div>
          )}
          {/* Comments from professional */}
          {log.comments && log.comments.length > 0 && (
            <div className="flex-col gap-2" style={{ marginTop: '0.25rem' }}>
              {log.comments.map(c => (
                <div key={c.id} className="elog-professional-comment">
                  <div className="flex-center gap-1" style={{ color: '#10b981', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                    <MessageSquare size={13} /> Luciana
                  </div>
                  <p style={{ margin: 0, fontSize: '0.88rem', color: '#ecfdf5' }}>{c.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function EmotionalLogPage() {
  const { user } = useAuth();
  const { toastInfo, toastError } = useToast();
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const dateInputRef = useRef(null);

  const dateStr = format(currentDate, 'yyyy-MM-dd');

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await api.getEmotionalLogsByDate(user.uid, dateStr);
    if (!error && data) setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    if (user?.uid) fetchLogs();
  }, [user?.uid, dateStr]);

  const handleSaved = (savedLog) => {
    if (editingLog) {
      if (savedLog.date !== dateStr) {
        setLogs(prev => prev.filter(l => l.id !== savedLog.id));
        toastInfo('Registro movido a la fecha seleccionada');
      } else {
        setLogs(prev => prev.map(l => l.id === savedLog.id ? savedLog : l));
      }
    } else {
      if (savedLog.date === dateStr) {
        setLogs(prev => [...prev, savedLog]);
      }
    }
    setShowForm(false);
    setEditingLog(null);
  };

  const handleEdit = (log) => {
    setEditingLog(log);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingLog(null);
  };

  const handleDelete = async (logId) => {
    if (!window.confirm('¿Eliminar este registro emocional?')) return;
    const { error } = await api.deleteEmotionalLog(logId);
    if (!error) {
      setLogs(prev => prev.filter(l => l.id !== logId));
      toastInfo('Registro eliminado');
    } else {
      toastError('Error al eliminar');
    }
  };

  return (
    <div className="flex-col gap-6">
      {/* Header */}
      <div className="flex-between" style={{ marginBottom: '-0.5rem' }}>
        <div className="flex-center gap-3">
          <button onClick={() => navigate('/patient')} className="btn-glass btn-icon">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.4rem' }}>
              <span className="text-gradient">Registro Emocional</span>
            </h2>
            <span className="text-sm text-muted">Tu diario personal</span>
          </div>
        </div>
        <Heart size={24} style={{ color: 'var(--secondary)' }} />
      </div>

      {/* Date Navigation */}
      <div className="glass flex-between p-4">
        <button onClick={() => setCurrentDate(prev => subDays(prev, 1))} className="btn-glass btn-icon">
          <ChevronLeft />
        </button>
        <div
          className="text-center relative cursor-pointer"
          style={{ padding: '0.25rem 1rem' }}
          onClick={() => { try { dateInputRef.current?.showPicker(); } catch(e) {} }}
        >
          <input
            ref={dateInputRef}
            type="date"
            value={dateStr}
            max={format(new Date(), 'yyyy-MM-dd')}
            onChange={(e) => { if(e.target.value) setCurrentDate(new Date(e.target.value + 'T12:00:00')); }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', opacity: 0, pointerEvents: 'none', zIndex: -1 }}
          />
          <h3 style={{ margin: 0, textTransform: 'capitalize' }}>
            {format(currentDate, 'EEEE', { locale: es })}
          </h3>
          <span className="text-sm text-muted">
            {format(currentDate, "d 'de' MMMM", { locale: es })} 📅
          </span>
        </div>
        <button
          onClick={() => setCurrentDate(prev => addDays(prev, 1))}
          className="btn-glass btn-icon"
          disabled={dateStr === format(new Date(), 'yyyy-MM-dd')}
        >
          <ChevronRight />
        </button>
      </div>

      {/* Form (new or edit) */}
      {showForm ? (
        <EmotionalLogForm
          patientId={user.uid}
          date={dateStr}
          initialLog={editingLog}
          onSaved={handleSaved}
          onCancel={handleCancelForm}
        />
      ) : (
        <button className="btn btn-emotional w-full p-4 font-semibold" onClick={() => setShowForm(true)}>
          <Plus size={20} /> Nuevo registro emocional
        </button>
      )}

      {/* Logs list */}
      {loading ? (
        <div className="flex-center p-6"><Loader2 className="animate-pulse-slow" size={32} style={{ color: 'var(--secondary)' }} /></div>
      ) : logs.length === 0 && !showForm ? (
        <div className="glass-panel p-6 text-center animate-fade-in">
          <Heart size={32} style={{ color: 'var(--secondary)', opacity: 0.4, margin: '0 auto 0.75rem' }} />
          <p className="m-0 text-muted">No hay registros emocionales para este día.</p>
          <p className="text-sm text-muted" style={{ marginTop: '0.25rem' }}>Tocá el botón de arriba para agregar uno.</p>
        </div>
      ) : (
        <div className="flex-col gap-3">
          {logs.map(log => (
            <EmotionalLogCard key={log.id} log={log} onDelete={handleDelete} onEdit={handleEdit} />
          ))}
        </div>
      )}
    </div>
  );
}
