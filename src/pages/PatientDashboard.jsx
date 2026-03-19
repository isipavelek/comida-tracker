import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { format, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Loader2 } from 'lucide-react';
import MealForm from '../components/MealForm';
import MealCard from '../components/MealCard';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const dateStr = format(currentDate, 'yyyy-MM-dd');

  const fetchMeals = async () => {
    setLoading(true);
    const { data, error } = await api.getMealsByDate(user.uid, dateStr);
    if (!error && data) {
      setMeals(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user?.uid) fetchMeals();
  }, [user?.uid, dateStr]);

  const handlePrevDay = () => setCurrentDate(prev => subDays(prev, 1));
  const handleNextDay = () => setCurrentDate(prev => addDays(prev, 1));

  const handleMealSaved = (newMeal) => {
    setShowForm(false);
    setMeals([...meals, newMeal]);
  };

  const handleMealDeleted = async (mealId) => {
    if (window.confirm("¿Seguro que deseas eliminar este registro?")) {
      const { error } = await api.deleteMeal(mealId);
      if (!error) {
        setMeals(meals.filter(m => m.id !== mealId));
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      
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

      {/* Main Content */}
      {showForm ? (
        <MealForm 
          patientId={user.uid} 
          date={dateStr} 
          onSaved={handleMealSaved} 
          onCancel={() => setShowForm(false)} 
        />
      ) : (
        <>
          <button 
            className="btn btn-primary w-full p-4" 
            style={{ fontSize: '1.1rem', padding: '1rem' }}
            onClick={() => setShowForm(true)}
          >
            <Plus /> Registrar Comida
          </button>

          {loading ? (
            <div className="flex-center p-6"><Loader2 className="animate-pulse-slow" size={32} /></div>
          ) : meals.length === 0 ? (
            <div className="glass-panel p-6 text-center animate-fade-in" style={{ marginTop: '1rem' }}>
              <p style={{ margin: 0, color: 'var(--text-muted)' }}>No hay comidas registradas este día.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {meals.map(meal => (
                <MealCard key={meal.id} meal={meal} onDelete={handleMealDeleted} />
              ))}
            </div>
          )}
        </>
      )}

    </div>
  );
};

export default PatientDashboard;
