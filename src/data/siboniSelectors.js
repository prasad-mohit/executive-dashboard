// ─────────────────────────────────────────────────────────────────
// siboniSelectors.js — Full filter-aware data engine
// Every filter combination produces different content:
//   titles, why_now, evidence, risks, actions, signals, KPI values,
//   sparklines, impact labels, risk details — all context-driven
// ─────────────────────────────────────────────────────────────────

import {
  kpis,
  externalIndicators,
  signals as baseSignals,
  decisions as baseDecisions,
  impactIndicators as baseImpact,
  downsideRisks as baseRisks,
  executionActions as baseActions,
  topDecisionHome,
  valueAtStake,
} from './gisData.js';

// ─── Country/site aliases ─────────────────────────────────────────
const aliases = { US: 'USA', USA: 'USA', UK: 'UK', India: 'India', Global: 'Global' };

const siteToCountry = {
  'Plano, Texas': 'USA', Detroit: 'USA', Pune: 'India', Michigan: 'UK',
};

// ─── Score multiplier tables ──────────────────────────────────────
const timeFactors = {
  'Last 30': 1, 'Last 60': 1.06, 'Last 90': 1.11, 'Last 180': 1.2, YTD: 1.28,
};

const scenarioBySite = {
  'Plano, Texas': { growth: 1.16, margin: 1.03, cash: 0.95, otif: 1.02, risk: 0.94 },
  Detroit:        { growth: 1.0,  margin: 1.0,  cash: 1.0,  otif: 1.0,  risk: 1.0  },
  Pune:           { growth: 0.94, margin: 0.97, cash: 0.91, otif: 0.96, risk: 1.12 },
  Michigan:       { growth: 0.97, margin: 1.05, cash: 1.02, otif: 1.01, risk: 0.96 },
  All:            { growth: 1.0,  margin: 1.0,  cash: 1.0,  otif: 1.0,  risk: 1.0  },
};

const segmentFactor = {
  OEM:      { growth: 1.0,  risk: 1.0  },
  'Tier-1': { growth: 0.92, risk: 0.91 },
  'Tier-2': { growth: 0.86, risk: 0.88 },
  All:      { growth: 1.0,  risk: 1.0  },
};

const productFactor = {
  'Car Axle':        { growth: 1.0,  margin: 1.0,  risk: 1.0  },
  'Braking Systems': { growth: 0.93, margin: 1.04, risk: 0.92 },
  Steering:          { growth: 0.89, margin: 1.02, risk: 0.94 },
  'EV Drivetrain':   { growth: 1.18, margin: 0.96, risk: 1.15 },
  All:               { growth: 1.0,  margin: 1.0,  risk: 1.0  },
};

// ─── Site context (drives all content substitution) ───────────────
const siteCtx = {
  'Plano, Texas': {
    customer: 'Ford Motors (SW Region)', altCustomer: 'Tesla Gigafactory TX',
    plant: 'Plano, TX', region: 'North America', currency: 'USD',
    supplierX: 'Delphi Technologies', competitor: 'Alpha Automotive TX',
    regulator: 'NHTSA', theme: 'growth',
    sparkGrowth: [36.0, 37.5, 38.2, 39.1, 40.4, 41.8, 43.6, 44.9, 46.2, 47.8],
    sparkMargin: [13.1, 13.4, 13.6, 13.9, 14.1, 14.0, 13.9, 14.2, 14.4, 14.6],
  },
  Detroit: {
    customer: 'Ford Motors', altCustomer: 'General Motors',
    plant: 'Detroit', region: 'Midwest US', currency: 'USD',
    supplierX: 'Supplier X (sensors)', competitor: 'Alpha Automotive',
    regulator: 'NHTSA', theme: 'capacity_quality',
    sparkGrowth: [40.2, 41.8, 39.6, 42.6, 40.1, 41.5, 42.6, 41.8, 42.3, 42.6],
    sparkMargin: [14.2, 13.8, 13.5, 13.1, 12.9, 13.0, 12.8, 12.7, 12.8, 12.8],
  },
  Pune: {
    customer: 'Bajaj Auto', altCustomer: 'Tata Motors',
    plant: 'Pune', region: 'South Asia', currency: 'INR',
    supplierX: 'Tata Steel Pune', competitor: 'Minda Industries',
    regulator: 'IATF/BIS', theme: 'cost_expansion',
    sparkGrowth: [42.1, 41.6, 40.8, 40.2, 39.8, 39.3, 38.9, 38.5, 38.1, 38.0],
    sparkMargin: [13.8, 13.4, 13.0, 12.7, 12.5, 12.3, 12.1, 12.0, 12.0, 12.4],
  },
  Michigan: {
    customer: 'Jaguar Land Rover', altCustomer: 'Nissan UK',
    plant: 'Michigan (UK)', region: 'Europe', currency: 'GBP',
    supplierX: 'Gestamp UK', competitor: 'Nexteer Automotive',
    regulator: 'UKCA / Euro 7', theme: 'margin_regulatory',
    sparkGrowth: [39.8, 40.1, 40.6, 41.0, 40.5, 41.2, 41.8, 42.0, 41.9, 42.1],
    sparkMargin: [13.0, 13.2, 13.5, 13.8, 13.6, 13.9, 14.1, 14.2, 14.3, 14.4],
  },
  All: {
    customer: 'Global Customers', altCustomer: 'Portfolio',
    plant: 'All Plants', region: 'Global', currency: 'USD',
    supplierX: 'Multiple Suppliers', competitor: 'Global Competitors',
    regulator: 'Multi-jurisdiction', theme: 'portfolio',
    sparkGrowth: [40.2, 41.8, 39.6, 42.6, 40.1, 41.5, 42.6, 41.8, 42.3, 42.6],
    sparkMargin: [13.5, 13.4, 13.2, 13.0, 12.9, 13.0, 12.8, 12.9, 13.0, 13.1],
  },
};

// ─── Segment-based customer overrides ────────────────────────────
const segCtxCustomer = {
  'Tier-1': {
    'Plano, Texas': 'Delphi Technologies', Detroit: 'Bosch North America',
    Pune: 'Motherson Group', Michigan: 'Continental UK', All: 'Tier-1 Partners',
    USA: 'Bosch / Delphi (US)', India: 'Motherson Group', UK: 'Continental UK', Global: 'Global Tier-1',
  },
  'Tier-2': {
    USA: 'US sub-tier suppliers', India: 'India sub-tier', UK: 'EU sub-tier',
    All: 'Sub-tier suppliers', Global: 'Global sub-tier',
  },
};

// ─── Product-line context ─────────────────────────────────────────
const prodCtx = {
  'Car Axle': {
    part: 'axle assembly', assy: 'Axle-B', spec: 'GVW tolerance ±0.3mm',
    scrapType: 'dimensional variance', component: 'sensor/casting', code: 'AXLE',
    sparkFcf: [11.5, 10.8, 9.9, 9.2, 8.8, 8.5, 8.2, 8.0, 8.1, 8.2],
  },
  'Braking Systems': {
    part: 'brake caliper', assy: 'Brake-C', spec: 'ABS pressure ±2 bar',
    scrapType: 'caliper bore tolerance', component: 'brake pads/ABS module', code: 'BRAKE',
    sparkFcf: [8.8, 8.6, 8.4, 8.2, 8.1, 8.0, 7.9, 7.8, 7.8, 7.9],
  },
  Steering: {
    part: 'steering rack', assy: 'Steer-A', spec: 'EPS torque ±1.5 Nm',
    scrapType: 'rack backlash variance', component: 'EPS motor/sensor', code: 'STEER',
    sparkFcf: [9.2, 9.0, 8.8, 8.9, 9.1, 9.0, 9.2, 9.3, 9.4, 9.5],
  },
  'EV Drivetrain': {
    part: 'motor shaft assembly', assy: 'EV-D', spec: 'NVH tolerance ±0.02mm',
    scrapType: 'rotor balance variance', component: 'rare-earth magnet/inverter', code: 'EV',
    sparkFcf: [7.5, 7.8, 8.1, 8.4, 8.8, 9.2, 9.6, 10.1, 10.5, 11.0],
  },
  All: {
    part: 'components', assy: 'mixed assemblies', spec: 'multi-spec tolerance',
    scrapType: 'dimensional variance', component: 'critical components', code: 'ALL',
    sparkFcf: [11.5, 10.8, 9.9, 9.2, 8.8, 8.5, 8.2, 8.0, 8.1, 8.2],
  },
};

// ─── Decision/signal scope maps ───────────────────────────────────
const decisionScope = {
  'DEC-001': { sites: ['Detroit', 'Plano, Texas'], countries: ['USA'], segments: ['OEM'], productLines: ['Car Axle'] },
  'DEC-002': { sites: ['Detroit', 'Pune', 'Plano, Texas'], countries: ['USA', 'India'], segments: ['OEM', 'Tier-1'], productLines: ['Car Axle', 'Braking Systems'] },
  'DEC-003': { sites: ['Detroit', 'Pune'], countries: ['USA', 'India'], segments: ['OEM'], productLines: ['Car Axle', 'Steering'] },
  'DEC-004': { sites: ['Michigan', 'Pune', 'Detroit'], countries: ['UK', 'India', 'USA'], segments: ['OEM', 'Tier-1'], productLines: ['Braking Systems', 'Steering', 'Car Axle'] },
};

const signalScope = {
  'SIG-001': { sites: ['Detroit', 'Plano, Texas'], countries: ['USA'], segments: ['OEM'], productLines: ['Car Axle'] },
  'SIG-002': { sites: ['Detroit', 'Pune'], countries: ['USA', 'India'], segments: ['OEM', 'Tier-1'], productLines: ['Car Axle', 'Braking Systems'] },
  'SIG-003': { sites: ['Detroit', 'Pune'], countries: ['USA', 'India'], segments: ['OEM'], productLines: ['Car Axle'] },
  'SIG-004': { sites: ['Detroit', 'Plano, Texas', 'Michigan'], countries: ['USA', 'UK'], segments: ['OEM', 'Tier-1'], productLines: ['Car Axle', 'Braking Systems', 'Steering'] },
  'SIG-005': { sites: ['Detroit', 'Plano, Texas'], countries: ['USA'], segments: ['OEM'], productLines: ['Car Axle', 'Steering'] },
  'SIG-006': { sites: ['Pune', 'Michigan'], countries: ['India', 'UK'], segments: ['Tier-1', 'OEM'], productLines: ['Braking Systems', 'Steering'] },
  'SIG-007': { sites: ['Pune', 'Detroit'], countries: ['India', 'USA'], segments: ['OEM', 'Tier-1'], productLines: ['Car Axle', 'Braking Systems'] },
};

// ─── Utilities ────────────────────────────────────────────────────
function round(n, d = 1) { return Math.round(n * 10 ** d) / 10 ** d; }
function moneyM(v) { return `$${round(v, 1)}M`; }

