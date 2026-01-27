import { createContext, useContext, useState, useEffect } from 'react';

const WorkspaceContext = createContext(null);

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
};

const defaultConnectors = [
  {
    id: 'erp',
    name: 'ERP System',
    icon: '💼',
    enabled: true,
    apiEndpoint: 'http://localhost:3001/api/mcp/erp',
    apiKey: 'demo-key-erp-2024',
    refreshInterval: 30,
    dataRetention: 90,
    status: 'online',
    lastSync: null,
    description: 'Financial data, revenue, expenses, cash flow',
    cost_per_query: 0.05,
    monthly_queries: 14400, // 30s intervals
  },
  {
    id: 'crm',
    name: 'CRM System',
    icon: '👥',
    enabled: true,
    apiEndpoint: 'http://localhost:3001/api/mcp/crm',
    apiKey: 'demo-key-crm-2024',
    refreshInterval: 30,
    dataRetention: 90,
    status: 'online',
    lastSync: null,
    description: 'Sales pipeline, deals, customer data',
    cost_per_query: 0.08,
    monthly_queries: 14400,
  },
  {
    id: 'email',
    name: 'Email Analytics',
    icon: '📧',
    enabled: true,
    apiEndpoint: 'http://localhost:3001/api/mcp/email',
    apiKey: 'demo-key-email-2024',
    refreshInterval: 60,
    dataRetention: 30,
    status: 'online',
    lastSync: null,
    description: 'Sentiment analysis, urgent threads, escalations',
    cost_per_query: 0.12,
    monthly_queries: 7200,
  },
  {
    id: 'hr',
    name: 'HR System',
    icon: '🏢',
    enabled: true,
    apiEndpoint: 'http://localhost:3001/api/mcp/hr',
    apiKey: 'demo-key-hr-2024',
    refreshInterval: 120,
    dataRetention: 180,
    status: 'online',
    lastSync: null,
    description: 'Headcount, attrition, hiring metrics',
    cost_per_query: 0.06,
    monthly_queries: 3600,
  },
  {
    id: 'market',
    name: 'Market Intelligence',
    icon: '📊',
    enabled: true,
    apiEndpoint: 'http://localhost:3001/api/mcp/market',
    apiKey: 'demo-key-market-2024',
    refreshInterval: 180,
    dataRetention: 60,
    status: 'online',
    lastSync: null,
    description: 'Competitor analysis, market sentiment',
    cost_per_query: 0.25,
    monthly_queries: 2400,
  },
  {
    id: 'news',
    name: 'News Feed',
    icon: '📰',
    enabled: true,
    apiEndpoint: 'http://localhost:3001/api/mcp/news',
    apiKey: 'demo-key-news-2024',
    refreshInterval: 300,
    dataRetention: 30,
    status: 'online',
    lastSync: null,
    description: 'Industry news, brand mentions',
    cost_per_query: 0.15,
    monthly_queries: 1440,
  },
];

export const WorkspaceProvider = ({ children }) => {
  const [connectors, setConnectors] = useState(() => {
    const stored = localStorage.getItem('workspace_connectors');
    return stored ? JSON.parse(stored) : defaultConnectors;
  });

  const [settings, setSettings] = useState(() => {
    const stored = localStorage.getItem('workspace_settings');
    return stored ? JSON.parse(stored) : {
      autoRefresh: true,
      globalRefreshInterval: 30,
      timezone: 'America/New_York',
      dataRetentionDefault: 90,
      enableNotifications: true,
      theme: 'light',
    };
  });

  useEffect(() => {
    localStorage.setItem('workspace_connectors', JSON.stringify(connectors));
  }, [connectors]);

  useEffect(() => {
    localStorage.setItem('workspace_settings', JSON.stringify(settings));
  }, [settings]);

  const updateConnector = (connectorId, updates) => {
    setConnectors(prev =>
      prev.map(conn =>
        conn.id === connectorId ? { ...conn, ...updates } : conn
      )
    );
  };

  const toggleConnector = (connectorId) => {
    setConnectors(prev =>
      prev.map(conn =>
        conn.id === connectorId ? { ...conn, enabled: !conn.enabled } : conn
      )
    );
  };

  const resetConnectors = () => {
    setConnectors(defaultConnectors);
  };

  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const getEnabledConnectors = () => {
    return connectors.filter(c => c.enabled);
  };

  const calculateMonthlyCost = () => {
    return connectors
      .filter(c => c.enabled)
      .reduce((total, c) => total + (c.cost_per_query * c.monthly_queries), 0);
  };

  const value = {
    connectors,
    settings,
    updateConnector,
    toggleConnector,
    resetConnectors,
    updateSettings,
    getEnabledConnectors,
    calculateMonthlyCost,
  };

  return (
    <WorkspaceContext.Provider value={value}>
      {children}
    </WorkspaceContext.Provider>
  );
};
