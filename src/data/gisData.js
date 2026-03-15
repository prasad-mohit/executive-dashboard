// ─────────────────────────────────────────────────────────────────
// Gaksh Industrial Systems (GIS) — Synthetic Demo Dataset
// Tenant: TENANT-GIS  |  Dataset anchor date: 2026-03-14
// Prototype scope: Home → Insights Hub → Decision Hub → Execution Hub
// ─────────────────────────────────────────────────────────────────

export const TENANT_ID = 'TENANT-GIS';
export const ANCHOR_DATE = '2026-03-14';

// ─── Company Identity ────────────────────────────────────────────
export const company = {
  name: 'Gaksh Industrial Systems',
  shortName: 'GIS',
  ticker: 'GIS',
  fiscalYearEnd: 'December',
  ceo: 'Marcus Gaksh',
  industry: 'Automotive Components Manufacturing',
  logoInitials: 'GIS',
};

// ─── Sites / Plants ──────────────────────────────────────────────
export const sites = [
  { id: 'SITE-US-DET', name: 'Detroit Plant',    city: 'Detroit',  country: 'US',    countryCode: 'us', role: 'Manufacturing, R&D' },
  { id: 'SITE-IN-PUN', name: 'Pune Plant',        city: 'Pune',     country: 'India', countryCode: 'in', role: 'Manufacturing, Shared Services' },
  { id: 'SITE-UK-MCH', name: 'Michigan (UK)',     city: 'Michigan', country: 'UK',    countryCode: 'uk', role: 'Sales, Distribution' },
];

// ─── Product Lines ───────────────────────────────────────────────
export const productLines = [
  { id: 'PL-AXLE',  name: 'Car Axle',        code: 'AXLE'  },
  { id: 'PL-BRAKE', name: 'Braking Systems', code: 'BRAKE' },
  { id: 'PL-STEER', name: 'Steering',        code: 'STEER' },
];

// ─── Customer Segments ───────────────────────────────────────────
export const segments = [
  { id: 'SEG-OEM', name: 'OEM'    },
  { id: 'SEG-T1',  name: 'Tier-1' },
];

// ─── Customers ───────────────────────────────────────────────────
export const customers = [
  { id: 'CUST-FORD',  name: 'Ford Motors', country: 'US',    segment: 'OEM'    },
  { id: 'CUST-BAJAJ', name: 'Bajaj Auto',  country: 'India', segment: 'OEM'    },
  { id: 'CUST-JAG',   name: 'Jaguar',      country: 'UK',    segment: 'OEM'    },
];