function normalizeFilters(f) {
  return {
    country:     aliases[f.country] || f.country || 'USA',
    site:        f.site || 'Detroit',
    segment:     f.segment || 'OEM',
    productLine: f.productLine || 'Car Axle',
    timeRange:   f.timeRange || 'Last 30',
  };
}

function inScope(scope, f) {
  const cOk  = f.country === 'Global' || f.country === 'All' || scope.countries.includes(f.country);
  const sOk  = f.site === 'All' || scope.sites.includes(f.site);
  const sgOk = f.segment === 'All' || scope.segments.includes(f.segment);
  const plOk = f.productLine === 'All' || scope.productLines.includes(f.productLine);
  return cOk && sOk && sgOk && plOk;
}

function scoreFactors(f) {
  const s   = scenarioBySite[f.site] || scenarioBySite.All;
  const t   = timeFactors[f.timeRange] || 1;
  const seg = segmentFactor[f.segment] || segmentFactor.All;
  const p   = productFactor[f.productLine] || productFactor.All;
  return {
    growth: s.growth * seg.growth * p.growth * t,
    margin: s.margin * p.margin,
    cash:   s.cash * t,
    otif:   s.otif,
    risk:   s.risk * (seg.risk || 1) * (p.risk || 1),
    time:   t,
  };
}

function getCtx(f) { return siteCtx[f.site] || siteCtx.All; }

function getCustomer(f) {
  if (f.segment === 'Tier-1') return segCtxCustomer['Tier-1'][f.site] || segCtxCustomer['Tier-1'][f.country] || 'Tier-1 Partners';
  if (f.segment === 'Tier-2') return segCtxCustomer['Tier-2'][f.country] || 'Sub-tier suppliers';
  return getCtx(f).customer;
}

function getPCtx(f) { return prodCtx[f.productLine] || prodCtx.All; }

