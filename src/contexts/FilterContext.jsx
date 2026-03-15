import { createContext, useContext, useState } from 'react';
import { defaultFilters } from '../data/gisData';

const FilterContext = createContext(null);

export const useFilters = () => {
  const ctx = useContext(FilterContext);
  if (!ctx) throw new Error('useFilters must be used within a FilterProvider');
  return ctx;
};

export function FilterProvider({ children }) {
  const [filters, setFilters] = useState({ ...defaultFilters });
  const [snapData, setSnapData] = useState(null);
  const [snapVisible, setSnapVisible] = useState(false);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const reset = () => {
    setFilters({ ...defaultFilters });
  };

  const snap = () => {
    const snapshot = {
      filters: { ...filters },
      timestamp: new Date().toISOString(),
      label: `Snapshot — ${filters.site} | ${filters.productLine} | ${filters.timeRange}`,
    };
    setSnapData(snapshot);
    setSnapVisible(true);
    return snapshot;
  };

  const dismissSnap = () => setSnapVisible(false);

  return (
    <FilterContext.Provider value={{
      filters,
      updateFilter,
      reset,
      snap,
      snapData,
      snapVisible,
      dismissSnap,
    }}>
      {children}
    </FilterContext.Provider>
  );
}