// ─── KPIs (Last 30 days rolling) ────────────────────────────────
export const kpis = {
  orderIntake: {
    id: 'KPI-001',
    label: 'Order Intake',
    shortLabel: 'Order Intake',
    value: 42.6,
    displayValue: '$42.6M',
    unit: '$M',
    trend: +9,
    trendLabel: '+9% vs prior 30D',
    target: 45,
    targetDisplay: '$45M',
    status: 'below_target',
    color: '#3b82f6',
    sparkline: [36.2, 38.5, 37.1, 40.2, 41.8, 39.6, 42.6],
    note: 'Q1 target $135M; on track at 94%',
  },
  bookToBill: {
    id: 'KPI-002',
    label: 'Backlog / Book-to-Bill',
    shortLabel: 'Book-to-Bill',
    value: 1.12,
    displayValue: '1.12×',
    unit: 'x',
    trend: +3,
    trendLabel: '+0.03× vs prior 30D',
    target: 1.2,
    targetDisplay: '1.2×',
    status: 'below_target',
    color: '#06b6d4',
    sparkline: [1.05, 1.08, 1.06, 1.09, 1.11, 1.08, 1.12],
    note: 'Backlog growing; 2 late-stage deals could push to 1.18',
  },
  operatingMargin: {
    id: 'KPI-003',
    label: 'Operating Margin',
    shortLabel: 'Op. Margin',
    value: 12.8,
    displayValue: '12.8%',
    unit: '%',
    trend: -1.2,
    trendLabel: '-1.2pp vs prior 30D',
    target: 14,
    targetDisplay: '14%',
    status: 'below_target',
    color: '#f59e0b',
    sparkline: [14.2, 13.8, 13.5, 13.1, 12.9, 13.0, 12.8],
    note: 'Scrap + expedite cost drag ~80bps',
  },
  freeCashFlow: {
    id: 'KPI-004',
    label: 'Free Cash Flow',
    shortLabel: 'Free Cash Flow',
    value: 8.2,
    displayValue: '$8.2M',
    unit: '$M',
    trend: -15,
    trendLabel: '-15% vs prior 30D',
    target: 12,
    targetDisplay: '$12M',
    status: 'below_target',
    color: '#10b981',
    sparkline: [11.5, 10.8, 9.9, 9.2, 8.8, 8.5, 8.2],
    note: 'Inventory build (-$12M WC) pressuring cash',
  },
  otif: {
    id: 'KPI-005',
    label: 'OTIF (On-Time In-Full)',
    shortLabel: 'OTIF',
    value: 93,
    displayValue: '93%',
    unit: '%',
    trend: -3,
    trendLabel: '-3pp vs prior 30D',
    target: 96,
    targetDisplay: '96%',
    status: 'below_target',
    color: '#ef4444',
    sparkline: [96, 95, 95, 94, 93, 94, 93],
    note: 'Supplier X delay impacting 3 programs',
  },
  ltifr: {
    id: 'KPI-006',
    label: 'Safety (LTIFR)',
    shortLabel: 'Safety LTIFR',
    value: 0.8,
    displayValue: '0.8',
    unit: '',
    trend: 0,
    trendLabel: 'Stable vs prior 30D',
    target: 0.5,
    targetDisplay: '0.5',
    status: 'below_target',
    color: '#8b5cf6',
    sparkline: [0.5, 0.6, 0.7, 0.8, 0.7, 0.8, 0.8],
    note: 'Target 0.5; Detroit site review due Apr 1',
  },
};

export const kpiArray = Object.values(kpis);

// ─── External Market Indicators (Live Ticker) ────────────────────
export const externalIndicators = [
  { id: 'EI-001', label: 'Copper (HG=F)',    value: '$5.851/lb',    change: '+1.2%',  direction: 'up',   source: 'CME' },
  { id: 'EI-002', label: 'US CPI YoY',       value: '2.4%',         change: '+0.1pp', direction: 'up',   source: 'BLS' },
  { id: 'EI-003', label: 'Crude Oil (WTI)',   value: '$96.40/bbl',   change: '+0.8%',  direction: 'up',   source: 'EIA' },
  { id: 'EI-004', label: 'Steel (HRC 30D)',   value: '+6%',          change: '30-day', direction: 'up',   source: 'SteelBenchmarker' },
  { id: 'EI-005', label: 'USD/INR',           value: '83.42',        change: '-0.2%',  direction: 'down', source: 'Bloomberg' },
  { id: 'EI-006', label: 'GBP/USD',           value: '1.268',        change: '+0.3%',  direction: 'up',   source: 'Bloomberg' },
  { id: 'EI-007', label: 'US 10Y Yield',      value: '4.52%',        change: '+4bps',  direction: 'up',   source: 'US Treasury' },
  { id: 'EI-008', label: 'Aluminium (LME)',   value: '$2,310/t',     change: '-0.5%',  direction: 'down', source: 'LME' },
];

