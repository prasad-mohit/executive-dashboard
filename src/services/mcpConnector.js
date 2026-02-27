/**
 * MCP Connector — local-data mode
 * Generates realistic synthetic data so the dashboard works without any backend.
 * All connectors report "online".
 */

const delay = (ms) => new Promise(r => setTimeout(r, ms));
const rnd  = (min, max) => Math.round(Math.random() * (max - min) + min);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

class MCPConnectorService {

  async getERPData() {
    await delay(60);
    const revCurrent = rnd(42, 48);
    const revPrev    = rnd(45, 52);
    const revChange  = parseFloat(((revCurrent - revPrev) / revPrev * 100).toFixed(1));
    const opexBudget = 22, opexActual = rnd(20, 26);
    return {
      status: 'online', source: 'ERP', timestamp: new Date().toISOString(),
      data: {
        revenue: {
          current: revCurrent, previous: revPrev, change: revChange,
          currency: 'USD_M', ytd: rnd(310, 360), target: 380,
          monthly_trend: [38, 41, 43, 40, revPrev, revCurrent],
        },
        opex: {
          budget: opexBudget, actual: opexActual,
          variance: parseFloat((opexActual - opexBudget).toFixed(1)),
          categories: [
            { name: 'Headcount',      budget: 12, actual: rnd(11, 14) },
            { name: 'Infrastructure', budget: 4,  actual: rnd(3, 5)  },
            { name: 'Marketing',      budget: 3,  actual: rnd(2, 4)  },
            { name: 'R&D',            budget: 3,  actual: rnd(2, 4)  },
          ],
        },
        gross_margin: rnd(58, 68),
        ebitda: rnd(12, 18),
        cash_runway_months: rnd(14, 22),
        inventory_turns: parseFloat((rnd(35, 65) / 10).toFixed(1)),
        ar_days: rnd(32, 55),
      },
    };
  }

  async getCRMData() {
    await delay(55);
    const delayedDeals = [
      { id: 'CRM-D1', company: 'Apex Global',    value: 2_400_000, days_delayed: 28, risk_level: 'high',   owner: 'Sarah K.',  stage: 'Negotiation'  },
      { id: 'CRM-D2', company: 'BridgeTech LLC', value: 1_750_000, days_delayed: 22, risk_level: 'high',   owner: 'Marcus T.', stage: 'Proposal'     },
      { id: 'CRM-D3', company: 'Corvin Retail',  value:   890_000, days_delayed: 19, risk_level: 'medium', owner: 'Priya N.',  stage: 'Discovery'    },
      { id: 'CRM-D4', company: 'Delphi Systems', value: 3_100_000, days_delayed: 35, risk_level: 'high',   owner: 'James L.',  stage: 'Legal Review' },
    ];
    return {
      status: 'online', source: 'CRM', timestamp: new Date().toISOString(),
      data: {
        pipeline_value: 87_400_000,
        closed_won_mtd: rnd(3, 7), closed_lost_mtd: rnd(1, 4),
        win_rate: rnd(32, 48), avg_deal_size: rnd(180_000, 340_000),
        pipeline_velocity: rnd(22, 38),
        delayed_deals: delayedDeals,
        churn_risk_accounts: [
          { account: 'Falcon Media',   arr: 420_000, health_score: 38, csm: 'Dana W.',  signals: ['No login 14d', 'Support tickets ×5'] },
          { account: 'Nexus Pharma',   arr: 780_000, health_score: 42, csm: 'Lena P.',  signals: ['Exec sponsor left', 'Usage down 40%'] },
          { account: 'Summit Apparel', arr: 290_000, health_score: 51, csm: 'Omar A.',  signals: ['Contract renewal 45d out', 'No QBR']  },
        ],
        nps: rnd(28, 52), csat: parseFloat((rnd(70, 88) / 10).toFixed(1)),
      },
    };
  }

  async getEmailData() {
    await delay(40);
    return {
      status: 'online', source: 'Email', timestamp: new Date().toISOString(),
      data: {
        unread_exec: rnd(12, 35), action_required: rnd(5, 14), escalations_open: rnd(2, 7),
        avg_response_hours: parseFloat((rnd(18, 54) / 10).toFixed(1)),
        key_threads: [
          { subject: 'Q1 Board Pack — Review Required',        from: 'CFO Office',    priority: 'high',   age_hours: 4 },
          { subject: 'Enterprise Deal — Apex Global Decision', from: 'Sales VP',      priority: 'urgent', age_hours: 1 },
          { subject: 'Regulatory Filing Deadline — 72h',       from: 'Legal',         priority: 'urgent', age_hours: 2 },
          { subject: 'Engineering Incident — P1 Post-Mortem',  from: 'CTO Office',    priority: 'high',   age_hours: 6 },
          { subject: 'Competitor Announcement — Response Plan',from: 'Strategy Team', priority: 'medium', age_hours: 8 },
        ],
      },
    };
  }

