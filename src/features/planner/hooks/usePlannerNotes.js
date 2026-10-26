import { useContext } from 'react';
import { PlannerContext } from '../context/PlannerContext';

export function usePlannerNotes() {
  const context = useContext(PlannerContext);
  if (!context) throw new Error('usePlannerNotes используется вне PlannerProvider');
  return context;
}