// ─── Signals (Last 90 days) ──────────────────────────────────────
export const signals = [
  {
    id: 'SIG-001',
    category: 'Market & Business',
    type: 'external',
    date: '2026-03-10',
    title: 'Ford Motors new EV model ramp announced for Q2',
    summary: 'Ford Motors announced accelerated Q2 ramp for Atlas EV platform, requiring 40% increase in axle supply from GIS Detroit. Signature window opens mid-March.',
    source: 'Ford Motors Press Release',
    source_ref: 'FORD-PRESS-2026-0310',
    confidence: 85,
    tags: ['demand', 'OEM', 'Ford', 'EV', 'Detroit'],
    related_decision_ids: ['DEC-001', 'DEC-002'],
    needs_verification: false,
    extraction_method: 'NLP / press feed',
    icon: '📈',
    severity: 'medium',
  },
  {
    id: 'SIG-002',
    category: 'Risk & Reputation',
    type: 'internal',
    date: '2026-03-12',
    title: 'Supplier X on-time delivery: 97% → 91% over 4 weeks',
    summary: 'Primary sensor supplier OTIF declined from 97% to 91% over last 4 weeks. Risk of Axle-B production stoppage within 3 weeks if trend continues.',
    source: 'ERP Procurement Module',
    source_ref: 'ERP-PROC-2026-0312',
    confidence: 90,
    tags: ['supply_chain', 'sensors', 'risk', 'Detroit', 'Supplier-X'],
    related_decision_ids: ['DEC-002'],
    needs_verification: false,
    extraction_method: 'ERP extract',
    icon: '⚠️',
    severity: 'high',
  },
  {
    id: 'SIG-003',
    category: 'Risk & Reputation',
    type: 'internal',
    date: '2026-03-13',
    title: 'Scrap rate Axle-B rising: 2.1% → 3.4%',
    summary: 'Axle-B scrap rate up 62% in 30 days. Root cause: casting defects from Pune batch P2203. Ford quality audit in 18 days. Est. penalty exposure $0.8M–$1.6M.',
    source: 'Quality MES System',
    source_ref: 'MES-QTY-2026-0313',
    confidence: 95,
    tags: ['quality', 'Axle-B', 'scrap', 'Detroit', 'Ford', 'penalty'],
    related_decision_ids: ['DEC-003'],
    needs_verification: false,
    extraction_method: 'MES extract',
    icon: '🔴',
    severity: 'high',
  },
  {
    id: 'SIG-004',
    category: 'Market & Business',
    type: 'external',
    date: '2026-03-08',
    title: 'Steel +6% in 30 days; competitor discounting in OEM bids',
    summary: 'HRC steel benchmark +6% in 30 days. Competitor Alpha Automotive discounting 8–12% in US OEM contract re-bids. Margin pressure accelerating.',
    source: 'Market Intelligence / Bloomberg',
    source_ref: 'MKTSIG-2026-0308',
    confidence: 78,
    tags: ['pricing', 'steel', 'competition', 'OEM', 'margin'],
    related_decision_ids: ['DEC-001'],
    needs_verification: false,
    extraction_method: 'market feed',
    icon: '📊',
    severity: 'medium',
  },
  {
    id: 'SIG-005',
    category: 'Risk & Reputation',
    type: 'internal',
    date: '2026-03-09',
    title: 'Detroit plant utilization at 92% — capacity ceiling approaching',
    summary: 'Detroit plant at 92% utilization. Adding Ford Q2 volume without second shift creates bottleneck within 6 weeks. Capital decision needed.',
    source: 'ERP Production Module',
    source_ref: 'ERP-PROD-2026-0309',
    confidence: 88,
    tags: ['capacity', 'Detroit', 'utilization', 'Ford', 'constraint'],
    related_decision_ids: ['DEC-001', 'DEC-002'],
    needs_verification: false,
    extraction_method: 'ERP extract',
    icon: '🏭',
    severity: 'medium',
  },
  {
    id: 'SIG-006',
    category: 'Benchmarking & Perception',
    type: 'external',
    date: '2026-03-11',
    title: 'Bajaj Auto signals interest in Tier-1 braking systems sourcing',
    summary: 'Bajaj procurement signaled openness to expanding Tier-1 braking systems sourcing in India. Est. $3–5M annual contract in play. Needs follow-up.',
    source: 'CRM / Meeting Notes',
    source_ref: 'CRM-MTNG-2026-0311',
    confidence: 65,
    tags: ['Bajaj', 'India', 'braking', 'Tier-1', 'growth', 'pipeline'],
    related_decision_ids: ['DEC-004'],
    needs_verification: true,
    extraction_method: 'CRM extract',
    icon: '💼',
    severity: 'low',
  },
  {
    id: 'SIG-007',
    category: 'Regulatory & Policy',
    type: 'external',
    date: '2026-03-06',
    title: 'US Section 301 tariff review may affect Chinese casting imports',
    summary: 'USTR reviewing Section 301 tariffs on Chinese auto parts. Potential 15–25% tariff increase on casting imports. GIS sources ~30% of castings from China.',
    source: 'USTR Public Filing',
    source_ref: 'USTR-2026-REVIEW-0306',
    confidence: 72,
    tags: ['tariff', 'China', 'castings', 'supply_chain', 'regulatory'],
    related_decision_ids: ['DEC-002'],
    needs_verification: true,
    extraction_method: 'regulatory feed',
    icon: '🏛️',
    severity: 'medium',
  },
];