  async getHRData() {
    await delay(50);
    const attritionRate = parseFloat((rnd(12, 22) / 10).toFixed(1));
    return {
      status: 'online', source: 'HR', timestamp: new Date().toISOString(),
      data: {
        headcount: rnd(1200, 1450), open_roles: rnd(45, 90),
        time_to_fill_days: rnd(38, 68), attrition_rate: attritionRate,
        attrition_risk_high: [
          { role: 'VP Engineering',           dept: 'Technology', tenure_yrs: 4.2, flight_risk: 82 },
          { role: 'Principal Data Scientist',  dept: 'Analytics',  tenure_yrs: 2.8, flight_risk: 76 },
          { role: 'Enterprise AE (×3)',        dept: 'Sales',      tenure_yrs: 1.5, flight_risk: 71 },
          { role: 'Staff Product Manager',     dept: 'Product',    tenure_yrs: 3.1, flight_risk: 68 },
        ],
        engagement_score: rnd(58, 78), eNPS: rnd(-5, 35),
        hiring_plan_gap: rnd(8, 24), critical_roles_open: rnd(6, 14),
      },
    };
  }

  async getMarketData() {
    await delay(65);
    return {
      status: 'online', source: 'Market Intelligence', timestamp: new Date().toISOString(),
      data: {
        market_sentiment: {
          score: rnd(35, 65),
          trend: pick(['positive', 'neutral', 'negative']),
          drivers: ['Fed rate uncertainty', 'Supply chain normalization', 'AI sector expansion'],
        },
        tam_growth_pct: parseFloat((rnd(80, 180) / 10).toFixed(1)),
        market_share_pct: parseFloat((rnd(82, 130) / 10).toFixed(1)),
        competitor_activity: [
          { name: 'CompetitorAlpha', event: 'Series D — $220M raised',  impact: 'high',   date: '2026-02-18' },
          { name: 'CompetitorBeta',  event: 'Launched enterprise tier', impact: 'medium', date: '2026-02-24' },
          { name: 'CompetitorGamma', event: 'Acquired DataLogic Inc.',  impact: 'high',   date: '2026-02-20' },
        ],
        regulatory_signals: [
          { region: 'EU', topic: 'AI Act compliance deadline', urgency: 'high',   days_remaining: 47  },
          { region: 'US', topic: 'Data residency rule change',  urgency: 'medium', days_remaining: 120 },
        ],
        industry_benchmarks: { revenue_growth_avg: 8.4, gross_margin_avg: 62.1, nrr_avg: 108, cac_payback_avg_mo: 18 },
      },
    };
  }

  async getNewsData() {
    await delay(35);
    return {
      status: 'online', source: 'News', timestamp: new Date().toISOString(),
      data: {
        headlines: [
          { title: 'EU AI Act enforcement begins — vendors scramble to comply',  sentiment: 'negative', relevance: 'high',   source: 'FT'         },
          { title: 'Enterprise SaaS valuations recover as macro stabilises',     sentiment: 'positive', relevance: 'high',   source: 'WSJ'        },
          { title: 'CompetitorAlpha closes $220M to target mid-market',          sentiment: 'negative', relevance: 'high',   source: 'TechCrunch' },
          { title: 'Workforce automation accelerates CFO re-prioritisation',     sentiment: 'neutral',  relevance: 'medium', source: 'HBR'        },
          { title: 'Supply chain disruptions ease in key manufacturing sectors', sentiment: 'positive', relevance: 'medium', source: 'Bloomberg'  },
        ],
        sentiment_index: rnd(38, 62), executive_mentions: rnd(0, 4),
      },
    };
  }

  async getAggregateData() {
    await delay(20);
    const [erp, crm, email, hr, market, news] = await Promise.all([
      this.getERPData(), this.getCRMData(), this.getEmailData(),
      this.getHRData(), this.getMarketData(), this.getNewsData(),
    ]);
    return { erp, crm, email, hr, market, news };
  }

  async getHealthStatus() {
    await delay(30);
    return {
      status: 'Online', version: '2.4.1',
      uptime_seconds: rnd(200_000, 500_000),
      timestamp: new Date().toISOString(),
      connectors: { erp: 'online', crm: 'online', email: 'online', hr: 'online', market: 'online', news: 'online' },
      latency_ms: { erp: rnd(45,120), crm: rnd(38,95), email: rnd(22,60), hr: rnd(50,110), market: rnd(80,180), news: rnd(30,75) },
    };
  }

  async sendAgentMessage(from, to, message, data) {
    await delay(10);
    return { status: 'delivered', from, to, timestamp: new Date().toISOString() };
  }
}

export default new MCPConnectorService();
