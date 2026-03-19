import React, { useState } from 'react';
import { Clock, MessageSquare, Trash2 } from 'lucide-react';

export default function MealCard({ meal, onDelete, readOnly, onAddComment }) {
  const [commentText, setCommentText] = useState('');
  const timeStr = new Date(meal.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="glass-card p-4 animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div className="flex-between">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{meal.type}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <Clock size={12} /> {timeStr}
          </span>
        </div>
        {!readOnly && onDelete && (
          <button onClick={() => onDelete(meal.id)} className="btn-glass btn-icon" style={{ padding: '0.25rem', color: 'var(--danger)', border: 'none' }}>
            <Trash2 size={16} />
          </button>
        )}
      </div>

      {meal.image_url && (
        <div style={{ borderRadius: 'var(--radius-sm)', overflow: 'hidden', height: '160px', border: '1px solid var(--border)' }}>
          <img src={meal.image_url} alt={meal.type} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      )}

      {meal.description && (
        <p style={{ color: 'var(--text)', fontSize: '0.95rem' }}>{meal.description}</p>
      )}

      {/* Professional comments */}
      {meal.comments && meal.comments.length > 0 && meal.comments.map(c => (
        <div key={c.id} style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--success)', marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', color: 'var(--success)', fontSize: '0.85rem', fontWeight: 600 }}>
            <MessageSquare size={14} /> Profesional
          </div>
          <p style={{ fontSize: '0.9rem', color: '#ecfdf5', margin: 0 }}>
            {c.content}
          </p>
        </div>
      ))}

      {/* Add comment input (Professional only) */}
      {onAddComment && (
        <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
          <input 
             type="text" 
             className="glass-input" 
             style={{ padding: '0.5rem', fontSize: '0.85rem' }}
             placeholder="Dejar un comentario..."
             value={commentText}
             onChange={e => setCommentText(e.target.value)}
          />
          <button 
             className="btn btn-primary" 
             style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', borderRadius: 'var(--radius-sm)' }} 
             onClick={() => { if(commentText.trim()) { onAddComment(meal.id, commentText); setCommentText(''); } }}
             disabled={!commentText.trim()}
          >
            Enviar
          </button>
        </div>
      )}
    </div>
  );
}