// ─── Context-aware decision content overlay ───────────────────────
function overlayDecisionContent(base, f, mul) {
  const ctx      = getCtx(f);
  const pCtx     = getPCtx(f);
  const customer = getCustomer(f);
  const vasLow   = round((base.impact_range?.low  || 5) * mul.growth, 1);
  const vasHigh  = round((base.impact_range?.high || 12) * mul.growth, 1);
  const vasStr   = `${moneyM(vasLow)}–${moneyM(vasHigh)}`;

  // ── D1 · Commercial / Revenue ────────────────────────────────
  if (base.id === 'DEC-001' || base.id.startsWith('DEC-001')) {
    if (f.country === 'India' || f.site === 'Pune') {
      return {
        ...base,
        title: `Close ${pCtx.part} supply contract with ${customer} — Q2 tender window`,
        shortTitle: `${customer} Q2 Contract`,
        context: `${ctx.plant} | ${f.productLine}`,
        why_now: `${customer} Q2 tender evaluation closes in 10–14 days. ${ctx.competitor} is quoting 6% below GIS on ${pCtx.part}. ${pCtx.assy} capacity confirmed available at ${ctx.plant} without capex.`,
        confidence: 'Medium-High',
        confidence_pct: Math.max(52, Math.min(88, base.confidence_pct - Math.round((mul.risk - 1) * 8))),
        evidence_details: [
          { source: 'CRM India', date: 'Mar 10', note: `${customer} procurement confirmed Q2 eval window; final RFQ response due Mar 24` },
          { source: 'Competitive Intel', date: 'Mar 8', note: `${ctx.competitor} quoting 6% below GIS last price on ${pCtx.part} program` },
          { source: `Operations ${ctx.plant}`, date: 'Mar 12', note: `${pCtx.assy} production headroom confirmed: +25% at ${ctx.plant} without capex` },
        ],
        risks_of_not_acting: [
          `${customer} awards to ${ctx.competitor} — ${vasStr} revenue lost for FY26`,
          `Q2 capacity window passes; next slot at ${ctx.plant} not available until Q4`,
          `INR movement widens competitor pricing advantage with each week of delay`,
        ],
        suggested_actions: [
          { id: 'ACT-001-A1', title: `Submit best-and-final price for ${pCtx.part} to ${customer} with delivery guarantee`, owner: 'SVP-Sales India', due: '2026-03-19', priority: 1 },
          { id: 'ACT-001-A2', title: `Align ${customer} on payment terms (60D vs 45D net) and warranty scope`, owner: 'CFO + Legal India', due: '2026-03-20', priority: 2 },
          { id: 'ACT-001-A3', title: `Exec-to-exec call with ${customer} VP Supply Chain to unlock final approval`, owner: 'CEO + SVP-Sales India', due: '2026-03-21', priority: 3 },
        ],
        value_at_stake: vasStr,
      };
    }
    if (f.country === 'UK' || f.site === 'Michigan') {
      return {
        ...base,
        title: `Secure ${customer} EV ${pCtx.part} contract — pricing commitment gating award`,
        shortTitle: `${customer} EV ${f.productLine} Contract`,
        context: `${ctx.plant} | ${f.productLine}`,
        why_now: `${customer} EV platform (JEA) award decision by Mar 28. GIS shortlisted vs ${ctx.competitor}. Pricing commitment on ${pCtx.part} is the final open item. GBP +0.3% this week worsens our cost position.`,
        confidence: 'Medium-High',
        confidence_pct: Math.max(52, Math.min(88, base.confidence_pct - Math.round((mul.risk - 1) * 8))),
        evidence_details: [
          { source: 'CRM UK', date: 'Mar 9', note: `${customer} procurement confirmed award decision by Mar 28; 2 suppliers shortlisted` },
          { source: 'Sales UK', date: 'Mar 11', note: `${ctx.competitor} submitted revised pricing on EV ${pCtx.part} — GBP/USD moving against GIS` },
          { source: 'Finance UK', date: 'Mar 12', note: 'GBP +0.3% vs USD this week erodes our margin buffer by ~40bps on this contract' },
        ],
        risks_of_not_acting: [
          `${ctx.competitor} wins ${customer} EV platform — 3-year supply worth ${vasStr} lost`,
          `Euro 7 launch date fixed — ${ctx.regulator} certification gap risk if decision delayed`,
          `GBP strength compounds weekly — deal economics worsen without price lock`,
        ],
        suggested_actions: [
          { id: 'ACT-001-A1', title: `Lock ${pCtx.part} price with 12-month GBP/USD hedge; submit to ${customer}`, owner: 'CFO + UK Sales', due: '2026-03-18', priority: 1 },
          { id: 'ACT-001-A2', title: `Submit ${ctx.regulator} compliance docs and Euro 7 readiness proof to ${customer} procurement`, owner: 'Legal + Quality UK', due: '2026-03-19', priority: 2 },
          { id: 'ACT-001-A3', title: `CEO call with ${customer} VP Procurement to remove final award blocker`, owner: 'CEO + SVP-Sales UK', due: '2026-03-20', priority: 3 },
        ],
        value_at_stake: vasStr,
      };
    }
    // USA (Detroit / Plano) — enhanced with context vars
    return {
      ...base,
      title: `Unblock 2 late-stage OEM deals with ${customer} — ${ctx.plant}`,
      shortTitle: `Unblock ${customer.split(' ')[0]} OEM Deals`,
      context: `${ctx.plant} | ${f.productLine}`,
      why_now: `Signature window closes in 10–14 days; re-bid/discount risk rising. ${customer} has reactivated a competing bid from ${ctx.competitor}. 5 legal redlines unresolved since Mar 4.`,
      evidence_details: [
        { source: 'CRM', date: 'Mar 4', note: `Deal stage stuck in "Legal Review" at ${ctx.plant} since Mar 4; ${customer} procurement flagging delay` },
        { source: 'Legal', date: 'Mar 9', note: '5 redlines open on indemnity, payment terms, and price escalation clause' },
        { source: 'Sales', date: 'Mar 10', note: `${ctx.competitor} reactivated with ${round(mul.growth * 8, 1)}% pricing undercut — window is 10–14 days` },
      ],
      risks_of_not_acting: [
        `${customer} requests end-of-quarter discount or reopens scope — ${vasStr} at risk`,
        `${ctx.competitor} bid re-enters with aggressive pricing in ${ctx.region}`,
        `Delivery lead-time concerns trigger Q2 pushout for ${f.productLine} program`,
      ],
      suggested_actions: [
        { id: 'ACT-001-A1', title: `Resolve top 5 legal redlines with ${customer} — align on fallback terms in 72 hours`, owner: 'Legal + CRO', due: '2026-03-17', priority: 1 },
        { id: 'ACT-001-A2', title: 'Lock pricing floor and approve concession playbook for final negotiation', owner: 'CFO + SVP-Sales', due: '2026-03-17', priority: 2 },
        { id: 'ACT-001-A3', title: `Confirm close date with exec sponsor; remove procurement blocker at ${ctx.plant}`, owner: 'CEO + CRO', due: '2026-03-18', priority: 3 },
      ],
      value_at_stake: vasStr,
    };
  }

  // ── D2 · Supply Chain ────────────────────────────────────────
  if (base.id === 'DEC-002' || base.id.startsWith('DEC-002')) {
    if (f.site === 'Pune' || (f.country === 'India' && f.site !== 'All')) {
      const otifNow = Math.max(84, Math.round(89 * mul.otif));
      return {
        ...base,
        title: `Dual-source ${pCtx.component} at ${ctx.plant} — ${pCtx.assy} line protection`,
        shortTitle: `Dual-Source ${pCtx.code} Pune`,
        context: `${ctx.plant} | ${f.productLine}`,
        why_now: `${ctx.supplierX} OTIF dropped from 96% to ${otifNow}% over 4 weeks. ${pCtx.assy} at ${ctx.plant} at risk within 3 weeks. ${ctx.competitor} pre-qualified a second source — GIS cannot afford single-supplier exposure.`,
        confidence: 'High',
        confidence_pct: Math.max(52, Math.min(92, 85 - Math.round((mul.risk - 1) * 6))),
        evidence_details: [
          { source: `ERP ${ctx.plant}`, date: 'Mar 12', note: `${ctx.supplierX} OTIF: 96% → ${otifNow}% over 4 weeks; 2 missed delivery windows` },
          { source: `Production ${ctx.plant}`, date: 'Mar 10', note: `${pCtx.assy} safety stock: ${Math.round(11 / mul.risk)} days remaining at current production rate` },
          { source: 'Procurement India', date: 'Mar 9', note: `Alternate supplier pre-qualified — can supply 40% of ${pCtx.component} volume within 3 weeks` },
        ],
        risks_of_not_acting: [
          `${pCtx.assy} line halts within 3 weeks if ${ctx.supplierX} misses another delivery`,
          `${customer} ${f.productLine} shipments delayed — OTIF penalty clauses trigger`,
          `OTIF drops below 88% — triggers ${ctx.regulator} contractual performance review`,
        ],
        suggested_actions: [
          { id: 'ACT-002-A1', title: `Issue RFQ to 2 qualified alternate ${pCtx.component} suppliers in India`, owner: 'Head of Procurement India', due: '2026-03-19', priority: 1 },
          { id: 'ACT-002-A2', title: `Emergency 3-week safety stock build for ${pCtx.component} at ${ctx.plant}`, owner: 'Head of Supply Chain', due: '2026-03-21', priority: 2 },
          { id: 'ACT-002-A3', title: `Dual-qualification audit for alternate supplier — expedited 4-week timeline`, owner: 'COO + Quality India', due: '2026-03-31', priority: 3 },
        ],
        value_at_stake: vasStr,
      };
    }
    if (f.site === 'Michigan' || f.country === 'UK') {
      return {
        ...base,
        title: `${ctx.supplierX} supply disruption — ${ctx.plant} ${pCtx.component} dual-source needed`,
        shortTitle: `EPS Supply Dual-Source UK`,
        context: `${ctx.plant} | ${f.productLine}`,
        why_now: `${ctx.supplierX} issued force majeure on 2 of 4 ${pCtx.component} SKUs following UK steel tariff escalation. ${pCtx.assy} at ${ctx.plant} has 18 days of stock. Euro 7 production start is fixed.`,
        confidence: 'High',
        confidence_pct: Math.max(52, Math.min(92, 82 - Math.round((mul.risk - 1) * 6))),
        evidence_details: [
          { source: 'Procurement UK', date: 'Mar 11', note: `${ctx.supplierX} force majeure notice — 2 of 4 SKUs unavailable for ≥6 weeks` },
          { source: `Production ${ctx.plant}`, date: 'Mar 12', note: `${pCtx.assy} stock at ${ctx.plant}: 18 days at current build rate — critical threshold in 10 days` },
          { source: 'Finance UK', date: 'Mar 10', note: 'UK steel tariff +9% confirmed; supplier absorbing 60%, passing 40% cost to GIS' },
        ],
        risks_of_not_acting: [
          `${pCtx.assy} production halt at ${ctx.plant} in 18 days — ${customer} program at risk`,
          `Euro 7 launch date missed — contractual penalty exposure up to ${moneyM(vasHigh)}`,
          `${ctx.competitor} will exploit GIS supply gap to reposition with ${customer}`,
        ],
        suggested_actions: [
          { id: 'ACT-002-A1', title: `Emergency RFQ to Continental and Bosch UK for ${pCtx.component} — 10-day response`, owner: 'Head of Procurement EU', due: '2026-03-18', priority: 1 },
          { id: 'ACT-002-A2', title: `Negotiate bridge supply agreement with ${ctx.supplierX} for non-affected SKUs`, owner: 'COO + Legal UK', due: '2026-03-20', priority: 2 },
          { id: 'ACT-002-A3', title: `Alert ${customer} procurement to delay risk — pre-empt penalty clause activation`, owner: 'SVP-Sales UK', due: '2026-03-19', priority: 3 },
        ],
        value_at_stake: vasStr,
      };
    }
    // USA default (Detroit / Plano) — enhanced
    const otifNow = Math.max(86, Math.round(91 * mul.otif));
    return {
      ...base,
      title: `Dual-source ${pCtx.component} — ${ctx.plant} ${pCtx.assy} line protection`,
      shortTitle: `Dual-Source ${pCtx.code} ${ctx.plant}`,
      context: `${ctx.plant} | ${f.productLine}`,
      why_now: `${ctx.supplierX} OTIF dropped to ${otifNow}% over 4 weeks. Single-source risk material with ${customer} Q2 ramp. ${pCtx.assy} line halts possible within 3 weeks if unresolved.`,
      evidence_details: [
        { source: 'ERP Procurement', date: 'Mar 12', note: `${ctx.supplierX} OTIF: 97% → ${otifNow}% over 4 weeks` },
        { source: 'ERP Production', date: 'Mar 9', note: `${ctx.plant} utilization ${Math.round(92 * mul.otif)}%; ${pCtx.assy} bottleneck in 6 weeks` },
        { source: 'USTR / Regulatory', date: 'Mar 6', note: `Section 301 tariff review on Chinese ${pCtx.component} — 15–25% increase possible` },
      ],
      risks_of_not_acting: [
        `${pCtx.assy} line halts within 3 weeks — ${customer} Q2 ramp jeopardized`,
        `${customer} OTIF penalty clauses trigger if delivery falls below 90%`,
        `OTIF drops below 90% — triggers ${ctx.regulator} performance review`,
      ],
      suggested_actions: base.suggested_actions,
      value_at_stake: vasStr,
    };
  }

  // ── D3 · Quality ─────────────────────────────────────────────
  if (base.id === 'DEC-003' || base.id.startsWith('DEC-003')) {
    if (f.site === 'Pune' || (f.country === 'India' && f.productLine !== 'Car Axle')) {
      return {
        ...base,
        title: `Quality containment sprint — ${pCtx.assy} ${pCtx.scrapType} at ${ctx.plant}`,
        shortTitle: `${pCtx.code} Quality Sprint Pune`,
        context: `${ctx.plant} | ${f.productLine}`,
        why_now: `${pCtx.assy} scrap rate up 58% (1.8% → 2.9%) at ${ctx.plant}. Root cause: ${pCtx.scrapType} from batch B2204. ${customer} supplier audit in 16 days. Corrective action draft submitted.`,
        confidence: 'Medium',
        confidence_pct: Math.max(52, Math.min(80, base.confidence_pct - Math.round((mul.risk - 1) * 5))),
        evidence_details: [
          { source: `MES Quality ${ctx.plant}`, date: 'Mar 13', note: `${pCtx.assy} scrap: 1.8% → 2.9% (+61%) — ${pCtx.scrapType} confirmed as root cause` },
          { source: 'Quality Team', date: 'Mar 14', note: `Batch B2204 variance outside ${pCtx.spec}; 3,200 units quarantined at ${ctx.plant}` },
          { source: 'SVP-Sales', date: 'Mar 13', note: `${customer} quality team notified; supplier audit in 16 days` },
        ],
        risks_of_not_acting: [
          `${customer} quality audit fails → immediate supply suspension from ${ctx.plant}`,
          `${pCtx.assy} scrap escalates — margin erosion and ${vasStr} penalty exposure`,
          `${ctx.regulator} performance review triggered — supplier tier demotion risk`,
        ],
        suggested_actions: [
          { id: 'ACT-003-A1', title: `5-day root cause sprint at ${ctx.plant}: ${pCtx.scrapType} on batch B2204`, owner: `CPO + Quality ${ctx.plant}`, due: '2026-03-19', priority: 1 },
          { id: 'ACT-003-A2', title: `Quarantine batch B2204 — halt ${pCtx.assy} production from defective batch`, owner: `Plant Manager ${ctx.plant}`, due: '2026-03-16', priority: 2 },
          { id: 'ACT-003-A3', title: `Submit corrective action plan to ${customer} proactively before audit`, owner: 'SVP-Sales + CPO', due: '2026-03-17', priority: 3 },
        ],
        value_at_stake: vasStr,
      };
    }
    // USA default
    return {
      ...base,
      title: `Quality containment sprint — ${pCtx.assy} scrap rate at ${ctx.plant}`,
      shortTitle: `${pCtx.code} Quality Sprint`,
      context: `${ctx.plant} | ${f.productLine}`,
      why_now: `${pCtx.assy} scrap rate rose 62% (2.1% → 3.4%) at ${ctx.plant}. ${customer} quality audit in 18 days. Root cause confirmed (${pCtx.scrapType}). CAP submitted to ${customer}.`,
      evidence_details: base.evidence_details,
      risks_of_not_acting: [
        `${customer} quality audit fails → immediate supply suspension from ${ctx.plant}`,
        `Scrap escalates — ${vasStr} margin erosion and penalty exposure accelerates`,
        `${ctx.regulator} OTIF penalty clauses triggered at ${ctx.plant}`,
      ],
      suggested_actions: base.suggested_actions,
      value_at_stake: vasStr,
    };
  }

  // ── D4 · Growth ──────────────────────────────────────────────
  if (base.id === 'DEC-004' || base.id.startsWith('DEC-004')) {
    if (f.site === 'Michigan' || f.country === 'UK') {
      return {
        ...base,
        title: `EU aftermarket ${pCtx.part} services — ${customer} installed base growth play`,
        shortTitle: `EU Aftermarket Services`,
        context: `${ctx.plant} | ${f.productLine}`,
        why_now: `8,500+ ${pCtx.part} assemblies in EU installed base approaching 5-year service window. ${ctx.competitor} probing this segment. ${customer} aftermarket team open to preferred supplier designation.`,
        confidence: 'Medium',
        confidence_pct: Math.max(52, Math.min(78, base.confidence_pct)),
        evidence_details: [
          { source: 'Strategy UK', date: 'Mar 8', note: `8,500+ ${pCtx.part} assemblies in EU base — est. ${vasStr}/yr aftermarket potential` },
          { source: 'CRM UK', date: 'Mar 11', note: `${customer} aftermarket team open to preferred supplier designation for EU ${pCtx.part} retrofit` },
          { source: 'Competitive Intel', date: 'Mar 5', note: `${ctx.competitor} probing EU ${pCtx.part} aftermarket; no formal offer yet` },
        ],
        risks_of_not_acting: [
          `${ctx.competitor} establishes EU aftermarket relationship with ${customer} installed base`,
          `${vasStr}/yr recurring revenue opportunity bypassed for 2+ years`,
          `${customer} sourcing relationship weakens without services layer`,
        ],
        suggested_actions: [
          { id: 'ACT-004-A1', title: `EU installed base analysis: pricing model for ${pCtx.part} retrofit services`, owner: 'COO EU + CFO', due: '2026-04-15', priority: 1 },
          { id: 'ACT-004-A2', title: `Pilot ${pCtx.part} retrofit offer with ${customer} — 30-unit EU trial`, owner: 'Head of Services EU', due: '2026-04-30', priority: 2 },
        ],
        value_at_stake: `${vasStr}/yr`,
      };
    }
    if (f.country === 'India' || f.site === 'Pune') {
      return {
        ...base,
        title: `${customer} Tier-1 ${pCtx.part} expansion — India services growth play`,
        shortTitle: `${customer} India Expansion`,
        context: `${ctx.plant} | ${f.productLine}`,
        why_now: `${customer} signaled Tier-1 ${pCtx.part} sourcing interest for India market. 12,000+ assemblies approaching service window at ${ctx.plant}. ${ctx.competitor} not yet responding. Decision window: 30 days.`,
        confidence: 'Medium',
        confidence_pct: base.confidence_pct,
        evidence_details: [
          { source: 'CRM India', date: 'Mar 11', note: `${customer} procurement signaled interest in expanding ${f.productLine} sourcing at ${ctx.plant}` },
          { source: 'Strategy', date: 'Mar 8', note: `12,000+ ${pCtx.part} assemblies in India base approaching 5-year service window` },
          { source: 'Competitive Intel', date: 'Mar 5', note: `${ctx.competitor} beginning to probe India aftermarket — no formal offer yet` },
        ],
        risks_of_not_acting: base.risks_of_not_acting,
        suggested_actions: [
          { id: 'ACT-004-A1', title: `India market sizing: ${pCtx.part} installed base analysis + pricing model`, owner: 'COO + CFO India', due: '2026-04-15', priority: 1 },
          { id: 'ACT-004-A2', title: `Pilot ${pCtx.part} retrofit with ${customer} India — 50-unit trial at ${ctx.plant}`, owner: 'Head of Services India', due: '2026-04-30', priority: 2 },
        ],
        value_at_stake: `${vasStr}/yr`,
      };
    }
    // USA default
    return {
      ...base,
      title: `Services + retrofit growth — ${customer} US ${pCtx.part} installed base`,
      shortTitle: `US Services & Retrofit`,
      context: `${ctx.plant} | ${f.productLine}`,
      why_now: `12,000+ ${pCtx.part} assemblies in US installed base approaching service window. ${customer} aftermarket at risk from ${ctx.competitor}. Retrofit revenue largely untapped at ${ctx.plant}.`,
      evidence_details: base.evidence_details,
      risks_of_not_acting: base.risks_of_not_acting,
      suggested_actions: base.suggested_actions,
      value_at_stake: `${vasStr}/yr`,
    };
  }

  // ── D5 · EV Drivetrain / Plano ────────────────────────────────────────────────────
  if (base.id === 'DEC-005' || base.id.startsWith('DEC-005')) {
    const evPlant   = 'Plano, TX';
    const evCustomer = (f.site === 'Plano, Texas' || f.productLine === 'EV Drivetrain') ? 'Tesla Gigafactory TX' : customer;
    const evComp    = 'Alpha Automotive TX';
    const annualL   = round((base.impact_range?.low  || 14) * mul.growth, 1);
    const annualH   = round((base.impact_range?.high || 35) * mul.growth, 1);
    const annualStr = `${moneyM(annualL)}–${moneyM(annualH)}/yr`;
    return {
      ...base,
      title: `Secure ${evCustomer} EV Drivetrain supply contract — Q2 award window`,
      shortTitle: `${evCustomer.split(' ')[0]} EV Drivetrain Contract`,
      context: `${evPlant} | EV Drivetrain`,
      why_now: `${evCustomer} Gigafactory TX RFQ for EV motor shaft assembly — award decision Apr 10. GIS shortlisted vs ${evComp}. ${pCtx.assy} capacity confirmed at ${evPlant}. Pricing commitment needed by Mar 20. NVH ±0.02mm confirmed compliant.`,
      confidence: 'Medium-High',
      confidence_pct: Math.max(62, Math.min(86, base.confidence_pct - Math.round((mul.risk - 1) * 6))),
      evidence_details: [
        { source: 'CRM Plano',   date: 'Mar 11', note: `${evCustomer} procurement confirmed Q2 RFQ timeline; final pricing due Mar 20` },
        { source: 'Sales Plano', date: 'Mar 13', note: `GIS shortlisted vs ${evComp}; pricing commitment is the final gating item` },
        { source: 'Finance',     date: 'Mar 12', note: `EV Drivetrain margin premium: +${Math.round(150 * mul.margin)}bps vs Car Axle at equivalent revenue` },
      ],
      risks_of_not_acting: [
        `${evComp} wins Tesla program — ${annualStr} annual revenue lost for 3 years`,
        `GIS Plano EV R&D line investment stranded — capex recovery delayed 2+ years`,
        `Tesla relationship weakens; competitor entrenches in US EV OEM space`,
      ],
      suggested_actions: [
        { id: 'ACT-005-A1', title: `Submit best-and-final EV motor shaft price to ${evCustomer} with NVH certification`, owner: 'SVP-Sales + CFO', due: '2026-03-20', priority: 1 },
        { id: 'ACT-005-A2', title: `Confirm ${evPlant} EV R&D line NVH tolerance compliance (±0.02mm spec)`, owner: 'COO + Plant Manager Plano', due: '2026-03-21', priority: 2 },
        { id: 'ACT-005-A3', title: `CEO exec-to-exec call with ${evCustomer} VP Supply Chain to unlock award`, owner: 'CEO', due: '2026-03-22', priority: 3 },
      ],
      value_at_stake: annualStr,
      impact_range: { low: annualL, likely: round(annualL * 1.4, 1), high: annualH, unit: '$M', label: 'Annual revenue (3-year EV supply program)' },
    };
  }

  // Fallback
  return {
    ...base,
    context: `${getCtx(f).plant} | ${f.productLine}`,
    value_at_stake: vasStr,
  };
}

