import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Mock historical decisions data
const generateHistoricalDecisions = () => [
  {
    id: 'DEC-2025-Q4-001',
    date: '2025-12-15',
    title: 'Delay European Expansion',
    description: 'Postpone European market entry by 6 months due to economic uncertainty',
    category: 'Strategic',
    urgency: 'high',
    confidence: 89,
    decidedBy: 'Sarah Chen (CEO)',
    status: 'implemented',
    predictedImpact: {
      cost_savings: 2500000,
      revenue_impact: -800000,
      timeline: '6 months',
    },
    actualImpact: {
      cost_savings: 2800000,
      revenue_impact: -650000,
      timeline: '6 months',
      accuracy: 92,
    },
    dataWindow: '2025-10-01 to 2025-12-01',
    sources: ['ERP', 'Market Intelligence', 'CRM'],
    aiRecommendation: true,
  },
  {
    id: 'DEC-2025-Q4-002',
    date: '2025-11-20',
    title: 'Accelerate Hiring Freeze',
    description: 'Implement hiring freeze across non-critical roles',
    category: 'Operational',
    urgency: 'urgent',
    confidence: 81,
    decidedBy: 'Sarah Chen (CEO)',
    status: 'implemented',
    predictedImpact: {
      cost_savings: 1200000,
      headcount_reduction: -15,
      timeline: '3 months',
    },
    actualImpact: {
      cost_savings: 1150000,
      headcount_reduction: -12,
      timeline: '3 months',
      accuracy: 88,
    },
    dataWindow: '2025-09-01 to 2025-11-15',
    sources: ['HR', 'ERP', 'Email'],
    aiRecommendation: true,
  },
  {
    id: 'DEC-2025-Q3-001',
    date: '2025-09-10',
    title: 'Renegotiate Major Client Contract',
    description: 'Proactive outreach to Acme Corp to prevent churn',
    category: 'Sales',
    urgency: 'urgent',
    confidence: 78,
    decidedBy: 'John Smith (VP Sales)',
    status: 'successful',
    predictedImpact: {
      revenue_saved: 850000,
      churn_prevention: 1,
      timeline: '2 months',
    },
    actualImpact: {
      revenue_saved: 950000,
      churn_prevention: 1,
      additional_upsell: 200000,
      timeline: '1.5 months',
      accuracy: 95,
    },
    dataWindow: '2025-07-01 to 2025-09-01',
    sources: ['CRM', 'Email', 'Market Intelligence'],
    aiRecommendation: true,
  },
  {
    id: 'DEC-2025-Q3-002',
    date: '2025-08-25',
    title: 'Launch Competitive Response Campaign',
    description: 'Marketing initiative to counter Competitor A funding announcement',
    category: 'Marketing',
    urgency: 'high',
    confidence: 72,
    decidedBy: 'Sarah Chen (CEO)',
    status: 'in-progress',
    predictedImpact: {
      brand_lift: 15,
      lead_generation: 500,
      timeline: '4 months',
    },
    actualImpact: {
      brand_lift: 18,
      lead_generation: 620,
      timeline: '3 months',
      accuracy: 89,
    },
    dataWindow: '2025-06-01 to 2025-08-20',
    sources: ['Market Intelligence', 'News', 'CRM'],
    aiRecommendation: true,
  },
  {
    id: 'DEC-2025-Q2-001',
    date: '2025-06-30',
    title: 'Optimize Cloud Infrastructure',
    description: 'Migrate to cost-optimized cloud tier',
    category: 'Technology',
    urgency: 'medium',
    confidence: 85,
    decidedBy: 'Maria Garcia (CTO)',
    status: 'successful',
    predictedImpact: {
      cost_savings: 480000,
      performance_impact: 'neutral',
      timeline: '2 months',
    },
    actualImpact: {
      cost_savings: 520000,
      performance_improvement: 12,
      timeline: '2.5 months',
      accuracy: 94,
    },
    dataWindow: '2025-04-01 to 2025-06-25',
    sources: ['ERP'],
    aiRecommendation: false,
  },
];

