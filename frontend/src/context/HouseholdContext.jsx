import React, { createContext, useState, useEffect, useCallback } from 'react';
import { householdService } from '../services/household.service.js';
import { useAuth } from '../hooks/useAuth.js';

export const HouseholdContext = createContext(null);

export const HouseholdProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [households, setHouseholds] = useState([]);
  const [activeHouseholdId, setActiveHouseholdId] = useState(() => {
    return localStorage.getItem('active_household_id') ? parseInt(localStorage.getItem('active_household_id'), 10) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshHouseholds = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(null);
    try {
      const res = await householdService.getAll();
      const list = Array.isArray(res.data) ? res.data : [];
      setHouseholds(list);

      // If active household is not in list or null, select first household
      if (list.length > 0) {
        const exists = list.find((h) => h.id === activeHouseholdId);
        if (!exists) {
          const defaultId = list[0].id;
          setActiveHouseholdId(defaultId);
          localStorage.setItem('active_household_id', String(defaultId));
        }
      } else {
        setActiveHouseholdId(null);
        localStorage.removeItem('active_household_id');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch households');
      setHouseholds([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, activeHouseholdId]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshHouseholds();
    } else {
      setHouseholds([]);
      setActiveHouseholdId(null);
      localStorage.removeItem('active_household_id');
    }
  }, [isAuthenticated, refreshHouseholds]);

  const selectHousehold = (id) => {
    const numId = parseInt(id, 10);
    setActiveHouseholdId(numId);
    localStorage.setItem('active_household_id', String(numId));
  };

  const safeHouseholds = Array.isArray(households) ? households : [];
  const activeHousehold = safeHouseholds.find((h) => h.id === activeHouseholdId) || (safeHouseholds.length > 0 ? safeHouseholds[0] : null);

  const value = {
    households: safeHouseholds,
    activeHousehold,
    activeHouseholdId: activeHousehold?.id || null,
    loading,
    error,
    refreshHouseholds,
    selectHousehold
  };

  return (
    <HouseholdContext.Provider value={value}>
      {children}
    </HouseholdContext.Provider>
  );
};