// ─── Impact Indicators ───────────────────────────────────────────
export const impactIndicators = [
  {
    id: 'II-001',
    label: 'Order Intake (30D)',
    value: '$42.6M',
    change: '+9%',
    direction: 'up',
    note: 'vs prior 30D',
    color: '#3b82f6',
  },
  {
    id: 'II-002',
    label: 'Quote-to-Order Conv.',
    value: '24%',
    target: '28%',
    direction: 'down',
    note: '4pp below target',
    color: '#f59e0b',
  },
  {
    id: 'II-003',
    label: 'OTIF',
    value: '93%',
    target: '96%',
    direction: 'down',
    note: '3pp below target',
    color: '#ef4444',
  },
];

// ─── Downside Risks ──────────────────────────────────────────────
export const downsideRisks = [
  {
    id: 'DR-001',
    label: 'Late-stage deals stuck in legal',
    detail: 'Revenue shifts out of quarter if not resolved within 10 days',
    severity: 'high',
    related_decision: 'DEC-001',
  },
  {
    id: 'DR-002',
    label: 'Inventory build hurting cash flow',
    detail: '−$10M to −$25M short-term working capital impact from buffer stock',
    severity: 'medium',
    related_decision: 'DEC-001',
  },
  {
    id: 'DR-003',
    label: 'Sensor lead-time spike blocks build schedule',
    detail: 'Axle-B line at risk within 3 weeks without dual-sourcing',
    severity: 'high',
    related_decision: 'DEC-002',
  },
];

// ─── What Changed (Home screen bullets) ─────────────────────────
export const whatChanged = [
  {
    id: 'WC-001',
    type: 'external',
    icon: '📈',
    text: 'Steel up ~6% in 30 days; competitor discounting in OEM bids',
    date: '2026-03-08',
    severity: 'medium',
  },
  {
    id: 'WC-002',
    type: 'internal',
    icon: '⚠️',
    text: 'Detroit utilization 92%; Axle-B scrap rate 2.1% → 3.4%',
    date: '2026-03-13',
    severity: 'high',
  },
  {
    id: 'WC-003',
    type: 'synthesis',
    icon: '🧠',
    text: 'Growth available — capacity + quality are now the constraints',
    date: '2026-03-14',
    severity: 'medium',
  },
];

// ─── Top Decision (Home screen spotlight) ───────────────────────
export const topDecisionHome = {
  decision_id: 'DEC-001',
  title: 'Unblock 2 late-stage OEM deals with Ford Motors',
  context: 'Plano | Car Axle',
  why_now: 'Signature window closes in 10–14 days; re-bid/discount risk rising',
  expected_impact: '+$8M–$15M order intake in 30–45 days',
  confidence: 'Medium-High',
  confidence_pct: 80,
  next_action: 'Set owner (CRO + Legal), approve pricing guardrails, schedule exec sponsor call',
};

// ─── Value at Stake (Home screen) ────────────────────────────────
export const valueAtStake = {
  revenue_at_risk: '$8M–$15M',
  margin_at_risk: '30–70 bps',
  otif_penalty: '$0.8M–$1.6M',
  cash_impact: '−$10M to −$25M',
  total_headline: '$22M–$44M',
};

