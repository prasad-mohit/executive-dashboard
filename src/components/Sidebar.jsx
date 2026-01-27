import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar() {
  const { user, hasPermission } = useAuth();

  const navigation = [
    { name: 'Dashboard', icon: '📊', path: '/dashboard', permission: null },
    { name: 'Decisions', icon: '🎯', path: '/decisions', permission: null },
    { name: 'History', icon: '📜', path: '/history', permission: 'view_team' },
    { name: 'Analytics', icon: '📈', path: '/analytics', permission: 'view_team' },
    { name: 'Settings', icon: '⚙️', path: '/settings', permission: 'view_all' },
  ];

  const filteredNav = navigation.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  return (
    <div className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Executive OS
        </h1>
        <p className="text-xs text-gray-400 mt-1">AI Decision Intelligence</p>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">{user?.name}</div>
            <div className="text-xs text-gray-400 capitalize">{user?.role}</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {filteredNav.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg'
                  : 'hover:bg-gray-700'
              }`
            }
          >
            <span className="text-xl">{item.icon}</span>
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-400 text-center">
          <div className="mb-2">🤖 4 AI Agents Active</div>
          <div>Version 2.0.0</div>
        </div>
      </div>
    </div>
  );
}
