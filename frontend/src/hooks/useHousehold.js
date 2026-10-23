import { useContext } from 'react';
import { HouseholdContext } from '../context/HouseholdContext.jsx';

export const useHousehold = () => {
  const context = useContext(HouseholdContext);
  if (!context) {
    throw new Error('useHousehold must be used within a HouseholdProvider');
  }
  return context;
};