// ─── Decisions (D1–D4) ───────────────────────────────────────────
export const decisions = [
  {
    id: 'DEC-001',
    ref: 'D1',
    title: 'Unblock 2 late-stage OEM deals with Ford Motors',
    shortTitle: 'Unblock Ford OEM Deals',
    context: 'Detroit | Car Axle',
    why_now: 'Signature window closes in 10–14 days; re-bid/discount risk rising. Ford has reactivated a competing bid from Alpha Automotive. 5 legal redlines unresolved since Mar 4.',
    confidence: 'High',
    confidence_pct: 80,
    confidence_reason: 'Late-stage deals = high conversion likelihood; close timing depends on legal/procurement resolution and exec sponsor availability.',
    time_window_days: 10,
    recommended_action: 'COMMIT',
    owner: 'SVP-Sales',
    exec_owner: 'CRO + Legal',
    status: 'Stalled',
    priority: 1,
    committed: false,
    impact_range: { low: 8, likely: 12, high: 15, unit: '$M', label: 'Order intake (next 30–45 days)' },
    kpi_impacts: [
      { kpi: 'Revenue (next 90D)', range: '+$18M to +$32M', direction: 'up' },
      { kpi: 'Order Intake (this Q)', range: '+2 deals → improves book-to-bill', direction: 'up' },
      { kpi: 'Gross Margin', range: '+40 to +90 bps vs. discounting loss', direction: 'up' },
    ],
    signals_evidence: ['SIG-001', 'SIG-004', 'SIG-005'],
    evidence_details: [
      { source: 'CRM', date: 'Mar 4', note: 'Deal stage stuck in "Legal Review" since Mar 4' },
      { source: 'Legal', date: 'Mar 9', note: '5 redlines open on indemnity & payment terms' },
      { source: 'Sales', date: 'Mar 10', note: 'Competing bid reactivated with pricing undercut' },
    ],
    risks_of_not_acting: [
      'Customer requests end-of-quarter discount or reopens scope',
      'Competing bid re-enters with aggressive pricing',
      'Delivery lead-time concerns trigger pushout to Q2',
    ],
    suggested_actions: [
      { id: 'ACT-001-A1', title: 'Align on fallback legal terms — resolve top 5 redlines in 72 hours', owner: 'Legal + CRO', due: '2026-03-17', priority: 1 },
      { id: 'ACT-001-A2', title: 'Lock pricing floor and approve concession playbook', owner: 'CFO + SVP-Sales', due: '2026-03-17', priority: 2 },
      { id: 'ACT-001-A3', title: 'Confirm close date with exec sponsor; remove procurement blocker', owner: 'CEO + CRO', due: '2026-03-18', priority: 3 },
    ],
    value_at_stake: '$8M–$15M',
    category: 'Commercial',
    categoryColor: '#ef4444',
    boardBriefReady: true,
  },
  {
    id: 'DEC-002',
    ref: 'D2',
    title: 'Dual-source critical component (sensors & castings)',
    shortTitle: 'Dual-Source Sensors',
    context: 'Detroit | Car Axle',
    why_now: 'Supplier X OTIF dropped to 91% over 4 weeks. Single-source risk is now material with Ford Q2 ramp starting. Lead-time spike possible in 3 weeks if unresolved.',
    confidence: 'High',
    confidence_pct: 82,
    confidence_reason: 'ERP data confirms supplier decline trend; alternative suppliers pre-qualified. Risk window is narrow.',
    time_window_days: 21,
    recommended_action: 'COMMIT',
    owner: 'COO',
    exec_owner: 'COO + Head of Procurement',
    status: 'In Progress',
    priority: 2,
    committed: true,
    impact_range: { low: 5, likely: 9, high: 14, unit: '$M', label: 'Revenue protected (supply continuity)' },
    kpi_impacts: [
      { kpi: 'OTIF recovery', range: '93% → 96% within 60 days', direction: 'up' },
      { kpi: 'Supply cost delta', range: '+1.5% to +3% unit cost (transitional)', direction: 'down' },
    ],
    signals_evidence: ['SIG-002', 'SIG-005', 'SIG-007'],
    evidence_details: [
      { source: 'ERP Procurement', date: 'Mar 12', note: 'Supplier X OTIF: 97% → 91% over 4 weeks' },
      { source: 'ERP Production', date: 'Mar 9',  note: 'Detroit utilization 92%; bottleneck in 6 weeks' },
      { source: 'USTR Filing',    date: 'Mar 6',  note: 'Section 301 tariff review on Chinese castings' },
    ],
    risks_of_not_acting: [
      'Axle-B line halts within 3 weeks if Supplier X misses another delivery',
      'Ford Q2 ramp commitment fails — OTIF penalty clauses trigger',
      'OTIF drops below 90% — triggers contractual performance review',
    ],
    suggested_actions: [
      { id: 'ACT-002-A1', title: 'Issue RFQ to 2 qualified alternative sensor suppliers (Bosch, Sensata)', owner: 'Head of Procurement', due: '2026-03-19', priority: 1 },
      { id: 'ACT-002-A2', title: 'Qualify second casting supplier at Pune — expedited 4-week timeline', owner: 'COO + Quality', due: '2026-03-31', priority: 2 },
      { id: 'ACT-002-A3', title: 'Build 3-week safety stock buffer on sensors at Detroit', owner: 'Head of Supply Chain', due: '2026-03-21', priority: 3 },
    ],
    value_at_stake: '$9M–$14M',
    category: 'Supply Chain',
    categoryColor: '#f59e0b',
    boardBriefReady: false,
  },
  {
    id: 'DEC-003',
    ref: 'D3',
    title: 'Quality containment sprint — Axle-B scrap rate',
    shortTitle: 'Axle-B Quality Sprint',
    context: 'Detroit | Car Axle',
    why_now: 'Axle-B scrap rate rose 62% (2.1% → 3.4%). Ford quality audit in 18 days. Root cause confirmed (batch P2203). Corrective action plan submitted to Ford.',
    confidence: 'Medium',
    confidence_pct: 70,
    confidence_reason: 'Root cause confirmed; corrective action in progress. Ford audit outcome still uncertain.',
    time_window_days: 18,
    recommended_action: 'COMMIT',
    owner: 'CPO',
    exec_owner: 'CPO + Plant Manager Detroit',
    status: 'Completed',
    priority: 3,
    committed: true,
    impact_range: { low: 0.8, likely: 1.2, high: 1.6, unit: '$M', label: 'Penalty avoided + margin recovery' },
    kpi_impacts: [
      { kpi: 'Scrap rate', range: '3.4% → <2.5% in 30 days', direction: 'up' },
      { kpi: 'OTIF penalty avoided', range: '$0.8M–$1.6M', direction: 'up' },
    ],
    signals_evidence: ['SIG-003'],
    evidence_details: [
      { source: 'MES Quality',   date: 'Mar 13', note: 'Axle-B scrap rate 2.1% → 3.4% (+62%)' },
      { source: 'Quality Team',  date: 'Mar 14', note: 'Root cause: casting batch P2203 dimensional variance' },
      { source: 'SVP-Sales',     date: 'Mar 13', note: 'Ford quality team notified; audit scheduled' },
    ],
    risks_of_not_acting: [
      'Ford quality audit fails → immediate supply suspension risk',
      'Scrap rate escalates further, margin erosion accelerates',
      'OTIF penalty clauses triggered — est. $0.8M–$1.6M',
    ],
    suggested_actions: [
      { id: 'ACT-003-A1', title: 'TQM sprint: 5-day root cause analysis at Detroit (DONE)', owner: 'CPO + Quality', due: '2026-03-19', priority: 1 },
      { id: 'ACT-003-A2', title: 'Halt Axle-B production from defective batch P2203 (DONE)', owner: 'Plant Manager', due: '2026-03-16', priority: 2 },
      { id: 'ACT-003-A3', title: 'Submit corrective action plan to Ford proactively (DONE)', owner: 'SVP-Sales + CPO', due: '2026-03-17', priority: 3 },
    ],
    value_at_stake: '$1.2M–$1.6M',
    category: 'Quality',
    categoryColor: '#22c55e',
    boardBriefReady: false,
  },
  {
    id: 'DEC-004',
    ref: 'D4',
    title: 'Services + retrofit growth play for installed base',
    shortTitle: 'Services & Retrofit Growth',
    context: 'US + India | All Lines',
    why_now: 'Bajaj signaled Tier-1 interest. 12,000+ axles in US/India approaching 5-year service window. Retrofit revenue potential largely untapped. Competitor starting to probe this segment.',
    confidence: 'Medium',
    confidence_pct: 65,
    confidence_reason: 'Market signal is encouraging but internal capacity to execute requires team build. Confidence will rise with pilot data.',
    time_window_days: 60,
    recommended_action: 'HOLD',
    owner: 'COO',
    exec_owner: 'COO + Head of Services',
    status: 'In Progress',
    priority: 4,
    committed: false,
    impact_range: { low: 4, likely: 8, high: 14, unit: '$M', label: 'Annual recurring revenue (services)' },
    kpi_impacts: [
      { kpi: 'New services revenue', range: '$4M–$14M/year (Year 2)', direction: 'up' },
      { kpi: 'Operating margin uplift', range: '+200 to +350 bps (services mix)', direction: 'up' },
    ],
    signals_evidence: ['SIG-006'],
    evidence_details: [
      { source: 'CRM Meeting Notes', date: 'Mar 11', note: 'Bajaj signaled interest in Tier-1 braking sourcing India' },
      { source: 'Strategy Analysis',  date: 'Mar 8',  note: '12,000+ axles in installed base approaching service window' },
      { source: 'Competitive Intel',  date: 'Mar 5',  note: 'Competitor Alpha probing aftermarket / retrofit space' },
    ],
    risks_of_not_acting: [
      'Competitor captures services relationship with GIS installed base',
      'Missed $8–$14M annual revenue opportunity',
      'Bajaj relationship cools if no response in 30 days',
    ],
    suggested_actions: [
      { id: 'ACT-004-A1', title: 'Size services market: installed base analysis + pricing model', owner: 'COO + CFO', due: '2026-04-15', priority: 1 },
      { id: 'ACT-004-A2', title: 'Pilot retrofit offer with Bajaj Auto India — 50-unit trial', owner: 'Head of Services', due: '2026-04-30', priority: 2 },
    ],
    value_at_stake: '$4M–$14M/yr',
    category: 'Growth',
    categoryColor: '#8b5cf6',
    boardBriefReady: false,
  },
];

