import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import agentOrchestrator from '../services/agentOrchestrator';
import mcpConnector from '../services/mcpConnector';
import ConnectorStatus from './ConnectorStatus';
import RiskPanel from './RiskPanel';
import RecommendationsPanel from './RecommendationsPanel';
import AgentOrchestrationPanel from './AgentOrchestrationPanel';

export default function Dashboard() {
  const { user } = useAuth();
  const { settings } = useWorkspace();
  const [loading, setLoading] = useState(true);
  const [orchestrationData, setOrchestrationData] = useState(null);
  const [healthData, setHealthData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [dataTimeSlice, setDataTimeSlice] = useState({
    start: null,
    end: null,
    range: 'Last 30 days',
  });

  const loadData = async () => {
    try {
      setRefreshing(true);
      
      // Calculate time slice
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      setDataTimeSlice({
        start: startDate,
        end: endDate,
        range: 'Last 30 days',
      });

      // Get health status
      const health = await mcpConnector.getHealthStatus();
      setHealthData(health);

      // Run agent orchestration
      const result = await agentOrchestrator.orchestrate();
      setOrchestrationData(result);
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setLoading(false);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-refresh based on settings
    if (settings?.autoRefresh) {
      const interval = setInterval(loadData, (settings?.globalRefreshInterval || 30) * 1000);
      return () => clearInterval(interval);
    }
  }, [settings?.autoRefresh, settings?.globalRefreshInterval]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading Executive Dashboard...</p>
          <p className="text-gray-500 text-sm mt-2">Orchestrating AI agents...</p>
        </div>
      </div>
    );
  }

  const risks = orchestrationData?.prioritizedData?.prioritizedRisks || [];
  const recommendations = orchestrationData?.prioritizedData?.prioritizedRecommendations || [];

  return (
    <div className="p-8">
      {/* Page Header with Time Slice */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Executive Dashboard
            </h1>
            <p className="text-gray-600">Real-time insights powered by AI agents</p>
          </div>
          <button
            onClick={loadData}
            disabled={refreshing}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 font-medium flex items-center space-x-2"
          >
            <span>{refreshing ? '🔄 Refreshing...' : '🔄 Refresh Data'}</span>
          </button>
        </div>

        {/* Time Slice Indicator */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">📅</span>
                <div>
                  <div className="text-sm font-semibold text-gray-700">Data Time Slice</div>
                  <div className="text-xs text-gray-600">Analysis period for current insights</div>
                </div>
              </div>
              <div className="h-8 w-px bg-blue-300" />
              <div>
                <div className="text-sm font-medium text-gray-800">
                  {dataTimeSlice.start?.toLocaleDateString()} - {dataTimeSlice.end?.toLocaleDateString()}
                </div>
                <div className="text-xs text-blue-600 font-semibold">{dataTimeSlice.range}</div>
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <div>
                <span className="text-gray-600">Last updated:</span>
                <span className="ml-2 font-semibold text-gray-800">
                  {orchestrationData?.timestamp ? new Date(orchestrationData.timestamp).toLocaleTimeString() : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Next refresh:</span>
                <span className="ml-2 font-semibold text-gray-800">
                  {settings?.globalRefreshInterval || 30}s
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column - Connectors & Quick Stats */}
        <div className="col-span-3 space-y-6">
          <ConnectorStatus healthData={healthData} />
          
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              📊 Quick Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-sm text-gray-600">Active Risks</span>
                <span className="text-xl font-bold text-red-600">{risks.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-gray-600">Recommendations</span>
                <span className="text-xl font-bold text-green-600">{recommendations.length}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-gray-600">AI Agents</span>
                <span className="text-xl font-bold text-blue-600">4</span>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column - Main Content */}
        <div className="col-span-6 space-y-6">
          <RiskPanel risks={risks} dataWindow={dataTimeSlice.range} />
          <RecommendationsPanel recommendations={recommendations} />
        </div>

        {/* Right Column - Agent Orchestration */}
        <div className="col-span-3 space-y-6">
          <AgentOrchestrationPanel orchestrationData={orchestrationData} />
          
          {/* System Health */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              💚 System Health
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">MCP Server</span>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded font-semibold">
                  {healthData?.status || 'Unknown'}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">Uptime</span>
                <span className="text-xs text-gray-700 font-medium">99.9%</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-600">Data Sources</span>
                <span className="text-xs text-gray-700 font-medium">
                  {Object.values(healthData?.connectors || {}).filter(s => s === 'online').length}/6
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
