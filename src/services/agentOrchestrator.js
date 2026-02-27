import mcpConnector from './mcpConnector';

/* ── tiny helpers ── */
const fmt$  = (n) => `$${(n / 1_000_000).toFixed(1)}M`;
const fmtK  = (n) => `$${Math.round(n / 1_000)}K`;
const uid   = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random()*1000)}`;

/* ════════════════════════════════════════════════════════════════
   AGENT BASE
═══════════════════════════════════════════════════════════════ */
class Agent {
  constructor(name, type, capabilities) {
    this.name = name; this.type = type; this.capabilities = capabilities;
    this.status = 'idle'; this.lastActivity = null;
  }
}

/* ════════════════════════════════════════════════════════════════
   DATA AGGREGATION AGENT
═══════════════════════════════════════════════════════════════ */
class DataAggregationAgent extends Agent {
  constructor() { super('Data Aggregator', 'aggregator', ['fetch_data','normalize','validate']); }

  async process() {
    this.status = 'processing'; this.lastActivity = new Date().toISOString();
    const [erp, crm, email, hr, market, news] = await Promise.all([
      mcpConnector.getERPData(), mcpConnector.getCRMData(), mcpConnector.getEmailData(),
      mcpConnector.getHRData(), mcpConnector.getMarketData(), mcpConnector.getNewsData(),
    ]);
    this.status = 'idle';
    return { timestamp: new Date().toISOString(), sources: { erp, crm, email, hr, market, news }, agent: this.name };
  }
}

/* ════════════════════════════════════════════════════════════════
   ANALYSIS AGENT  — builds rich, evidence-backed risks
═══════════════════════════════════════════════════════════════ */
class AnalysisAgent extends Agent {
  constructor() { super('Risk Analyzer', 'analyzer', ['analyze_patterns','identify_risks','correlate']); }

  async process(aggregatedData) {
    this.status = 'processing'; this.lastActivity = new Date().toISOString();
    const { sources } = aggregatedData;
    const erp = sources.erp?.data, crm = sources.crm?.data,
          hr  = sources.hr?.data,  mkt = sources.market?.data,
          em  = sources.email?.data, news = sources.news?.data;
    const risks = [];

    /* 1 ── Revenue decline */
    if (erp?.revenue?.change < -3) {
      const delta = Math.abs(erp.revenue.change);
      const gap   = erp.revenue.target - erp.revenue.ytd;
      risks.push({
        id: uid('RISK'), type: 'revenue', severity: delta > 8 ? 'high' : 'medium',
        title: 'Revenue Decline vs Target',
        description: `Monthly revenue dropped ${delta}% (${fmt$(erp.revenue.current)}M vs ${fmt$(erp.revenue.previous)}M prior period). YTD gap to target: ${fmt$(gap)}.`,
        source: 'ERP', confidence: 91, impact: delta > 8 ? 'high' : 'medium',
        evidence: [
          { label: 'Current MRR',       value: `${fmt$(erp.revenue.current)}`, trend: 'down' },
          { label: 'Prior MRR',         value: `${fmt$(erp.revenue.previous)}`, trend: 'neutral' },
          { label: 'MoM Change',        value: `${erp.revenue.change}%`, trend: 'down' },
          { label: 'YTD vs Target',     value: `${fmt$(erp.revenue.ytd)} / $380M`, trend: 'down' },
          { label: 'Gross Margin',      value: `${erp.gross_margin}%`, trend: 'neutral' },
        ],
        affected_systems: ['ERP', 'CRM', 'Finance'],
        owner: 'CFO', timeline: '30 days',
        trend: erp.revenue.monthly_trend || [],
        financial_impact: gap,
        drilldown_data: { monthly_trend: erp.revenue.monthly_trend, categories: erp.opex?.categories },
      });
    }

    /* 2 ── Opex overrun */
    if (erp?.opex?.variance > 1.5) {
      risks.push({
        id: uid('RISK'), type: 'finance', severity: erp.opex.variance > 3 ? 'high' : 'medium',
        title: 'OpEx Budget Overrun',
        description: `Operating expenses ${fmt$(erp.opex.actual)}M vs budget ${fmt$(erp.opex.budget)}M — ${fmt$(erp.opex.variance)}M (${((erp.opex.variance/erp.opex.budget)*100).toFixed(1)}%) over.`,
        source: 'ERP', confidence: 94, impact: 'medium',
        evidence: [
          { label: 'Budget',      value: `${fmt$(erp.opex.budget)}`, trend: 'neutral' },
          { label: 'Actual',      value: `${fmt$(erp.opex.actual)}`, trend: 'up' },
          { label: 'Variance',    value: `+${fmt$(erp.opex.variance)}`, trend: 'down' },
          { label: 'EBITDA',      value: `${erp.ebitda}%`, trend: 'neutral' },
          { label: 'Cash Runway', value: `${erp.cash_runway_months} months`, trend: 'neutral' },
        ],
        affected_systems: ['ERP', 'Finance', 'HR'],
        owner: 'CFO', timeline: '14 days',
        trend: (erp.opex?.categories || []).map(c => c.actual),
        financial_impact: erp.opex.variance * 1_000_000,
        drilldown_data: { categories: erp.opex?.categories, ar_days: erp.ar_days, inventory_turns: erp.inventory_turns },
      });
    }

    /* 3 ── High-value deals stalled */
    const highDeals = (crm?.delayed_deals || []).filter(d => d.risk_level === 'high');
    if (highDeals.length > 0) {
      const totalVal = highDeals.reduce((s, d) => s + d.value, 0);
      risks.push({
        id: uid('RISK'), type: 'sales', severity: 'high',
        title: `${highDeals.length} High-Value Deals Stalled`,
        description: `${highDeals.length} enterprise deals (${fmt$(totalVal)} combined) delayed >20 days. Largest: ${highDeals[0].company} at ${fmtK(highDeals[0].value)} stalled in ${highDeals[0].stage}.`,
        source: 'CRM', confidence: 88, impact: 'high',
        evidence: highDeals.map(d => ({
          label: d.company, value: `${fmtK(d.value)} · ${d.days_delayed}d · ${d.stage}`, trend: 'down',
        })),
        affected_systems: ['CRM', 'Sales Ops', 'Finance'],
        owner: 'CRO', timeline: '7 days',
        trend: [2, 3, 2, 4, 3, highDeals.length],
        financial_impact: totalVal,
        drilldown_data: { deals: highDeals, win_rate: crm.win_rate, pipeline_value: crm.pipeline_value },
      });
    }

    /* 4 ── Customer churn risk */
    const churnAccounts = crm?.churn_risk_accounts || [];
    if (churnAccounts.length > 0) {
      const churnARR = churnAccounts.reduce((s, a) => s + a.arr, 0);
      risks.push({
        id: uid('RISK'), type: 'retention', severity: churnAccounts.some(a => a.health_score < 40) ? 'high' : 'medium',
        title: 'Customer Churn Risk Elevated',
        description: `${churnAccounts.length} key accounts (${fmt$(churnARR)} ARR at risk) showing health scores below 55. Top risk: ${churnAccounts[0].account} (score ${churnAccounts[0].health_score}).`,
        source: 'CRM', confidence: 83, impact: 'high',
        evidence: churnAccounts.map(a => ({
          label: a.account, value: `ARR ${fmtK(a.arr)} · Health ${a.health_score}/100`, trend: 'down',
        })),
        affected_systems: ['CRM', 'Customer Success', 'Support'],
        owner: 'CCO', timeline: '21 days',
        trend: churnAccounts.map(a => a.health_score),
        financial_impact: churnARR,
        drilldown_data: { accounts: churnAccounts, nps: crm.nps, csat: crm.csat },
      });
    }

    /* 5 ── Talent / attrition risk */
    const flightRisks = (hr?.attrition_risk_high || []).filter(r => r.flight_risk >= 70);
    if (flightRisks.length > 0 || (hr?.attrition_rate || 0) > 1.5) {
      risks.push({
        id: uid('RISK'), type: 'talent', severity: hr.attrition_rate > 2 ? 'high' : 'medium',
        title: 'Critical Talent Attrition Risk',
        description: `Annualised attrition at ${hr.attrition_rate}%. ${flightRisks.length} critical roles show >70% flight-risk score. ${hr.critical_roles_open} critical positions unfilled (avg ${hr.time_to_fill_days}d TTF).`,
        source: 'HR', confidence: 79, impact: 'high',
        evidence: [
          { label: 'Attrition Rate',     value: `${hr.attrition_rate}% annualised`, trend: 'down' },
          { label: 'Critical Roles Open',value: `${hr.critical_roles_open}`,        trend: 'down' },
          { label: 'Time to Fill',       value: `${hr.time_to_fill_days} days avg`, trend: 'neutral' },
          { label: 'Engagement Score',   value: `${hr.engagement_score}/100`,       trend: 'neutral' },
          { label: 'eNPS',               value: `${hr.eNPS}`,                       trend: hr.eNPS < 0 ? 'down' : 'neutral' },
          ...flightRisks.map(r => ({ label: r.role, value: `Flight risk ${r.flight_risk}%`, trend: 'down' })),
        ],
        affected_systems: ['HR', 'Payroll', 'Talent Platform'],
        owner: 'CHRO', timeline: '45 days',
        trend: (hr.attrition_risk_high || []).map(r => r.flight_risk),
        financial_impact: flightRisks.length * 280_000,   // avg replacement cost estimate
        drilldown_data: { attrition_risk_high: hr.attrition_risk_high, open_roles: hr.open_roles, eNPS: hr.eNPS },
      });
    }

    /* 6 ── Competitive threat */
    const highImpactComp = (mkt?.competitor_activity || []).filter(c => c.impact === 'high');
    if (highImpactComp.length > 0) {
      risks.push({
        id: uid('RISK'), type: 'competition', severity: 'high',
        title: 'High-Impact Competitive Moves',
        description: `${highImpactComp.length} major competitive events in last 14 days. ${highImpactComp[0].name}: ${highImpactComp[0].event}. Market share could erode by 2–4% within 2 quarters.`,
        source: 'Market Intelligence', confidence: 74, impact: 'high',
        evidence: (mkt.competitor_activity || []).map(c => ({
          label: c.name, value: `${c.event} · ${c.date} · ${c.impact} impact`, trend: c.impact === 'high' ? 'down' : 'neutral',
        })),
        affected_systems: ['Market Intelligence', 'Product', 'Sales'],
        owner: 'CEO / CPO', timeline: '30 days',
        trend: [2, 2, 3, 3, 2, highImpactComp.length],
        financial_impact: 0,
        drilldown_data: { competitor_activity: mkt.competitor_activity, market_share_pct: mkt.market_share_pct, tam_growth_pct: mkt.tam_growth_pct },
      });
    }

    /* 7 ── Regulatory / compliance */
    const urgentReg = (mkt?.regulatory_signals || []).filter(r => r.urgency === 'high');
    if (urgentReg.length > 0) {
      risks.push({
        id: uid('RISK'), type: 'compliance', severity: 'high',
        title: 'Regulatory Deadline — Action Required',
        description: `${urgentReg[0].region} ${urgentReg[0].topic} in ${urgentReg[0].days_remaining} days. Non-compliance exposure: potential fines + reputational damage.`,
        source: 'Market Intelligence', confidence: 96, impact: 'high',
        evidence: (mkt.regulatory_signals || []).map(r => ({
          label: `${r.region}: ${r.topic}`, value: `${r.days_remaining} days remaining`, trend: r.urgency === 'high' ? 'down' : 'neutral',
        })),
        affected_systems: ['Legal', 'Engineering', 'Compliance'],
        owner: 'CLO', timeline: `${urgentReg[0].days_remaining} days`,
        trend: [90, 75, 60, 55, 50, urgentReg[0].days_remaining],
        financial_impact: 5_000_000,  // estimated fine exposure
        drilldown_data: { regulatory_signals: mkt.regulatory_signals },
      });
    }

    /* 8 ── Escalating email backlog */
    if (em?.escalations_open > 4 || em?.action_required > 10) {
      risks.push({
        id: uid('RISK'), type: 'operations', severity: em.escalations_open > 6 ? 'high' : 'medium',
        title: 'Executive Decision Queue Backlog',
        description: `${em.action_required} items require executive action. ${em.escalations_open} active escalations. Avg response time ${em.avg_response_hours}h. Urgent items: Apex Global deal decision + Regulatory filing.`,
        source: 'Email', confidence: 85, impact: 'medium',
        evidence: (em.key_threads || []).map(t => ({
          label: t.from, value: `"${t.subject}" — ${t.age_hours}h old`, trend: t.priority === 'urgent' ? 'down' : 'neutral',
        })),
        affected_systems: ['Email', 'Calendar', 'CRM'],
        owner: 'COO', timeline: '48 hours',
        trend: [3, 4, 3, 5, em.escalations_open, em.action_required],
        financial_impact: 0,
        drilldown_data: { key_threads: em.key_threads, escalations_open: em.escalations_open },
      });
    }

    this.status = 'idle';
    return { timestamp: new Date().toISOString(), risks, agent: this.name };
  }
}

/* ════════════════════════════════════════════════════════════════
   DECISION AGENT  — generates executive-grade recommendations
═══════════════════════════════════════════════════════════════ */
class DecisionAgent extends Agent {
  constructor() { super('Decision Recommender', 'recommender', ['generate_recommendations','prioritize','simulate_outcomes']); }

  async process(analysisData) {
    this.status = 'processing'; this.lastActivity = new Date().toISOString();
    const { risks } = analysisData;
    const recommendations = [];

    risks.forEach(risk => {
      switch (risk.type) {

        case 'revenue':
          recommendations.push({
            id: uid('REC'), priority: 'urgent', type: 'revenue',
            title: 'Activate Revenue Recovery War Room',
            summary: 'Convene cross-functional task force within 48h to reverse revenue decline through pricing, pipeline acceleration, and churn prevention.',
            actions: [
              { step: 1, action: 'Convene CFO/CRO/CEO war room — 48h deadline',        owner: 'CEO',     days: 2  },
              { step: 2, action: 'Audit top-20 accounts for expansion signals',         owner: 'CRO',     days: 7  },
              { step: 3, action: 'Review and stress-test pricing model vs competitors', owner: 'CFO/CPO', days: 10 },
              { step: 4, action: 'Accelerate Q1 pipeline conversion — 10% incentive',  owner: 'CRO',     days: 14 },
              { step: 5, action: 'Board interim update with recovery trajectory',       owner: 'CEO',     days: 21 },
            ],
            expectedImpact: 'Revenue stabilisation within 30–45 days; $2–4M recovery potential.',
            roi_estimate: 'high', roi_range: '$2M–$4M', payback_days: 45,
            confidence: 78, effort: 'high', relatedRisks: [risk.id],
            kpis: ['MRR recovery', 'Pipeline velocity', 'Win rate'],
            affected_systems: ['ERP', 'CRM', 'Finance'],
          });
          break;

        case 'finance':
          recommendations.push({
            id: uid('REC'), priority: 'urgent', type: 'finance',
            title: 'Initiate OpEx Control & Efficiency Review',
            summary: 'Implement immediate spend controls and 30-day line-item audit to bring OpEx back within budget tolerance.',
            actions: [
              { step: 1, action: 'Freeze discretionary spend above $50K pending CFO sign-off', owner: 'CFO',  days: 3  },
              { step: 2, action: 'Line-item audit of top-5 over-budget categories',             owner: 'CFO',  days: 7  },
              { step: 3, action: 'Renegotiate 3 largest vendor contracts (target: 12% saving)', owner: 'COO',  days: 21 },
              { step: 4, action: 'Headcount plan review — defer 15 non-critical hires',         owner: 'CHRO', days: 14 },
              { step: 5, action: 'Monthly variance dashboard for board reporting',               owner: 'CFO',  days: 30 },
            ],
            expectedImpact: 'Bring OpEx variance below 5% within 30 days.',
            roi_estimate: 'high', roi_range: `$${((risk.financial_impact||0)/1_000_000).toFixed(1)}M saved`, payback_days: 30,
            confidence: 82, effort: 'medium', relatedRisks: [risk.id],
            kpis: ['OpEx variance %', 'Gross margin', 'EBITDA'],
            affected_systems: ['ERP', 'Finance', 'HR'],
          });
          break;

        case 'sales':
          recommendations.push({
            id: uid('REC'), priority: 'high', type: 'sales',
            title: 'Executive-Sponsored Deal Rescue Program',
            summary: 'Direct C-level engagement on stalled enterprise deals combined with accelerated legal review and tailored incentives.',
            actions: [
              { step: 1, action: `CEO/CRO call with Delphi Systems ($3.1M) — this week`, owner: 'CEO/CRO', days: 5  },
              { step: 2, action: 'Legal fast-track review for deals in Legal Review stage',  owner: 'CLO',     days: 7  },
              { step: 3, action: 'Bespoke proof-of-value offer for Apex Global',             owner: 'CRO',     days: 7  },
              { step: 4, action: 'Structured deal desk incentive — 10% Q1 discount window', owner: 'CRO/CFO', days: 10 },
              { step: 5, action: 'Weekly pipeline review cadence with VP Sales',             owner: 'CRO',     days: 14 },
            ],
            expectedImpact: 'Recover 50–65% of stalled deals ($4–5M). Pipeline velocity +15%.',
            roi_estimate: 'high', roi_range: `$4M–$5M`, payback_days: 21,
            confidence: 72, effort: 'medium', relatedRisks: [risk.id],
            kpis: ['Deal close rate', 'Days in stage', 'Pipeline velocity'],
            affected_systems: ['CRM', 'Sales Ops', 'Legal'],
          });
          break;

        case 'retention':
          recommendations.push({
            id: uid('REC'), priority: 'high', type: 'retention',
            title: 'At-Risk Account Executive Intervention',
            summary: 'Immediate CSM-escalated outreach with executive sponsorship, QBRs, and tailored retention offers before renewal windows close.',
            actions: [
              { step: 1, action: 'CEO/CCO executive call with Nexus Pharma ($780K ARR)',    owner: 'CEO/CCO', days: 3  },
              { step: 2, action: 'Schedule emergency QBR for all accounts score <50',       owner: 'CCO',     days: 5  },
              { step: 3, action: 'Retention offer: 3-month extended terms + free onboarding',owner: 'CCO/CFO', days: 7  },
              { step: 4, action: 'Executive sponsor assignment for top-5 churn-risk accounts',owner: 'CEO',    days: 10 },
              { step: 5, action: 'Monthly health-score review embedded in exec cadence',    owner: 'CCO',     days: 21 },
            ],
            expectedImpact: 'Retain >$1.2M ARR. NPS improvement +8–12 points.',
            roi_estimate: 'high', roi_range: `$1.2M+ ARR retained`, payback_days: 30,
            confidence: 75, effort: 'medium', relatedRisks: [risk.id],
            kpis: ['Net Revenue Retention', 'Health scores', 'NPS'],
            affected_systems: ['CRM', 'Customer Success', 'Support'],
          });
          break;

        case 'talent':
          recommendations.push({
            id: uid('REC'), priority: 'high', type: 'talent',
            title: 'Critical Talent Retention & Hiring Sprint',
            summary: 'Targeted retention packages for flight-risk leaders, compressed hiring for critical roles, and engagement programme launch.',
            actions: [
              { step: 1, action: '1:1 stay interviews with all >70% flight-risk employees', owner: 'CHRO/CEO', days: 7  },
              { step: 2, action: 'Retention package review — equity refresh + salary benchmarking', owner: 'CHRO/CFO', days: 14 },
              { step: 3, action: 'Activate executive search for VP Engineering (P0)',          owner: 'CHRO',     days: 10 },
              { step: 4, action: 'Launch "Fast Track" hiring: 30d compressed process for top roles', owner: 'CHRO', days: 21 },
              { step: 5, action: 'All-hands culture & strategy update — CEO-led',             owner: 'CEO',      days: 30 },
            ],
            expectedImpact: 'Reduce flight risk by 40%. Fill 8 critical roles in 30 days.',
            roi_estimate: 'high', roi_range: `$${((risk.financial_impact||0)/1_000_000).toFixed(1)}M replacement cost avoided`, payback_days: 60,
            confidence: 70, effort: 'high', relatedRisks: [risk.id],
            kpis: ['Attrition rate', 'eNPS', 'Time to fill', 'Flight risk scores'],
            affected_systems: ['HR', 'Payroll', 'Talent Platform'],
          });
          break;

        case 'competition':
          recommendations.push({
            id: uid('REC'), priority: 'high', type: 'strategy',
            title: 'Competitive Response & Differentiation Sprint',
            summary: 'Accelerate product differentiation, launch competitive displacement playbook, and consider strategic M&A to defend market position.',
            actions: [
              { step: 1, action: 'Competitive war room — CEO/CPO/CMO — assess CompetitorAlpha $220M impact', owner: 'CEO', days: 5  },
              { step: 2, action: 'Accelerate Q2 product roadmap by 6 weeks — 3 key differentiators',        owner: 'CPO', days: 21 },
              { step: 3, action: 'Launch competitive displacement campaign — 20% switch incentive',          owner: 'CMO', days: 14 },
              { step: 4, action: 'Identify 2–3 acquisition targets for capability acceleration',             owner: 'CEO/CFO', days: 45 },
              { step: 5, action: 'Briefing: analysts and press — thought leadership counter-narrative',      owner: 'CMO', days: 10 },
            ],
            expectedImpact: 'Maintain market share. 15–20 competitive displacements in 60 days.',
            roi_estimate: 'medium', roi_range: 'Market share protection', payback_days: 90,
            confidence: 66, effort: 'high', relatedRisks: [risk.id],
            kpis: ['Market share %', 'Competitive win rate', 'Feature parity score'],
            affected_systems: ['Product', 'Marketing', 'Sales'],
          });
          break;

        case 'compliance':
          recommendations.push({
            id: uid('REC'), priority: 'urgent', type: 'compliance',
            title: 'Regulatory Compliance Taskforce — Immediate',
            summary: 'Establish cross-functional compliance taskforce to meet EU AI Act deadline and avoid regulatory sanctions.',
            actions: [
              { step: 1, action: 'Appoint compliance programme lead — CLO + external counsel engaged', owner: 'CLO/CEO', days: 3  },
              { step: 2, action: 'Gap analysis against EU AI Act requirements — 10-day sprint',        owner: 'CLO/CTO', days: 10 },
              { step: 3, action: 'Engineering remediation plan for high-risk AI modules',              owner: 'CTO',     days: 21 },
              { step: 4, action: 'DPA filing and data-processing documentation update',               owner: 'CLO',     days: 30 },
              { step: 5, action: 'External audit and certification submission',                        owner: 'CLO',     days: 42 },
            ],
            expectedImpact: 'Avoid €5M+ fine exposure. Maintain EU market access.',
            roi_estimate: 'high', roi_range: '$5M fine avoidance', payback_days: 47,
            confidence: 91, effort: 'high', relatedRisks: [risk.id],
            kpis: ['Compliance gap count', 'Days to deadline', 'Audit pass rate'],
            affected_systems: ['Legal', 'Engineering', 'Compliance'],
          });
          break;

        case 'operations':
          recommendations.push({
            id: uid('REC'), priority: 'high', type: 'operations',
            title: 'Executive Decision Velocity Improvement',
            summary: 'Implement structured decision triage, delegate authority levels, and establish an async decision protocol to clear the backlog.',
            actions: [
              { step: 1, action: 'Triage email queue — CEO/EA — resolve 3 urgent items today', owner: 'CEO/EA', days: 1  },
              { step: 2, action: 'Delegate authority matrix update — empower VPs for <$500K decisions', owner: 'CEO/COO', days: 7 },
              { step: 3, action: 'Introduce async decision tool (Loom/Notion) for non-sync items', owner: 'COO', days: 14 },
              { step: 4, action: 'Weekly exec prioritisation meeting — 30 min standing agenda',   owner: 'CEO/COO', days: 7  },
            ],
            expectedImpact: 'Reduce decision latency by 60%. Clear backlog within 48h.',
            roi_estimate: 'medium', roi_range: 'Opportunity cost recovery', payback_days: 14,
            confidence: 80, effort: 'low', relatedRisks: [risk.id],
            kpis: ['Avg response time', 'Open escalations', 'Decision backlog size'],
            affected_systems: ['Email', 'Calendar', 'Collaboration'],
          });
          break;
      }
    });

    this.status = 'idle';
    return { timestamp: new Date().toISOString(), recommendations, agent: this.name };
  }
}

/* ════════════════════════════════════════════════════════════════
   PRIORITY AGENT
═══════════════════════════════════════════════════════════════ */
class PriorityAgent extends Agent {
  constructor() { super('Priority Scorer', 'scorer', ['calculate_impact','assess_urgency','rank_items']); }

  async process(data) {
    this.status = 'processing'; this.lastActivity = new Date().toISOString();
    const { risks, recommendations } = data;
    const sevW = { high: 3, medium: 2, low: 1 }, impW = { high: 3, medium: 2, low: 1 };

    const scoreRisk = r => (sevW[r.severity]||1)*30 + (impW[r.impact]||1)*30 + (r.confidence||50)*0.4;
    const urgency   = r => { const s=scoreRisk(r); return s>200?'immediate':s>150?'urgent':s>100?'high':'monitor'; };

    const scoredRisks = risks
      .map(r => ({ ...r, score: scoreRisk(r), urgency: urgency(r) }))
      .sort((a, b) => b.score - a.score);

    const priW = { urgent: 4, high: 3, medium: 2, low: 1 };
    const scoredRecs = recommendations
      .map(r => ({ ...r, score: (priW[r.priority]||1)*40 + (r.confidence||50)*0.6 }))
      .sort((a, b) => b.score - a.score);

    this.status = 'idle';
    return { timestamp: new Date().toISOString(), prioritizedRisks: scoredRisks, prioritizedRecommendations: scoredRecs, agent: this.name };
  }
}

/* ════════════════════════════════════════════════════════════════
   ORCHESTRATOR
═══════════════════════════════════════════════════════════════ */
class AgentOrchestrator {
  constructor() {
    this.agents = {
      aggregator: new DataAggregationAgent(),
      analyzer:   new AnalysisAgent(),
      recommender:new DecisionAgent(),
      scorer:     new PriorityAgent(),
    };
    this.executionLog = [];
  }

  logExecution(agent, step, data) {
    this.executionLog.push({
      timestamp: new Date().toISOString(), agent: agent.name,
      step, status: agent.status, dataSize: JSON.stringify(data).length,
    });
  }

  async orchestrate() {
    const aggregatedData   = await this.agents.aggregator.process();
    this.logExecution(this.agents.aggregator, 'Data Aggregation', aggregatedData);

    const analysisData     = await this.agents.analyzer.process(aggregatedData);
    this.logExecution(this.agents.analyzer, 'Risk Analysis', analysisData);

    const recommendations  = await this.agents.recommender.process(analysisData);
    this.logExecution(this.agents.recommender, 'Recommendation Generation', recommendations);

    const prioritizedData  = await this.agents.scorer.process({
      risks: analysisData.risks, recommendations: recommendations.recommendations,
    });
    this.logExecution(this.agents.scorer, 'Prioritization', prioritizedData);

    /* blended confidence across risks */
    const allConf = analysisData.risks.map(r => r.confidence);
    const averageConfidence = allConf.length
      ? Math.round(allConf.reduce((a, b) => a + b, 0) / allConf.length) : 87;

    return {
      aggregatedData, analysisData, recommendations, prioritizedData,
      executionLog: this.executionLog, averageConfidence,
      timestamp: new Date().toISOString(),
    };
  }

  getAgentStatus() {
    return Object.entries(this.agents).map(([key, agent]) => ({
      id: key, name: agent.name, type: agent.type,
      status: agent.status, lastActivity: agent.lastActivity, capabilities: agent.capabilities,
    }));
  }
}

export default new AgentOrchestrator();
