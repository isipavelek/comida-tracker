import React, { useState, useRef, useEffect } from 'react';
import { Camera, Image as ImageIcon, X, Loader2, Plus } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../contexts/ToastContext';

export default function MealForm({ patientId, date, onSaved, onCancel, initialMeal = null }) {
  const [type, setType] = useState('Almuerzo');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('');
  const [photos, setPhotos] = useState([]); // Array of { url: string, file: File|null, isNew: boolean }
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const { toastSuccess, toastError } = useToast();

  const mealTypes = ['Desayuno', 'Media Mañana', 'Almuerzo', 'Merienda', 'Cena', 'Picoteo'];

  useEffect(() => {
    if (initialMeal) {
      setType(initialMeal.type || 'Almuerzo');
      setDescription(initialMeal.description || '');
      
      if (initialMeal.time) setTime(initialMeal.time);
      else {
        const d = initialMeal.created_at ? new Date(initialMeal.created_at) : new Date();
        setTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
      }

      const initialPhotos = [];
      if (initialMeal.image_urls && Array.isArray(initialMeal.image_urls)) {
        initialMeal.image_urls.forEach(url => initialPhotos.push({ url, file: null, isNew: false }));
      } else if (initialMeal.image_url) {
        initialPhotos.push({ url: initialMeal.image_url, file: null, isNew: false });
      }
      setPhotos(initialPhotos);
    } else {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }));
    }
  }, [initialMeal]);

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      const newPhotos = files.map(file => ({
        url: URL.createObjectURL(file),
        file: file,
        isNew: true
      }));
      setPhotos(prev => [...prev, ...newPhotos]);
    }
    // reset inputs
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const removePhoto = (index) => {
    setPhotos(prev => {
      const newArr = [...prev];
      // Revoke object URL to avoid memory leaks if it was local
      if (newArr[index].isNew) URL.revokeObjectURL(newArr[index].url);
      newArr.splice(index, 1);
      return newArr;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Upload new photos
      const finalImageUrls = [];
      for (const p of photos) {
        if (p.isNew && p.file) {
          const { data, error } = await api.uploadPhoto(p.file);
          if (error) throw error;
          finalImageUrls.push(data.url);
        } else {
          finalImageUrls.push(p.url);
        }
      }

      const mealData = {
        patient_id: patientId,
        date: date, // YYYY-MM-DD
        time,       // HH:mm
        type,
        description,
        image_urls: finalImageUrls
      };

      if (initialMeal) {
        const { data, error } = await api.updateMeal(initialMeal.id, mealData);
        if (error) throw error;
        toastSuccess('¡Comida actualizada con éxito!');
        onSaved(data);
      } else {
        const { data, error } = await api.createMeal(mealData);
        if (error) throw error;
        toastSuccess('¡Comida registrada con éxito!');
        onSaved(data);
      }
    } catch (err) {
      console.error("Error al guardar:", err);
      toastError("Hubo un error al guardar la comida.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-6 animate-fade-in relative">
      <button 
        onClick={onCancel} 
        className="btn-glass btn-icon absolute top-0 right-0 p-2" 
        style={{ margin: '1rem' }}
      >
        <X size={20} />
      </button>

      <h3 className="text-gradient mb-4">{initialMeal ? 'Editar Comida' : 'Registrar Comida'}</h3>

      <form onSubmit={handleSubmit} className="flex-col gap-4">
        
        <div>
          <label className="mb-1 block text-sm text-gray-400">Tipo de Comida</label>
          <div className="flex-center justify-start gap-2" style={{ flexWrap: 'wrap' }}>
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
          <label className="mb-1 block text-sm text-gray-400">Horario</label>
          <input 
            type="time" 
            className="glass-input" 
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="mb-1 block text-sm text-gray-400">Fotos (Opcional)</label>
          
          <div className="flex-center justify-between gap-2 mb-3">
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              ref={cameraInputRef} 
              style={{ display: 'none' }} 
              onChange={handlePhotoSelect} 
            />
            <button type="button" onClick={() => cameraInputRef.current?.click()} className="btn btn-glass w-full gap-2">
              <Camera size={18} /> Cámara
            </button>

            <input 
              type="file" 
              accept="image/*" 
              multiple
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handlePhotoSelect} 
            />
            <button type="button" onClick={() => fileInputRef.current?.click()} className="btn btn-glass w-full gap-2">
              <ImageIcon size={18} /> Galería
            </button>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
            {photos.map((p, idx) => (
              <div key={idx} className="relative" style={{ minWidth: '80px', width: '80px', height: '80px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                <img src={p.url} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <button 
                  type="button" 
                  onClick={() => removePhoto(idx)}
                  className="btn-glass btn-icon absolute top-0 right-0"
                  style={{ width: '20px', height: '20px', padding: '0', margin: '0.25rem', background: 'rgba(0,0,0,0.6)' }}
                >
                  <X size={12} color="white" />
                </button>
              </div>
            ))}
          </div>
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
