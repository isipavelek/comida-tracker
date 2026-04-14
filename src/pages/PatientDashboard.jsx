import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { api } from '../lib/api';
import { format, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, Loader2 } from 'lucide-react';
import MealForm from '../components/MealForm';
import MealCard from '../components/MealCard';
import WaterTracker from '../components/WaterTracker';
import PatientStats from '../components/PatientStats';

const PatientDashboard = () => {
  const { user } = useAuth();
  const { toastSuccess, toastError, toastInfo } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const dateInputRef = useRef(null);

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
    if (editingMeal) {
      setMeals(meals.map(m => m.id === newMeal.id ? newMeal : m));
    } else {
      setMeals([...meals, newMeal]);
    }
    setEditingMeal(null);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingMeal(null);
  };

  const handleEditMeal = (meal) => {
    setEditingMeal(meal);
    setShowForm(true);
  };

  const handleMealDeleted = async (mealId) => {
    if (window.confirm("¿Seguro que deseas eliminar este registro?")) {
      const { error } = await api.deleteMeal(mealId);
      if (!error) {
        setMeals(meals.filter(m => m.id !== mealId));
        toastInfo("Registro eliminado");
      } else {
        toastError("Error al eliminar");
      }
    }
  };

  return (
    <div className="flex-col gap-6">
      
      {/* Date Navigation */}
      <div className="glass flex-between p-4">
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

      <PatientStats meals={meals} dateStr={dateStr} />
      <WaterTracker patientId={user.uid} dateStr={dateStr} />

      {/* Main Content */}
      {showForm ? (
        <MealForm 
          patientId={user.uid} 
          date={dateStr} 
          initialMeal={editingMeal}
          onSaved={handleMealSaved} 
          onCancel={handleCancelForm} 
        />
      ) : (
        <>
          <button 
            className="btn btn-primary w-full p-4 font-semibold" 
            onClick={() => setShowForm(true)}
          >
            <Plus /> Registrar Comida
          </button>

          {loading ? (
            <div className="flex-center p-6"><Loader2 className="animate-pulse-slow" size={32} /></div>
          ) : meals.length === 0 ? (
            <div className="glass-panel p-6 mt-4 text-center animate-fade-in">
              <p className="m-0 text-muted">No hay comidas registradas este día.</p>
            </div>
          ) : (
            <div className="flex-col gap-4">
              {meals.map(meal => (
                <MealCard 
                  key={meal.id} 
                  meal={meal} 
                  onDelete={handleMealDeleted} 
                  onEdit={handleEditMeal}
                />
              ))}
            </div>
          )}
        </>
      )}

    </div>
  );
};

export default PatientDashboard;