// ─── Context-aware signal content overlay ────────────────────────
function overlaySignalContent(sig, f, mul) {
  const ctx      = getCtx(f);
  const pCtx     = getPCtx(f);
  const customer = getCustomer(f);
  const conf     = (base) => Math.max(55, Math.min(98, Math.round((base || 75) * (1 - (mul.risk - 1) * 0.08))));

  // SIG-001 — Market / Growth demand signal
  if (sig.id === 'SIG-001' || sig.id.startsWith('SIG-001')) {
    if (f.country === 'India' || f.site === 'Pune') {
      return {
        ...sig,
        title: `${customer} Q2 ${f.productLine} sourcing tender — evaluation window open now`,
        summary: `${customer} procurement opened Q2 sourcing eval for ${pCtx.part} at ${ctx.plant}. Volume: +30% vs prior Q. Decision window closes mid-April. ${ctx.competitor} in parallel evaluation.`,
        source: `${customer} Procurement Portal / CRM`,
        tags: ['demand', f.segment, customer, f.productLine, ctx.plant],
        confidence: conf(sig.confidence),
      };
    }
    if (f.country === 'UK' || f.site === 'Michigan') {
      return {
        ...sig,
        title: `${customer} EV platform (JEA) award decision Mar 28 — GIS shortlisted`,
        summary: `${customer} announced EV platform ${pCtx.part} supplier award for Mar 28. GIS and ${ctx.competitor} shortlisted. Pricing commitment on ${pCtx.part} volume is the final gating item.`,
        source: `${customer} Procurement / CRM UK`,
        tags: ['EV', customer, f.productLine, ctx.plant, 'award'],
        confidence: conf(sig.confidence),
      };
    }
    return {
      ...sig,
      title: `${customer} EV model ramp announced for Q2 — ${ctx.plant} supply impact`,
      summary: `${customer} accelerated Q2 ramp for Atlas EV platform, requiring 40% increase in ${pCtx.part} supply from ${ctx.plant}. Signature window opens mid-March.`,
      source: `${customer} Press Release`,
      tags: ['demand', 'OEM', customer, f.productLine, ctx.plant],
      confidence: conf(sig.confidence),
    };
  }

  // SIG-002 — Supply chain / OTIF risk
  if (sig.id === 'SIG-002' || sig.id.startsWith('SIG-002')) {
    const otifHigh = Math.round(97 * mul.otif);
    const otifLow  = Math.max(82, Math.round(91 * mul.otif));
    return {
      ...sig,
      title: `${ctx.supplierX} on-time delivery: ${otifHigh}% → ${otifLow}% over 4 weeks`,
      summary: `Primary ${pCtx.component} supplier (${ctx.supplierX}) OTIF declined from ${otifHigh}% to ${otifLow}% over 4 weeks at ${ctx.plant}. Risk of ${pCtx.assy} production stoppage within 3 weeks if trend continues.`,
      source: `ERP Procurement — ${ctx.plant}`,
      tags: ['supply_chain', pCtx.component, 'risk', ctx.plant, ctx.supplierX],
      confidence: conf(sig.confidence),
    };
  }

  // SIG-003 — Quality / Scrap
  if (sig.id === 'SIG-003' || sig.id.startsWith('SIG-003')) {
    const scrapLow  = round(2.1 * mul.risk, 1);
    const scrapHigh = round(3.4 * mul.risk, 1);
    const penaltyL  = round(0.8 * mul.risk, 1);
    const penaltyH  = round(1.6 * mul.risk, 1);
    return {
      ...sig,
      title: `${pCtx.assy} ${pCtx.scrapType}: ${scrapLow}% → ${scrapHigh}% — rising at ${ctx.plant}`,
      summary: `${pCtx.assy} ${pCtx.scrapType} up ${Math.round(62 * mul.risk)}% in 30 days at ${ctx.plant}. Root cause: ${pCtx.scrapType} from batch P2203. ${customer} quality audit in 18 days. Penalty exposure $${penaltyL}M–$${penaltyH}M.`,
      source: `Quality MES — ${ctx.plant}`,
      tags: ['quality', pCtx.assy, 'scrap', ctx.plant, customer, 'penalty'],
      confidence: conf(sig.confidence),
    };
  }

  // SIG-004 — Market / Competitive / Pricing
  if (sig.id === 'SIG-004' || sig.id.startsWith('SIG-004')) {
    const stkPct = round(6 * mul.risk, 0);
    if (f.country === 'India' || f.site === 'Pune') {
      return {
        ...sig,
        title: `India HRC steel +${stkPct}% (30D); ${ctx.competitor} discounting in Tier-1 bids`,
        summary: `India HRC steel +${stkPct}% in 30 days. ${ctx.competitor} discounting 7–11% in India Tier-1 re-bids for ${f.productLine}. Margin pressure accelerating at ${ctx.plant}.`,
        source: 'Market Intelligence / SteelMint India',
        tags: ['pricing', 'steel', 'competition', f.segment, 'margin', ctx.plant],
        confidence: conf(sig.confidence),
      };
    }
    if (f.country === 'UK' || f.site === 'Michigan') {
      return {
        ...sig,
        title: `UK steel tariff +9%; ${ctx.competitor} undercutting EU OEM bids`,
        summary: `UK steel tariff +9% following CBAM implementation. ${ctx.competitor} undercutting GIS on EU OEM bids by 5–9%. ${ctx.plant} margin pressure projected –80bps.`,
        source: 'Market Intelligence / UK Steel Federation',
        tags: ['tariff', 'steel', 'competition', 'EU', 'margin', ctx.plant],
        confidence: conf(sig.confidence),
      };
    }
    return {
      ...sig,
      title: `Steel +${stkPct}% in 30 days; ${ctx.competitor} discounting in OEM bids`,
      summary: `HRC steel benchmark +${stkPct}% in 30 days. ${ctx.competitor} discounting ${Math.round(8 * mul.risk)}–${Math.round(12 * mul.risk)}% in US OEM re-bids. Margin pressure at ${ctx.plant} accelerating.`,
      source: 'Market Intelligence / Bloomberg',
      tags: ['pricing', 'steel', 'competition', 'OEM', 'margin', ctx.plant],
      confidence: conf(sig.confidence),
    };
  }

  // SIG-005 — Capacity utilization
  if (sig.id === 'SIG-005' || sig.id.startsWith('SIG-005')) {
    const util  = Math.round(92 * mul.otif);
    const weeks = Math.round(6 * (1 / mul.otif));
    return {
      ...sig,
      title: `${ctx.plant} utilization at ${util}% for ${f.productLine} — ceiling approaching`,
      summary: `${ctx.plant} at ${util}% utilization for ${f.productLine}. Adding ${customer} Q2 ${pCtx.part} volume without second shift creates ${pCtx.assy} bottleneck within ${weeks} weeks. Capital decision needed.`,
      source: `ERP Production — ${ctx.plant}`,
      tags: ['capacity', ctx.plant, 'utilization', customer, 'constraint', f.productLine],
      confidence: conf(sig.confidence),
    };
  }

  // SIG-006 — Growth opportunity signal
  if (sig.id === 'SIG-006' || sig.id.startsWith('SIG-006')) {
    const annualLow  = round(3 * mul.growth, 1);
    const annualHigh = round(5 * mul.growth, 1);
    return {
      ...sig,
      title: `${customer} signals interest in ${f.segment} ${f.productLine} sourcing at ${ctx.plant}`,
      summary: `${customer} procurement signaled openness to expanding ${f.segment} ${f.productLine} sourcing at ${ctx.plant}. Est. $${annualLow}M–$${annualHigh}M annual contract in play. Follow-up meeting scheduled.`,
      source: `CRM / Meeting Notes — ${ctx.plant}`,
      tags: [customer, ctx.plant, f.productLine, f.segment, 'growth', 'pipeline'],
      confidence: conf(sig.confidence),
    };
  }

  // SIG-007 — Regulatory / Tariff
  if (sig.id === 'SIG-007' || sig.id.startsWith('SIG-007')) {
    if (f.country === 'India' || f.site === 'Pune') {
      return {
        ...sig,
        title: `India PLI scheme review may affect ${f.productLine} component classification`,
        summary: `India PLI (Production-Linked Incentive) scheme Q2 2026 review may reclassify ${pCtx.part} eligibility. GIS Pune claims ~INR 12Cr annually under current scheme. Risk: INR 8–15Cr annual impact.`,
        source: 'Ministry of Heavy Industries Filing',
        tags: ['regulatory', 'PLI', 'India', f.productLine, ctx.plant],
        confidence: conf(sig.confidence),
      };
    }
    if (f.country === 'UK' || f.site === 'Michigan') {
      const certCost = round(1.2 * mul.risk, 1);
      const certHigh = round(2.8 * mul.risk, 1);
      return {
        ...sig,
        title: `Euro 7 standards may require ${f.productLine} spec update for ${customer}`,
        summary: `Euro 7 (Jan 2027) requires updated ${pCtx.spec} for all ${pCtx.part} supplied to EU vehicles. ${ctx.regulator} certification gap analysis overdue. Cost to certify est. $${certCost}M–$${certHigh}M.`,
        source: `EU Commission / ${ctx.regulator} Filing`,
        tags: ['Euro7', 'regulatory', f.productLine, ctx.plant, 'certification'],
        confidence: conf(sig.confidence),
      };
    }
    const costL = round(1.5 * mul.risk, 1);
    const costH = round(3.2 * mul.risk, 1);
    return {
      ...sig,
      title: `Section 301 tariff review may affect ${pCtx.component} imports — ${ctx.plant} exposure`,
      summary: `USTR reviewing Section 301 tariffs on Chinese auto parts. Potential 15–25% increase on ${pCtx.component} imports. GIS ${ctx.plant} sources ~30% from China — est. $${costL}M–$${costH}M annual cost impact.`,
      source: 'USTR Public Filing',
      tags: ['tariff', 'China', pCtx.component, 'supply_chain', 'regulatory', ctx.plant],
      confidence: conf(sig.confidence),
    };
  }

  // SIG-008 — EV Drivetrain demand signal (Tesla Plano)
  if (sig.id === 'SIG-008' || sig.id.startsWith('SIG-008')) {
    const annualL = round(14 * mul.growth, 1);
    const annualH = round(35 * mul.growth, 1);
    const units   = Math.round(120 * mul.growth);
    const evCust  = (f.site === 'Plano, Texas' || f.productLine === 'EV Drivetrain') ? 'Tesla Gigafactory TX' : customer;
    return {
      ...sig,
      title: `${evCust} EV Drivetrain RFQ issued — GIS Plano shortlisted for Apr 10 award`,
      summary: `${evCust} issued formal RFQ for EV motor shaft assembly (±0.02mm NVH spec). GIS Plano shortlisted vs Alpha Automotive TX. Award decision Apr 10. Volume: ${units}K units/year at ramp. Est. $${annualL}M–$${annualH}M annual revenue opportunity.`,
      source: `${evCust.split(' ')[0]} Procurement Portal / CRM Plano`,
      tags: ['EV', evCust, 'Plano', 'EV Drivetrain', 'OEM', 'growth', 'award'],
      confidence: conf(sig.confidence),
    };
  }

  // SIG-009 — EV regulatory / DOT NVH standard
  if (sig.id === 'SIG-009' || sig.id.startsWith('SIG-009')) {
    const certL    = round(0.8 * mul.risk, 1);
    const certH    = round(1.5 * mul.risk, 1);
    const newSpec  = '±0.015mm';
    const currSpec = '±0.02mm';
    return {
      ...sig,
      title: `US DOT EV drivetrain NVH standard update (${newSpec}) — Jan 2027 deadline`,
      summary: `US DOT proposed tighter NVH tolerance (${newSpec}) for EV drivetrain components in passenger vehicles, effective Jan 2027. GIS Plano current spec is ${currSpec}. Recertification est. $${certL}M–$${certH}M. Early compliance positions GIS ahead of EV OEM procurement criteria.`,
      source: 'US DOT Federal Register / Regulatory Feed',
      tags: ['EV', 'regulatory', 'NVH', 'Plano', 'EV Drivetrain', 'DOT', 'certification'],
      confidence: conf(sig.confidence),
    };
  }

  // Fallback
  return {
    ...sig,
    summary: `${sig.summary} (${ctx.plant} • ${f.productLine} • ${f.segment})`,
    confidence: conf(sig.confidence),
  };
}

