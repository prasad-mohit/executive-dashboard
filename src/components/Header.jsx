import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';

export default function Header() {
  const { user, logout } = useAuth();
  const { calculateMonthlyCost } = useWorkspace();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    return now.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Current Time & Status */}
        <div className="flex items-center space-x-6">
          <div>
            <div className="text-sm text-gray-500">Current Time</div>
            <div className="font-semibold text-gray-800">{getCurrentDateTime()}</div>
          </div>
          <div className="h-8 w-px bg-gray-300" />
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-700">All Systems Operational</span>
          </div>
        </div>

        {/* Right: Cost & User Actions */}
        <div className="flex items-center space-x-6">
          {/* Monthly Cost */}
          <div className="text-right">
            <div className="text-xs text-gray-500">Monthly Cost</div>
            <div className="font-bold text-blue-600">
              ${calculateMonthlyCost().toFixed(2)}
            </div>
          </div>

          <div className="h-8 w-px bg-gray-300" />

          {/* User Badge */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-800">{user?.name}</div>
              <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
