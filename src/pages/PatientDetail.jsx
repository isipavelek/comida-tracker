import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { format, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react';
import MealCard from '../components/MealCard';

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '-0.5rem' }}>
        <button onClick={() => navigate('/professional')} className="btn-glass btn-icon">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h2 className="text-gradient" style={{ margin: 0, fontSize: '1.5rem' }}>{patient.full_name}</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Registro Diario</span>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="glass flex-between p-4">
        <button onClick={handlePrevDay} className="btn-glass btn-icon">
          <ChevronLeft />
        </button>
        <div className="text-center">
          <h3 style={{ margin: 0, textTransform: 'capitalize' }}>
            {format(currentDate, 'EEEE', { locale: es })}
          </h3>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {format(currentDate, "d 'de' MMMM", { locale: es })}
          </span>
        </div>
        <button onClick={handleNextDay} className="btn-glass btn-icon" disabled={format(currentDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')}>
          <ChevronRight />
        </button>
      </div>

      {/* Meals */}
      {loading ? (
        <div className="flex-center p-6"><Loader2 className="animate-pulse-slow" size={32} /></div>
      ) : meals.length === 0 ? (
        <div className="glass-panel p-6 text-center animate-fade-in">
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>El paciente no registró comidas este día.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