// ─── Public: Filtered signals ─────────────────────────────────────
export function getFilteredSignals(filters) {
  const f   = normalizeFilters(filters);
  const mul = scoreFactors(f);
  const filtered = baseSignals
    .filter(s => inScope(signalScope[s.id] || signalScope['SIG-001'], f))
    .map(s => overlaySignalContent(s, f, mul));
  if (filtered.length) return filtered;
  return baseSignals.slice(0, 3).map((s, i) =>
    overlaySignalContent({ ...s, id: `${s.id}-SYN-${i + 1}` }, f, mul)
  );
}

// ─── Public: Filtered decisions ───────────────────────────────────
export function getFilteredDecisions(filters) {
  const f   = normalizeFilters(filters);
  const mul = scoreFactors(f);
  let list  = baseDecisions.filter(d => inScope(decisionScope[d.id] || decisionScope['DEC-001'], f));
  if (!list.length) {
    list = baseDecisions.slice(0, 2).map((d, i) => ({ ...d, id: `${d.id}-SYN-${i + 1}` }));
  }
  return list.map(d => {
    const low    = d.impact_range?.low    || 3;
    const likely = d.impact_range?.likely || 5;
    const high   = d.impact_range?.high   || 8;
    const g      = mul.growth;
    const scaled = {
      ...d,
      impact_range: { ...(d.impact_range || {}), low: round(low * g, 1), likely: round(likely * g, 1), high: round(high * g, 1) },
      confidence_pct: Math.max(52, Math.min(95, Math.round((d.confidence_pct || 70) - (mul.risk - 1) * 8))),
    };
    return overlayDecisionContent(scaled, f, mul);
  });
}

// ─── Public: Filtered KPIs (with dynamic sparklines) ─────────────
export function getFilteredKpis(filters) {
  const f   = normalizeFilters(filters);
  const m   = scoreFactors(f);
  const ctx = getCtx(f);
  const pCtx = getPCtx(f);

  const orderIntakeVal = kpis.orderIntake.value     * m.growth;
  const marginVal      = kpis.operatingMargin.value * m.margin;
  const cashVal        = kpis.freeCashFlow.value    * m.cash;
  const otifVal        = kpis.otif.value            * m.otif;
  const b2bVal         = kpis.bookToBill.value      * m.growth * 0.93;
  const ltifrVal       = Math.max(0.2, kpis.ltifr.value * m.risk);

  // Site + product specific sparklines — different shapes per context
  const sparkBase  = ctx.sparkGrowth || [40.2, 41.8, 39.6, 42.6, 40.1, 41.5, 42.6, 41.8, 42.3, 42.6];
  const sparkM     = ctx.sparkMargin || [13.5, 13.4, 13.2, 13.0, 12.9, 13.0, 12.8, 12.9, 13.0, 13.1];
  const sparkFcf   = pCtx.sparkFcf   || [11.5, 10.8, 9.9, 9.2, 8.8, 8.5, 8.2, 8.0, 8.1, 8.2];
  const sparkOtif  = Array.from({ length: 10 }, (_, i) => Math.max(86, round(96 * m.otif - (9 - i) * 0.35, 1)));
  const sparkB2b   = sparkBase.map(v => round((v / sparkBase[0]) * b2bVal, 2));
  const sparkSafe  = Array.from({ length: 10 }, (_, i) => round(ltifrVal * (0.88 + i * 0.025), 2));
  const sparkOrds  = sparkBase.map(v => Math.max(50, Math.round(v * 5.8 * m.growth)));

  return [
    {
      id: 'KPI-001', label: 'Revenue growth', value: moneyM(orderIntakeVal),
      trend: m.growth >= 1 ? 'up' : 'down',
      delta: `${m.growth >= 1 ? '+' : ''}${round((m.growth - 1) * 100, 1)}%`,
      sublabel: `${f.timeRange} • ${ctx.plant}`,
      shortLabel: 'Revenue',
      pts: sparkBase.map(v => round(v * m.growth, 1)),
      sparkline: sparkBase.map(v => round(v * m.growth, 1)),
    },
    {
      id: 'KPI-003', label: 'Profit Margin', value: `${round(marginVal, 1)}%`,
      trend: marginVal >= kpis.operatingMargin.value ? 'up' : 'down',
      delta: `${marginVal >= kpis.operatingMargin.value ? '+' : ''}${round(marginVal - kpis.operatingMargin.value, 1)}pp`,
      sublabel: `vs baseline • ${f.productLine}`,
      shortLabel: 'Margin',
      pts: sparkM.map(v => round(v * m.margin, 1)),
      sparkline: sparkM.map(v => round(v * m.margin, 1)),
    },
    {
      id: 'KPI-004', label: 'Free cash flow', value: moneyM(cashVal),
      trend: cashVal >= kpis.freeCashFlow.value ? 'up' : 'down',
      delta: `${cashVal >= kpis.freeCashFlow.value ? '+' : ''}${round(((cashVal / kpis.freeCashFlow.value) - 1) * 100, 1)}%`,
      sublabel: `rolling • ${f.segment}`,
      shortLabel: 'FCF',
      pts: sparkFcf.map(v => round(v * m.cash, 1)),
      sparkline: sparkFcf.map(v => round(v * m.cash, 1)),
    },
    {
      id: 'KPI-005', label: 'Orders / order intake', value: `${Math.max(60, Math.round(orderIntakeVal * 5.8))}`,
      trend: 'up', delta: `${Math.round(orderIntakeVal)} pts`,
      sublabel: `booked orders • ${ctx.plant}`,
      shortLabel: 'Orders',
      pts: sparkOrds,
      sparkline: sparkOrds,
    },
    {
      id: 'KPI-002', label: 'Backlog / book-to-bill', value: `${round(b2bVal, 2)}×`,
      trend: b2bVal >= 1 ? 'up' : 'down', delta: `${round(b2bVal - 1, 2)}x`,
      sublabel: `target 1.2x • ${f.timeRange}`,
      shortLabel: 'B2B',
      pts: sparkB2b,
      sparkline: sparkB2b,
    },
    {
      id: 'KPI-006', label: 'Safety Performance (LTIFR)', value: `${round(ltifrVal, 2)}`,
      trend: ltifrVal <= 0.8 ? 'up' : 'down',
      delta: `${ltifrVal <= 0.8 ? 'stable' : 'watch'}`,
      sublabel: `lower is better • ${ctx.plant}`,
      shortLabel: 'LTIFR',
      pts: sparkSafe,
      sparkline: sparkSafe,
    },
    {
      id: 'BASE-OTIF', label: 'OTIF', value: `${round(otifVal, 1)}%`,
      trend: otifVal >= 93 ? 'up' : 'down', delta: `${round(otifVal - 93, 1)}pp`,
      sublabel: `target 96% • ${ctx.plant}`,
      shortLabel: 'OTIF',
      pts: sparkOtif,
      sparkline: sparkOtif,
    },
  ];
}

