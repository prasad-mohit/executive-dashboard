// AnalystStudio — The killer differentiator feature
// Analyst builds custom prompts against real data feeds → shares insights directly to CEO view
// CEO sees analyst-curated insights in InsightsHub — no other tool does this
import { useState, useCallback } from 'react';
import { usePrompts } from '../contexts/PromptContext';
import { useAuth } from '../contexts/AuthContext';
import { useFilters } from '../contexts/FilterContext';

// ── Mock AI insight generator ─────────────────────────────────────
// Maps natural language prompts to structured insight responses using mock GIS data
function generateInsight(promptText, kpiFocus, sources, filters) {
  const p = promptText.toLowerCase();
  const isRevenue   = /revenue|sales|booking|pipeline|arr|customer|order|deal/i.test(p);
  const isSupply    = /supply|logistics|inventory|procure|supplier|lead.?time|sourcing|vendor/i.test(p);
  const isQuality   = /quality|defect|scrap|dppm|warranty|reject|inspection|audit/i.test(p);
  const isRisk      = /risk|compliance|regulator|safety|legal|exposure|liability|hazard/i.test(p);
  const isWorkforce = /headcount|workforce|team|hiring|attrition|capacity|skill|talent/i.test(p);
  const isMarket    = /market|compet|pricing|demand|segment|share|competitor|price/i.test(p);
  const isMargin    = /margin|cost|ebitda|profit|opex|capex|overhead|efficiency/i.test(p);

  if (isRevenue) return {
    headline: 'Revenue Position & Pipeline Analysis',
    summary: `YTD revenue for ${filters.site} is $127.4M vs $135M target (94.4%). Gap of $7.6M is concentrated in 3 accounts: Magna International (PO delayed Q2, ≈$2.8M), Bosch NA (re-phasing to Q3, ≈$4.1M), and new EV drivetrain pipeline conversion running 18% below forecast (≈$0.7M headwind). CRM pipeline coverage ratio stands at 2.3× — healthy. Win rate YTD: 38% on competitive deals.`,
    keyPoints: [
      { label:'YTD Revenue',      value:'$127.4M',  vs:'Target $135M',     flag:'warn', trend:'down' },
      { label:'Pipeline Coverage',value:'2.3×',     vs:'Target 2.0× min',  flag:'ok',   trend:'up'   },
      { label:'Win Rate',         value:'38%',       vs:'Prior year 41%',   flag:'warn', trend:'down' },
      { label:'Top Risk Account', value:'Bosch NA',  vs:'$4.1M at risk',    flag:'alert',trend:'down' },
    ],
    recommendation: 'Prioritise CEO-level outreach to Bosch NA this week — re-phasing risk is recoverable with Q3 commitment. Fast-track 2 EV drivetrain proposals in final review (combined $4.2M). Commission a 15-day sprint on Magna re-engagement. Achievable to close within 5% of target by June 30.',
    confidence: 87,
    sources: ['CRM: 18,400 account records', 'ERP: 42,800 order transactions', 'Meetings: 48 customer calls'],
  };

  if (isSupply) return {
    headline: 'Supply Chain Risk & Exposure Report',
    summary: `7 active supply chain risks identified across ${filters.site} operations. Financial exposure: $3.1M total. Top risk: Titanium Grade 5 from Bharat Forge — 18-day lead time slippage impacting 3 production orders (SAP PO-8821, PO-8847, PO-8902). Chennai port congestion adding 4-7 days transit. SKFY Bearings requesting 12% price increase effective May 1.`,
    keyPoints: [
      { label:'Active Supply Risks', value:'7',      vs:'Up from 3 last month',      flag:'alert', trend:'down' },
      { label:'Financial Exposure',  value:'$3.1M',  vs:'Budget tolerance $1.5M',    flag:'alert', trend:'down' },
      { label:'On-Time Delivery',    value:'84.2%',  vs:'Target 92%',                flag:'warn',  trend:'down' },
      { label:'Safety Stock',        value:'9 SKUs', vs:'Below 2-week threshold',    flag:'warn',  trend:'down' },
    ],
    recommendation: 'Immediately pre-buy 6-month Titanium supply (≈$980K). Evaluate dual-sourcing for SKFY bearings before May 1 — 2 approved alternates available. Activate air freight for 3 critical POs to avoid production stoppage. Estimated cost: $84K vs $1.1M production loss. Escalate Chennai routing to logistics team today.',
    confidence: 91,
    sources: ['ERP: 42,800 PO/inventory records', 'News: 124 supply chain alerts', 'Supplier portal data'],
  };

  if (isQuality) return {
    headline: 'Quality Performance & Defect Trend Analysis',
    summary: `Quality metrics for ${filters.site} show mixed performance. DPPM (defects per million parts) at 284 — within target of 300 but up 18% vs prior quarter. Scrap rate trending up to 2.8% driven by new EV drivetrain tooling (Line 4 accounts for 62% of scrap). 3 customer warranty claims opened this month: BorgWarner (brake caliper finish), Denso (seal leakage), Continental (dimensional tolerance). Customer audit from Toyota scheduled April 14 — current readiness: 78%.`,
    keyPoints: [
      { label:'DPPM',           value:'284',   vs:'Target < 300',         flag:'ok',   trend:'up'   },
      { label:'Scrap Rate',     value:'2.8%',  vs:'Target 2.0%',          flag:'warn', trend:'down' },
      { label:'Warranty Claims',value:'3',     vs:'0 same period prior',  flag:'alert',trend:'down' },
      { label:'Audit Readiness',value:'78%',   vs:'Need 90%+ for Toyota', flag:'warn', trend:'up'   },
    ],
    recommendation: 'Prioritise Line 4 tooling calibration this week — $1.2M scrap cost savings achievable. Assign quality engineer to 3 warranty claims for root cause by April 5. Schedule mock Toyota audit this Friday to identify readiness gaps. Focus on 4 control points where Cpk < 1.33.',
    confidence: 83,
    sources: ['ERP: Quality module — 8,400 inspection records', 'CRM: 3 warranty cases', 'HR: Quality team capacity'],
  };

  if (isWorkforce) return {
    headline: 'Workforce Capacity & Skills Gap Analysis',
    summary: `GIS workforce across 3 plants totals 3,200 employees. Detroit plant running at 78% certified capacity for Q2 production surge — 14 Grade-5 machinists below threshold. Plano Texas at 91% (healthy). Pune at 88%. Attrition YTD: 8.4% (above 6% target). Top attrition risk: 12 senior engineers with > 8 years tenure — critical institutional knowledge. HR forecasts $2.1M overtime cost in Q2 if not addressed.`,
    keyPoints: [
      { label:'Detroit Capacity',  value:'78%',  vs:'Target 85% min',        flag:'warn', trend:'down' },
      { label:'YTD Attrition',     value:'8.4%', vs:'Target 6.0%',           flag:'warn', trend:'down' },
      { label:'Q2 Overtime Proj.', value:'$2.1M',vs:'Budget $0.8M',          flag:'alert',trend:'down' },
      { label:'Open Critical Roles',value:'22',  vs:'Time-to-fill: 68 days', flag:'warn', trend:'down' },
    ],
    recommendation: 'Engage 2 contract staffing firms for Detroit (14 machinists needed by April 20). Launch retention program for 12 high-risk senior engineers — targeted comp adjustment ~$380K annually vs $2.4M replacement cost. Fast-track 6 internal promotions to fill critical roles. Recommend CEO to present growth roadmap at April 15 town hall.',
    confidence: 79,
    sources: ['HR Workday: 3,200 employee records', 'ERP: Production capacity data', 'Payroll: Overtime actuals'],
  };

  if (isMarket) return {
    headline: 'Market Position & Competitive Intelligence',
    summary: `GIS holds 12.4% market share in precision automotive components — up 0.8pp vs prior year. EV drivetrain segment is the growth catalyst (34% revenue CAGR projected). Key competitive threats: Parker Hannifin filed 2 new braking patents (monitoring), Schaeffler expanding India capacity (+40%), Bosch announcing 8% price reduction on standard axle components effective Q3. GIS EV pipeline: $48M qualified, $12M in final stages.`,
    keyPoints: [
      { label:'Market Share',      value:'12.4%', vs:'+0.8pp vs prior year',    flag:'ok',   trend:'up'  },
      { label:'EV Pipeline',       value:'$48M',  vs:'Target $60M by year-end', flag:'warn', trend:'up'  },
      { label:'Competitor Threat', value:'High',  vs:'Bosch -8% price move',    flag:'alert',trend:'down'},
      { label:'Win Rate vs Tier-1',value:'44%',   vs:'+3pp vs last quarter',    flag:'ok',   trend:'up'  },
    ],
    recommendation: 'Accelerate EV drivetrain commercialisation — close $12M pipeline in Q2. Respond to Bosch price move with 5% targeted rebate for OEM accounts at risk (exposure: $8M). Increase India R&D investment by $2M to compete with Schaeffler capacity expansion. Position GIS as quality-premium alternative in customer conversations.',
    confidence: 85,
    sources: ['CRM: Competitor tracking', 'News: 284 competitor intel records', 'Bloomberg: Market data'],
  };

  if (isMargin) return {
    headline: 'Margin & Cost Efficiency Analysis',
    summary: `Gross margin YTD at 38.2% vs 40% target — 180bps below. Primary margin drag: steel & aluminium input costs up 12% (impact: -140bps), scrap rate elevation on Line 4 (-40bps). EBITDA at $18.4M (23.4% rate) — trending below $20M annual target. Q1 cost savings programme delivered $2.8M vs $4M target. Expedite freight costs up $680K vs prior year due to supply disruptions.`,
    keyPoints: [
      { label:'Gross Margin',       value:'38.2%', vs:'Target 40.0%',        flag:'warn', trend:'down' },
      { label:'EBITDA',             value:'$18.4M',vs:'Target $20M run-rate', flag:'warn', trend:'down' },
      { label:'Cost Save Delivery', value:'$2.8M', vs:'Target $4M',          flag:'warn', trend:'up'   },
      { label:'Input Cost Inflation',value:'+12%', vs:'Budget +5%',          flag:'alert',trend:'down' },
    ],
    recommendation: 'Immediately hedge 60% of Q3 steel requirements at current rates before next Fed announcement. Resolve Line 4 scrap (saves ≈$1.2M margin). Renegotiate 3 logistics contracts up for renewal in May — benchmark suggests 8-12% savings. Defer 2 non-critical capex items ($1.4M) to protect cash. Target: recover 80-100bps by Q3.',
    confidence: 88,
    sources: ['ERP: GL and cost centre data', 'Bloomberg: Commodity indices', 'ERP: Production cost actuals'],
  };

  if (isRisk) return {
    headline: 'Enterprise Risk Exposure Assessment',
    summary: `4 active high-severity risks identified across ${filters.site}. Regulatory: EU CBAM (Carbon Border Adjustment) effective Jan 2027 — GIS India operations require carbon disclosure by Q4 2026 (readiness: 32%). Legal: 1 active product liability claim (BorgWarner brake caliper, estimated $800K exposure, 70% likelihood). Cyber: ISO 27001 audit due May 2026 — 3 critical gaps identified. Reputational: ESG score at 48/100 — below customer threshold of 60 for Tier-1 renewal.`,
    keyPoints: [
      { label:'High Severity Risks', value:'4',      vs:'Up from 2 last quarter',   flag:'alert',trend:'down' },
      { label:'CBAM Readiness',      value:'32%',    vs:'Need 80% by Q4 2026',      flag:'alert',trend:'up'   },
      { label:'Legal Exposure',      value:'$800K',  vs:'Provisioned $200K',        flag:'warn', trend:'down' },
      { label:'ESG Score',           value:'48/100', vs:'Customer threshold: 60',   flag:'warn', trend:'up'   },
    ],
    recommendation: 'Activate CBAM compliance programme immediately — appoint dedicated lead, budget $240K. Increase legal provision for BorgWarner claim to $600K. Close 3 ISO 27001 gaps before May (estimated 3 weeks effort). Accelerate ESG programme — target 62+ score by Dec 2026 to protect Tier-1 renewals worth $24M.',
    confidence: 82,
    sources: ['ERP: Compliance module', 'News: Regulatory intelligence', 'CRM: Customer risk flags'],
  };

  // Default: operational summary
  return {
    headline: 'Operational Intelligence Summary',
    summary: `Cross-functional operational analysis for ${filters.site} (${filters.timeRange}) reveals 3 priority areas requiring executive attention: Revenue gap of $7.6M vs target driven by 2 customer re-phasings; Supply chain exposure of $3.1M with 7 active risks; Detroit plant capacity at 78% ahead of Q2 surge. Overall operational health: 72/100 — below 80 target.`,
    keyPoints: [
      { label:'Revenue vs Target',  value:'94.4%', vs:'$7.6M gap',         flag:'warn', trend:'up'   },
      { label:'Supply Risk Expo.',  value:'$3.1M', vs:'Budget $1.5M',      flag:'alert',trend:'down' },
      { label:'Detroit Capacity',   value:'78%',   vs:'Target 85%',        flag:'warn', trend:'down' },
      { label:'Ops Health Score',   value:'72/100',vs:'Target 80+',        flag:'warn', trend:'up'   },
    ],
    recommendation: 'Convene a 90-minute executive review covering: (1) Revenue recovery plan for Bosch/Magna, (2) Supply chain pre-buy authorisation for Titanium, (3) Detroit capacity plan. All 3 are solvable with decisions this week. Combined impact of inaction: ~$4.8M in Q2 earnings risk.',
    confidence: 76,
    sources: ['ERP', 'CRM', 'HR Workday', 'News feeds'],
  };
}

