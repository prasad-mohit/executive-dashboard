import { useState } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useAuth } from '../contexts/AuthContext';

export default function Settings() {
  const { connectors, settings, updateConnector, toggleConnector, resetConnectors, updateSettings } = useWorkspace();
  const { hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('connectors');

  const canManage = hasPermission('manage_users') || hasPermission('view_all');

  if (!canManage) {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Access Restricted</h2>
          <p className="text-gray-600">You don't have permission to access workspace settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">⚙️ Workspace Settings</h1>
        <p className="text-gray-600">Configure data connectors and system preferences</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('connectors')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'connectors'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              🔌 Data Connectors
            </button>
            <button
              onClick={() => setActiveTab('general')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'general'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              ⚡ General Settings
            </button>
            <button
              onClick={() => setActiveTab('costs')}
              className={`px-6 py-3 font-medium border-b-2 transition-colors ${
                activeTab === 'costs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              💰 Cost Analysis
            </button>
          </nav>
        </div>
      </div>

      {/* Connectors Tab */}
      {activeTab === 'connectors' && (
        <div className="space-y-4">
          {connectors.map((connector) => (
            <div
              key={connector.id}
              className={`bg-white rounded-lg shadow p-6 border-2 ${
                connector.enabled ? 'border-green-200' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{connector.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{connector.name}</h3>
                    <p className="text-sm text-gray-600">{connector.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleConnector(connector.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    connector.enabled
                      ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {connector.enabled ? '✓ Enabled' : '○ Disabled'}
                </button>
              </div>

              {connector.enabled && (
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API Endpoint
                    </label>
                    <input
                      type="text"
                      value={connector.apiEndpoint}
                      onChange={(e) =>
                        updateConnector(connector.id, { apiEndpoint: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      API Key
                    </label>
                    <input
                      type="password"
                      value={connector.apiKey}
                      onChange={(e) =>
                        updateConnector(connector.id, { apiKey: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Refresh Interval (seconds)
                    </label>
                    <input
                      type="number"
                      value={connector.refreshInterval}
                      onChange={(e) =>
                        updateConnector(connector.id, {
                          refreshInterval: parseInt(e.target.value),
                        })
                      }
                      min="10"
                      max="3600"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Data Retention (days)
                    </label>
                    <input
                      type="number"
                      value={connector.dataRetention}
                      onChange={(e) =>
                        updateConnector(connector.id, {
                          dataRetention: parseInt(e.target.value),
                        })
                      }
                      min="1"
                      max="365"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>

                  <div className="col-span-2">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Status:</span>
                          <span className={`ml-2 font-semibold ${
                            connector.status === 'online' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {connector.status}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Cost per query:</span>
                          <span className="ml-2 font-semibold text-gray-800">
                            ${connector.cost_per_query.toFixed(3)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Monthly cost:</span>
                          <span className="ml-2 font-semibold text-blue-600">
                            ${(connector.cost_per_query * connector.monthly_queries).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={resetConnectors}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Reset to Defaults
            </button>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Save Configuration
            </button>
          </div>
        </div>
      )}

      {/* General Settings Tab */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">Auto-refresh Dashboard</h3>
                <p className="text-sm text-gray-600">Automatically refresh data at intervals</p>
              </div>
              <button
                onClick={() => updateSettings({ autoRefresh: !settings.autoRefresh })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.autoRefresh ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.autoRefresh ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Global Refresh Interval (seconds)
              </label>
              <input
                type="number"
                value={settings.globalRefreshInterval}
                onChange={(e) =>
                  updateSettings({ globalRefreshInterval: parseInt(e.target.value) })
                }
                min="10"
                max="600"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
              <select
                value={settings.timezone}
                onChange={(e) => updateSettings({ timezone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="UTC">UTC</option>
                <option value="Europe/London">London (GMT)</option>
                <option value="Asia/Tokyo">Tokyo (JST)</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">Enable Notifications</h3>
                <p className="text-sm text-gray-600">Get alerts for critical events</p>
              </div>
              <button
                onClick={() =>
                  updateSettings({ enableNotifications: !settings.enableNotifications })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.enableNotifications ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.enableNotifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cost Analysis Tab */}
      {activeTab === 'costs' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">💰 Monthly Cost Projection</h2>
            <div className="text-5xl font-bold text-blue-600 mb-2">
              ${useWorkspace().calculateMonthlyCost().toFixed(2)}
            </div>
            <p className="text-gray-600">Based on current connector configuration</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Cost Breakdown by Connector</h3>
            <div className="space-y-3">
              {connectors
                .filter((c) => c.enabled)
                .map((connector) => {
                  const monthlyCost = connector.cost_per_query * connector.monthly_queries;
                  return (
                    <div key={connector.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{connector.icon}</span>
                        <div>
                          <div className="font-medium text-gray-800">{connector.name}</div>
                          <div className="text-xs text-gray-600">
                            {connector.monthly_queries.toLocaleString()} queries/month
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-gray-800">
                          ${monthlyCost.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-600">
                          ${connector.cost_per_query.toFixed(3)}/query
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