// ─── Public: Filtered external indicators ────────────────────────
export function getFilteredExternalIndicators(filters) {
  const f = normalizeFilters(filters);
  const fxLabel = f.country === 'India' ? 'USD/INR' : f.country === 'UK' ? 'GBP/USD' : 'DXY';
  const fxVal   = f.country === 'India' ? '83.42'   : f.country === 'UK' ? '1.268'   : '104.1';
  return [
    ...externalIndicators.slice(0, 5),
    { id: 'EI-FX', label: fxLabel, value: fxVal, change: f.country === 'UK' ? '+0.3%' : '-0.2%', direction: f.country === 'UK' ? 'up' : 'down', source: 'Bloomberg' },
    ...externalIndicators.slice(6),
  ];
}

// ─── Public: Filtered impact indicators ──────────────────────────
export function getFilteredImpact(filters) {
  const f        = normalizeFilters(filters);
  const m        = scoreFactors(f);
  const ctx      = getCtx(f);
  const pCtx     = getPCtx(f);
  const customer = getCustomer(f);
  const orderVal  = round((Number(String(baseImpact[0]?.value || '42.6').replace(/[^\d.]/g, '')) || 42.6) * m.growth, 1);
  const convRate  = Math.max(10, round(24 * m.growth, 1));
  const otifRate  = Math.min(99, round(93 * m.otif, 1));
  return [
    {
      ...baseImpact[0],
      label: `${f.productLine} Order Intake (${f.timeRange})`,
      value: moneyM(orderVal),
      change: `${m.growth >= 1 ? '+' : ''}${round((m.growth - 1) * 100, 1)}%`,
      direction: m.growth >= 1 ? 'up' : 'down',
      note: `${f.timeRange} vs prior window — ${ctx.plant}`,
      color: m.growth >= 1 ? '#3b82f6' : '#ef4444',
    },
    {
      ...baseImpact[1],
      label: `${customer} Quote-to-Order Conv.`,
      value: `${convRate}%`,
      target: '28%',
      direction: convRate >= 28 ? 'up' : 'down',
      note: convRate >= 28 ? `${round(convRate - 28, 1)}pp above target` : `${round(28 - convRate, 1)}pp below target`,
    },
    {
      ...baseImpact[2],
      label: `${ctx.plant} OTIF — ${pCtx.assy}`,
      value: `${otifRate}%`,
      target: '96%',
      direction: otifRate >= 93 ? 'up' : 'down',
      note: otifRate >= 96 ? 'On target' : `${round(96 - otifRate, 1)}pp below target`,
    },
  ];
}

// ─── Public: Filtered downside risks ─────────────────────────────
export function getFilteredRisks(filters) {
  const f        = normalizeFilters(filters);
  const m        = scoreFactors(f);
  const ctx      = getCtx(f);
  const pCtx     = getPCtx(f);
  const customer = getCustomer(f);
  const riskOrder = m.risk > 1.08 ? ['high', 'high', 'medium'] : m.risk < 0.96 ? ['medium', 'medium', 'low'] : ['high', 'medium', 'medium'];
  const wcImpactL = round(10 * m.risk, 1);
  const wcImpactH = round(25 * m.risk, 1);
  const weeks     = Math.round(3 * (1 / m.otif));
  return [
    {
      id: 'DR-001',
      label: `Late-stage ${customer} ${f.productLine} deals stuck in review`,
      detail: `Revenue shifts out of quarter for ${ctx.plant} if not resolved within 10 days`,
      severity: riskOrder[0],
      related_decision: 'DEC-001',
    },
    {
      id: 'DR-002',
      label: `${f.productLine} inventory build hurting cash flow at ${ctx.plant}`,
      detail: `−$${wcImpactL}M to −$${wcImpactH}M short-term working capital impact from buffer stock`,
      severity: riskOrder[1],
      related_decision: 'DEC-001',
    },
    {
      id: 'DR-003',
      label: `${ctx.supplierX} lead-time spike blocks ${pCtx.assy} build schedule`,
      detail: `${pCtx.assy} line at ${ctx.plant} at risk within ${weeks} weeks without dual-sourcing of ${pCtx.component}`,
      severity: riskOrder[2],
      related_decision: 'DEC-002',
    },
  ];
}

// ─── Helpers ──────────────────────────────────────────────────────
export function getValueAtStakeFromDecisions(decisions) {
  const ranges = decisions.map(d => d.impact_range || {}).map(r => ({ low: Number(r.low || 0), high: Number(r.high || 0) }));
  const low    = ranges.reduce((s, r) => s + r.low,  0);
  const high   = ranges.reduce((s, r) => s + r.high, 0);
  return {
    ...valueAtStake,
    revenue_at_risk: `${moneyM(low)}–${moneyM(high)}`,
    total_headline:  `${moneyM(low * 1.4)}–${moneyM(high * 1.9)}`,
  };
}

export function getHomeTopDecision(decisions) {
  const top = decisions[0];
  if (!top) return topDecisionHome;
  return {
    ...topDecisionHome,
    decision_id: top.id,
    title: top.title,
    context: top.context,
    why_now: top.why_now,
    confidence: top.confidence,
    confidence_pct: top.confidence_pct,
    time_window_days: top.time_window_days,
    next_action: top.suggested_actions?.[0]?.title || topDecisionHome.next_action,
  };
}

export function getWhatChanged(signals) {
  return signals
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)
    .map(s => ({ text: s.summary, critical: s.severity === 'high', source: s.source, date: s.date }));
}

// ─── Execution model ──────────────────────────────────────────────
export function getExecutionModel(filters, decisionState = {}) {
  const decisions = getFilteredDecisions(filters);
  const actions = baseActions
    .filter(a => decisions.some(d => d.id === a.decision_id || a.decision_id.startsWith(d.id)))
    .map(a => ({ ...a }));

  decisions.forEach(d => {
    const override = decisionState[d.id];
    if (!override) return;
    actions.forEach(a => {
      if (a.decision_id === d.id) {
        if (override.status === 'Committed') a.status = a.status === 'Not Started' ? 'In Progress' : a.status;
        if (override.status === 'Hold') a.status = 'Blocked';
      }
    });
  });

  const statusByDecision = decisions.reduce((acc, d) => {
    const ov = decisionState[d.id];
    acc[d.id] = ov?.status === 'Committed' ? 'In Progress' : ov?.status === 'Hold' ? 'Hold' : d.status;
    return acc;
  }, {});

  const rows = decisions.map(d => ({
    decision_id: d.id,
    ref: d.ref,
    title: d.shortTitle || d.title,
    owner: d.owner,
    status: statusByDecision[d.id] || d.status,
    due: d.suggested_actions?.[0]?.due || d.time_window_days,
    value_at_stake: d.value_at_stake,
    actions: actions.filter(a => a.decision_id === d.id),
  }));

  const inProgress = actions.filter(a => a.status === 'In Progress').length;
  const atRisk     = actions.filter(a => a.status === 'Blocked' || a.status === 'Stalled').length;
  const overdue    = actions.filter(a => a.status !== 'Completed' && new Date(a.due_date) < new Date('2026-03-16')).length;
  const completed  = actions.filter(a => a.status === 'Completed').length;

  return {
    rows, actions,
    summary: {
      totalValueAtStake: getValueAtStakeFromDecisions(decisions).total_headline,
      activeDecisions: decisions.length,
      actionsInProgress: inProgress,
      actionsAtRisk: atRisk,
      actionsOverdue: overdue,
      actionsCompleted: completed,
    },
  };
}

// ─── Master slice ─────────────────────────────────────────────────
export function getDashboardSlice(filters, decisionState = {}) {
  const norm = normalizeFilters(filters);
  if (norm.country === 'Global' && norm.site !== 'All') {
    norm.country = siteToCountry[norm.site] || norm.country;
  }
  const decisions        = getFilteredDecisions(norm);
  const signals          = getFilteredSignals(norm);
  const kpisArr          = getFilteredKpis(norm);
  const externalInds     = getFilteredExternalIndicators(norm);
  const impactInds       = getFilteredImpact(norm);
  const risks            = getFilteredRisks(norm);
  const topDecision      = getHomeTopDecision(decisions);
  const whatChanged      = getWhatChanged(signals);
  const vasResult        = getValueAtStakeFromDecisions(decisions);
  const execution        = getExecutionModel(norm, decisionState);
  return {
    filters: norm, decisions, signals,
    kpis: kpisArr,
    externalIndicators: externalInds,
    impactIndicators: impactInds,
    downsideRisks: risks,
    topDecision, whatChanged,
    valueAtStake: vasResult,
    execution,
  };
}

