import { createContext, useContext, useMemo, useState } from 'react';

const DecisionStateContext = createContext(null);

export function useDecisionState() {
  const ctx = useContext(DecisionStateContext);
  if (!ctx) throw new Error('useDecisionState must be used within a DecisionStateProvider');
  return ctx;
}

export function DecisionStateProvider({ children }) {
  const [decisionState, setDecisionState] = useState(() => {
    try {
      const raw = localStorage.getItem('siboni_decision_state');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  const write = (next) => {
    setDecisionState(next);
    try { localStorage.setItem('siboni_decision_state', JSON.stringify(next)); } catch {}
  };

  const commitDecision = (decisionId) => {
    const next = {
      ...decisionState,
      [decisionId]: {
        ...(decisionState[decisionId] || {}),
        status: 'Committed',
        updatedAt: new Date().toISOString(),
      },
    };
    write(next);
  };

  const holdDecision = (decisionId) => {
    const next = {
      ...decisionState,
      [decisionId]: {
        ...(decisionState[decisionId] || {}),
        status: 'Hold',
        updatedAt: new Date().toISOString(),
      },
    };
    write(next);
  };

  const clearDecisionState = () => {
    write({});
  };

  const value = useMemo(() => ({
    decisionState,
    commitDecision,
    holdDecision,
    clearDecisionState,
  }), [decisionState]);

  return <DecisionStateContext.Provider value={value}>{children}</DecisionStateContext.Provider>;
}
