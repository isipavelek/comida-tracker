import React, { useState } from 'react';
import { Clock, MessageSquare, Trash2, Edit2 } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

export default function MealCard({ meal, onDelete, onEdit, readOnly, onAddComment }) {
  const [commentText, setCommentText] = useState('');
  const { toastSuccess, toastError } = useToast();
  
  let timeStr = '';
  if (meal.time) {
    timeStr = meal.time;
  } else {
    const createdAt = meal.created_at || new Date().toISOString();
    timeStr = new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  const images = meal.image_urls || (meal.image_url ? [meal.image_url] : []);

  return (
    <div className="glass-card p-4 animate-fade-in flex-col gap-3">
      <div className="flex-between">
        <div className="flex-center gap-2">
          <span className="font-semibold text-gradient" style={{ color: 'var(--primary)' }}>{meal.type}</span>
          <span className="text-muted text-xs flex-center gap-1">
            <Clock size={12} /> {timeStr}
          </span>
        </div>
        {!readOnly && (
          <div className="flex-center gap-2">
            {onEdit && (
              <button onClick={() => onEdit(meal)} className="btn-glass btn-icon p-2 text-muted" style={{ border: 'none' }}>
                <Edit2 size={16} />
              </button>
            )}
            {onDelete && (
              <button onClick={() => onDelete(meal.id)} className="btn-glass btn-icon p-2" style={{ color: 'var(--danger)', border: 'none' }}>
                <Trash2 size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      {images.length > 0 && (
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {images.map((imgUrl, i) => (
            <div key={i} style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden', height: '140px', minWidth: '140px', border: '1px solid var(--border)' }}>
              <img src={imgUrl} alt={`${meal.type} ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ))}
        </div>
      )}

      {meal.description && (
        <p style={{ color: 'var(--text)', fontSize: '0.95rem' }}>{meal.description}</p>
      )}

      {meal.comments && meal.comments.length > 0 && meal.comments.map(c => (
        <div key={c.id} className="p-3 mt-4" style={{ background: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--success)' }}>
          <div className="flex-center justify-start gap-2 mb-1 text-sm font-semibold" style={{ color: 'var(--success)' }}>
            <MessageSquare size={14} /> Profesional
          </div>
          <p className="text-sm" style={{ color: '#ecfdf5', margin: 0 }}>
            {c.content}
          </p>
        </div>
      ))}

      {/* Add comment input (Professional only) */}
      {onAddComment && (
        <div className="no-print mt-4 flex-center gap-2">
          <input 
             type="text" 
             className="glass-input p-2 text-sm" 
             placeholder="Dejar un comentario..."
             value={commentText}
             onChange={e => setCommentText(e.target.value)}
          />
          <button 
             className="btn btn-primary px-3 py-1 text-sm" 
             style={{ borderRadius: 'var(--radius-sm)' }} 
             onClick={async () => { 
                if(commentText.trim()) { 
                  try {
                    await onAddComment(meal.id, commentText); 
                    setCommentText(''); 
                    toastSuccess("Comentario enviado");
                  } catch(e) {
                    toastError("Error al enviar");
                  }
                } 
             }}
             disabled={!commentText.trim()}
          >
            Enviar
          </button>
        </div>
      )}
    </div>
  );
}