// ─── KPI-driven insights (drives InsightsHub recommendations) ────
export function getKpiInsights(filters, kpiId) {
  const f        = normalizeFilters(filters);
  const m        = scoreFactors(f);
  const ctx      = getCtx(f);
  const pCtx     = getPCtx(f);
  const customer = getCustomer(f);

  const orderVal  = round(kpis.orderIntake.value     * m.growth, 1);
  const marginVal = round(kpis.operatingMargin.value * m.margin, 1);
  const cashVal   = round(kpis.freeCashFlow.value    * m.cash, 1);
  const otifVal   = round(kpis.otif.value            * m.otif, 1);
  const b2bVal    = round(kpis.bookToBill.value      * m.growth * 0.93, 2);
  const ltifrVal  = round(Math.max(0.2, kpis.ltifr.value * m.risk), 2);

  const map = {
    'KPI-001': {
      label: 'Revenue Growth', color: '#2563eb',
      insightSummary: `${ctx.plant} order intake ${m.growth >= 1 ? 'up' : 'down'} to ${moneyM(orderVal)} (${f.timeRange}). ${m.growth >= 1.1 ? `+${round((m.growth - 1) * 100, 1)}% above baseline — ${customer} Q2 ramp and 2 late-stage deals worth ${moneyM(round(orderVal * 0.35, 1))} pending signature.` : `Revenue below baseline. ${customer} pipeline stalled — commercial action needed within 10 days or deals reopen to ${ctx.competitor}.`}`,
      recommendation: `Unblock ${customer} late-stage ${f.productLine} contracts to realize ${moneyM(round(orderVal * 0.3, 1))}–${moneyM(round(orderVal * 0.4, 1))} incremental revenue. ${m.growth >= 1 ? `Deal window open — act within 10 days. Pricing concession playbook is approved.` : `Revenue recovery requires commercial decision + pricing realignment at ${ctx.plant}.`}`,
      relevantDecisionIds: ['DEC-001', 'DEC-004'],
      relevantSignalCategories: ['Market & Business', 'Commercial', 'Benchmarking & Perception'],
    },
    'KPI-003': {
      label: 'Profit Margin', color: '#7c3aed',
      insightSummary: `Margin at ${ctx.plant} is ${marginVal}% (${m.margin >= 1 ? `+${round((m.margin - 1) * 100, 1)}pp above baseline` : `${round((1 - m.margin) * 100, 1)}pp below baseline`}). ${m.margin < 1 ? `Two cost drags: (1) ${pCtx.scrapType} adding ~80bps on ${pCtx.assy}. (2) ${ctx.supplierX} expedite premium ~40bps. Combined: ${round(Math.abs(kpis.operatingMargin.value - marginVal), 1)}pp drag on ${f.productLine}.` : `${f.productLine} margin premium driven by mix efficiency and ${ctx.plant} utilization.`}`,
      recommendation: `Margin recovery roadmap: (1) Quality sprint on ${pCtx.assy} — contain ${pCtx.scrapType} → save 80bps. (2) Dual-source ${pCtx.component} at ${ctx.plant} → remove expedite premium, save 40bps. Target: ${round(marginVal + 1.2, 1)}% margin within 45 days.`,
      relevantDecisionIds: ['DEC-002', 'DEC-003'],
      relevantSignalCategories: ['Supply Chain', 'Quality', 'Market & Business'],
    },
    'KPI-004': {
      label: 'Free Cash Flow', color: '#0891b2',
      insightSummary: `FCF at ${ctx.plant} is ${moneyM(cashVal)} — ${m.cash < 1 ? `${round((1 - m.cash) * 100, 1)}% below baseline. Inventory buffer build from ${ctx.supplierX} risk adding −$${round(12 * m.risk, 1)}M working capital pressure on ${f.productLine}.` : `${round((m.cash - 1) * 100, 1)}% above baseline. ${ctx.plant} cash position healthy for ${f.timeRange}.`}`,
      recommendation: `FCF recovery levers: (1) Close ${customer} ${f.productLine} deals → unlock ${moneyM(round(orderVal * 0.2, 1))} receivables. (2) Dual-source ${pCtx.component} → free $${round(8 * m.risk, 1)}M working capital. Target FCF: ${moneyM(round(cashVal * 1.15, 1))} in ${f.timeRange}.`,
      relevantDecisionIds: ['DEC-001', 'DEC-002'],
      relevantSignalCategories: ['Supply Chain', 'Commercial', 'Risk & Reputation'],
    },
    'KPI-005': {
      label: 'Order Intake', color: '#059669',
      insightSummary: `${Math.max(60, Math.round(orderVal * 5.8))} orders (${moneyM(orderVal)}) in ${f.timeRange} at ${ctx.plant} for ${f.productLine}. ${m.growth >= 1 ? `2 late-stage ${customer} deals represent ~35% of next quarter intake. Quote-to-order at ${round(24 * m.growth, 1)}% vs 28% target.` : `Order momentum below target. ${customer} pipeline slowing — tender response window: 10 days.`}`,
      recommendation: `Close 2 late-stage ${customer} OEM deals (worth ${moneyM(round(orderVal * 0.35, 1))}). Then activate ${f.productLine} services/retrofit for Q3 pipeline. Monitor quote-to-order conversion weekly at ${ctx.plant}.`,
      relevantDecisionIds: ['DEC-001', 'DEC-004'],
      relevantSignalCategories: ['Market & Business', 'Commercial', 'Benchmarking & Perception'],
    },
    'KPI-002': {
      label: 'Book-to-Bill', color: '#d97706',
      insightSummary: `B2B ratio at ${ctx.plant} is ${b2bVal}x vs 1.2x target (${f.productLine}, ${f.segment}). ${b2bVal < 1 ? `Backlog declining — new order closures urgent.` : b2bVal < 1.1 ? `Backlog growing slowly. ${customer} late-stage deals (+${round(b2bVal * 0.04, 2)}x) and services pipeline (+${round(b2bVal * 0.03, 2)}x) could reach 1.18x.` : `Backlog momentum strong at ${ctx.plant}. Pipeline conversion is the next lever to 1.2x.`}`,
      recommendation: `To reach 1.2x B2B at ${ctx.plant}: Close ${customer} ${f.productLine} deals (+${round(b2bVal * 0.04, 2)}x estimated) and launch services/retrofit pilot (+${round(b2bVal * 0.03, 2)}x). Review order intake vs shipped weekly.`,
      relevantDecisionIds: ['DEC-001', 'DEC-004'],
      relevantSignalCategories: ['Market & Business', 'Growth', 'Benchmarking & Perception'],
    },
    'KPI-006': {
      label: 'Safety (LTIFR)', color: '#dc2626',
      insightSummary: `LTIFR at ${ctx.plant} is ${ltifrVal} vs target 0.5. ${m.risk > 1 ? `Elevated risk: ${pCtx.assy} disruptions and ${ctx.supplierX} expediting increasing floor incident risk. ${ctx.plant} safety review due Apr 1.` : `Safety trending in right direction at ${ctx.plant}. ${pCtx.assy} line monitoring active during quality sprint.`}`,
      recommendation: `${m.risk > 1 ? `Suspend overtime on ${pCtx.assy} line during quality sprint — incidents correlate with extended shifts. Schedule ${ctx.plant} safety audit for Apr 1.` : `Maintain current safety protocols. LTIFR on track — continue weekly safety briefing cadence on ${pCtx.assy} line.`}`,
      relevantDecisionIds: ['DEC-003'],
      relevantSignalCategories: ['Risk & Reputation', 'Quality'],
    },
    'BASE-OTIF': {
      label: 'OTIF', color: '#0891b2',
      insightSummary: `OTIF at ${ctx.plant} is ${otifVal}% vs 96% target for ${f.productLine}. Gap: ${round(96 - otifVal, 1)}pp. Root causes: (1) ${ctx.supplierX} OTIF decline cascading to ${pCtx.assy} schedule. (2) ${pCtx.scrapType} on ${pCtx.assy} adding rework cycles at ${ctx.plant}.`,
      recommendation: `OTIF recovery (45 days): Dual-source ${pCtx.component} at ${ctx.plant} → +${round(Math.min(3, 96 - otifVal) * 0.6, 1)}pp. Contain ${pCtx.assy} ${pCtx.scrapType} → +${round(Math.min(2, 96 - otifVal) * 0.4, 1)}pp. Target: ${round(Math.min(96, otifVal + 3.5), 1)}% OTIF within 45 days.`,
      relevantDecisionIds: ['DEC-002', 'DEC-003'],
      relevantSignalCategories: ['Supply Chain', 'Risk & Reputation', 'Quality'],
    },
  };

  // ── Per-KPI Impact Indicators (shown in InsightsHub when KPI is selected) ──
  const kpiImpactMap = {
    'KPI-001': [ // Order Intake / Revenue Growth
      { id:'II-KPI001-1', label:'Pipeline Value (Late-Stage)', value: moneyM(round(orderVal * 0.38, 1)), target: moneyM(round(orderVal * 0.45, 1)), direction: m.growth >= 1 ? 'up' : 'down', note: `${customer} 2 deals in legal review — close window: 10 days`, color:'#2563eb' },
      { id:'II-KPI001-2', label:'Quote-to-Order Conversion', value: `${round(24 * m.growth * 0.98, 1)}%`, target:'28%', direction:'down', note:`${round(28 - 24 * m.growth * 0.98, 1)}pp below target — pricing alignment needed`, color:'#2563eb' },
      { id:'II-KPI001-3', label:'Book-to-Bill Ratio', value:`${b2bVal}×`, target:'1.2×', direction: b2bVal >= 1.15 ? 'up' : 'down', note:`Backlog growing; 2 late-stage deals could push to 1.18×`, color:'#2563eb' },
    ],
    'KPI-003': [ // Operating Margin
      { id:'II-KPI003-1', label:'Scrap Cost Drag', value:`-${round((1 - m.margin) * 100 + 0.8, 1)}bps`, target:'<50bps', direction:'down', note:`${pCtx.assy} ${pCtx.scrapType} adding ~80bps drag`, color:'#7c3aed' },
      { id:'II-KPI003-2', label:'Expedite Premium Cost', value:`-${round((1-m.margin)*100*0.5 + 40, 1)}bps`, target:'<20bps', direction:'down', note:`${ctx.supplierX} expedite fees embedded in unit cost`, color:'#7c3aed' },
      { id:'II-KPI003-3', label:'Target Margin Recovery', value:`${round(marginVal + 1.2, 1)}%`, target:`${round(marginVal + 2, 1)}%`, direction:'up', note:`Achievable in 45 days via quality sprint + dual-source`, color:'#7c3aed' },
    ],
    'KPI-004': [ // Free Cash Flow
      { id:'II-KPI004-1', label:'Working Capital Drag (Inventory)', value:`-${moneyM(round(12 * m.risk, 1))}`, target:'<-$6M', direction:'down', note:`Buffer stock build due to ${ctx.supplierX} risk at ${ctx.plant}`, color:'#0891b2' },
      { id:'II-KPI004-2', label:'Receivables Outstanding', value:`${moneyM(round(orderVal * 0.28, 1))}`, target:`${moneyM(round(orderVal * 0.22, 1))}`, direction:'down', note:`${customer} payment terms extension adding DSO pressure`, color:'#0891b2' },
      { id:'II-KPI004-3', label:'FCF Recovery (Deal Close)', value:`+${moneyM(round(orderVal * 0.2, 1))}`, target:`${moneyM(round(cashVal * 1.15, 1))}`, direction:'up', note:`Closing ${customer} deals unlocks receivables in 30 days`, color:'#0891b2' },
    ],
    'KPI-005': [ // OTIF
      { id:'II-KPI005-1', label:'OTIF Current', value:`${otifVal}%`, target:'96%', direction:'down', note:`${round(96 - otifVal, 1)}pp gap — ${ctx.supplierX} and ${pCtx.assy} scrap are root causes`, color:'#059669' },
      { id:'II-KPI005-2', label:'Supplier X OTIF', value:`91%`, target:'97%', direction:'down', note:`${ctx.supplierX} declining over 4 weeks — dual-source decision active`, color:'#059669' },
      { id:'II-KPI005-3', label:'Penalty Exposure (OTIF clauses)', value:`$0.8M–$1.6M`, target:'$0', direction:'down', note:`${customer} contract has OTIF-linked penalty clauses`, color:'#059669' },
    ],
    'KPI-002': [ // Book-to-Bill
      { id:'II-KPI002-1', label:'Backlog (Current)', value:`${moneyM(round(orderVal * 0.82, 1))}`, target:`${moneyM(round(orderVal * 1.0, 1))}`, direction: b2bVal >= 1.1 ? 'up' : 'down', note:`Backlog vs shipped — ${b2bVal < 1.15 ? 'growing slowly, 2 deals pending' : 'on track'}`, color:'#d97706' },
      { id:'II-KPI002-2', label:'New Order Intake (Pipeline)', value:`${moneyM(round(orderVal * 0.35, 1))}`, target:`${moneyM(round(orderVal * 0.42, 1))}`, direction:'down', note:`2 late-stage ${customer} deals; services pipeline developing`, color:'#d97706' },
      { id:'II-KPI002-3', label:'Services/Retrofit Pipeline', value:`$4M–$8M`, target:'$10M+', direction:'up', note:`Bajaj Tier-1 signal + installed base retrofit opportunity`, color:'#d97706' },
    ],
    'KPI-006': [ // Safety LTIFR
      { id:'II-KPI006-1', label:'LTIFR (Current)', value:`${ltifrVal}`, target:'0.5', direction: ltifrVal <= 0.6 ? 'up' : 'down', note:`${ctx.plant} — Apr 1 safety review scheduled`, color:'#dc2626' },
      { id:'II-KPI006-2', label:'Overtime Hours (This Month)', value: m.risk > 1 ? '+18%' : '+4%', target:'<10%', direction: m.risk > 1 ? 'down' : 'up', note: m.risk > 1 ? `Elevated overtime on ${pCtx.assy} during quality sprint — incident risk` : 'Normal overtime levels maintained', color:'#dc2626' },
      { id:'II-KPI006-3', label:'Near-Miss Reports (30D)', value: m.risk > 1 ? '6' : '2', target:'<3', direction: m.risk > 1 ? 'down' : 'up', note:`${ctx.plant} floor — correlates with ${pCtx.assy} rework cycle disruptions`, color:'#dc2626' },
    ],
    'BASE-OTIF': [ // OTIF (alias)
      { id:'II-OTIF-1', label:'OTIF Current', value:`${otifVal}%`, target:'96%', direction:'down', note:`${round(96 - otifVal, 1)}pp gap`, color:'#0891b2' },
      { id:'II-OTIF-2', label:'Supplier X OTIF', value:'91%', target:'97%', direction:'down', note:`${ctx.supplierX} — dual-source decision pending`, color:'#0891b2' },
      { id:'II-OTIF-3', label:'Penalty Exposure', value:'$0.8M–$1.6M', target:'$0', direction:'down', note:`OTIF-linked penalty clauses at ${customer}`, color:'#0891b2' },
    ],
  };

  // ── Per-KPI Downside Risks ────────────────────────────────────
  const kpiRiskMap = {
    'KPI-001': [
      { id:'R-KPI001-1', label:`${customer} late-stage deals miss signature window`, detail:`Revenue shifts out of quarter — ${moneyM(round(orderVal * 0.35, 1))} order intake at risk if not resolved in 10 days`, severity:'high', related_decision:'DEC-001' },
      { id:'R-KPI001-2', label:`${ctx.competitor} re-enters with aggressive pricing`, detail:`Competitor reactivated bid in ${ctx.region} — pricing undercut up to 8–12% on ${f.productLine} program`, severity:'high', related_decision:'DEC-001' },
      { id:'R-KPI001-3', label:'Services pipeline not captured — Bajaj interest cooling', detail:`$4M–$14M/year recurring revenue missed if no pilot engagement within 30 days. ${ctx.competitor} probing same space.`, severity:'medium', related_decision:'DEC-004' },
    ],
    'KPI-003': [
      { id:'R-KPI003-1', label:`${pCtx.assy} scrap rate escalates further`, detail:`Current 3.4% — each 1pp increase adds ~40bps margin drag. Ford audit in 18 days.`, severity:'high', related_decision:'DEC-003' },
      { id:'R-KPI003-2', label:`${ctx.supplierX} expedite costs persist`, detail:`Each additional week of single-source exposure adds $${round(0.3 * m.risk, 1)}M incremental premium cost at ${ctx.plant}`, severity:'medium', related_decision:'DEC-002' },
      { id:'R-KPI003-3', label:'Steel/raw material cost spike widens margin gap', detail:`Steel +6% in 30 days not yet fully priced in. If continued, further 30–50bps headwind on ${f.productLine} margin`, severity:'medium', related_decision:'DEC-001' },
    ],
    'KPI-004': [
      { id:'R-KPI004-1', label:'Inventory buffer build continues unchecked', detail:`Each week of ${ctx.supplierX} risk adds $${round(1.2 * m.risk, 1)}M working capital drag. Currently at -$${round(12 * m.risk, 1)}M.`, severity:'high', related_decision:'DEC-002' },
      { id:'R-KPI004-2', label:`${customer} payment terms extension compresses FCF`, detail:`End-of-quarter discount request from ${customer} adds DSO risk — potential -$${round(orderVal * 0.08, 1)}M additional receivables`, severity:'medium', related_decision:'DEC-001' },
      { id:'R-KPI004-3', label:'Capex decision on second shift delayed', detail:`Detroit at 92% utilization — without decision, emergency capex likely in Q3 at 2× planned cost`, severity:'low', related_decision:'DEC-002' },
    ],
    'KPI-005': [
      { id:'R-KPI005-1', label:`${pCtx.assy} production stoppage — ${ctx.supplierX} miss`, detail:`If ${ctx.supplierX} misses another delivery, Axle-B line halts within 3 weeks. OTIF drops to ~87%.`, severity:'high', related_decision:'DEC-002' },
      { id:'R-KPI005-2', label:`${customer} OTIF penalty clauses trigger`, detail:`OTIF below 92% activates ${customer} contractual performance review — est. penalty $0.8M–$1.6M`, severity:'high', related_decision:'DEC-003' },
      { id:'R-KPI005-3', label:'Ford Q2 ramp commitment at risk', detail:`Ford Q2 volume ramp starts in 6 weeks. Detroit at 92% utilization with current quality issues — cannot absorb +40% volume without action`, severity:'medium', related_decision:'DEC-001' },
    ],
    'KPI-002': [
      { id:'R-KPI002-1', label:'Backlog slips below 1.0× if deals slip', detail:`2 late-stage ${customer} deals (+0.06× B2B) lost → ratio drops to ~${round(b2bVal - 0.06, 2)}× — below break-even backlog level`, severity:'high', related_decision:'DEC-001' },
      { id:'R-KPI002-2', label:'Services/retrofit revenue not captured in backlog', detail:`$4M–$14M/year retrofit pipeline requires commitment now. Without DEC-004 action, Bajaj cools and ${ctx.competitor} captures installed base`, severity:'medium', related_decision:'DEC-004' },
      { id:'R-KPI002-3', label:'Quote-to-order ratio declines further', detail:`Current 24% vs 28% target. Without pricing alignment at ${ctx.plant}, conversion gap widens — impacting Q2 book-to-bill`, severity:'low', related_decision:'DEC-001' },
    ],
    'KPI-006': [
      { id:'R-KPI006-1', label:`Overtime + quality sprint increases incident risk at ${ctx.plant}`, detail:`LTIFR at ${ltifrVal} vs 0.5 target. Extended shifts on ${pCtx.assy} during TQM sprint correlated with near-miss increase`, severity: m.risk > 1 ? 'high' : 'medium', related_decision:'DEC-003' },
      { id:'R-KPI006-2', label:'Regulatory safety audit flag — Apr 1 deadline', detail:`${ctx.plant} safety review due Apr 1. LTIFR above 0.8 may trigger ${ctx.regulator} notification requirement`, severity:'medium', related_decision:'DEC-003' },
      { id:'R-KPI006-3', label:'Worker confidence impact slows ${pCtx.assy} throughput', detail:`Safety incidents slow floor confidence during quality sprint — risk of further OTIF and scrap rate impact`, severity:'low', related_decision:'DEC-003' },
    ],
    'BASE-OTIF': [
      { id:'R-OTIF-1', label:`${pCtx.assy} line stoppage — ${ctx.supplierX} miss`, detail:`OTIF drops to ~87% if ${ctx.supplierX} misses another delivery. ${customer} contract triggers penalty.`, severity:'high', related_decision:'DEC-002' },
      { id:'R-OTIF-2', label:`${customer} OTIF penalty: $0.8M–$1.6M`, detail:`Penalty clauses activate below 92% OTIF sustained for 2+ weeks`, severity:'high', related_decision:'DEC-003' },
      { id:'R-OTIF-3', label:'Ford Q2 volume ramp blocked by capacity + quality', detail:`Cannot add 40% volume at Detroit — 92% utilization + scrap issue = hard ceiling`, severity:'medium', related_decision:'DEC-001' },
    ],
  };

  const entry = map[kpiId];
  if (!entry) return null;
  return {
    label: entry.label,
    color: entry.color,
    insightSummary: entry.insightSummary,
    recommendation: entry.recommendation,
    relevantDecisionIds: entry.relevantDecisionIds,
    relevantSignalCategories: entry.relevantSignalCategories,
    impactIndicators: kpiImpactMap[kpiId] || [],
    downsideRisks: kpiRiskMap[kpiId] || [],
  };
}

// ─── Board Brief ─────────────────────────────────────────────────
export function buildBoardBrief(filters, decisionState = {}) {
  const slice = getDashboardSlice(filters, decisionState);
  const d = slice.decisions[0];
  if (!d) return null;
  return {
    title: `${d.ref}: ${d.title}`,
    whyNow: d.why_now,
    confidence: `${d.confidence} (${d.confidence_pct}%)`,
    impact: d.impact_range,
    valueAtStake: d.value_at_stake,
    evidence: d.evidence_details?.slice(0, 3) || [],
    actions: d.suggested_actions?.slice(0, 3) || [],
    generatedAt: '2026-03-16T09:00:00Z',
    scope: slice.filters,
  };
}
