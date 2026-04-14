import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { format, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, ArrowLeft, Loader2, Download } from 'lucide-react';
import MealCard from '../components/MealCard';

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const dateInputRef = useRef(null);

  const dateStr = format(currentDate, 'yyyy-MM-dd');

  useEffect(() => {
    api.getPatientInfo(id).then(({ data }) => setPatient(data));
  }, [id]);

  useEffect(() => {
    setLoading(true);
    api.getMealsByDate(id, dateStr).then(({ data }) => {
      setMeals(data || []);
      setLoading(false);
    });
  }, [id, dateStr]);

  const handleAddComment = async (mealId, content) => {
    const { data, error } = await api.addComment(mealId, content);
    if (!error && data) {
      // Update local state to show the comment instantly
      setMeals(meals.map(m => {
        if (m.id === mealId) {
          return { ...m, comments: [...(m.comments || []), data] };
        }
        return m;
      }));
    }
  };

  const handlePrevDay = () => setCurrentDate(prev => subDays(prev, 1));
  const handleNextDay = () => setCurrentDate(prev => addDays(prev, 1));

  if (!patient) return <div className="flex-center p-6"><Loader2 className="animate-pulse-slow" size={32} /></div>;

  return (
    <div className="flex-col gap-6">
      
      {/* Header */}
      <div className="flex-between" style={{ marginBottom: '-0.5rem' }}>
        <div className="flex-center gap-4">
          <button onClick={() => navigate('/professional')} className="btn-glass btn-icon no-print">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-gradient m-0" style={{ fontSize: '1.5rem' }}>{patient.full_name}</h2>
            <span className="text-sm text-muted">Registro Diario</span>
          </div>
        </div>
        <button onClick={() => window.print()} className="btn-glass btn-icon no-print" title="Exportar a PDF" style={{ color: 'var(--primary)' }}>
          <Download size={20} />
        </button>
      </div>

      {/* Date Navigation */}
      <div className="glass flex-between p-4 no-print">
        <button onClick={handlePrevDay} className="btn-glass btn-icon">
          <ChevronLeft />
        </button>
        <div className="text-center relative cursor-pointer" style={{ padding: '0.25rem 1rem' }} onClick={() => { try { dateInputRef.current?.showPicker(); } catch(e) {} }}>
          <input 
            ref={dateInputRef}
            type="date"
            value={dateStr}
            max={format(new Date(), 'yyyy-MM-dd')}
            onChange={(e) => {
              if(e.target.value) setCurrentDate(new Date(e.target.value + 'T12:00:00'));
            }}
            style={{ 
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
              width: '100%', height: '100%', 
              opacity: 0, pointerEvents: 'none', zIndex: -1 
            }}
          />
          <h3 style={{ margin: 0, textTransform: 'capitalize' }}>
            {format(currentDate, 'EEEE', { locale: es })}
          </h3>
          <span className="text-sm text-muted">
            {format(currentDate, "d 'de' MMMM", { locale: es })} 📅
          </span>
        </div>
        <button onClick={handleNextDay} className="btn-glass btn-icon" disabled={dateStr === format(new Date(), 'yyyy-MM-dd')}>
          <ChevronRight />
        </button>
      </div>

      {/* Meals */}
      {loading ? (
        <div className="flex-center p-6"><Loader2 className="animate-pulse-slow" size={32} /></div>
      ) : meals.length === 0 ? (
        <div className="glass-panel p-6 text-center animate-fade-in">
          <p className="m-0 text-muted">El paciente no registró comidas este día.</p>
        </div>
      ) : (
        <div className="flex-col gap-4">
          {meals.map(meal => (
            <MealCard 
              key={meal.id} 
              meal={meal} 
              readOnly={true} 
              onAddComment={handleAddComment} 
            />
          ))}
        </div>
      )}

    </div>
  );
}
