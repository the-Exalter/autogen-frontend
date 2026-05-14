import React, { createContext, useContext, useState } from 'react';

const CompareContext = createContext(null);

export function CompareProvider({ children }) {
  const [compareIds, setCompareIds] = useState([]);

  const addToCompare = (id) => {
    setCompareIds((prev) => (prev.includes(id) || prev.length >= 3 ? prev : [...prev, id]));
  };

  const removeFromCompare = (id) => {
    setCompareIds((prev) => prev.filter((x) => x !== id));
  };

  const isInCompare = (id) => compareIds.includes(id);

  const clearCompare = () => setCompareIds([]);

  return (
    <CompareContext.Provider value={{ compareIds, addToCompare, removeFromCompare, isInCompare, clearCompare }}>
      {children}
    </CompareContext.Provider>
  );
}

export const useCompare = () => useContext(CompareContext);
