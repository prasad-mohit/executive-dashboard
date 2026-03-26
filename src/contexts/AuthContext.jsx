import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

/* Persona metadata map */
const personaConfig = {
  executive: {
    label:       'C-Suite Executive',
    icon:        '👑',
    accentColor: '#f59e0b',
    gradientFrom:'#92400e',
    gradientTo:  '#78350f',
    dashboardFocus: ['strategic', 'risks', 'board'],
    aiGreeting:  'Good morning, Chief. Here\'s your strategic brief.',
  },
  manager: {
    label:       'Director / VP / Manager',
    icon:        '🎯',
    accentColor: '#3b82f6',
    gradientFrom:'#1e3a5f',
    gradientTo:  '#1e40af',
    dashboardFocus: ['operational', 'team', 'kpis'],
    aiGreeting:  'Good morning. Your team KPIs and action items are ready.',
  },
  analyst: {
    label:       'Senior Analyst',
    icon:        '🔬',
    accentColor: '#8b5cf6',
    gradientFrom:'#3b0764',
    gradientTo:  '#4c1d95',
    dashboardFocus: ['data', 'reports', 'trends'],
    aiGreeting:  'Good morning. Your data models and insights are loaded.',
  },
  admin: {
    label:       'Platform Administrator',
    icon:        '⚙️',
    accentColor: '#dc2626',
    gradientFrom:'#450a0a',
    gradientTo:  '#7f1d1d',
    dashboardFocus: ['connections', 'prompts', 'audit'],
    aiGreeting:  'Good morning. Platform status: all systems operational.',
  },
};

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('exec_os_user');
    if (storedUser) setUser(JSON.parse(storedUser));
    setLoading(false);
  }, []);

  const login = async (email, password, selectedPersona = 'executive') => {
    const mockUsers = [
      // ─── SiBoNi GIS accounts ───────────────────────────────────
      {
        id: 10,
        email: 'ceo@gis.com',
        password: 'ceo123',
        name: 'Marcus Gaksh',
        title: 'Chief Executive Officer',
        avatar: 'MG',
        role: 'executive',
        permissions: ['view_all', 'approve_decisions', 'access_confidential', 'manage_users'],
        department: 'Executive Office',
        company: 'Gaksh Industrial Systems',
      },
      {
        id: 11,
        email: 'leader@gis.com',
        password: 'leader123',
        name: 'Priya Sharma',
        title: 'Chief Operating Officer',
        avatar: 'PS',
        role: 'manager',
        permissions: ['view_team', 'recommend_decisions', 'access_standard'],
        department: 'Operations',
        company: 'Gaksh Industrial Systems',
      },
      {
        id: 12,
        email: 'admin@gis.com',
        password: 'admin123',
        name: 'Dev Admin',
        title: 'Platform Administrator',
        avatar: 'DA',
        role: 'admin',
        permissions: ['view_all', 'manage_users', 'access_confidential', 'view_data', 'create_reports', 'access_basic', 'manage_connections', 'manage_prompts'],
        department: 'IT & Platform',
        company: 'Gaksh Industrial Systems',
      },
      {
        id: 13,
        email: 'analyst@gis.com',
        password: 'analyst123',
        name: 'Arjun Mehta',
        title: 'Senior Data Analyst',
        avatar: 'AM',
        role: 'analyst',
        permissions: ['view_data', 'create_reports', 'access_basic', 'create_prompts', 'share_insights'],
        department: 'Analytics & Intelligence',
        company: 'Gaksh Industrial Systems',
      },
      // ─── Legacy accounts (backward compat) ─────────────────────
      {
        id: 1,
        email: 'ceo@company.com',
        password: 'ceo123',
        name: 'Sarah Chen',
        title: 'Chief Executive Officer',
        avatar: 'SC',
        role: 'executive',
        permissions: ['view_all', 'approve_decisions', 'access_confidential', 'manage_users'],
        department: 'Executive Office',
      },
      {
        id: 2,
        email: 'manager@company.com',
        password: 'manager123',
        name: 'John Smith',
        title: 'VP of Operations',
        avatar: 'JS',
        role: 'manager',
        permissions: ['view_team', 'recommend_decisions', 'access_standard'],
        department: 'Operations',
      },
      {
        id: 3,
        email: 'analyst@company.com',
        password: 'analyst123',
        name: 'Maria Garcia',
        title: 'Senior Data Analyst',
        avatar: 'MG',
        role: 'analyst',
        permissions: ['view_data', 'create_reports', 'access_basic'],
        department: 'Analytics',
      },
    ];

    const foundUser = mockUsers.find(u => u.email === email && u.password === password);

    if (foundUser) {
      const { password: _pw, ...safe } = foundUser;
      // Attach persona config — use matched role OR user-selected persona
      const personaKey = safe.role in personaConfig ? safe.role : selectedPersona;
      const enriched = {
        ...safe,
        persona: personaKey,
        personaConfig: personaConfig[personaKey],
        loginTime: new Date().toISOString(),
      };
      setUser(enriched);
      localStorage.setItem('exec_os_user', JSON.stringify(enriched));
      return { success: true, user: enriched };
    }

    return { success: false, error: 'Invalid credentials. Try a demo account below.' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('exec_os_user');
  };

  const hasPermission = (permission) => user?.permissions?.includes(permission) || false;

  const setPersona = (personaKey) => {
    if (!user || !(personaKey in personaConfig)) return;
    const updated = { ...user, persona: personaKey, personaConfig: personaConfig[personaKey] };
    setUser(updated);
    localStorage.setItem('exec_os_user', JSON.stringify(updated));
  };

  const value = {
    user,
    login,
    logout,
    hasPermission,
    setPersona,
    loading,
    isAuthenticated: !!user,
    personaConfig,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
