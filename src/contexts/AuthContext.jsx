import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored auth token on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // Mock login - in production, this would call your MCP server
    const mockUsers = [
      {
        id: 1,
        email: 'ceo@company.com',
        password: 'ceo123',
        name: 'Sarah Chen',
        role: 'executive',
        permissions: ['view_all', 'approve_decisions', 'access_confidential', 'manage_users']
      },
      {
        id: 2,
        email: 'manager@company.com',
        password: 'manager123',
        name: 'John Smith',
        role: 'manager',
        permissions: ['view_team', 'recommend_decisions', 'access_standard']
      },
      {
        id: 3,
        email: 'analyst@company.com',
        password: 'analyst123',
        name: 'Maria Garcia',
        role: 'analyst',
        permissions: ['view_data', 'create_reports', 'access_basic']
      }
    ];

    const foundUser = mockUsers.find(
      u => u.email === email && u.password === password
    );

    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      localStorage.setItem('user', JSON.stringify(userWithoutPassword));
      return { success: true, user: userWithoutPassword };
    }

    return { success: false, error: 'Invalid credentials' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const hasPermission = (permission) => {
    return user?.permissions?.includes(permission) || false;
  };

  const value = {
    user,
    login,
    logout,
    hasPermission,
    loading,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