export default function History() {
  const { hasPermission } = useAuth();
  const [decisions, setDecisions] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  useEffect(() => {
    setDecisions(generateHistoricalDecisions());
  }, []);

  const canViewHistory = hasPermission('view_all') || hasPermission('view_team');

  if (!canViewHistory) {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Limited Access</h2>
          <p className="text-gray-600">Historical decisions are only available to Executives and Managers.</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'successful':
        return 'bg-green-100 text-green-800';
      case 'implemented':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAccuracyColor = (accuracy) => {
    if (accuracy >= 90) return 'text-green-600';
    if (accuracy >= 75) return 'text-blue-600';
    if (accuracy >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredDecisions = decisions.filter((d) => {
    if (filter === 'all') return true;
    if (filter === 'ai') return d.aiRecommendation;
    if (filter === 'manual') return !d.aiRecommendation;
    return d.status === filter;
  });

  const sortedDecisions = [...filteredDecisions].sort((a, b) => {
    if (sortBy === 'date') return new Date(b.date) - new Date(a.date);
    if (sortBy === 'accuracy') return (b.actualImpact?.accuracy || 0) - (a.actualImpact?.accuracy || 0);
    if (sortBy === 'confidence') return b.confidence - a.confidence;
    return 0;
  });

  const totalDecisions = decisions.length;
  const aiDecisions = decisions.filter((d) => d.aiRecommendation).length;
  const avgAccuracy =
    decisions.reduce((sum, d) => sum + (d.actualImpact?.accuracy || 0), 0) / decisions.length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">📊 Decision History & Impact</h1>
        <p className="text-gray-600">Track past decisions and their real-world outcomes</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow p-6">
          <div className="text-sm text-blue-600 font-medium mb-1">Total Decisions</div>
          <div className="text-3xl font-bold text-blue-900">{totalDecisions}</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow p-6">
          <div className="text-sm text-green-600 font-medium mb-1">AI-Powered</div>
          <div className="text-3xl font-bold text-green-900">{aiDecisions}</div>
          <div className="text-xs text-green-600">{((aiDecisions / totalDecisions) * 100).toFixed(0)}% of total</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow p-6">
          <div className="text-sm text-purple-600 font-medium mb-1">Avg. Accuracy</div>
          <div className="text-3xl font-bold text-purple-900">{avgAccuracy.toFixed(1)}%</div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow p-6">
          <div className="text-sm text-orange-600 font-medium mb-1">Total Savings</div>
          <div className="text-3xl font-bold text-orange-900">$6.9M</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex items-center justify-between">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('ai')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'ai'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            🤖 AI-Powered
          </button>
          <button
            onClick={() => setFilter('successful')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'successful'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            ✓ Successful
          </button>
        </div>

        <div className="flex items-center space-x-3">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="date">Date</option>
            <option value="accuracy">Accuracy</option>
            <option value="confidence">Confidence</option>
          </select>
        </div>
      </div>

      {/* Decision Cards */}
      <div className="space-y-4">
        {sortedDecisions.map((decision) => (
          <div
            key={decision.id}
            className="bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow p-6"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-800">{decision.title}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(decision.status)}`}>
                    {decision.status}
                  </span>
                  {decision.aiRecommendation && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                      🤖 AI-Powered
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mb-2">{decision.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>📅 {new Date(decision.date).toLocaleDateString()}</span>
                  <span>👤 {decision.decidedBy}</span>
                  <span>🔖 {decision.category}</span>
                  <span>📊 Data: {decision.dataWindow}</span>
                </div>
              </div>
              <div className="text-right ml-6">
                <div className="text-sm text-gray-600 mb-1">Confidence</div>
                <div className="text-2xl font-bold text-blue-600">{decision.confidence}%</div>
              </div>
            </div>

            {/* Impact Comparison */}
            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-gray-200">
              {/* Predicted Impact */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="mr-2">🎯</span> Predicted Impact
                </h4>
                <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                  {Object.entries(decision.predictedImpact).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span className="font-semibold text-gray-800">{typeof value === 'number' && value > 1000 ? `$${(value / 1000000).toFixed(1)}M` : value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actual Impact */}
              <div>
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                  <span className="mr-2">✅</span> Actual Impact
                </h4>
                <div className="bg-green-50 rounded-lg p-4 space-y-2">
                  {Object.entries(decision.actualImpact)
                    .filter(([key]) => key !== 'accuracy')
                    .map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-gray-600 capitalize">{key.replace(/_/g, ' ')}:</span>
                        <span className="font-semibold text-gray-800">{typeof value === 'number' && value > 1000 ? `$${(value / 1000000).toFixed(1)}M` : value}</span>
                      </div>
                    ))}
                  <div className="pt-2 border-t border-green-200 flex justify-between items-center">
                    <span className="text-gray-700 font-medium">AI Accuracy:</span>
                    <span className={`text-xl font-bold ${getAccuracyColor(decision.actualImpact.accuracy)}`}>
                      {decision.actualImpact.accuracy}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Sources */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                <strong>Data Sources:</strong> {decision.sources.join(', ')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