const FLAG_STYLE = {
  ok:    { bg:'#f0fdf4', color:'#15803d', border:'#bbf7d0', icon:'✓' },
  warn:  { bg:'#fef9c3', color:'#92400e', border:'#fde68a', icon:'⚠' },
  alert: { bg:'#fef2f2', color:'#991b1b', border:'#fecaca', icon:'!' },
};

const KPI_OPTS = ['All KPIs','Revenue (KPI-001)','EBITDA Margin (KPI-003)','Scrap Rate (KPI-004)','On-Time Delivery (KPI-005)','Cash Conversion (KPI-002)','EV Pipeline (KPI-006)'];
const SRC_OPTS = ['ERP','CRM','HR','News','Market','Email','IoT'];
const TIME_OPTS = ['Last 30 days','Last 60 days','Last 90 days','YTD','Last 12 months'];

// ── Insight card (output) ─────────────────────────────────────────
function InsightCard({ insight, onShare, onCopy, onSave, alreadyShared }) {
  if (!insight) return null;
  return (
    <div style={{ background:'#ffffff', border:'1.5px solid #7c3aed30', borderRadius:12,
      overflow:'hidden', boxShadow:'0 2px 10px rgba(124,58,237,0.08)' }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,#7c3aed,#4f46e5)', padding:'14px 18px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
          <span style={{ fontSize:14, fontWeight:800, color:'#ffffff' }}>🔬 {insight.headline}</span>
          <span style={{ marginLeft:'auto', fontSize:11, fontWeight:700, background:'rgba(255,255,255,0.2)',
            color:'#ffffff', padding:'3px 10px', borderRadius:99 }}>
            AI Confidence: {insight.confidence}%
          </span>
        </div>
        {/* Confidence bar */}
        <div style={{ marginTop:8, height:4, borderRadius:99, background:'rgba(255,255,255,0.2)', overflow:'hidden' }}>
          <div style={{ height:'100%', borderRadius:99, background:'rgba(255,255,255,0.85)',
            width:`${insight.confidence}%`, transition:'width 1s ease' }}/>
        </div>
      </div>

      <div style={{ padding:'16px 18px', display:'flex', flexDirection:'column', gap:14 }}>
        {/* Summary */}
        <div style={{ fontSize:12, color:'#334155', lineHeight:1.75 }}>{insight.summary}</div>

        {/* Key metrics */}
        <div>
          <div style={{ fontSize:10, fontWeight:700, color:'#94a3b8', textTransform:'uppercase',
            letterSpacing:1, marginBottom:8 }}>Key Metrics</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
            {insight.keyPoints.map((kp, i) => {
              const f = FLAG_STYLE[kp.flag] || FLAG_STYLE.warn;
              return (
                <div key={i} style={{ background:f.bg, border:`1px solid ${f.border}`,
                  borderRadius:9, padding:'10px 12px' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:4 }}>
                    <span style={{ fontSize:11, fontWeight:700, color:f.color }}>{f.icon}</span>
                    <span style={{ fontSize:10, fontWeight:700, color:'#64748b' }}>{kp.label}</span>
                    <span style={{ fontSize:10, color:kp.trend === 'up' ? '#16a34a' : '#dc2626',
                      marginLeft:'auto' }}>{kp.trend === 'up' ? '▲' : '▼'}</span>
                  </div>
                  <div style={{ fontSize:18, fontWeight:900, color:f.color, lineHeight:1.1 }}>{kp.value}</div>
                  <div style={{ fontSize:10, color:'#94a3b8', marginTop:2 }}>{kp.vs}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recommendation */}
        <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:9, padding:'12px 14px' }}>
          <div style={{ fontSize:10, fontWeight:700, color:'#2563eb', marginBottom:6,
            textTransform:'uppercase', letterSpacing:0.8 }}>Executive Recommendation</div>
          <div style={{ fontSize:12, color:'#1e40af', lineHeight:1.7 }}>{insight.recommendation}</div>
        </div>

        {/* Data sources */}
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          <span style={{ fontSize:10, fontWeight:700, color:'#94a3b8' }}>Sources:</span>
          {insight.sources.map((s, i) => (
            <span key={i} style={{ fontSize:10, background:'#f8fafc', color:'#475569',
              border:'1px solid #e2e8f0', padding:'2px 8px', borderRadius:99 }}>
              {s}
            </span>
          ))}
          <span style={{ marginLeft:'auto', fontSize:10, color:'#94a3b8' }}>
            Generated {new Date().toLocaleTimeString()}
          </span>
        </div>

        {/* CTAs */}
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', paddingTop:4,
          borderTop:'1px solid #f1f5f9' }}>
          {alreadyShared ? (
            <div style={{ flex:1, fontSize:12, fontWeight:700, padding:'10px 0', borderRadius:9,
              background:'#f0fdf4', color:'#15803d', border:'1px solid #bbf7d0', textAlign:'center' }}>
              ✓ Shared with CEO — visible in Insights Hub
            </div>
          ) : (
            <button onClick={onShare}
              style={{ flex:2, fontSize:12, fontWeight:800, padding:'10px 0', borderRadius:9,
                background:'linear-gradient(135deg,#f59e0b,#d97706)', color:'#ffffff',
                border:'none', cursor:'pointer', boxShadow:'0 2px 8px rgba(245,158,11,0.3)' }}>
              📤 Share with CEO — Marcus Gaksh
            </button>
          )}
          <button onClick={onSave}
            style={{ flex:1, fontSize:12, fontWeight:700, padding:'10px 0', borderRadius:9,
              background:'#7c3aed', color:'#ffffff', border:'none', cursor:'pointer' }}>
            💾 Save
          </button>
          <button onClick={onCopy}
            style={{ fontSize:12, fontWeight:700, padding:'10px 16px', borderRadius:9,
              background:'#f8fafc', color:'#475569', border:'1px solid #e2e8f0', cursor:'pointer' }}>
            📋
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Saved prompt card ─────────────────────────────────────────────
function SavedPromptCard({ p, onShare, onDelete, onRecall }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:10, overflow:'hidden' }}>
      <div onClick={() => setOpen(v => !v)}
        style={{ padding:'12px 15px', cursor:'pointer', display:'flex', alignItems:'flex-start', gap:10 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4, flexWrap:'wrap' }}>
            <span style={{ fontSize:12, fontWeight:700, color:'#0f172a' }}>{p.title}</span>
            {p.shared && (
              <span style={{ fontSize:10, fontWeight:700, background:'#fef9c3', color:'#92400e',
                border:'1px solid #fde68a', padding:'1px 7px', borderRadius:99 }}>
                📤 Shared with CEO
              </span>
            )}
            {p.kpiFocus && p.kpiFocus !== 'All KPIs' && (
              <span style={{ fontSize:10, background:'#eff6ff', color:'#2563eb',
                border:'1px solid #bfdbfe', padding:'1px 6px', borderRadius:99 }}>{p.kpiFocus}</span>
            )}
          </div>
          <div style={{ fontSize:11, color:'#64748b', lineHeight:1.5 }}>
            {(p.prompt || '').substring(0,100)}{(p.prompt || '').length > 100 ? '…' : ''}
          </div>
          <div style={{ fontSize:10, color:'#94a3b8', marginTop:4 }}>
            Saved {p.createdAt}{p.sharedAt ? ` · Shared ${p.sharedAt}` : ''}
          </div>
        </div>
        <span style={{ fontSize:12, color:'#94a3b8', flexShrink:0 }}>{open ? '▲' : '▼'}</span>
      </div>

      {open && p.output && (
        <div style={{ borderTop:'1px solid #f1f5f9', padding:'12px 15px',
          background:'#fafbfc', display:'flex', flexDirection:'column', gap:10 }}>
          <div style={{ fontSize:11, color:'#334155', lineHeight:1.7 }}>{p.output.summary}</div>
          <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:8,
            padding:'10px 12px', fontSize:11, color:'#1e40af', lineHeight:1.6 }}>
            {p.output.recommendation}
          </div>
          <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
            {p.shared ? (
              <button onClick={() => onRecall(p.id)}
                style={{ fontSize:11, fontWeight:700, padding:'7px 14px', borderRadius:8,
                  background:'#fef9c3', color:'#92400e', border:'1px solid #fde68a', cursor:'pointer' }}>
                ↩ Recall from CEO view
              </button>
            ) : (
              <button onClick={() => onShare(p)}
                style={{ fontSize:11, fontWeight:700, padding:'7px 14px', borderRadius:8,
                  background:'linear-gradient(135deg,#f59e0b,#d97706)', color:'#ffffff',
                  border:'none', cursor:'pointer' }}>
                📤 Share with CEO
              </button>
            )}
            <button onClick={() => onDelete(p.id)}
              style={{ fontSize:11, fontWeight:700, padding:'7px 12px', borderRadius:8,
                background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca', cursor:'pointer' }}>
              🗑 Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main AnalystStudio ────────────────────────────────────────────
export default function AnalystStudio() {
  const { user } = useAuth();
  const { filters } = useFilters();
  const { analystPrompts, saveAnalystPrompt, deleteAnalystPrompt, shareToExecutive, recallSharedInsight } = usePrompts();

  const [tab, setTab] = useState('builder');
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [kpiFocus, setKpiFocus] = useState('All KPIs');
  const [selSources, setSelSources] = useState(['ERP','CRM']);
  const [timeRange, setTimeRange] = useState('Last 30 days');
  const [generating, setGenerating] = useState(false);
  const [output, setOutput] = useState(null);
  const [currentId, setCurrentId] = useState(null);
  const [alreadyShared, setAlreadyShared] = useState(false);
  const [shareToast, setShareToast] = useState(false);
  const [copied, setCopied] = useState(false);

  const toggleSource = useCallback((src) => {
    setSelSources(prev => prev.includes(src) ? prev.filter(s => s !== src) : [...prev, src]);
  }, []);

  const handleRun = useCallback(() => {
    if (!prompt.trim()) return;
    setGenerating(true);
    setOutput(null);
    // Simulate AI processing delay
    setTimeout(() => {
      const result = generateInsight(prompt, kpiFocus, selSources, filters);
      setOutput(result);
      setGenerating(false);
    }, 1800);
  }, [prompt, kpiFocus, selSources, filters]);

  const handleSave = useCallback(() => {
    if (!output || !title) return;
    const promptObj = {
      id: currentId || `AP-${Date.now()}`,
      title: title || 'Untitled Insight',
      prompt, kpiFocus, sources: selSources, timeRange, output,
      createdAt: new Date().toLocaleString(),
    };
    saveAnalystPrompt(promptObj);
    setCurrentId(promptObj.id);
    setTab('library');
  }, [output, title, prompt, kpiFocus, selSources, timeRange, currentId, saveAnalystPrompt]);

  const handleShare = useCallback(() => {
    if (!output || !title) { alert('Please save the prompt first (add a title)'); return; }
    const promptObj = {
      id: currentId || `AP-${Date.now()}`,
      title: title || 'Untitled Insight',
      prompt, kpiFocus, sources: selSources, timeRange, output,
      createdAt: new Date().toLocaleString(),
    };
    if (!currentId) { saveAnalystPrompt(promptObj); setCurrentId(promptObj.id); }
    shareToExecutive(promptObj, user?.name || 'Analyst');
    setAlreadyShared(true);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 4000);
  }, [output, title, prompt, kpiFocus, selSources, timeRange, currentId, user, saveAnalystPrompt, shareToExecutive]);

  const handleCopy = useCallback(() => {
    if (!output) return;
    const text = `${output.headline}\n\n${output.summary}\n\nRecommendation:\n${output.recommendation}`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000);
    });
  }, [output]);

  const handleShareFromLibrary = useCallback((p) => {
    shareToExecutive(p, user?.name);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 4000);
  }, [shareToExecutive, user]);

  const sharedCount = analystPrompts.filter(p => p.shared).length;
  const totalCount  = analystPrompts.length;

  return (
    <div style={{ background:'#f4f6f9', minHeight:'100%', padding:'20px 24px',
      display:'flex', flexDirection:'column', gap:16 }}>

      {/* Share toast */}
      {shareToast && (
        <div style={{ position:'fixed', top:20, right:20, zIndex:9999,
          background:'linear-gradient(135deg,#f59e0b,#d97706)', color:'#ffffff',
          borderRadius:12, padding:'14px 20px', fontSize:13, fontWeight:700,
          boxShadow:'0 8px 30px rgba(245,158,11,0.35)', display:'flex', alignItems:'center', gap:10 }}>
          <span>📤</span>
          <div>
            <div>Insight shared with CEO!</div>
            <div style={{ fontSize:11, fontWeight:400, opacity:0.9, marginTop:2 }}>
              Marcus Gaksh will see it in Insights Hub
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
        <div>
          <div style={{ fontSize:18, fontWeight:900, color:'#0f172a' }}>Analyst Studio</div>
          <div style={{ fontSize:11, color:'#94a3b8', marginTop:2 }}>
            {user?.name} · Build insights from live data · share directly to CEO view — no other tool does this
          </div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <span style={{ fontSize:11, fontWeight:700, background:'#fdf4ff', color:'#9333ea',
            border:'1px solid #e9d5ff', padding:'5px 12px', borderRadius:99 }}>
            🔬 Analyst Role
          </span>
          {sharedCount > 0 && (
            <span style={{ fontSize:11, fontWeight:700, background:'#fef9c3', color:'#92400e',
              border:'1px solid #fde68a', padding:'5px 12px', borderRadius:99 }}>
              📤 {sharedCount} live with CEO
            </span>
          )}
        </div>
      </div>

      {/* Why this is different callout */}
      <div style={{ background:'linear-gradient(135deg,#faf5ff,#eff6ff)', border:'1px solid #ddd6fe',
        borderRadius:10, padding:'12px 16px', display:'flex', alignItems:'flex-start', gap:10 }}>
        <span style={{ fontSize:20, flexShrink:0 }}>⚡</span>
        <div>
          <div style={{ fontSize:12, fontWeight:800, color:'#6d28d9', marginBottom:3 }}>
            The differentiator: Analyst-to-CEO intelligence bridge
          </div>
          <div style={{ fontSize:11, color:'#4c1d95', lineHeight:1.6 }}>
            Write a natural language question about your data → the system generates a structured AI insight → you choose to share it directly to the CEO{`'`}s Insights Hub. No emails. No decks. No filters. Your analysis, in the CEO{`'`}s morning view, in real time.
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:0, background:'#ffffff', border:'1px solid #e2e8f0',
        borderRadius:10, padding:4, width:'fit-content' }}>
        {[
          { id:'builder', label:'Build Insight',   icon:'✨' },
          { id:'library', label:`My Prompts (${totalCount})`, icon:'📚' },
          { id:'shared',  label:`Shared with CEO (${sharedCount})`, icon:'📤' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ fontSize:12, fontWeight:700, padding:'8px 18px', borderRadius:7, border:'none',
              cursor:'pointer', transition:'all .12s',
              background: tab === t.id ? '#0f172a' : 'transparent',
              color:       tab === t.id ? '#ffffff'  : '#475569' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── Builder tab ────────────────────────────────────────── */}
      {tab === 'builder' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, alignItems:'start' }}>

          {/* Left: Input panel */}
          <div style={{ background:'#ffffff', border:'1px solid #e2e8f0', borderRadius:12,
            padding:'18px 20px', display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ fontSize:14, fontWeight:700, color:'#0f172a' }}>Ask your data anything</div>

            {/* Prompt title */}
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'#64748b', marginBottom:6, textTransform:'uppercase', letterSpacing:0.8 }}>Insight Title</div>
              <input value={title} onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Q2 Revenue Risk Analysis"
                style={{ width:'100%', fontSize:13, fontWeight:600, padding:'9px 12px', borderRadius:8,
                  border:'1px solid #e2e8f0', outline:'none', boxSizing:'border-box', color:'#0f172a' }}/>
            </div>

            {/* Context selectors */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'#64748b', marginBottom:6, textTransform:'uppercase', letterSpacing:0.8 }}>KPI Focus</div>
                <select value={kpiFocus} onChange={e => setKpiFocus(e.target.value)}
                  style={{ width:'100%', fontSize:11, padding:'8px 10px', borderRadius:7,
                    border:'1px solid #e2e8f0', background:'#ffffff', cursor:'pointer' }}>
                  {KPI_OPTS.map(k => <option key={k}>{k}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize:10, fontWeight:700, color:'#64748b', marginBottom:6, textTransform:'uppercase', letterSpacing:0.8 }}>Time Range</div>
                <select value={timeRange} onChange={e => setTimeRange(e.target.value)}
                  style={{ width:'100%', fontSize:11, padding:'8px 10px', borderRadius:7,
                    border:'1px solid #e2e8f0', background:'#ffffff', cursor:'pointer' }}>
                  {TIME_OPTS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>

            {/* Data sources */}
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'#64748b', marginBottom:8, textTransform:'uppercase', letterSpacing:0.8 }}>Data Sources</div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                {SRC_OPTS.map(src => (
                  <button key={src} onClick={() => toggleSource(src)}
                    style={{ fontSize:11, fontWeight:700, padding:'4px 11px', borderRadius:99,
                      background: selSources.includes(src) ? '#7c3aed' : '#f8fafc',
                      color: selSources.includes(src) ? '#ffffff' : '#475569',
                      border:`1px solid ${selSources.includes(src) ? '#7c3aed' : '#e2e8f0'}`,
                      cursor:'pointer', transition:'all .1s' }}>
                    {src}
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt text area */}
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'#64748b', marginBottom:6, textTransform:'uppercase', letterSpacing:0.8 }}>Your Question / Analysis Request</div>
              <textarea value={prompt} onChange={e => { setPrompt(e.target.value); setOutput(null); setAlreadyShared(false); }}
                rows={6} placeholder={`Ask anything about your business data...\n\nExamples:\n• "What is our current revenue risk for Q2?"\n• "Analyse our supply chain exposure and top risks"\n• "What is our workforce capacity for Detroit plant?"\n• "Where are our biggest margin improvement opportunities?"`}
                style={{ width:'100%', fontSize:12, padding:'10px 12px', borderRadius:8,
                  border:'1px solid #e2e8f0', outline:'none', resize:'vertical', lineHeight:1.6,
                  boxSizing:'border-box', fontFamily:'inherit', color:'#334155' }}/>
            </div>

            {/* Run button */}
            <button onClick={handleRun} disabled={!prompt.trim() || generating}
              style={{ width:'100%', fontSize:13, fontWeight:800, padding:'12px 0', borderRadius:9,
                background: (!prompt.trim() || generating)
                  ? '#e2e8f0'
                  : 'linear-gradient(135deg,#7c3aed,#4f46e5)',
                color: (!prompt.trim() || generating) ? '#94a3b8' : '#ffffff',
                border:'none', cursor: (!prompt.trim() || generating) ? 'default' : 'pointer',
                boxShadow: (!prompt.trim() || generating) ? 'none' : '0 4px 14px rgba(124,58,237,0.3)',
                transition:'all .15s' }}>
              {generating ? '⟳ Generating insight from live data…' : '▶ Run Insight'}
            </button>

            {/* Suggestions */}
            <div>
              <div style={{ fontSize:10, fontWeight:700, color:'#94a3b8', marginBottom:8 }}>TRY THESE →</div>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                {[
                  'What is our current Q2 revenue risk and which accounts are driving the gap?',
                  'Analyse our supply chain exposure and flag top 3 risks by financial impact',
                  'What is the workforce capacity situation at Detroit ahead of Q2 surge?',
                  'Where are our biggest gross margin improvement opportunities this quarter?',
                ].map((s, i) => (
                  <button key={i} onClick={() => { setPrompt(s); setOutput(null); }}
                    style={{ fontSize:11, color:'#7c3aed', background:'#faf5ff', border:'1px solid #e9d5ff',
                      padding:'7px 12px', borderRadius:7, cursor:'pointer', textAlign:'left',
                      lineHeight:1.45, transition:'background .1s' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Output panel */}
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {generating && (
              <div style={{ background:'#faf5ff', border:'1px solid #e9d5ff', borderRadius:12,
                padding:'40px 20px', textAlign:'center' }}>
                <div style={{ fontSize:28, marginBottom:12 }}>🔬</div>
                <div style={{ fontSize:13, fontWeight:700, color:'#7c3aed', marginBottom:6 }}>
                  Analysing your data…
                </div>
                <div style={{ fontSize:11, color:'#94a3b8', marginBottom:16 }}>
                  Cross-referencing {selSources.join(', ')} data sources
                </div>
                <div style={{ height:4, borderRadius:99, background:'#e9d5ff', overflow:'hidden', maxWidth:200, margin:'0 auto' }}>
                  <div style={{ height:'100%', borderRadius:99, background:'#7c3aed',
                    animation:'loading 1.5s ease infinite', width:'60%' }}/>
                </div>
              </div>
            )}

            {!generating && !output && (
              <div style={{ background:'#ffffff', border:'2px dashed #e2e8f0', borderRadius:12,
                padding:'40px 20px', textAlign:'center', color:'#94a3b8' }}>
                <div style={{ fontSize:36, marginBottom:12 }}>✨</div>
                <div style={{ fontSize:13, fontWeight:600, marginBottom:6 }}>Your insight will appear here</div>
                <div style={{ fontSize:11, lineHeight:1.6 }}>
                  Type a question on the left and click Run Insight.<br/>
                  You can then share the result directly to the CEO{`'`}s view.
                </div>
              </div>
            )}

            {!generating && output && (
              <InsightCard insight={output} alreadyShared={alreadyShared}
                onShare={handleShare} onSave={handleSave}
                onCopy={handleCopy}/>
            )}

            {copied && (
              <div style={{ background:'#f0fdf4', border:'1px solid #bbf7d0', borderRadius:8,
                padding:'10px 14px', fontSize:12, fontWeight:600, color:'#15803d', textAlign:'center' }}>
                ✓ Copied to clipboard
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Library tab ────────────────────────────────────────── */}
      {tab === 'library' && (
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {analystPrompts.length === 0 ? (
            <div style={{ background:'#ffffff', border:'2px dashed #e2e8f0', borderRadius:12,
              padding:'48px 20px', textAlign:'center', color:'#94a3b8' }}>
              <div style={{ fontSize:36, marginBottom:12 }}>📚</div>
              <div style={{ fontSize:13, fontWeight:600 }}>No saved prompts yet</div>
              <div style={{ fontSize:11, marginTop:6 }}>
                Run an insight in the Builder tab and click Save
              </div>
              <button onClick={() => setTab('builder')}
                style={{ marginTop:14, fontSize:12, fontWeight:700, padding:'8px 20px', borderRadius:8,
                  background:'#7c3aed', color:'#ffffff', border:'none', cursor:'pointer' }}>
                Build an Insight →
              </button>
            </div>
          ) : (
            analystPrompts.map(p => (
              <SavedPromptCard key={p.id} p={p}
                onShare={handleShareFromLibrary}
                onDelete={deleteAnalystPrompt}
                onRecall={recallSharedInsight}/>
            ))
          )}
        </div>
      )}

      {/* ── Shared tab ─────────────────────────────────────────── */}
      {tab === 'shared' && (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <div style={{ background:'#fef9c3', border:'1px solid #fde68a', borderRadius:10,
            padding:'12px 16px', fontSize:12, color:'#92400e', lineHeight:1.6 }}>
            <b>How it works:</b> Insights you share appear in Marcus Gaksh{`'`}s Insights Hub under{' '}
            <b>"Analyst Intelligence"</b>. He sees your name, the insight title, summary, and recommendation.
            He can pin it to the Board Brief or dismiss it. You can recall any shared insight at any time.
          </div>

          {analystPrompts.filter(p => p.shared).length === 0 ? (
            <div style={{ background:'#ffffff', border:'2px dashed #e2e8f0', borderRadius:12,
              padding:'48px 20px', textAlign:'center', color:'#94a3b8' }}>
              <div style={{ fontSize:36, marginBottom:12 }}>📤</div>
              <div style={{ fontSize:13, fontWeight:600 }}>Nothing shared yet</div>
              <div style={{ fontSize:11, marginTop:6 }}>
                Build an insight and click "Share with CEO"
              </div>
            </div>
          ) : (
            analystPrompts.filter(p => p.shared).map(p => (
              <div key={p.id} style={{ background:'#ffffff', border:'1px solid #fde68a',
                borderLeft:'3px solid #d97706', borderRadius:10, padding:'14px 16px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, flexWrap:'wrap' }}>
                  <span style={{ fontSize:12, fontWeight:700, color:'#0f172a' }}>{p.title}</span>
                  <span style={{ fontSize:10, fontWeight:700, background:'#fef9c3', color:'#92400e',
                    border:'1px solid #fde68a', padding:'1px 7px', borderRadius:99 }}>
                    📤 Live with CEO
                  </span>
                  <span style={{ fontSize:10, color:'#94a3b8', marginLeft:'auto' }}>Shared {p.sharedAt}</span>
                </div>
                <div style={{ fontSize:11, color:'#64748b', lineHeight:1.55, marginBottom:10 }}>
                  {p.output?.summary?.substring(0,120)}…
                </div>
                <button onClick={() => recallSharedInsight(p.id)}
                  style={{ fontSize:11, fontWeight:700, padding:'6px 14px', borderRadius:7,
                    background:'#fef2f2', color:'#dc2626', border:'1px solid #fecaca', cursor:'pointer' }}>
                  ↩ Recall from CEO view
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
