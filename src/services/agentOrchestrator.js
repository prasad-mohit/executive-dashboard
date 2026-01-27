import mcpConnector from './mcpConnector';

class Agent {
  constructor(name, type, capabilities) {
    this.name = name;
    this.type = type;
    this.capabilities = capabilities;
    this.status = 'idle';
    this.lastActivity = null;
  }

  async process(data) {
    this.status = 'processing';
    this.lastActivity = new Date().toISOString();
    // Override in subclasses
    return data;
  }
}

class DataAggregationAgent extends Agent {
  constructor() {
    super('Data Aggregator', 'aggregator', ['fetch_data', 'normalize', 'validate']);
  }

  async process() {
    this.status = 'processing';
    this.lastActivity = new Date().toISOString();

    const [erp, crm, email, hr, market, news] = await Promise.all([
      mcpConnector.getERPData(),
      mcpConnector.getCRMData(),
      mcpConnector.getEmailData(),
      mcpConnector.getHRData(),
      mcpConnector.getMarketData(),
      mcpConnector.getNewsData()
    ]);

    this.status = 'idle';

    return {
      timestamp: new Date().toISOString(),
      sources: { erp, crm, email, hr, market, news },
      agent: this.name
    };
  }
}

class AnalysisAgent extends Agent {
  constructor() {
    super('Risk Analyzer', 'analyzer', ['analyze_patterns', 'identify_risks', 'correlate']);
  }

  async process(aggregatedData) {
    this.status = 'processing';
    this.lastActivity = new Date().toISOString();

    const risks = [];
    const { sources } = aggregatedData;

    // Analyze ERP data
    if (sources.erp?.data?.revenue?.change < -5) {
      risks.push({
        id: 'RISK-' + Date.now() + '-1',
        type: 'revenue',
        severity: 'high',
        title: 'Revenue Decline Detected',
        description: `Revenue down ${Math.abs(sources.erp.data.revenue.change)}% vs previous period`,
        source: 'ERP',
        confidence: 85,
        impact: 'high'
      });
    }

    // Analyze CRM data
    if (sources.crm?.data?.delayed_deals?.length > 0) {
      const highRiskDeals = sources.crm.data.delayed_deals.filter(d => d.risk_level === 'high');
      if (highRiskDeals.length > 0) {
        risks.push({
          id: 'RISK-' + Date.now() + '-2',
          type: 'sales',
          severity: 'high',
          title: 'High-Value Deals at Risk',
          description: `${highRiskDeals.length} deals delayed >20 days, totaling $${(highRiskDeals.reduce((sum, d) => sum + d.value, 0) / 1000000).toFixed(1)}M`,
          source: 'CRM',
          confidence: 78,
          impact: 'high'
        });
      }
    }

    // Analyze market sentiment
    if (sources.market?.data?.market_sentiment?.trend === 'negative') {
      risks.push({
        id: 'RISK-' + Date.now() + '-3',
        type: 'market',
        severity: 'medium',
        title: 'Negative Market Sentiment',
        description: 'Industry sentiment declining due to economic concerns',
        source: 'Market Intelligence',
        confidence: 72,
        impact: 'medium'
      });
    }

    // Analyze competitor activity
    if (sources.market?.data?.competitor_activity?.some(c => c.impact === 'high')) {
      risks.push({
        id: 'RISK-' + Date.now() + '-4',
        type: 'competition',
        severity: 'medium',
        title: 'Increased Competitive Pressure',
        description: 'Major competitor secured significant funding',
        source: 'Market Intelligence',
        confidence: 68,
        impact: 'medium'
      });
    }

    this.status = 'idle';

    return {
      timestamp: new Date().toISOString(),
      risks,
      agent: this.name
    };
  }
}

class DecisionAgent extends Agent {
  constructor() {
    super('Decision Recommender', 'recommender', ['generate_recommendations', 'prioritize', 'simulate_outcomes']);
  }

  async process(analysisData) {
    this.status = 'processing';
    this.lastActivity = new Date().toISOString();

    const { risks } = analysisData;
    const recommendations = [];

    risks.forEach(risk => {
      switch (risk.type) {
        case 'revenue':
          recommendations.push({
            id: 'REC-' + Date.now() + '-1',
            priority: 'urgent',
            title: 'Revenue Recovery Plan',
            actions: [
              'Schedule emergency board meeting',
              'Review and adjust pricing strategy',
              'Accelerate pipeline conversion efforts',
              'Implement cost reduction measures'
            ],
            expectedImpact: 'Could stabilize revenue within 30-60 days',
            confidence: 75,
            relatedRisks: [risk.id]
          });
          break;

        case 'sales':
          recommendations.push({
            id: 'REC-' + Date.now() + '-2',
            priority: 'high',
            title: 'Sales Pipeline Intervention',
            actions: [
              'Executive engagement with at-risk accounts',
              'Offer limited-time incentives',
              'Competitive analysis on lost deals',
              'Sales team training on objection handling'
            ],
            expectedImpact: 'Could recover 40-60% of delayed deals',
            confidence: 68,
            relatedRisks: [risk.id]
          });
          break;

        case 'market':
          recommendations.push({
            id: 'REC-' + Date.now() + '-3',
            priority: 'medium',
            title: 'Market Positioning Strategy',
            actions: [
              'Increase marketing presence',
              'Launch thought leadership campaign',
              'Strengthen customer success programs',
              'Explore strategic partnerships'
            ],
            expectedImpact: 'Improve brand perception over 3-6 months',
            confidence: 62,
            relatedRisks: [risk.id]
          });
          break;

        case 'competition':
          recommendations.push({
            id: 'REC-' + Date.now() + '-4',
            priority: 'medium',
            title: 'Competitive Response Plan',
            actions: [
              'Accelerate product roadmap',
              'Enhance competitive intelligence',
              'Strengthen customer retention',
              'Consider strategic acquisitions'
            ],
            expectedImpact: 'Maintain competitive position',
            confidence: 65,
            relatedRisks: [risk.id]
          });
          break;
      }
    });

    this.status = 'idle';

    return {
      timestamp: new Date().toISOString(),
      recommendations,
      agent: this.name
    };
  }
}

