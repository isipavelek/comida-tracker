import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, X, Loader2 } from 'lucide-react';
import { api } from '../lib/api';

export default function MealForm({ patientId, date, onSaved, onCancel }) {
  const [type, setType] = useState('Almuerzo');
  const [description, setDescription] = useState('');
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const mealTypes = ['Desayuno', 'Media Mañana', 'Almuerzo', 'Merienda', 'Cena', 'Picoteo'];

  const handlePhotoSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = null;
      if (photoFile) {
        const { data, error } = await api.uploadPhoto(photoFile);
        if (error) throw error;
        imageUrl = data.url;
      }

      const mealData = {
        patient_id: patientId,
        date: date, // YYYY-MM-DD
        type,
        description,
        image_url: imageUrl
      };

      const { data, error } = await api.createMeal(mealData);
      if (error) throw error;
      
      onSaved(data);
    } catch (err) {
      console.error("Error al guardar:", err);
      alert("Hubo un error al guardar la comida.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6 animate-fade-in" style={{ position: 'relative' }}>
      <button 
        onClick={onCancel} 
        className="btn-glass btn-icon" 
        style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.25rem' }}
      >
        <X size={20} />
      </button>

      <h3 className="text-gradient mb-4">Registrar Comida</h3>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        <div>
          <label className="mb-1 block text-sm text-gray-400">Tipo de Comida</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {mealTypes.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`btn ${type === t ? 'btn-primary' : 'btn-glass'}`}
                style={{ padding: '0.25rem 0.75rem', fontSize: '0.85rem' }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-400">Foto (Opcional)</label>
          {photoPreview ? (
            <div style={{ position: 'relative', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <img src={photoPreview} alt="Preview" style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', display: 'block' }} />
              <button 
                type="button"
                onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                className="btn-glass btn-icon"
                style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.5)' }}
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="file" 
                accept="image/*" 
                capture="environment" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handlePhotoSelect} 
              />
              <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-glass flex-1">
                <Camera size={18} /> Cámara
              </button>
              <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-glass flex-1">
                <ImageIcon size={18} /> Galería
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-400">¿Qué comiste? ¿Cómo te sentiste?</label>
          <textarea 
            className="glass-input" 
            rows="3" 
            placeholder="Ej. Una ensalada muy rica, me sentí lleno pero bien."
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
            style={{ resize: 'vertical' }}
          ></textarea>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <Loader2 className="animate-pulse-slow" size={20} /> : 'Guardar Comida'}
        </button>
      </form>
    </div>
  );
}
