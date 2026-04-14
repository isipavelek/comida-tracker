import React from 'react';
import { format } from 'date-fns';
import { AlertCircle } from 'lucide-react';

const PatientStats = ({ meals = [], dateStr }) => {
  const goal = 4; // Expected meals: Desayuno, Almuerzo, Merienda, Cena
  const mealsCount = meals.length;
  const percent = Math.min(100, Math.round((mealsCount / goal) * 100));
  
  const isToday = dateStr === format(new Date(), 'yyyy-MM-dd');
  const missedMeals = [];
  
  if (isToday) {
    const currentHour = new Date().getHours();
    
    const hasDesayuno = meals.some(m => m.type === 'Desayuno');
    const hasAlmuerzo = meals.some(m => m.type === 'Almuerzo');
    const hasMerienda = meals.some(m => m.type === 'Merienda');
    const hasCena = meals.some(m => m.type === 'Cena');

    if (!hasDesayuno && currentHour >= 10) missedMeals.push('Desayuno');
    if (!hasAlmuerzo && currentHour >= 15) missedMeals.push('Almuerzo');
    if (!hasMerienda && currentHour >= 18) missedMeals.push('Merienda');
    if (!hasCena && currentHour >= 23) missedMeals.push('Cena');
  }

  return (
    <div className="glass animate-fade-in mb-4 flex-col" style={{ overflow: 'hidden' }}>
      <div className="p-4 flex-center justify-start gap-4">
        <div className="flex-center" style={{ 
          width: '60px', 
          height: '60px', 
          borderRadius: '50%', 
          background: `conic-gradient(#10b981 ${percent}%, rgba(16, 185, 129, 0.1) 0)`
        }}>
          <div className="flex-center font-bold text-sm" style={{ 
            width: '50px', 
            height: '50px', 
            borderRadius: '50%', 
            backgroundColor: 'var(--background)'
          }}>
            {percent}%
          </div>
        </div>
        <div>
          <h4 style={{ margin: 0 }}>Resumen del Día</h4>
          <p className="text-sm m-0">
            Has registrado {mealsCount} {mealsCount === 1 ? 'comida' : 'comidas'}. 
            {mealsCount >= goal ? ' ¡Excelente trabajo! 🎉' : ' ¡Sigue así! 💪'}
          </p>
        </div>
      </div>

      {missedMeals.length > 0 && (
        <div className="flex-col gap-1" style={{ padding: '0.75rem 1.25rem', background: 'rgba(239, 68, 68, 0.1)', borderTop: '1px solid rgba(239, 68, 68, 0.2)', width: '100%', boxSizing: 'border-box' }}>
          <div className="flex-center justify-center gap-2 text-sm font-semibold" style={{ color: 'var(--danger)' }}>
            <AlertCircle size={16} /> ¡Comidas pendientes!
          </div>
          <p className="text-sm m-0 text-center" style={{ color: 'var(--text)' }}>
            Te olvidaste de registrar: <strong style={{ color: 'var(--danger)' }}>{missedMeals.join(', ')}</strong>.
          </p>
        </div>
      )}
    </div>
  );
};

export default PatientStats;
