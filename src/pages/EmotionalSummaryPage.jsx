import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import {
  format, startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  subWeeks, addWeeks, subMonths, addMonths, parseISO
} from 'date-fns';
import { es } from 'date-fns/locale';
import {
  ArrowLeft, Loader2, Heart, Download, ChevronLeft, ChevronRight,
  Calendar, CalendarDays, MessageSquare, Send
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

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

function LogEntry({ log, onAddComment }) {
  const [commentText, setCommentText] = useState('');
  const [saving, setSaving] = useState(false);
  const { toastSuccess, toastError } = useToast();
  const color = excitacionColor(log.nivel_excitacion);
  const [localComments, setLocalComments] = useState(log.comments || []);

  const handleSend = async () => {
    if (!commentText.trim()) return;
    setSaving(true);
    try {
      const { data, error } = await api.addEmotionalComment(log.id, commentText.trim());
      if (!error && data) {
        setLocalComments(prev => [...prev, data]);
        setCommentText('');
        toastSuccess('Comentario enviado 💬');
      } else {
        toastError('Error al enviar');
      }
    } catch {
      toastError('Error al enviar');
    }
    setSaving(false);
  };

  return (
    <div className="elog-entry" style={{ borderLeft: `3px solid ${color}` }}>
      <div className="elog-entry-meta">
        <span className="elog-time">🕐 {log.time || '—'}</span>
        <span className="excitacion-badge" style={{ background: color + '22', color }}>
          {log.nivel_excitacion}/10 · {excitacionLabel(log.nivel_excitacion)}
        </span>
      </div>
      <div className="elog-fields">
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
      </div>

      {/* Comments from professional */}
      {localComments.length > 0 && (
        <div className="flex-col gap-2" style={{ marginTop: '0.5rem' }}>
          {localComments.map(c => (
            <div key={c.id} className="elog-professional-comment">
              <div className="flex-center gap-1" style={{ color: '#10b981', fontSize: '0.78rem', fontWeight: 700, marginBottom: '0.2rem' }}>
                <MessageSquare size={13} /> Profesional
              </div>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#ecfdf5' }}>{c.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Add comment input */}
      {onAddComment && (
        <div className="no-print flex-center gap-2" style={{ marginTop: '0.75rem' }}>
          <input
            type="text"
            className="glass-input p-2 text-sm"
            placeholder="Dejar un comentario..."
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          />
          <button
            className="btn btn-primary px-3"
            style={{ borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.75rem', opacity: (!commentText.trim() || saving) ? 0.5 : 1 }}
            onClick={handleSend}
            disabled={!commentText.trim() || saving}
          >
            <Send size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

function DayGroup({ dateStr, logs, onAddComment }) {
  const date = parseISO(dateStr);
  const avg = logs.reduce((s, l) => s + (l.nivel_excitacion || 5), 0) / logs.length;
  const color = excitacionColor(Math.round(avg));

  return (
    <div className="elog-day-group animate-fade-in">
      <div className="elog-day-header">
        <div>
          <span className="elog-day-name" style={{ textTransform: 'capitalize' }}>
            {format(date, "EEEE d 'de' MMMM", { locale: es })}
          </span>
          <span className="text-xs text-muted" style={{ marginLeft: '0.5rem' }}>
            {logs.length} {logs.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>
        <div className="excitacion-badge" style={{ background: color + '22', color, fontSize: '0.75rem' }}>
          Prom. {avg.toFixed(1)}/10
        </div>
      </div>
      <div className="flex-col gap-3">
        {logs.map(log => <LogEntry key={log.id} log={log} onAddComment={onAddComment} />)}
      </div>
    </div>
  );
}

export default function EmotionalSummaryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('week'); // 'day' | 'week' | 'month'
  const [cursor, setCursor] = useState(new Date());

  // Compute range based on mode
  const getRange = () => {
    if (mode === 'day') {
      const d = format(cursor, 'yyyy-MM-dd');
      return { start: d, end: d };
    }
    if (mode === 'week') {
      return {
        start: format(startOfWeek(cursor, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
        end: format(endOfWeek(cursor, { weekStartsOn: 1 }), 'yyyy-MM-dd'),
      };
    }
    return {
      start: format(startOfMonth(cursor), 'yyyy-MM-dd'),
      end: format(endOfMonth(cursor), 'yyyy-MM-dd'),
    };
  };

  const { start, end } = getRange();

  const rangeLabel = () => {
    if (mode === 'day') return format(cursor, "EEEE d 'de' MMMM", { locale: es });
    if (mode === 'week') {
      const s = parseISO(start);
      const e = parseISO(end);
      if (s.getMonth() === e.getMonth())
        return `${format(s, 'd')} – ${format(e, "d 'de' MMMM", { locale: es })}`;
      return `${format(s, "d MMM", { locale: es })} – ${format(e, "d MMM yyyy", { locale: es })}`;
    }
    return format(cursor, "MMMM yyyy", { locale: es });
  };

  const prev = () => {
    if (mode === 'day') setCursor(prev => { const d = new Date(prev); d.setDate(d.getDate()-1); return d; });
    if (mode === 'week') setCursor(prev => subWeeks(prev, 1));
    if (mode === 'month') setCursor(prev => subMonths(prev, 1));
  };
  const next = () => {
    if (mode === 'day') setCursor(prev => { const d = new Date(prev); d.setDate(d.getDate()+1); return d; });
    if (mode === 'week') setCursor(prev => addWeeks(prev, 1));
    if (mode === 'month') setCursor(prev => addMonths(prev, 1));
  };

  useEffect(() => {
    api.getPatientInfo(id).then(({ data }) => setPatient(data));
  }, [id]);

  useEffect(() => {
    setLoading(true);
    api.getEmotionalLogsByRange(id, start, end).then(({ data }) => {
      setLogs(data || []);
      setLoading(false);
    });
  }, [id, start, end]);

  // Group by date
  const grouped = logs.reduce((acc, log) => {
    if (!acc[log.date]) acc[log.date] = [];
    acc[log.date].push(log);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort();

  // Average excitacion
  const globalAvg = logs.length
    ? (logs.reduce((s, l) => s + (l.nivel_excitacion || 5), 0) / logs.length).toFixed(1)
    : null;

  if (!patient) return <div className="flex-center p-6"><Loader2 className="animate-pulse-slow" size={32} /></div>;

  return (
    <div className="flex-col gap-6">
      {/* Header */}
      <div className="flex-between" style={{ marginBottom: '-0.5rem' }}>
        <div className="flex-center gap-3">
          <button onClick={() => navigate('/professional')} className="btn-glass btn-icon no-print">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-gradient m-0" style={{ fontSize: '1.4rem' }}>{patient.full_name}</h2>
            <span className="text-sm text-muted">Paciente</span>
          </div>
        </div>
        <button onClick={() => window.print()} className="btn-glass btn-icon no-print" title="Exportar PDF">
          <Download size={20} style={{ color: 'var(--primary)' }} />
        </button>
      </div>

      {/* Tab switcher */}
      <div className="patient-tab-switcher no-print">
        <button className="patient-tab active">
          <Heart size={15} /> Emocional
        </button>
        <button
          className="patient-tab"
          onClick={() => navigate(`/professional/patient/${id}`)}
        >
          🍽️ Comidas
        </button>
      </div>
      <div className="elog-mode-selector no-print">
        {[
          { key: 'day', label: 'Día', icon: <CalendarDays size={15} /> },
          { key: 'week', label: 'Semana', icon: <Calendar size={15} /> },
          { key: 'month', label: 'Mes', icon: <Calendar size={15} /> },
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setMode(key)}
            className={`elog-mode-btn ${mode === key ? 'active' : ''}`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Range navigation */}
      <div className="glass flex-between p-4">
        <button onClick={prev} className="btn-glass btn-icon"><ChevronLeft /></button>
        <div className="text-center">
          <h3 style={{ margin: 0, textTransform: 'capitalize', fontSize: '1rem' }}>{rangeLabel()}</h3>
          {globalAvg && (
            <span className="text-sm" style={{ color: excitacionColor(Math.round(parseFloat(globalAvg))) }}>
              Promedio excitación: {globalAvg}/10
            </span>
          )}
        </div>
        <button onClick={next} className="btn-glass btn-icon" disabled={end >= format(new Date(), 'yyyy-MM-dd')}>
          <ChevronRight />
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex-center p-6">
          <Loader2 className="animate-pulse-slow" size={32} style={{ color: 'var(--secondary)' }} />
        </div>
      ) : sortedDates.length === 0 ? (
        <div className="glass-panel p-6 text-center animate-fade-in">
          <Heart size={32} style={{ color: 'var(--secondary)', opacity: 0.3, margin: '0 auto 0.75rem' }} />
          <p className="m-0 text-muted">No hay registros emocionales en este período.</p>
        </div>
      ) : (
        <div className="flex-col gap-6">
          {sortedDates.map(dateStr => (
            <DayGroup key={dateStr} dateStr={dateStr} logs={grouped[dateStr]} onAddComment={true} />
          ))}
        </div>
      )}
    </div>
  );
}
