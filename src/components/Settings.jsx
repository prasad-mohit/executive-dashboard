import { useState } from 'react';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { useAuth } from '../contexts/AuthContext';

const CARD_STYLE = {
  background: 'rgba(8,15,31,0.9)',
  border: '1px solid rgba(30,58,95,0.4)',
};

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={onChange}
      className="relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-200"
      style={{
        background: value ? '#2563eb' : 'rgba(30,58,95,0.6)',
        boxShadow: value ? '0 0 10px rgba(37,99,235,0.4)' : 'none',
      }}
    >
      <span
        className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200"
        style={{ transform: value ? 'translateX(1.25rem)' : 'translateX(0.25rem)' }}
      />
    </button>
  );
}

function DarkInput({ value, onChange, type = 'text', min, max }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      className="input-dark w-full px-3 py-2 rounded-lg text-sm"
    />
  );
}

export default function Settings() {
  const { connectors, settings, updateConnector, toggleConnector, resetConnectors, updateSettings, calculateMonthlyCost } = useWorkspace();
  const { user, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('connectors');

  const canManage   = hasPermission('manage_users') || hasPermission('view_all');
  const accentColor = user?.personaConfig?.accentColor || '#3b82f6';

  const tabs = [
    { id: 'connectors', label: '🔌 Data Connectors' },
    { id: 'general',    label: '⚡ General Settings' },
    { id: 'costs',      label: '💰 Cost Analysis' },
  ];

  if (!canManage) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <div
          className="rounded-2xl p-10 text-center max-w-sm"
          style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}
        >
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-white mb-2">Access Restricted</h2>
          <p className="text-slate-500 text-sm">You don't have permission to access workspace settings.</p>
        </div>
      </div>
    );
  }

  const totalMonthlyCost = calculateMonthlyCost();

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white mb-1">⚙️ Workspace Settings</h1>
        <p className="text-slate-500 text-sm">Configure data connectors and system preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(8,15,31,0.8)', border: '1px solid rgba(30,58,95,0.4)' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="flex-1 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
            style={{
              background: activeTab === tab.id ? `${accentColor}20` : 'transparent',
              border: activeTab === tab.id ? `1px solid ${accentColor}40` : '1px solid transparent',
              color: activeTab === tab.id ? accentColor : '#64748b',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Connectors Tab ── */}
      {activeTab === 'connectors' && (
        <div className="space-y-4">
          {connectors.map(connector => (
            <div
              key={connector.id}
              className="rounded-2xl p-5 transition-all"
              style={{
                background: connector.enabled ? 'rgba(16,185,129,0.05)' : 'rgba(8,15,31,0.9)',
                border: `1px solid ${connector.enabled ? 'rgba(16,185,129,0.2)' : 'rgba(30,58,95,0.4)'}`,
              }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{connector.icon}</span>
                  <div>
                    <h3 className="text-sm font-bold text-white">{connector.name}</h3>
                    <p className="text-xs text-slate-500">{connector.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleConnector(connector.id)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={{
                    background: connector.enabled ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.15)',
                    border: `1px solid ${connector.enabled ? 'rgba(16,185,129,0.3)' : 'rgba(100,116,139,0.3)'}`,
                    color: connector.enabled ? '#10b981' : '#64748b',
                  }}
                >
                  {connector.enabled ? '✓ Enabled' : '○ Disabled'}
                </button>
              </div>

              {connector.enabled && (
                <div className="grid grid-cols-2 gap-4 pt-4" style={{ borderTop: '1px solid rgba(30,58,95,0.3)' }}>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">API Endpoint</label>
                    <DarkInput
                      value={connector.apiEndpoint}
                      onChange={e => updateConnector(connector.id, { apiEndpoint: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">API Key</label>
                    <DarkInput
                      type="password"
                      value={connector.apiKey}
                      onChange={e => updateConnector(connector.id, { apiKey: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Refresh Interval (s)</label>
                    <DarkInput type="number" value={connector.refreshInterval} min="10" max="3600"
                      onChange={e => updateConnector(connector.id, { refreshInterval: parseInt(e.target.value) })} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Data Retention (days)</label>
                    <DarkInput type="number" value={connector.dataRetention} min="1" max="365"
                      onChange={e => updateConnector(connector.id, { dataRetention: parseInt(e.target.value) })} />
                  </div>
                  <div className="col-span-2">
                    <div className="grid grid-cols-3 gap-3 rounded-xl p-3" style={{ background: 'rgba(15,31,61,0.5)', border: '1px solid rgba(30,58,95,0.3)' }}>
                      <div>
                        <div className="text-xs text-slate-500">Status</div>
                        <div className="text-xs font-semibold" style={{ color: connector.status === 'online' ? '#10b981' : '#ef4444' }}>
                          {connector.status}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Cost/query</div>
                        <div className="text-xs font-semibold text-slate-300">${connector.cost_per_query?.toFixed(3)}</div>
                      </div>
                      <div>
                        <div className="text-xs text-slate-500">Monthly cost</div>
                        <div className="text-xs font-semibold" style={{ color: accentColor }}>
                          ${(connector.cost_per_query * connector.monthly_queries).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={resetConnectors}
              className="px-5 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'rgba(100,116,139,0.15)', border: '1px solid rgba(100,116,139,0.3)', color: '#94a3b8' }}
            >
              Reset to Defaults
            </button>
            <button
              className="px-5 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ background: `linear-gradient(135deg,#2563eb,#0ea5e9)`, color: 'white', boxShadow: '0 0 20px rgba(37,99,235,0.3)' }}
            >
              Save Configuration
            </button>
          </div>
        </div>
      )}

      {/* ── General Settings Tab ── */}
      {activeTab === 'general' && (
        <div className="rounded-2xl p-6 space-y-6" style={CARD_STYLE}>
          {[
            { key: 'autoRefresh', label: 'Auto-refresh Dashboard', desc: 'Automatically refresh data at set intervals' },
            { key: 'enableNotifications', label: 'Enable Notifications', desc: 'Get alerts for critical AI findings' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">{item.label}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
              </div>
              <Toggle value={settings[item.key]} onChange={() => updateSettings({ [item.key]: !settings[item.key] })} />
            </div>
          ))}

          <div style={{ borderTop: '1px solid rgba(30,58,95,0.4)', paddingTop: '1.5rem' }}>
            <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">
              Global Refresh Interval (seconds)
            </label>
            <DarkInput type="number" value={settings.globalRefreshInterval} min="10" max="600"
              onChange={e => updateSettings({ globalRefreshInterval: parseInt(e.target.value) })} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wider">Timezone</label>
            <select
              value={settings.timezone}
              onChange={e => updateSettings({ timezone: e.target.value })}
              className="input-dark w-full px-3 py-2 rounded-lg text-sm"
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
        </div>
      )}

      {/* ── Cost Analysis Tab ── */}
      {activeTab === 'costs' && (
        <div className="space-y-5">
          {/* Total cost hero */}
          <div
            className="rounded-2xl p-6"
            style={{ background: 'linear-gradient(135deg,rgba(37,99,235,0.12),rgba(14,165,233,0.06))', border: '1px solid rgba(37,99,235,0.25)' }}
          >
            <h2 className="text-sm font-semibold text-slate-400 mb-2">💰 Monthly Cost Projection</h2>
            <div className="text-5xl font-extrabold mb-1" style={{ color: accentColor, textShadow: `0 0 30px ${accentColor}44` }}>
              ${totalMonthlyCost.toFixed(2)}
            </div>
            <p className="text-slate-500 text-sm">Based on current connector configuration and query volumes</p>
          </div>

          {/* Breakdown */}
          <div className="rounded-2xl p-5" style={CARD_STYLE}>
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Cost Breakdown by Connector</h3>
            <div className="space-y-3">
              {connectors.filter(c => c.enabled).map(connector => {
                const cost = connector.cost_per_query * connector.monthly_queries;
                const pct  = totalMonthlyCost > 0 ? (cost / totalMonthlyCost) * 100 : 0;
                return (
                  <div key={connector.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span>{connector.icon}</span>
                        <span className="text-sm text-slate-300">{connector.name}</span>
                        <span className="text-xs text-slate-600">{connector.monthly_queries?.toLocaleString()} queries</span>
                      </div>
                      <span className="text-sm font-bold" style={{ color: accentColor }}>${cost.toFixed(2)}</span>
                    </div>
                    <div className="h-1.5 rounded-full" style={{ background: 'rgba(30,58,95,0.4)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: `linear-gradient(90deg,${accentColor},${accentColor}88)` }}
                      />
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

