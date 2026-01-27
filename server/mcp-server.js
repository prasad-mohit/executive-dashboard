import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Mock data generators
const generateERPData = () => ({
  timestamp: new Date().toISOString(),
  source: 'ERP',
  data: {
    revenue: {
      current: 12500000,
      previous: 13200000,
      change: -5.3,
      trend: 'declining'
    },
    expenses: {
      current: 8900000,
      previous: 8500000,
      change: 4.7,
      trend: 'increasing'
    },
    inventory: {
      turnover: 4.2,
      daysOnHand: 87,
      status: 'warning'
    },
    cashFlow: {
      current: 3600000,
      burn_rate: 450000,
      runway_months: 8
    }
  }
});

const generateCRMData = () => ({
  timestamp: new Date().toISOString(),
  source: 'CRM',
  data: {
    pipeline: {
      total_value: 25000000,
      deals_count: 47,
      avg_deal_size: 531914,
      conversion_rate: 23.5
    },
    delayed_deals: [
      { id: 'D-2341', company: 'Acme Corp', value: 850000, days_delayed: 23, risk_level: 'high' },
      { id: 'D-2356', company: 'TechStart Inc', value: 620000, days_delayed: 18, risk_level: 'medium' },
      { id: 'D-2389', company: 'Global Systems', value: 950000, days_delayed: 21, risk_level: 'high' }
    ],
    top_opportunities: [
      { id: 'D-2401', company: 'Enterprise Co', value: 1200000, probability: 85 },
      { id: 'D-2398', company: 'MegaCorp', value: 980000, probability: 72 }
    ],
    churn_risk: {
      accounts: 5,
      total_arr: 780000,
      top_risk: 'Contoso Ltd'
    }
  }
});

const generateEmailData = () => ({
  timestamp: new Date().toISOString(),
  source: 'Email',
  data: {
    sentiment_analysis: {
      positive: 42,
      neutral: 31,
      negative: 27,
      overall_trend: 'declining'
    },
    urgent_threads: [
      { 
        from: 'CFO', 
        subject: 'Q4 Budget Review - Critical',
        priority: 'high',
        keywords: ['budget', 'overrun', 'immediate action']
      },
      { 
        from: 'Sales Head', 
        subject: 'Major deal at risk',
        priority: 'high',
        keywords: ['Acme Corp', 'competitor', 'pricing']
      }
    ],
    escalations: {
      count: 8,
      departments: ['Sales', 'Support', 'Product'],
      avg_response_time: 14.5
    }
  }
});

const generateHRData = () => ({
  timestamp: new Date().toISOString(),
  source: 'HR',
  data: {
    headcount: {
      total: 287,
      new_hires: 12,
      departures: 8,
      net_change: 4
    },
    attrition: {
      rate: 12.5,
      trend: 'increasing',
      high_risk_employees: 14
    },
    hiring: {
      open_positions: 23,
      avg_time_to_hire: 45,
      offer_acceptance_rate: 78
    },
    employee_sentiment: {
      satisfaction_score: 7.2,
      engagement_score: 6.8,
      trend: 'stable'
    }
  }
});

const generateMarketData = () => ({
  timestamp: new Date().toISOString(),
  source: 'Market Intelligence',
  data: {
    competitor_activity: [
      {
        company: 'Competitor A',
        event: 'Series C Funding',
        amount: 75000000,
        impact: 'high',
        date: '2026-01-20'
      },
      {
        company: 'Competitor B',
        event: 'Product Launch',
        description: 'AI-powered analytics platform',
        impact: 'medium',
        date: '2026-01-15'
      }
    ],
    market_sentiment: {
      score: 6.2,
      trend: 'negative',
      factors: ['Economic uncertainty', 'Increased competition', 'Tech sector slowdown']
    },
    industry_trends: [
      { trend: 'AI adoption', momentum: 'strong', relevance: 'high' },
      { trend: 'Cost optimization', momentum: 'growing', relevance: 'high' },
      { trend: 'Remote work tools', momentum: 'stable', relevance: 'medium' }
    ]
  }
});