// ─── Execution Actions ───────────────────────────────────────────
export const executionActions = [
  {
    id: 'ACT-001-A1', decision_id: 'DEC-001',
    title: 'Resolve top 5 legal redlines on Ford contracts',
    owner: 'Legal + CRO', due_date: '2026-03-17',
    status: 'Blocked', blocker: 'Awaiting Ford legal response — 2 redlines unresolved',
    value_at_stake: '$8M–$15M', priority: 1,
    last_update: '2026-03-13',
  },
  {
    id: 'ACT-001-A2', decision_id: 'DEC-001',
    title: 'Lock pricing floor and approve concession playbook',
    owner: 'CFO + SVP-Sales', due_date: '2026-03-17',
    status: 'In Progress', blocker: null,
    value_at_stake: '$8M–$15M', priority: 2,
    last_update: '2026-03-14',
  },
  {
    id: 'ACT-002-A1', decision_id: 'DEC-002',
    title: 'Issue RFQ to Bosch & Sensata for sensor dual-sourcing',
    owner: 'Head of Procurement', due_date: '2026-03-19',
    status: 'In Progress', blocker: null,
    value_at_stake: '$9M–$14M', priority: 1,
    last_update: '2026-03-13',
  },
  {
    id: 'ACT-002-A2', decision_id: 'DEC-002',
    title: 'Build 3-week safety stock buffer on sensors at Detroit',
    owner: 'Head of Supply Chain', due_date: '2026-03-21',
    status: 'In Progress', blocker: null,
    value_at_stake: '$9M–$14M', priority: 2,
    last_update: '2026-03-12',
  },
  {
    id: 'ACT-003-A1', decision_id: 'DEC-003',
    title: 'TQM sprint complete — root cause confirmed (batch P2203)',
    owner: 'CPO + Quality', due_date: '2026-03-19',
    status: 'Completed', blocker: null,
    value_at_stake: '$1.2M–$1.6M', priority: 1,
    last_update: '2026-03-14',
  },
  {
    id: 'ACT-003-A2', decision_id: 'DEC-003',
    title: 'Ford corrective action plan submitted',
    owner: 'SVP-Sales + CPO', due_date: '2026-03-17',
    status: 'Completed', blocker: null,
    value_at_stake: '$1.2M–$1.6M', priority: 2,
    last_update: '2026-03-13',
  },
  {
    id: 'ACT-004-A1', decision_id: 'DEC-004',
    title: 'Services market sizing — installed base analysis',
    owner: 'COO + CFO', due_date: '2026-04-15',
    status: 'Not Started', blocker: null,
    value_at_stake: '$4M–$14M/yr', priority: 1,
    last_update: '2026-03-11',
  },
];