class PriorityAgent extends Agent {
  constructor() {
    super('Priority Scorer', 'scorer', ['calculate_impact', 'assess_urgency', 'rank_items']);
  }

  async process(data) {
    this.status = 'processing';
    this.lastActivity = new Date().toISOString();

    const { risks, recommendations } = data;

    // Score risks
    const scoredRisks = risks.map(risk => ({
      ...risk,
      score: this.calculateRiskScore(risk),
      urgency: this.calculateUrgency(risk)
    })).sort((a, b) => b.score - a.score);

    // Score recommendations
    const scoredRecommendations = recommendations.map(rec => ({
      ...rec,
      score: this.calculateRecommendationScore(rec),
      roi_estimate: this.estimateROI(rec)
    })).sort((a, b) => b.score - a.score);

    this.status = 'idle';

    return {
      timestamp: new Date().toISOString(),
      prioritizedRisks: scoredRisks,
      prioritizedRecommendations: scoredRecommendations,
      agent: this.name
    };
  }

  calculateRiskScore(risk) {
    const severityWeight = { high: 3, medium: 2, low: 1 };
    const impactWeight = { high: 3, medium: 2, low: 1 };
    
    return (
      (severityWeight[risk.severity] || 1) * 30 +
      (impactWeight[risk.impact] || 1) * 30 +
      (risk.confidence || 50) * 0.4
    );
  }

  calculateUrgency(risk) {
    const score = this.calculateRiskScore(risk);
    if (score > 200) return 'immediate';
    if (score > 150) return 'urgent';
    if (score > 100) return 'high';
    return 'medium';
  }

  calculateRecommendationScore(rec) {
    const priorityWeight = { urgent: 3, high: 2, medium: 1, low: 0.5 };
    return (
      (priorityWeight[rec.priority] || 1) * 40 +
      (rec.confidence || 50) * 0.6
    );
  }

  estimateROI(rec) {
    const impact = rec.expectedImpact || '';
    if (impact.includes('30-60 days')) return 'high';
    if (impact.includes('3-6 months')) return 'medium';
    return 'long-term';
  }
}

class AgentOrchestrator {
  constructor() {
    this.agents = {
      aggregator: new DataAggregationAgent(),
      analyzer: new AnalysisAgent(),
      recommender: new DecisionAgent(),
      scorer: new PriorityAgent()
    };
    this.executionLog = [];
  }

  logExecution(agent, step, data) {
    this.executionLog.push({
      timestamp: new Date().toISOString(),
      agent: agent.name,
      step,
      status: agent.status,
      dataSize: JSON.stringify(data).length
    });
  }

  async orchestrate() {
    console.log('🤖 Starting agent orchestration...');
    
    // Step 1: Data Aggregation
    console.log('📊 Agent 1: Aggregating data from all sources...');
    const aggregatedData = await this.agents.aggregator.process();
    this.logExecution(this.agents.aggregator, 'Data Aggregation', aggregatedData);

    // Step 2: Analysis
    console.log('🔍 Agent 2: Analyzing risks and patterns...');
    const analysisData = await this.agents.analyzer.process(aggregatedData);
    this.logExecution(this.agents.analyzer, 'Risk Analysis', analysisData);

    // Step 3: Recommendations
    console.log('💡 Agent 3: Generating recommendations...');
    const recommendations = await this.agents.recommender.process(analysisData);
    this.logExecution(this.agents.recommender, 'Recommendation Generation', recommendations);

    // Step 4: Prioritization
    console.log('🎯 Agent 4: Prioritizing actions...');
    const prioritizedData = await this.agents.scorer.process({
      risks: analysisData.risks,
      recommendations: recommendations.recommendations
    });
    this.logExecution(this.agents.scorer, 'Prioritization', prioritizedData);

    console.log('✅ Agent orchestration complete!');

    return {
      aggregatedData,
      analysisData,
      recommendations,
      prioritizedData,
      executionLog: this.executionLog,
      timestamp: new Date().toISOString()
    };
  }

  getAgentStatus() {
    return Object.entries(this.agents).map(([key, agent]) => ({
      id: key,
      name: agent.name,
      type: agent.type,
      status: agent.status,
      lastActivity: agent.lastActivity,
      capabilities: agent.capabilities
    }));
  }
}

export default new AgentOrchestrator();
