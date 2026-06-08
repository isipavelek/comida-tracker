import React, { useState } from 'react';
import { Loader2, X, Heart, Save } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../contexts/ToastContext';

const EMPTY_FORM = {
  auto_percepcion: '',
  presentacion: '',
  tipo_persona_atraida: '',
  nivel_excitacion: 5,
  conducta: '',
  pensamiento_automatico: false,
  pensamiento_descripcion: '',
  trabajar_en_sesion: '',
  observaciones: '',
};

const excitacionColor = (n) => {
  if (n <= 3) return '#10b981';   // verde
  if (n <= 6) return '#f59e0b';   // amarillo
  if (n <= 8) return '#f97316';   // naranja
  return '#ef4444';               // rojo
};

const excitacionLabel = (n) => {
  if (n <= 2) return 'Muy baja';
  if (n <= 4) return 'Baja';
  if (n <= 6) return 'Moderada';
  if (n <= 8) return 'Alta';
  return 'Muy alta';
};

export default function EmotionalLogForm({ patientId, date, initialLog, onSaved, onCancel }) {
  const { toastSuccess, toastError } = useToast();
  const isEditing = !!initialLog;
  const [form, setForm] = useState(
    initialLog ? {
      auto_percepcion: initialLog.auto_percepcion || '',
      presentacion: initialLog.presentacion || '',
      tipo_persona_atraida: initialLog.tipo_persona_atraida || '',
      nivel_excitacion: initialLog.nivel_excitacion ?? 5,
      conducta: initialLog.conducta || '',
      pensamiento_automatico: initialLog.pensamiento_automatico || false,
      pensamiento_descripcion: initialLog.pensamiento_descripcion || '',
      trabajar_en_sesion: initialLog.trabajar_en_sesion || '',
      observaciones: initialLog.observaciones || '',
    } : EMPTY_FORM
  );
  const [saving, setSaving] = useState(false);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (isEditing) {
      const { data, error } = await api.updateEmotionalLog(initialLog.id, form);
      setSaving(false);
      if (error) {
        toastError('Error al guardar los cambios');
      } else {
        toastSuccess('Registro actualizado ✅');
        onSaved({ ...initialLog, ...form });
      }
    } else {
      const payload = { ...form, date };
      const { data, error } = await api.createEmotionalLog(patientId, payload);
      setSaving(false);
      if (error) {
        toastError('Error al guardar el registro');
      } else {
        toastSuccess('Registro emocional guardado 💜');
        onSaved(data);
      }
    }
  };

  const color = excitacionColor(form.nivel_excitacion);

  return (
    <form onSubmit={handleSubmit} className="emotional-form glass-panel p-4 flex-col gap-4 animate-fade-in">

      {/* Header */}
      <div className="flex-between">
        <div className="flex-center gap-2">
          <Heart size={20} style={{ color: 'var(--secondary)' }} />
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
            {isEditing ? 'Editar Registro Emocional' : 'Nuevo Registro Emocional'}
          </h3>
        </div>
        <button type="button" onClick={onCancel} className="btn-glass btn-icon">
          <X size={18} />
        </button>
      </div>

      {/* Auto-percepción */}
      <div className="elf-group">
        <label className="elf-label">
          🌿 Auto-percepción del día
          <span className="elf-hint">¿Cómo te percibiste hoy? ¿Qué palabras usarías para definirte?</span>
        </label>
        <textarea
          className="glass-input elf-textarea"
          placeholder="Ej: tranquila, dispersa, presente..."
          value={form.auto_percepcion}
          onChange={e => set('auto_percepcion', e.target.value)}
          rows={3}
        />
      </div>

      {/* Presentación */}
      <div className="elf-group">
        <label className="elf-label">
          💭 Si tuvieras que presentarte ante una chica hoy...
          <span className="elf-hint">¿Qué le dirías de vos, de tus deseos actuales y a futuro?</span>
        </label>
        <textarea
          className="glass-input elf-textarea"
          placeholder="¿Qué dirías de vos misma hoy?"
          value={form.presentacion}
          onChange={e => set('presentacion', e.target.value)}
          rows={3}
        />
      </div>

      {/* Tipo de persona atraída */}
      <div className="elf-group">
        <label className="elf-label">
          ✨ ¿Qué tipo de persona te atrajo hoy?
          <span className="elf-hint">1 o 2 palabras que describan el tipo (dominante, sensual, maternal, etc.)</span>
        </label>
        <textarea
          className="glass-input elf-textarea"
          placeholder="Ej: dominante, sensual, protectora..."
          value={form.tipo_persona_atraida}
          onChange={e => set('tipo_persona_atraida', e.target.value)}
          rows={2}
        />
      </div>

      {/* Nivel de excitación */}
      <div className="elf-group">
        <label className="elf-label">
          🌡️ Nivel de excitación del día
          <span className="elf-hint">Marcá del 1 al 10 el nivel de intensidad</span>
        </label>
        <div className="elf-slider-container">
          <input
            id="nivel-excitacion"
            type="range"
            min="1"
            max="10"
            step="1"
            value={form.nivel_excitacion}
            onChange={e => set('nivel_excitacion', Number(e.target.value))}
            className="elf-slider"
            style={{ '--thumb-color': color, '--track-color': color }}
          />
          <div className="elf-slider-value" style={{ color }}>
            <span className="elf-slider-number">{form.nivel_excitacion}</span>
            <span className="elf-slider-label">{excitacionLabel(form.nivel_excitacion)}</span>
          </div>
        </div>
        <div className="elf-slider-ticks">
          {[1,2,3,4,5,6,7,8,9,10].map(n => (
            <span key={n} className="elf-tick" style={{ color: form.nivel_excitacion === n ? color : 'var(--text-muted)' }}>
              {n}
            </span>
          ))}
        </div>
      </div>

      {/* Conducta */}
      <div className="elf-group">
        <label className="elf-label">
          👗 Conducta
          <span className="elf-hint">¿Qué conducta te generó hoy? (comprar ropa, harmonizar, etc.)</span>
        </label>
        <textarea
          className="glass-input elf-textarea"
          placeholder="Describí la conducta motivada por tu estado emocional..."
          value={form.conducta}
          onChange={e => set('conducta', e.target.value)}
          rows={2}
        />
      </div>

      {/* Pensamiento automático */}
      <div className="elf-group">
        <label className="elf-label">
          🧠 Pensamiento automático durante el día
        </label>
        <div className="elf-toggle-row">
          <button
            type="button"
            className={`elf-toggle-btn ${form.pensamiento_automatico ? 'active' : ''}`}
            onClick={() => set('pensamiento_automatico', true)}
          >
            Sí
          </button>
          <button
            type="button"
            className={`elf-toggle-btn ${!form.pensamiento_automatico ? 'active' : ''}`}
            onClick={() => { set('pensamiento_automatico', false); set('pensamiento_descripcion', ''); }}
          >
            No
          </button>
        </div>
        {form.pensamiento_automatico && (
          <textarea
            className="glass-input elf-textarea animate-fade-in"
            placeholder="¿Cuál fue ese pensamiento automático?"
            value={form.pensamiento_descripcion}
            onChange={e => set('pensamiento_descripcion', e.target.value)}
            rows={3}
            style={{ marginTop: '0.75rem' }}
          />
        )}
      </div>

      {/* Trabajar en sesión */}
      <div className="elf-group">
        <label className="elf-label">
          🎯 Algo que te gustaría trabajar en sesión
        </label>
        <textarea
          className="glass-input elf-textarea"
          placeholder="¿Hay algún tema que quieras explorar en tu próxima sesión?"
          value={form.trabajar_en_sesion}
          onChange={e => set('trabajar_en_sesion', e.target.value)}
          rows={2}
        />
      </div>

      {/* Observaciones extra */}
      <div className="elf-group">
        <label className="elf-label">
          📝 Observaciones adicionales
        </label>
        <textarea
          className="glass-input elf-textarea"
          placeholder="Cualquier otra cosa que quieras agregar..."
          value={form.observaciones}
          onChange={e => set('observaciones', e.target.value)}
          rows={2}
        />
      </div>

      {/* Actions */}
      <div className="flex-center gap-3" style={{ marginTop: '0.5rem' }}>
        <button type="button" onClick={onCancel} className="btn btn-glass" style={{ flex: 1 }}>
          Cancelar
        </button>
        <button type="submit" disabled={saving} className="btn btn-emotional" style={{ flex: 2 }}>
          {saving ? <Loader2 size={18} className="animate-pulse-slow" /> : <Save size={18} />}
          {saving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Guardar registro'}
        </button>
      </div>

    </form>
  );
}
