export default function ConnectorStatus({ healthData }) {
  const connectors = healthData?.connectors || {};

  const getStatusColor = (status) => {
    return status === 'online' ? 'bg-green-500' : 'bg-red-500';
  };

  const connectorInfo = [
    { id: 'erp', name: 'ERP System', icon: '💼' },
    { id: 'crm', name: 'CRM', icon: '👥' },
    { id: 'email', name: 'Email', icon: '📧' },
    { id: 'hr', name: 'HR System', icon: '🏢' },
    { id: 'market', name: 'Market Intel', icon: '📊' },
    { id: 'news', name: 'News Feed', icon: '📰' }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Data Connectors
      </h2>
      <div className="space-y-3">
        {connectorInfo.map((connector) => (
          <div
            key={connector.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{connector.icon}</span>
              <span className="text-sm font-medium text-gray-700">
                {connector.name}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${getStatusColor(
                  connectors[connector.id]
                )}`}
              />
              <span className="text-xs text-gray-600 capitalize">
                {connectors[connector.id] || 'offline'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