const generateNewsData = () => ({
  timestamp: new Date().toISOString(),
  source: 'News & Media',
  data: {
    relevant_articles: [
      {
        title: 'Tech Sector Faces Headwinds in Q1 2026',
        source: 'Financial Times',
        sentiment: 'negative',
        relevance: 'high',
        summary: 'Market analysts predict challenging quarter for tech companies'
      },
      {
        title: 'Enterprise Software Spending to Decline',
        source: 'Wall Street Journal',
        sentiment: 'negative',
        relevance: 'high',
        summary: 'Companies cutting software budgets amid economic concerns'
      }
    ],
    brand_mentions: {
      count: 34,
      sentiment_positive: 18,
      sentiment_negative: 9,
      sentiment_neutral: 7
    }
  }
});

// MCP Endpoints
app.get('/api/mcp/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    connectors: {
      erp: 'online',
      crm: 'online',
      email: 'online',
      hr: 'online',
      market: 'online',
      news: 'online'
    }
  });
});

app.get('/api/mcp/erp', (req, res) => {
  res.json(generateERPData());
});

app.get('/api/mcp/crm', (req, res) => {
  res.json(generateCRMData());
});

app.get('/api/mcp/email', (req, res) => {
  res.json(generateEmailData());
});

app.get('/api/mcp/hr', (req, res) => {
  res.json(generateHRData());
});

app.get('/api/mcp/market', (req, res) => {
  res.json(generateMarketData());
});

app.get('/api/mcp/news', (req, res) => {
  res.json(generateNewsData());
});

// Aggregate endpoint - returns data from all connectors
app.get('/api/mcp/aggregate', (req, res) => {
  res.json({
    timestamp: new Date().toISOString(),
    sources: {
      erp: generateERPData(),
      crm: generateCRMData(),
      email: generateEmailData(),
      hr: generateHRData(),
      market: generateMarketData(),
      news: generateNewsData()
    }
  });
});

// Agent communication endpoint (for agent-to-agent communication simulation)
app.post('/api/mcp/agent/message', (req, res) => {
  const { from, to, message, data } = req.body;
  res.json({
    status: 'received',
    timestamp: new Date().toISOString(),
    from,
    to,
    message,
    response: 'Message processed by agent system'
  });
});

// Authentication endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const users = [
    {
      id: 1,
      email: 'ceo@company.com',
      password: 'ceo123',
      name: 'Sarah Chen',
      role: 'executive',
      permissions: ['view_all', 'approve_decisions', 'access_confidential', 'manage_users']
    },
    {
      id: 2,
      email: 'manager@company.com',
      password: 'manager123',
      name: 'John Smith',
      role: 'manager',
      permissions: ['view_team', 'recommend_decisions', 'access_standard']
    },
    {
      id: 3,
      email: 'analyst@company.com',
      password: 'analyst123',
      name: 'Maria Garcia',
      role: 'analyst',
      permissions: ['view_data', 'create_reports', 'access_basic']
    }
  ];

  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    const { password, ...userWithoutPassword } = user;
    res.json({
      success: true,
      user: userWithoutPassword,
      token: 'mock-jwt-token-' + user.id
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid credentials'
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 MCP Server running on http://localhost:${PORT}`);
  console.log(`📊 Available endpoints:`);
  console.log(`   - GET  /api/mcp/health`);
  console.log(`   - GET  /api/mcp/erp`);
  console.log(`   - GET  /api/mcp/crm`);
  console.log(`   - GET  /api/mcp/email`);
  console.log(`   - GET  /api/mcp/hr`);
  console.log(`   - GET  /api/mcp/market`);
  console.log(`   - GET  /api/mcp/news`);
  console.log(`   - GET  /api/mcp/aggregate`);
  console.log(`   - POST /api/auth/login`);
  console.log(`   - POST /api/mcp/agent/message`);
});
