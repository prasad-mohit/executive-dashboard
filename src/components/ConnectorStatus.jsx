export default function ConnectorStatus({ healthData }) {
  const connectors = healthData?.connectors || {};

  const connectorInfo = [
    { id: 'erp',    name: 'ERP System',    icon: '💼', desc: 'Enterprise resource' },
    { id: 'crm',    name: 'CRM',           icon: '👥', desc: 'Customer relations' },
    { id: 'email',  name: 'Email',         icon: '📧', desc: 'Communications' },
    { id: 'hr',     name: 'HR System',     icon: '🏢', desc: 'Human resources' },
    { id: 'market', name: 'Market Intel',  icon: '📊', desc: 'Market intelligence' },
    { id: 'news',   name: 'News Feed',     icon: '📰', desc: 'Live news stream' },
  ];

  const onlineCount  = connectorInfo.filter(c => connectors[c.id] === 'online').length;
  const healthPct    = Math.round((onlineCount / connectorInfo.length) * 100);
  const healthColor  = healthPct >= 80 ? '#10b981' : healthPct >= 50 ? '#f59e0b' : '#ef4444';

  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: 'rgba(8,15,31,0.9)', border: '1px solid rgba(30,58,95,0.4)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-300">🔌 Data Connectors</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold" style={{ color: healthColor }}>
            {onlineCount}/{connectorInfo.length}
          </span>
          <span className="text-xs text-slate-600">online</span>
        </div>
      </div>

      {/* Health bar */}
      <div className="mb-4">
        <div className="h-1.5 rounded-full" style={{ background: 'rgba(30,58,95,0.4)' }}>
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{
              width: `${healthPct}%`,
              background: `linear-gradient(90deg, ${healthColor}, ${healthColor}99)`,
              boxShadow: `0 0 8px ${healthColor}66`,
            }}
          />
        </div>
        <div className="flex justify-between mt-1">
          <span className="text-xs text-slate-600">Network health</span>
          <span className="text-xs font-semibold" style={{ color: healthColor }}>{healthPct}%</span>
        </div>
      </div>

      {/* Connector list */}
      <div className="space-y-2">
        {connectorInfo.map(connector => {
          const isOnline = connectors[connector.id] === 'online';
          return (
            <div
              key={connector.id}
              className="flex items-center gap-3 px-3 py-2 rounded-xl transition-all"
              style={{
                background: isOnline ? 'rgba(16,185,129,0.05)' : 'rgba(239,68,68,0.04)',
                border: `1px solid ${isOnline ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.12)'}`,
              }}
            >
              <span className="text-base">{connector.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-slate-300 truncate">{connector.name}</div>
                <div className="text-xs text-slate-600">{connector.desc}</div>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <div
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: isOnline ? '#10b981' : '#ef4444',
                    boxShadow: `0 0 5px ${isOnline ? '#10b981' : '#ef4444'}`,
                  }}
                />
                <span
                  className="text-xs font-medium"
                  style={{ color: isOnline ? '#10b981' : '#ef4444' }}
                >
                  {isOnline ? 'Live' : 'Off'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