// ─── Execution Summary ────────────────────────────────────────────
export const executionSummary = {
  totalValueAtStake: '$22M–$44M',
  activeDecisions: 4,
  actionsInProgress: 3,
  actionsAtRisk: 1,
  actionsOverdue: 0,
  actionsCompleted: 2,
};

// ─── Execution Tracking Table ─────────────────────────────────────
export const executionRows = [
  {
    decision_id: 'DEC-001',
    ref: 'D1',
    title: 'Unblock 2 late-stage OEM deals (Ford)',
    owner: 'SVP-Sales',
    status: 'Stalled',
    due: '2026-03-17',
    value_at_stake: '$8M–$15M',
    categoryColor: '#ef4444',
  },
  {
    decision_id: 'DEC-002',
    ref: 'D2',
    title: 'Dual-source critical component (sensors)',
    owner: 'COO',
    status: 'In Progress',
    due: '2026-03-31',
    value_at_stake: '$9M–$14M',
    categoryColor: '#f59e0b',
  },
  {
    decision_id: 'DEC-003',
    ref: 'D3',
    title: 'Quality containment — Axle-B scrap rate',
    owner: 'CPO',
    status: 'Completed',
    due: '2026-03-19',
    value_at_stake: '$1.2M–$1.6M',
    categoryColor: '#22c55e',
  },
  {
    decision_id: 'DEC-004',
    ref: 'D4',
    title: 'Services + retrofit growth play',
    owner: 'COO',
    status: 'In Progress',
    due: '2026-04-15',
    value_at_stake: '$4M–$14M/yr',
    categoryColor: '#8b5cf6',
  },
];

// ─── Filter Options ───────────────────────────────────────────────
export const filterOptions = {
  country:     ['All', 'US', 'UK', 'India'],
  site:        ['All', 'Detroit', 'Pune', 'Michigan'],
  segment:     ['All', 'OEM', 'Tier-1'],
  productLine: ['All', 'Car Axle', 'Braking Systems', 'Steering'],
  timeRange:   ['Last 30', 'Last 60', 'Last 90'],
};

export const defaultFilters = {
  country:     'US',
  site:        'Detroit',
  segment:     'OEM',
  productLine: 'Car Axle',
  timeRange:   'Last 30',
};

// ─── Status color map (light theme) ─────────────────────────────
export const statusColors = {
  'Stalled':     { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' },
  'Blocked':     { background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' },
  'In Progress': { background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe' },
  'Completed':   { background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0' },
  'Not Started': { background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0'  },
  'Hold':        { background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a'  },
  'On Hold':     { background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a'  },
};

// ─── Confidence color map ─────────────────────────────────────────
export const confidenceColors = {
  'High':        '#16a34a',
  'Medium-High': '#2563eb',
  'Medium':      '#d97706',
  'Low':         '#dc2626',
};
