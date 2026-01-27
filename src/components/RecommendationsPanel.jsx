import { useAuth } from '../contexts/AuthContext';

export default function RecommendationsPanel({ recommendations }) {
  const { user, hasPermission } = useAuth();

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const canApprove = hasPermission('approve_decisions');
  const canRecommend = hasPermission('recommend_decisions');

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        💡 AI-Generated Recommendations
      </h2>

      {!recommendations || recommendations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No recommendations available
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div key={rec.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span
                      className={`text-xs px-2 py-1 rounded font-semibold ${getPriorityColor(
                        rec.priority
                      )}`}
                    >
                      {rec.priority?.toUpperCase()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {rec.confidence}% confidence
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-800">{rec.title}</h3>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Recommended Actions:
                </p>
                <ul className="space-y-1">
                  {rec.actions?.slice(0, user?.role === 'analyst' ? 2 : 10).map((action, idx) => (
                    <li key={idx} className="text-sm text-gray-600 flex items-start">
                      <span className="mr-2">•</span>
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="text-sm text-gray-600 mb-3">
                <strong>Expected Impact:</strong> {rec.expectedImpact}
              </div>

              {rec.roi_estimate && (
                <div className="text-xs text-gray-500 mb-3">
                  <strong>ROI Estimate:</strong> {rec.roi_estimate}
                </div>
              )}

              {/* Action Buttons Based on Role */}
              <div className="flex space-x-2 mt-4">
                {canApprove && (
                  <>
                    <button className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                      Approve
                    </button>
                    <button className="px-4 py-2 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400">
                      Defer
                    </button>
                  </>
                )}
                {canRecommend && !canApprove && (
                  <button className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                    Escalate to Executive
                  </button>
                )}
                {!canApprove && !canRecommend && (
                  <span className="text-xs text-gray-500 italic">
                    View only - No action permissions
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
