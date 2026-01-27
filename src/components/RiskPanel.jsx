import { useAuth } from '../contexts/AuthContext';

export default function RiskPanel({ risks, dataWindow }) {
  const { user, hasPermission } = useAuth();

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const canViewDetails = hasPermission('view_all') || hasPermission('view_team');

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            ⚠️ Risk Assessment
          </h2>
          <p className="text-xs text-gray-500 mt-1">Based on {dataWindow || 'recent data'}</p>
        </div>
        <span className="text-sm text-gray-500">
          Role: {user?.role || 'Unknown'}
        </span>
      </div>

      {!risks || risks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No risks identified at this time
        </div>
      ) : (
        <div className="space-y-3">
          {risks.slice(0, user?.role === 'analyst' ? 2 : 10).map((risk) => (
            <div
              key={risk.id}
              className={`border-2 rounded-lg p-4 ${getSeverityColor(
                risk.severity
              )}`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-sm">{risk.title}</h3>
                <span className="text-xs px-2 py-1 bg-white rounded">
                  {risk.confidence}% confidence
                </span>
              </div>

              {canViewDetails && (
                <>
                  <p className="text-sm mb-2">{risk.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">
                      Source: {risk.source}
                    </span>
                    <span className={`font-semibold ${
                      risk.urgency === 'immediate' ? 'text-red-600' : 
                      risk.urgency === 'urgent' ? 'text-orange-600' : 
                      'text-yellow-600'
                    }`}>
                      {risk.urgency?.toUpperCase()}
                    </span>
                  </div>
                </>
              )}

              {user?.role === 'analyst' && (
                <p className="text-xs text-gray-600 mt-2 italic">
                  Limited view - Contact manager for full details
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
