import { useState } from 'react';

/* ─────────────────────────────────────────────────────────────
   SHARED ATOMS
───────────────────────────────────────────────────────────── */
function Section({ title, subtitle, children }) {
  return (
    <div className="mb-12">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
        <div className="mt-3 h-px bg-gradient-to-r from-blue-500/40 via-blue-400/20 to-transparent" />
      </div>
      {children}
    </div>
  );
}

function Card({ title, icon, children, accent = '#3b82f6', className = '' }) {
  return (
    <div
      className={`rounded-xl border p-5 ${className}`}
      style={{
        background: 'linear-gradient(135deg,rgba(15,23,42,0.95) 0%,rgba(10,17,35,0.98) 100%)',
        borderColor: 'rgba(59,130,246,0.18)',
        boxShadow: `0 0 0 1px rgba(59,130,246,0.06), inset 0 1px 0 rgba(255,255,255,0.04)`,
      }}
    >
      {(title || icon) && (
        <div className="flex items-center gap-2 mb-3">
          {icon && <span className="text-xl">{icon}</span>}
          {title && <span className="font-semibold text-white text-sm">{title}</span>}
        </div>
      )}
      {children}
    </div>
  );
}

function Badge({ label, color = 'blue' }) {
  const map = {
    blue:   'bg-blue-500/15 text-blue-300 border border-blue-500/25',
    green:  'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25',
    amber:  'bg-amber-500/15 text-amber-300 border border-amber-500/25',
    red:    'bg-red-500/15 text-red-300 border border-red-500/25',
    purple: 'bg-purple-500/15 text-purple-300 border border-purple-500/25',
    slate:  'bg-slate-500/15 text-slate-300 border border-slate-500/25',
  };
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${map[color]}`}>{label}</span>
  );
}

function Pill({ children }) {
  return (
    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20 mr-2 mb-2">
      {children}
    </span>
  );
}

function CodeBlock({ children }) {
  return (
    <pre
      className="rounded-lg text-xs leading-relaxed overflow-x-auto p-4 text-slate-300"
      style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(59,130,246,0.15)' }}
    >
      {children}
    </pre>
  );
}

function FlowArrow({ label }) {
  return (
    <div className="flex flex-col items-center my-1 text-slate-500">
      <div className="w-px h-4 bg-blue-500/40" />
      {label && <span className="text-[10px] text-blue-400/70 my-0.5">{label}</span>}
      <svg width="10" height="6" viewBox="0 0 10 6">
        <path d="M5 6L0 0h10z" fill="rgba(59,130,246,0.5)" />
      </svg>
    </div>
  );
}

function HorizArrow({ label }) {
  return (
    <div className="flex flex-col items-center justify-center px-2">
      {label && <span className="text-[10px] text-blue-400/70 mb-1 whitespace-nowrap">{label}</span>}
      <div className="flex items-center">
        <div className="h-px w-8 bg-blue-500/40" />
        <svg width="6" height="10" viewBox="0 0 6 10">
          <path d="M6 5L0 0v10z" fill="rgba(59,130,246,0.5)" />
        </svg>
      </div>
    </div>
  );
}

function LayerBox({ label, items, color = '#3b82f6', bg = 'rgba(59,130,246,0.06)' }) {
  return (
    <div className="rounded-xl p-4" style={{ border: `1px solid ${color}30`, background: bg }}>
      <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color }}>
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {items.map((it, i) => (
          <div
            key={i}
            className="rounded-lg px-3 py-2 text-xs text-white font-medium"
            style={{ background: `${color}18`, border: `1px solid ${color}30` }}
          >
            {it}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TAB: ARCHITECTURE
───────────────────────────────────────────────────────────── */
function ArchitectureTab() {
  return (
    <div>
      {/* Hero */}
      <div
        className="rounded-2xl p-8 mb-10 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg,rgba(14,26,58,0.95) 0%,rgba(8,15,35,0.98) 100%)',
          border: '1px solid rgba(59,130,246,0.2)',
          boxShadow: '0 0 80px rgba(59,130,246,0.08)',
        }}
      >
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 39px,rgba(59,130,246,0.4) 39px,rgba(59,130,246,0.4) 40px),repeating-linear-gradient(90deg,transparent,transparent 39px,rgba(59,130,246,0.4) 39px,rgba(59,130,246,0.4) 40px)',
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">🏛️</span>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Executive OS</h1>
              <p className="text-blue-300 text-sm mt-0.5">Intelligence Platform — Technical Architecture v2.0</p>
            </div>
          </div>
          <p className="text-slate-300 text-base max-w-3xl leading-relaxed">
            Executive OS is a real-time AI-powered intelligence and decision platform designed for C-suite leaders.
            It aggregates live enterprise data across ERP, CRM, HRMS, Email, and Market Intelligence systems through
            a secure Model Context Protocol (MCP) data mesh, feeds it through a multi-agent reasoning pipeline, and
            surfaces prioritised risks and executive-grade recommendations — all within a sub-5-second decision cycle.
          </p>
          <div className="flex flex-wrap gap-3 mt-5">
            <Badge label="Event-Driven Architecture" color="blue" />
            <Badge label="Multi-Agent AI Pipeline" color="purple" />
            <Badge label="Zero-Trust Security" color="red" />
            <Badge label="SOC 2 Type II Ready" color="green" />
            <Badge label="GDPR / HIPAA Compliant" color="amber" />
            <Badge label="99.95% SLA" color="green" />
          </div>
        </div>
      </div>

      {/* System Layers Diagram */}
      <Section title="System Architecture" subtitle="Five-tier production deployment on Azure Cloud with active-active redundancy">
        <div className="space-y-3">
          <LayerBox
            label="Tier 1 — Presentation Layer"
            items={['React 19 SPA', 'Vite 5 Build Pipeline', 'Tailwind CSS', 'React Router DOM v6', 'Service Workers (Offline Mode)', 'Azure CDN / Static Web Apps']}
            color="#60a5fa"
            bg="rgba(59,130,246,0.06)"
          />
          <div className="flex justify-center"><FlowArrow label="HTTPS/WSS · JWT Bearer" /></div>
          <LayerBox
            label="Tier 2 — API Gateway Layer"
            items={['Azure API Management (APIM)', 'OAuth 2.0 / OIDC (AAD)', 'Rate Limiting · Throttling', 'Request Routing', 'TLS 1.3 Termination', 'WAF (OWASP Top 10)']}
            color="#a78bfa"
            bg="rgba(139,92,246,0.06)"
          />
          <div className="flex justify-center"><FlowArrow label="mTLS · Service Mesh (Istio)" /></div>
          <LayerBox
            label="Tier 3 — Intelligence & Orchestration Layer"
            items={['MCP Connector Service', 'Agent Orchestrator (4-Agent Pipeline)', 'Azure OpenAI GPT-4o', 'LangGraph Workflow Engine', 'Vector Store (Azure AI Search)', 'Redis Cache (Hot Data)', 'Azure Service Bus (Events)']}
            color="#34d399"
            bg="rgba(52,211,153,0.06)"
          />
          <div className="flex justify-center"><FlowArrow label="Encrypted · Tokenised Queries" /></div>
          <LayerBox
            label="Tier 4 — Data Integration Layer (MCP Connectors)"
            items={['ERP Connector (SAP S/4HANA)', 'CRM Connector (Salesforce / Dynamics)', 'HRMS Connector (Workday)', 'Email/Calendar (M365 Graph API)', 'Market Data (Bloomberg / Refinitiv)', 'News Intelligence (NewsAPI / Diffbot)']}
            color="#fb923c"
            bg="rgba(251,146,60,0.06)"
          />
          <div className="flex justify-center"><FlowArrow label="REST / GraphQL / SOAP · Encrypted" /></div>
          <LayerBox
            label="Tier 5 — Enterprise Data Sources"
            items={['SAP S/4HANA (Finance + Supply Chain)', 'Salesforce CRM', 'Workday HCM', 'Microsoft 365 (Exchange + Teams)', 'Bloomberg Terminal Feed', 'Reuters NewsML', 'Internal Data Warehouse (Snowflake)']}
            color="#f472b6"
            bg="rgba(244,114,182,0.06)"
          />
        </div>
      </Section>

      {/* Components */}
      <Section title="Core Components" subtitle="Service decomposition and responsibilities">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="MCP Connector Service" icon="🔌">
            <p className="text-slate-400 text-xs leading-relaxed mb-3">
              Implements the Model Context Protocol (MCP) specification for secure, schema-validated bi-directional data exchange with enterprise systems. Each connector is a stateless microservice deployed on Azure Container Apps with independent scaling.
            </p>
            <div className="space-y-1 text-xs">
              {[
                ['Protocol', 'MCP v1.2 + REST/GraphQL adapters'],
                ['Auth', 'Per-connector OAuth 2.0 service accounts'],
                ['Caching', 'Redis 7 · TTL 60s hot / 300s warm'],
                ['Retry', 'Exponential backoff · Circuit breaker (Polly)'],
                ['SLA', 'p99 < 800ms per connector fetch'],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <span className="text-slate-500 w-20 shrink-0">{k}</span>
                  <span className="text-slate-300">{v}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Agent Orchestrator" icon="🤖">
            <p className="text-slate-400 text-xs leading-relaxed mb-3">
              A LangGraph-powered 4-agent pipeline that sequentially aggregates raw enterprise data, performs multi-source risk analysis, generates prioritised recommendations, and scores outputs for executive consumption.
            </p>
            <div className="space-y-1 text-xs">
              {[
                ['Runtime', 'Azure Container Apps (Durable Functions)'],
                ['LLM', 'Azure OpenAI GPT-4o (128K context)'],
                ['Memory', 'Azure AI Search (vector) + Cosmos DB'],
                ['Latency', 'p50 < 2.8s · p99 < 4.9s end-to-end'],
                ['Tracing', 'OpenTelemetry → Azure Monitor / Jaeger'],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <span className="text-slate-500 w-20 shrink-0">{k}</span>
                  <span className="text-slate-300">{v}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Scheduled Prompts Engine" icon="⏱️">
            <p className="text-slate-400 text-xs leading-relaxed mb-3">
              Executes pre-configured executive intelligence queries on user-defined schedules (cron or event-triggered). Results are pushed via Azure Service Bus → WebSocket to the client in real-time.
            </p>
            <div className="space-y-1 text-xs">
              {[
                ['Scheduler', 'Azure Logic Apps + Timer Triggers'],
                ['Queue', 'Azure Service Bus (Premium · FIFO)'],
                ['Push', 'SignalR (WebSocket) · Server-Sent Events'],
                ['History', 'Cosmos DB (30-day retention)'],
                ['Alerts', 'Threshold-based → email/Teams/SMS'],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <span className="text-slate-500 w-20 shrink-0">{k}</span>
                  <span className="text-slate-300">{v}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Identity & Access Control" icon="🔐">
            <p className="text-slate-400 text-xs leading-relaxed mb-3">
              Enforces zero-trust architecture with Azure AD B2B federation, RBAC at the API and UI layer, field-level encryption for sensitive financial data, and full SIEM integration.
            </p>
            <div className="space-y-1 text-xs">
              {[
                ['IdP', 'Azure Active Directory (Entra ID)'],
                ['Tokens', 'JWT · RS256 · 15-min access TTL'],
                ['MFA', 'FIDO2 / Authenticator App enforced'],
                ['RBAC', 'CEO / CFO / CRO / CHRO / Viewer roles'],
                ['Audit', 'All actions → Azure Log Analytics'],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <span className="text-slate-500 w-20 shrink-0">{k}</span>
                  <span className="text-slate-300">{v}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Real-Time Feed Service" icon="📡">
            <p className="text-slate-400 text-xs leading-relaxed mb-3">
              Event-streaming layer that ingests change-data-capture (CDC) events from enterprise systems and pushes live updates to the dashboard via WebSocket without polling.
            </p>
            <div className="space-y-1 text-xs">
              {[
                ['Streaming', 'Azure Event Hubs (Kafka-compatible)'],
                ['CDC', 'Debezium connectors per source system'],
                ['Processing', 'Azure Stream Analytics · Flink'],
                ['Client Push', 'Azure SignalR Service'],
                ['Throughput', '50K events/sec at peak'],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <span className="text-slate-500 w-20 shrink-0">{k}</span>
                  <span className="text-slate-300">{v}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Observability Platform" icon="📊">
            <p className="text-slate-400 text-xs leading-relaxed mb-3">
              Full-stack observability across all tiers using OpenTelemetry for unified traces, metrics, and logs — surfaced through Grafana dashboards and PagerDuty incident management.
            </p>
            <div className="space-y-1 text-xs">
              {[
                ['Metrics', 'Azure Monitor · Prometheus · Grafana'],
                ['Tracing', 'Jaeger (distributed) · App Insights'],
                ['Logging', 'Azure Log Analytics Workspace'],
                ['Alerting', 'PagerDuty · OpsGenie'],
                ['SLO', '99.95% uptime · MTTR < 8 min'],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <span className="text-slate-500 w-20 shrink-0">{k}</span>
                  <span className="text-slate-300">{v}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Section>

      {/* Infrastructure */}
      <Section title="Infrastructure & Deployment" subtitle="Azure-native, IaC-managed, GitOps-driven">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Compute', icon: '⚙️',
              items: ['Azure Kubernetes Service (AKS) — backend microservices', 'Azure Container Apps — MCP connectors & agents', 'Azure Static Web Apps — React SPA + CDN', 'Azure Functions — event processors & timers'],
            },
            {
              title: 'Data & Storage', icon: '🗄️',
              items: ['Azure Cosmos DB — operational store (multi-region)', 'Snowflake — analytical warehouse', 'Azure Redis Cache — hot data layer', 'Azure Blob Storage — artefacts & audit logs', 'Azure AI Search — vector embeddings'],
            },
            {
              title: 'DevOps & Governance', icon: '🚀',
              items: ['GitHub Actions — CI/CD pipeline', 'Terraform — IaC (modules per tier)', 'Helm Charts — Kubernetes manifests', 'Azure Policy — compliance guardrails', 'Defender for Cloud — CSPM + CWPP'],
            },
          ].map(({ title, icon, items }) => (
            <Card key={title} title={title} icon={icon}>
              <ul className="space-y-1.5">
                {items.map((it, i) => (
                  <li key={i} className="text-xs text-slate-400 flex gap-2">
                    <span className="text-blue-500 mt-0.5">›</span>
                    <span>{it}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </Section>

      {/* Security */}
      <Section title="Security Architecture" subtitle="Zero-trust · defence in depth · NIST CSF aligned">
        <Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-sm font-semibold text-white mb-3">Identity & Network</div>
              <ul className="space-y-2 text-xs text-slate-400">
                {[
                  'Azure Entra ID (AAD) — OIDC / SAML 2.0 federation',
                  'Conditional Access Policies — device compliance enforced',
                  'Private Endpoints — no public internet exposure for data services',
                  'Azure Firewall Premium — IDPS + TLS inspection',
                  'DDOS Protection Standard on all public IP ranges',
                  'Network Security Groups — micro-segmentation per tier',
                ].map((it, i) => (
                  <li key={i} className="flex gap-2"><span className="text-green-400">✓</span>{it}</li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-sm font-semibold text-white mb-3">Data & Application</div>
              <ul className="space-y-2 text-xs text-slate-400">
                {[
                  'AES-256 encryption at rest (Azure Key Vault managed keys)',
                  'TLS 1.3 in transit — PFS enforced, TLS 1.0/1.1 disabled',
                  'Field-level encryption for PII and financial fields',
                  'OWASP Top 10 mitigations via Azure WAF (managed ruleset)',
                  'Secrets management via Azure Key Vault (no credentials in code)',
                  'SIEM: Microsoft Sentinel — UEBA + threat detection rules',
                ].map((it, i) => (
                  <li key={i} className="flex gap-2"><span className="text-green-400">✓</span>{it}</li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </Section>

      {/* Tech Stack */}
      <Section title="Technology Stack">
        <div className="flex flex-wrap gap-2">
          {[
            'React 19', 'Vite 5', 'Tailwind CSS 3', 'React Router v6', 'Node.js 20 LTS',
            'Python 3.12 (Agent Runtime)', 'LangGraph', 'Azure OpenAI GPT-4o',
            'Azure Kubernetes Service', 'Azure Container Apps', 'Azure API Management',
            'Azure Service Bus', 'Azure Event Hubs', 'Azure SignalR Service',
            'Azure Cosmos DB', 'Snowflake', 'Redis 7', 'Azure AI Search',
            'Azure Active Directory', 'Azure Key Vault', 'Azure Monitor',
            'OpenTelemetry', 'Terraform', 'GitHub Actions', 'Helm', 'Istio',
            'Debezium CDC', 'Apache Kafka', 'SAP S/4HANA API', 'Salesforce REST API',
            'Workday API', 'Microsoft Graph API', 'Bloomberg B-PIPE', 'Reuters NewsML',
          ].map(t => <Pill key={t}>{t}</Pill>)}
        </div>
      </Section>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TAB: DATA FLOW
───────────────────────────────────────────────────────────── */
function DataFlowTab() {
  return (
    <div>
      {/* End-to-End Flow */}
      <Section title="End-to-End Data Flow" subtitle="From enterprise source to executive decision in under 5 seconds">

        {/* Big flow diagram */}
        <div
          className="rounded-2xl p-6 mb-8"
          style={{
            background: 'linear-gradient(135deg,rgba(10,18,40,0.98) 0%,rgba(6,12,28,0.99) 100%)',
            border: '1px solid rgba(59,130,246,0.2)',
          }}
        >
          {/* Row 1 — Sources */}
          <div className="text-center mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Enterprise Data Sources</span>
          </div>
          <div className="grid grid-cols-6 gap-2 mb-1">
            {[
              { label: 'SAP S/4HANA', icon: '💼', sub: 'Finance · ERP' },
              { label: 'Salesforce', icon: '🤝', sub: 'CRM · Pipeline' },
              { label: 'Workday', icon: '👥', sub: 'HCM · Talent' },
              { label: 'M365', icon: '📧', sub: 'Email · Calendar' },
              { label: 'Bloomberg', icon: '📈', sub: 'Market Data' },
              { label: 'NewsML', icon: '📰', sub: 'News · Signals' },
            ].map(({ label, icon, sub }) => (
              <div
                key={label}
                className="rounded-xl p-3 text-center"
                style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.2)' }}
              >
                <div className="text-xl mb-1">{icon}</div>
                <div className="text-white text-[11px] font-semibold">{label}</div>
                <div className="text-slate-500 text-[9px]">{sub}</div>
              </div>
            ))}
          </div>

          {/* Arrow */}
          <div className="flex justify-center my-3">
            <div className="flex flex-col items-center text-slate-500">
              <div className="w-px h-4 bg-orange-500/30" />
              <span className="text-[10px] text-orange-400/70 my-0.5">REST · GraphQL · SOAP · CDC (Debezium)</span>
              <svg width="10" height="6" viewBox="0 0 10 6">
                <path d="M5 6L0 0h10z" fill="rgba(251,146,60,0.4)" />
              </svg>
            </div>
          </div>

          {/* Row 2 — MCP Connectors */}
          <div className="text-center mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">MCP Connector Service · Azure Container Apps</span>
          </div>
          <div
            className="rounded-xl p-4 mb-1"
            style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}
          >
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {['ERP Connector', 'CRM Connector', 'HRMS Connector', 'Email Connector', 'Market Connector', 'News Connector'].map(c => (
                <div key={c} className="text-center rounded-lg px-2 py-2"
                  style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <div className="text-[11px] text-purple-200 font-medium">{c}</div>
                  <div className="text-[9px] text-slate-500 mt-0.5">normalise · validate · cache</div>
                </div>
              ))}
            </div>
            <div className="mt-3 text-center text-[10px] text-slate-500">
              Schema validation · Field normalisation · Redis caching (TTL 60s) · Circuit-breaker pattern · Retry with exponential backoff
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center my-3">
            <div className="flex flex-col items-center">
              <div className="w-px h-4 bg-purple-500/30" />
              <span className="text-[10px] text-purple-400/70 my-0.5">Normalised JSON · Azure Service Bus</span>
              <svg width="10" height="6" viewBox="0 0 10 6">
                <path d="M5 6L0 0h10z" fill="rgba(139,92,246,0.4)" />
              </svg>
            </div>
          </div>

          {/* Row 3 — Agent Pipeline */}
          <div className="text-center mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Multi-Agent Intelligence Pipeline · LangGraph</span>
          </div>
          <div
            className="rounded-xl p-4 mb-1"
            style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)' }}
          >
            <div className="flex items-center justify-between">
              {[
                { name: 'Agent 1', label: 'Data Aggregator', sub: 'Parallel fetch · merge · dedup', icon: '📦' },
                { name: 'Agent 2', label: 'Risk Analyzer', sub: 'Pattern detect · scoring · evidence', icon: '🔍' },
                { name: 'Agent 3', label: 'Decision Engine', sub: 'Rec generation · ROI calc · action plan', icon: '💡' },
                { name: 'Agent 4', label: 'Priority Scorer', sub: 'Impact scoring · urgency ranking', icon: '🎯' },
              ].map((a, i) => (
                <div key={a.name} className="flex items-center">
                  <div
                    className="rounded-xl p-3 text-center"
                    style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.2)', minWidth: 100 }}
                  >
                    <div className="text-lg mb-1">{a.icon}</div>
                    <div className="text-[10px] font-bold text-emerald-300">{a.name}</div>
                    <div className="text-[11px] text-white font-medium">{a.label}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">{a.sub}</div>
                  </div>
                  {i < 3 && (
                    <div className="flex items-center px-2">
                      <div className="h-px w-5 bg-emerald-500/40" />
                      <svg width="6" height="10" viewBox="0 0 6 10">
                        <path d="M6 5L0 0v10z" fill="rgba(52,211,153,0.4)" />
                      </svg>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 text-center text-[10px] text-slate-500">
              GPT-4o (128K context) · Azure OpenAI · LangGraph orchestration · OpenTelemetry traces · Cosmos DB memory
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center my-3">
            <div className="flex flex-col items-center">
              <div className="w-px h-4 bg-blue-500/30" />
              <span className="text-[10px] text-blue-400/70 my-0.5">Structured JSON payload · WebSocket push (SignalR)</span>
              <svg width="10" height="6" viewBox="0 0 10 6">
                <path d="M5 6L0 0h10z" fill="rgba(59,130,246,0.4)" />
              </svg>
            </div>
          </div>

          {/* Row 4 — API Layer */}
          <div
            className="rounded-xl p-3 mb-1 text-center"
            style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}
          >
            <div className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-1">Azure API Management · Response Envelope</div>
            <div className="text-[11px] text-slate-400">JWT validation · rate limiting · response caching (Redis) · audit logging → Log Analytics</div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center my-3">
            <div className="flex flex-col items-center">
              <div className="w-px h-4 bg-blue-500/30" />
              <span className="text-[10px] text-blue-400/70 my-0.5">TLS 1.3 · HTTPS + WebSocket</span>
              <svg width="10" height="6" viewBox="0 0 10 6">
                <path d="M5 6L0 0h10z" fill="rgba(59,130,246,0.4)" />
              </svg>
            </div>
          </div>

          {/* Row 5 — UI */}
          <div
            className="rounded-xl p-4 text-center"
            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)' }}
          >
            <div className="text-[10px] font-bold uppercase tracking-widest text-blue-300 mb-2">Executive Dashboard — React 19 SPA</div>
            <div className="grid grid-cols-4 gap-2">
              {['Risk Panel', 'Recommendations', 'Feed Ticker', 'Prompt Engine'].map(c => (
                <div key={c} className="rounded-lg py-2 text-[11px] text-blue-200 font-medium"
                  style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.25)' }}>
                  {c}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Agent Pipeline Detail */}
      <Section title="Agent Pipeline — Detailed Flow" subtitle="LangGraph state machine with memory and tool calling">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              step: '01', name: 'DataAggregationAgent', icon: '📦',
              input: 'Scheduled trigger / user action',
              process: [
                'Parallel async fetch from all 6 MCP connectors',
                'Schema validation against connector-specific JSON Schema v7',
                'Deduplication using content-hash fingerprinting',
                'Merge into unified ContextBundle object',
                'Write to Cosmos DB session store (TTL 1h)',
              ],
              output: 'ContextBundle { erp, crm, hr, email, market, news }',
              latency: '~600ms',
            },
            {
              step: '02', name: 'AnalysisAgent', icon: '🔍',
              input: 'ContextBundle from Agent 1',
              process: [
                'Deterministic rule engine (8 risk type detectors)',
                'GPT-4o semantic enrichment of each detected risk',
                'Evidence extraction from source data fields',
                'Confidence scoring via Bayesian model',
                'Trend inference from historical Cosmos DB records',
              ],
              output: 'RiskSet[] — up to 8 prioritised, evidence-backed risks',
              latency: '~1.2s',
            },
            {
              step: '03', name: 'DecisionAgent', icon: '💡',
              input: 'RiskSet[] from Agent 2',
              process: [
                'Risk-type → recommendation template mapping',
                'GPT-4o action plan generation with context injection',
                'ROI estimation via financial model lookup tables',
                'Owner assignment from RBAC directory',
                'KPI selection from metric taxonomy',
              ],
              output: 'RecommendationSet[] — full action plans, ROI, KPIs',
              latency: '~1.8s',
            },
            {
              step: '04', name: 'PriorityAgent', icon: '🎯',
              input: 'RiskSet + RecommendationSet',
              process: [
                'Weighted scoring model: severity × impact × confidence',
                'Time-decay urgency scoring (immediate / urgent / high / monitor)',
                'Financial exposure ranking',
                'Cross-risk correlation detection',
                'Output serialisation → API response envelope',
              ],
              output: 'Sorted RiskSet + RecommendationSet + blended confidence score',
              latency: '~300ms',
            },
          ].map(({ step, name, icon, input, process, output, latency }) => (
            <Card key={step}>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold text-blue-300"
                  style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}
                >
                  {step}
                </div>
                <span className="text-lg">{icon}</span>
                <span className="text-white font-semibold text-sm">{name}</span>
                <Badge label={latency} color="slate" />
              </div>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 uppercase tracking-wider text-[10px]">Input</span>
                  <p className="text-slate-300 mt-0.5">{input}</p>
                </div>
                <div>
                  <span className="text-slate-500 uppercase tracking-wider text-[10px]">Processing Steps</span>
                  <ul className="mt-1 space-y-1">
                    {process.map((p, i) => (
                      <li key={i} className="flex gap-2 text-slate-400">
                        <span className="text-emerald-500">›</span>{p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="text-slate-500 uppercase tracking-wider text-[10px]">Output</span>
                  <p className="text-slate-300 mt-0.5">{output}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      {/* Event Streaming */}
      <Section title="Real-Time Event Streaming" subtitle="Change-Data-Capture → Event Hub → SignalR → Dashboard">
        <Card>
          <div className="space-y-4">
            {[
              { phase: 'Source CDC', detail: 'Debezium connectors monitor WAL / change logs on SAP, Salesforce, Workday. Every committed transaction publishes a CDC event within 200ms.', badge: '<200ms', color: 'amber' },
              { phase: 'Event Ingestion', detail: 'Azure Event Hubs (Kafka-compatible, 10 partitions, 7-day retention). Events are consumed by Azure Stream Analytics jobs with 10-second tumbling windows.', badge: 'Kafka', color: 'purple' },
              { phase: 'Stream Processing', detail: 'Stream Analytics detects threshold breaches (e.g., deal value drop, attrition spike). Enriches events with metadata from Redis lookup cache. Routes to Service Bus.', badge: 'Flink', color: 'blue' },
              { phase: 'Push to Client', detail: 'Azure SignalR Service broadcasts processed events to connected clients via WebSocket. React client dispatches to Feed state store → FeedTicker animates within 500ms.', badge: '<500ms', color: 'green' },
            ].map(({ phase, detail, badge, color }) => (
              <div key={phase} className="flex gap-4">
                <div className="w-32 shrink-0">
                  <Badge label={badge} color={color} />
                  <div className="text-xs font-semibold text-white mt-1">{phase}</div>
                </div>
                <div className="text-xs text-slate-400 leading-relaxed">{detail}</div>
              </div>
            ))}
          </div>
        </Card>
      </Section>

      {/* API Response Schema */}
      <Section title="API Response Schema" subtitle="Standardised envelope used by all orchestration endpoints">
        <CodeBlock>{`// POST /api/v2/orchestrate
// Authorization: Bearer <JWT>
// Content-Type: application/json

{
  "meta": {
    "requestId": "req_01HXYZ9...",
    "timestamp": "2026-02-27T09:14:33.421Z",
    "latency_ms": 3247,
    "agentVersion": "2.0.4",
    "averageConfidence": 83
  },
  "risks": [
    {
      "id": "RISK-1740647673-442",
      "type": "revenue",                        // enum: revenue|finance|sales|retention|talent|competition|compliance|operations
      "severity": "high",                       // enum: high|medium|low
      "urgency": "immediate",                   // enum: immediate|urgent|high|monitor
      "title": "Revenue Decline vs Target",
      "description": "Monthly revenue dropped 6.2% ...",
      "source": "ERP",                          // originating connector
      "confidence": 91,                         // 0-100 Bayesian confidence score
      "financial_impact": 4200000,              // USD
      "trend": [38.1, 37.4, 36.8, 35.9, 35.2], // 6-point rolling data
      "evidence": [
        { "label": "Current MRR", "value": "$35.2M", "trend": "down" }
      ],
      "affected_systems": ["ERP", "CRM", "Finance"],
      "owner": "CFO",
      "timeline": "30 days"
    }
  ],
  "recommendations": [
    {
      "id": "REC-1740647674-881",
      "priority": "urgent",
      "type": "revenue",
      "title": "Activate Revenue Recovery War Room",
      "confidence": 78,
      "roi_range": "$2M–$4M",
      "payback_days": 45,
      "effort": "high",                         // enum: low|medium|high
      "actions": [
        { "step": 1, "action": "Convene CFO/CRO/CEO war room", "owner": "CEO", "days": 2 }
      ],
      "kpis": ["MRR recovery", "Pipeline velocity"],
      "affected_systems": ["ERP", "CRM"]
    }
  ],
  "connectors": {
    "erp":    { "status": "online", "latency_ms": 142 },
    "crm":    { "status": "online", "latency_ms": 98  },
    "hr":     { "status": "online", "latency_ms": 213 },
    "email":  { "status": "online", "latency_ms": 77  },
    "market": { "status": "online", "latency_ms": 331 },
    "news":   { "status": "online", "latency_ms": 188 }
  }
}`}</CodeBlock>
      </Section>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   TAB: USER GUIDE
───────────────────────────────────────────────────────────── */
function UserGuideTab() {
  const [openSection, setOpenSection] = useState(null);

  const sections = [
    {
      id: 'login',
      icon: '🔐',
      title: 'Getting Started — Login & Persona Setup',
      content: (
        <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
          <p>
            Access Executive OS at your organisation's SSO URL (<code className="text-blue-300">https://exec-os.yourdomain.com</code>).
            Authentication is handled via Azure Active Directory — use your corporate credentials with MFA (FIDO2 or Authenticator App required).
          </p>
          <div className="rounded-lg p-4" style={{ background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)' }}>
            <div className="font-semibold text-white mb-2">First Login — Persona Configuration</div>
            <ol className="list-decimal list-inside space-y-1.5 text-slate-400 text-xs">
              <li>Enter your corporate email and authenticate via SSO / MFA.</li>
              <li>Select your <strong className="text-white">Executive Role</strong> (CEO, CFO, CRO, CHRO, COO, CPO, CLO, Viewer) — this sets your RBAC permissions and default data view.</li>
              <li>Select your <strong className="text-white">Focus Areas</strong> (Revenue, Operations, Talent, Risk, Strategy) — used by the AI to personalise recommendation prioritisation.</li>
              <li>Your persona is persisted in your Azure AD user profile and can be updated via Settings → Profile at any time.</li>
            </ol>
          </div>
          <div className="rounded-lg p-4" style={{ background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.2)' }}>
            <div className="text-xs font-semibold text-amber-300 mb-1">⚠️ Role-Based Access</div>
            <p className="text-xs text-slate-400">
              Your role determines which panels, data fields, and actions are available. CFO sees full financial exposure; CRO sees pipeline and retention data. CLO sees compliance risks. CEO sees the full executive view. Viewers can observe but cannot approve recommendations or escalate risks.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'dashboard',
      icon: '🖥️',
      title: 'Executive Dashboard — Overview',
      content: (
        <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
          <p>The Dashboard is your primary command centre. It auto-refreshes every <strong className="text-white">90 seconds</strong> and receives real-time push updates via WebSocket for critical threshold breaches.</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { zone: 'KPI Strip (Top)', desc: 'Active risk count, recommendation count, data sources online, AI decision confidence, and scheduled prompt runs — all updated in real-time.' },
              { zone: 'Feed Ticker', desc: 'Live event stream of significant business signals from all connected data sources. Events are colour-coded by severity.' },
              { zone: 'Risk Assessment Panel (Left)', desc: 'Prioritised list of active risks detected by the AI. Filter by severity (High/Medium/Low). Click any card for full drilldown analysis.' },
              { zone: 'AI Recommendations (Right)', desc: 'Executive-grade action recommendations linked to each risk. Click any card to view full action plan, ROI estimates, and approve/defer.' },
              { zone: 'Connector Status', desc: 'Real-time health of all 6 data connectors. Green = online and within SLA. Amber = degraded latency. Red = offline (failover active).' },
              { zone: 'Prompt Signals', desc: 'Results from scheduled intelligence prompts that ran since your last session. Each signal shows confidence and data source trail.' },
            ].map(({ zone, desc }) => (
              <div key={zone} className="rounded-lg p-3" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
                <div className="text-xs font-semibold text-blue-300 mb-1">{zone}</div>
                <p className="text-xs text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'risks',
      icon: '⚠️',
      title: 'Risk Assessment — Drilldown & Escalation',
      content: (
        <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
          <p>The Risk Assessment panel surfaces up to 8 AI-detected risks per cycle, ranked by a weighted score of severity × financial impact × confidence.</p>
          <div className="space-y-2">
            <div className="font-semibold text-white">Risk Card — Quick View</div>
            <ul className="text-xs text-slate-400 space-y-1.5">
              {[
                'Severity badge (High / Medium / Low) with colour coding',
                'Risk type icon (Revenue 💰, Finance 📊, Sales 🤝, Retention 💧, Talent 🧠, Competition ⚔️, Compliance 📋, Operations ⚙️)',
                'Title and 2-line description with source connector label',
                'Financial exposure (USD estimated)',
                'Mini sparkline showing the 6-point trend',
                'AI confidence score progress bar',
              ].map((it, i) => <li key={i} className="flex gap-2"><span className="text-blue-400">›</span>{it}</li>)}
            </ul>
          </div>
          <div className="rounded-lg p-4" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <div className="font-semibold text-white mb-2">Drilldown Modal — Click any card</div>
            <ul className="text-xs text-slate-400 space-y-1.5">
              {[
                'Full risk description with data-backed evidence table (label / value / trend arrow)',
                '6-point bar chart trend visualisation',
                'Financial exposure, AI confidence %, and urgency level — 3-column metric strip',
                'Affected enterprise systems (ERP, CRM, HR, etc.)',
                'Assigned risk owner (role-based)',
                'Escalate button — creates a high-priority ticket in ServiceNow / Jira and notifies via Teams',
                'Assign Owner — re-assign the risk to a specific executive (requires CEO/COO permission)',
              ].map((it, i) => <li key={i} className="flex gap-2"><span className="text-red-400">›</span>{it}</li>)}
            </ul>
          </div>
          <div className="rounded-lg p-4" style={{ background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.2)' }}>
            <div className="text-xs font-semibold text-amber-300 mb-1">Urgency Labels</div>
            <div className="grid grid-cols-4 gap-2 mt-2">
              {[
                { label: 'IMMEDIATE', desc: 'Act today — financial or reputational exposure is active', color: 'text-red-400' },
                { label: 'URGENT', desc: 'Act within 48 hours — threshold breach imminent', color: 'text-orange-400' },
                { label: 'HIGH', desc: 'Act within 7 days — trending toward critical', color: 'text-amber-400' },
                { label: 'MONITOR', desc: 'Watchlist — no immediate action required', color: 'text-blue-400' },
              ].map(({ label, desc, color }) => (
                <div key={label}>
                  <div className={`text-xs font-bold ${color} mb-1`}>{label}</div>
                  <div className="text-[11px] text-slate-500">{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'recs',
      icon: '💡',
      title: 'AI Recommendations — Action Plans & Approval',
      content: (
        <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
          <p>Every detected risk generates a corresponding executive-grade recommendation with a full implementation roadmap. Recommendations are mapped 1:1 to risks and ranked by priority × confidence × ROI.</p>
          <div className="space-y-2">
            <div className="font-semibold text-white">Recommendation Card — Quick View</div>
            <ul className="text-xs text-slate-400 space-y-1.5">
              {[
                'Priority badge (Urgent / High / Medium / Low)',
                'ROI range estimate (e.g. $2M–$4M or $5M fine avoidance)',
                'Action count (number of concrete steps in the plan)',
                'Effort level (Low / Medium / High)',
                'Payback period in days',
                'AI confidence bar',
              ].map((it, i) => <li key={i} className="flex gap-2"><span className="text-blue-400">›</span>{it}</li>)}
            </ul>
          </div>
          <div className="rounded-lg p-4" style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)' }}>
            <div className="font-semibold text-white mb-2">Action Plan Modal — Click any card</div>
            <ul className="text-xs text-slate-400 space-y-1.5">
              {[
                'Numbered action steps with assigned owner and target completion days',
                'Expected impact summary (plain English, executive-readable)',
                'ROI estimate and payback timeline with confidence range',
                'Success KPIs — measurable outcomes to track post-implementation',
                'Affected systems list — know which teams to loop in',
                'Approve & Assign — marks as approved and creates tasks in Jira/Asana, notifies owners via Teams/email',
                'Defer — snoozes the recommendation for a configurable period (1 day / 1 week / 2 weeks)',
              ].map((it, i) => <li key={i} className="flex gap-2"><span className="text-emerald-400">›</span>{it}</li>)}
            </ul>
          </div>
          <div className="rounded-lg p-3" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
            <div className="text-xs font-semibold text-blue-300 mb-1">Permission Note</div>
            <p className="text-xs text-slate-400">Approve & Assign is available to CEO, CFO, CRO, CHRO, and COO roles. Viewers and read-only roles can view recommendations but cannot take action. All approvals are audit-logged to Azure Log Analytics with timestamp, user, and decision rationale.</p>
          </div>
        </div>
      ),
    },
    {
      id: 'prompts',
      icon: '⏱️',
      title: 'Scheduled Intelligence Prompts',
      content: (
        <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
          <p>The Prompts page (<strong className="text-white">/prompts</strong>) lets you configure intelligence queries that run on a schedule and push results to your dashboard automatically.</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { title: 'Creating a Prompt', steps: ['Click "New Prompt" on the Prompts page', 'Enter your intelligence query in natural language (e.g. "Summarise revenue risk and top 3 deals at risk")', 'Set schedule: cron expression or interval (hourly, daily, weekly)', 'Select data sources to include (checkboxes)', 'Set alert threshold: notify if confidence drops below X%', 'Save — prompt runs on next scheduled tick'] },
              { title: 'Prompt Result Types', steps: ['Executive Summary — paragraph synthesis for a topic', 'Risk Snapshot — ranked list of risks for a domain', 'Competitor Brief — market intelligence summary', 'Talent Pulse — weekly HR and attrition update', 'Financial Digest — revenue, OpEx, and cash position', 'Custom — free-form natural language query with full data context'] },
            ].map(({ title, steps }) => (
              <div key={title} className="rounded-lg p-3" style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}>
                <div className="text-xs font-semibold text-blue-300 mb-2">{title}</div>
                <ol className="list-decimal list-inside space-y-1 text-xs text-slate-400">
                  {steps.map((s, i) => <li key={i}>{s}</li>)}
                </ol>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500">Prompt history is retained for 30 days. All prompts include source data attribution — hover over any result to see which connector supplied the underlying data.</p>
        </div>
      ),
    },
    {
      id: 'connectors',
      icon: '🔌',
      title: 'Data Connectors — Status & Management',
      content: (
        <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
          <p>The Connector Status panel shows live health for all 6 enterprise data connectors. Each connector polls or streams data independently, so a single connector issue does not block the rest of the pipeline.</p>
          <div className="space-y-2">
            {[
              { name: 'ERP (SAP S/4HANA)', data: 'Revenue, OpEx, Gross Margin, EBITDA, Cash Flow, AP/AR aging, Inventory', sla: '< 200ms' },
              { name: 'CRM (Salesforce)', data: 'Pipeline, deal stage, health scores, win rate, churn risk accounts, NPS, CSAT', sla: '< 150ms' },
              { name: 'HRMS (Workday)', data: 'Headcount, attrition rate, flight risk scores, engagement index, eNPS, open roles', sla: '< 300ms' },
              { name: 'Email/Calendar (M365)', data: 'Escalations, action items, meeting commitments, comms sentiment, key threads', sla: '< 120ms' },
              { name: 'Market Intelligence (Bloomberg)', data: 'Competitor activity, market share, TAM growth, industry benchmarks, funding events', sla: '< 500ms' },
              { name: 'News (Reuters NewsML)', data: 'Curated news headlines, sentiment score, relevance score, regulatory signals', sla: '< 400ms' },
            ].map(({ name, data, sla }) => (
              <div key={name} className="flex gap-3 rounded-lg p-3" style={{ background: 'rgba(59,130,246,0.05)', border: '1px solid rgba(59,130,246,0.12)' }}>
                <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1 shrink-0" />
                <div>
                  <div className="text-xs font-semibold text-white">{name} <Badge label={`SLA ${sla}`} color="green" /></div>
                  <div className="text-xs text-slate-500 mt-0.5">{data}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500">If a connector shows amber or red, the AI pipeline runs with the available data and marks affected risks with a reduced confidence score. The operations team is automatically alerted via PagerDuty.</p>
        </div>
      ),
    },
    {
      id: 'rbac',
      icon: '👥',
      title: 'Roles & Permissions Matrix',
      content: (
        <div>
          <p className="text-sm text-slate-300 mb-4">Access to data, actions, and sensitive fields is governed by role-based access control (RBAC). Roles are assigned in Azure Active Directory and enforced at both the API layer and UI component level.</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left py-2 px-3 text-slate-400 font-semibold border-b border-slate-700/50">Capability</th>
                  {['CEO', 'CFO', 'CRO', 'CHRO', 'COO', 'CLO', 'Viewer'].map(r => (
                    <th key={r} className="text-center py-2 px-3 text-slate-400 font-semibold border-b border-slate-700/50">{r}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['View all risks & recommendations', true, true, true, true, true, true, true],
                  ['View financial exposure data', true, true, false, false, true, false, false],
                  ['View talent / HR risks', true, false, false, true, true, false, false],
                  ['Approve recommendations', true, true, true, true, true, true, false],
                  ['Escalate risks', true, true, true, true, true, true, false],
                  ['Create scheduled prompts', true, true, true, true, true, true, false],
                  ['Manage connector settings', true, true, false, false, true, false, false],
                  ['View audit log', true, true, false, false, true, true, false],
                  ['Export to PDF / PowerPoint', true, true, true, true, true, true, false],
                ].map(([cap, ...perms]) => (
                  <tr key={cap} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                    <td className="py-2 px-3 text-slate-300">{cap}</td>
                    {perms.map((p, i) => (
                      <td key={i} className="py-2 px-3 text-center">
                        {p ? <span className="text-emerald-400">✓</span> : <span className="text-slate-700">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ),
    },
    {
      id: 'shortcuts',
      icon: '⌨️',
      title: 'Keyboard Shortcuts & Power User Tips',
      content: (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-sm font-semibold text-white mb-3">Keyboard Shortcuts</div>
            <div className="space-y-2">
              {[
                ['G + D', 'Go to Dashboard'],
                ['G + P', 'Go to Prompts'],
                ['G + H', 'Go to History'],
                ['R', 'Refresh all data feeds'],
                ['Esc', 'Close open modal / drilldown'],
                ['F', 'Toggle risk severity filter'],
                ['A', 'Approve highlighted recommendation'],
                ['E', 'Escalate highlighted risk'],
                ['?', 'Show this help panel'],
              ].map(([key, desc]) => (
                <div key={key} className="flex items-center gap-3">
                  <kbd className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-blue-300"
                    style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}>
                    {key}
                  </kbd>
                  <span className="text-xs text-slate-400">{desc}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm font-semibold text-white mb-3">Power User Tips</div>
            <ul className="space-y-2 text-xs text-slate-400">
              {[
                'Pin the Dashboard tab to your browser for instant access — it authenticates silently via SSO.',
                'Use "Export to Board Deck" (top-right menu) to generate a PowerPoint-ready executive summary with AI insights.',
                'Set up a Daily Digest prompt to receive a morning intelligence brief via email every weekday at 7am.',
                'Filter risks by "Immediate" urgency to focus only on items requiring action today.',
                'Hover over any confidence score to see the breakdown of factors that influenced it.',
                "Use the CEO Switch in Settings to temporarily view the dashboard from another executive's perspective.",
                'Scheduled prompts support Slack / Teams delivery — configure webhooks in Settings → Integrations.',
              ].map((tip, i) => (
                <li key={i} className="flex gap-2"><span className="text-blue-400 shrink-0">💡</span>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Section title="User Guide" subtitle="Complete reference for executives, administrators, and data stewards">

        {/* Quick start banner */}
        <div
          className="rounded-2xl p-6 mb-8 flex gap-6"
          style={{
            background: 'linear-gradient(135deg,rgba(16,34,72,0.95) 0%,rgba(10,20,50,0.98) 100%)',
            border: '1px solid rgba(59,130,246,0.25)',
          }}
        >
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🚀</span>
              <span className="font-bold text-white text-lg">Quick Start</span>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              New to Executive OS? Start here. After SSO login and persona setup, your personalised dashboard will be ready in under 30 seconds. The AI pipeline runs its first analysis cycle automatically — you'll see live risks and recommendations within 5 seconds of the page loading.
            </p>
          </div>
          <div className="shrink-0 space-y-2 min-w-[200px]">
            {[
              { n: '1', label: 'SSO Login', sub: 'Azure AD · MFA required' },
              { n: '2', label: 'Set Persona', sub: 'Role + Focus Areas' },
              { n: '3', label: 'Dashboard loads', sub: 'AI runs first cycle' },
              { n: '4', label: 'Click risk card', sub: 'Drilldown analysis' },
              { n: '5', label: 'Approve action', sub: 'Tasks dispatched' },
            ].map(({ n, label, sub }) => (
              <div key={n} className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
                  style={{ background: 'rgba(59,130,246,0.4)', border: '1px solid rgba(59,130,246,0.5)' }}
                >{n}</div>
                <div>
                  <div className="text-xs font-semibold text-white">{label}</div>
                  <div className="text-[10px] text-slate-500">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Accordion sections */}
        <div className="space-y-3">
          {sections.map(({ id, icon, title, content }) => (
            <div
              key={id}
              className="rounded-xl overflow-hidden"
              style={{
                border: openSection === id ? '1px solid rgba(59,130,246,0.35)' : '1px solid rgba(59,130,246,0.14)',
                background: 'rgba(10,18,40,0.8)',
              }}
            >
              <button
                className="w-full flex items-center justify-between px-5 py-4 text-left"
                onClick={() => setOpenSection(openSection === id ? null : id)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{icon}</span>
                  <span className="font-semibold text-white text-sm">{title}</span>
                </div>
                <svg
                  className="w-4 h-4 text-slate-400 transition-transform"
                  style={{ transform: openSection === id ? 'rotate(180deg)' : 'none' }}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {openSection === id && (
                <div className="px-5 pb-5 border-t" style={{ borderColor: 'rgba(59,130,246,0.1)' }}>
                  <div className="mt-4">{content}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </Section>

      {/* Support */}
      <Section title="Support & Contact">
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: '📧', title: 'Platform Support', detail: 'exec-os-support@yourdomain.com\nP1 (critical): 15-min SLA\nP2 (high): 2-hour SLA\nP3 (normal): 1 business day' },
            { icon: '📖', title: 'Documentation', detail: 'Internal Confluence: exec-os.wiki\nAPI Reference: exec-os.yourdomain.com/api-docs\nPostman Collection: shared workspace "Executive OS"' },
            { icon: '🛡️', title: 'Security & Compliance', detail: 'Security queries: security@yourdomain.com\nDPA / GDPR requests: privacy@yourdomain.com\nSOC 2 Type II report: available on request' },
          ].map(({ icon, title, detail }) => (
            <Card key={title} icon={icon} title={title}>
              <pre className="text-xs text-slate-400 whitespace-pre-wrap font-sans">{detail}</pre>
            </Card>
          ))}
        </div>
      </Section>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN DOCS PAGE
───────────────────────────────────────────────────────────── */
const TABS = [
  { id: 'architecture', label: 'Architecture', icon: '🏛️' },
  { id: 'dataflow',     label: 'Data Flow',    icon: '🔄' },
  { id: 'userguide',   label: 'User Guide',   icon: '📖' },
];

export default function DocsPage() {
  const [tab, setTab] = useState('architecture');

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg,#020817 0%,#050c1a 100%)' }}>
      {/* Page header */}
      <div
        className="sticky top-0 z-30 px-8 py-4 flex items-center justify-between"
        style={{
          background: 'rgba(2,8,23,0.92)',
          borderBottom: '1px solid rgba(59,130,246,0.1)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">📋</span>
          <div>
            <div className="text-white font-bold text-lg leading-none">Documentation</div>
            <div className="text-slate-500 text-xs mt-0.5">Architecture · Data Flow · User Guide</div>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(59,130,246,0.15)' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="px-5 py-2 rounded-lg text-sm font-medium transition-all"
              style={
                tab === t.id
                  ? { background: 'rgba(59,130,246,0.25)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.4)' }
                  : { color: '#64748b', border: '1px solid transparent' }
              }
            >
              <span className="mr-1.5">{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Badge label="v2.0" color="blue" />
          <Badge label="Feb 2026" color="slate" />
        </div>
      </div>

      {/* Tab content */}
      <div className="px-8 py-8 max-w-6xl mx-auto">
        {tab === 'architecture' && <ArchitectureTab />}
        {tab === 'dataflow'     && <DataFlowTab />}
        {tab === 'userguide'    && <UserGuideTab />}
      </div>
    </div>
  );
}
