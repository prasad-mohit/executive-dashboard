# Executive OS - AI-Powered Decision Intelligence Platform

An advanced executive dashboard featuring multi-agent AI orchestration, role-based access control, and real-time data integration from multiple corporate systems.

## 🚀 Features

### 1. **Authentication & Authorization**
- Secure login system with role-based access control (RBAC)
- Three user roles with different permission levels:
  - **Executive**: Full access, can approve decisions, view all data
  - **Manager**: Can recommend decisions, view team data
  - **Analyst**: Limited view, can create reports

### 2. **Mock MCP (Model Context Protocol) Server**
- RESTful API backend with Express.js
- Real-time data connectors for:
  - **ERP System**: Revenue, expenses, cash flow, inventory
  - **CRM**: Pipeline data, delayed deals, churn risk
  - **Email**: Sentiment analysis, urgent threads, escalations
  - **HR System**: Headcount, attrition, hiring metrics
  - **Market Intelligence**: Competitor activity, market sentiment
  - **News Feed**: Relevant articles, brand mentions

### 3. **Multi-Agent AI Orchestration**
Four specialized AI agents working together:
- **Data Aggregation Agent**: Fetches and normalizes data from all sources
- **Risk Analysis Agent**: Identifies patterns, risks, and correlations
- **Decision Recommender Agent**: Generates actionable recommendations
- **Priority Scorer Agent**: Ranks and prioritizes risks and actions

### 4. **Role-Based Dashboard**
- Dynamic UI that adapts based on user role and permissions
- Real-time data updates (auto-refresh every 30 seconds)
- Visual agent orchestration timeline
- Live connector status monitoring

## 📦 Installation

```bash
# Clone the repository (already done)
cd c:\Users\mprasa30\Documents\executive_os

# Install dependencies (already done)
npm install
```

## 🏃 Running the Application

### Option 1: Run both server and client together (Recommended)
```bash
npm run dev:all
```

### Option 2: Run separately
```bash
# Terminal 1 - Start MCP Server
npm run server

# Terminal 2 - Start React App
npm run dev
```

## 🔐 Demo Credentials

### Executive Access
- **Email**: ceo@company.com
- **Password**: ceo123
- **Permissions**: View all data, approve decisions, manage users

### Manager Access
- **Email**: manager@company.com
- **Password**: manager123
- **Permissions**: View team data, recommend decisions

### Analyst Access
- **Email**: analyst@company.com
- **Password**: analyst123
- **Permissions**: View basic data, create reports

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                  React Frontend                      │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │
│  │  Auth      │  │ Dashboard  │  │ Components   │  │
│  │  Context   │  │ Container  │  │ (Role-based) │  │
│  └────────────┘  └────────────┘  └──────────────┘  │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│            Agent Orchestration Layer                 │
│  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │
│  │ Aggregator │→ │  Analyzer  │→ │ Recommender  │  │
│  │   Agent    │  │   Agent    │  │    Agent     │  │
│  └────────────┘  └────────────┘  └──────────────┘  │
│                        ↓                             │
│                  ┌────────────┐                      │
│                  │  Scorer    │                      │
│                  │   Agent    │                      │
│                  └────────────┘                      │
└───────────────────────┬─────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────┐
│              MCP Server (Express.js)                 │
│  ┌────┐  ┌────┐  ┌─────┐  ┌────┐  ┌──────┐  ┌────┐│
│  │ERP │  │CRM │  │Email│  │ HR │  │Market│  │News││
│  └────┘  └────┘  └─────┘  └────┘  └──────┘  └────┘│
└─────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
executive_os/
├── server/
│   └── mcp-server.js          # Mock MCP backend server
├── src/
│   ├── components/
│   │   ├── Login.jsx          # Authentication page
│   │   ├── Dashboard.jsx      # Main dashboard container
│   │   ├── ProtectedRoute.jsx # Route guard
│   │   ├── RiskPanel.jsx      # Risk visualization
│   │   ├── RecommendationsPanel.jsx
│   │   ├── ConnectorStatus.jsx
│   │   └── AgentOrchestrationPanel.jsx
│   ├── contexts/
│   │   └── AuthContext.jsx    # Authentication context
│   ├── services/
│   │   ├── mcpConnector.js    # MCP API client
│   │   └── agentOrchestrator.js # AI agent system
│   ├── App.jsx                # Main app with routing
│   └── main.jsx               # Entry point
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User authentication

### MCP Data Connectors
- `GET /api/mcp/health` - System health status
- `GET /api/mcp/erp` - ERP system data
- `GET /api/mcp/crm` - CRM data
- `GET /api/mcp/email` - Email analytics
- `GET /api/mcp/hr` - HR metrics
- `GET /api/mcp/market` - Market intelligence
- `GET /api/mcp/news` - News feed
- `GET /api/mcp/aggregate` - All data combined

### Agent Communication
- `POST /api/mcp/agent/message` - Agent-to-agent messaging

## 🎯 Key Features Demonstration

### 1. Role-Based Access Control
Each role sees different levels of detail:
- **Executives** see full risk details and can approve actions
- **Managers** can escalate recommendations to executives
- **Analysts** have read-only access with limited details

### 2. Agent Orchestration
Watch the AI agents work together in real-time:
1. Data Aggregation Agent fetches data from all 6 sources
2. Risk Analysis Agent identifies patterns and correlations
3. Decision Recommender Agent generates actionable plans
4. Priority Scorer Agent ranks everything by urgency and impact

### 3. Real-Time Updates
- Dashboard auto-refreshes every 30 seconds
- Live connector status monitoring
- Real-time agent execution logs

## 🛠️ Technology Stack

- **Frontend**: React 19, React Router, Tailwind CSS
- **Backend**: Node.js, Express.js
- **State Management**: React Context API
- **Authentication**: JWT-based (mock implementation)
- **Build Tool**: Vite

## 🔮 Future Enhancements

1. **Real Data Connectors**: Replace mock data with actual API integrations
2. **Advanced AI Models**: Integrate LLMs for natural language insights
3. **WebSocket Support**: Real-time bidirectional communication
4. **Persistent Storage**: Add database for historical analysis
5. **Advanced Analytics**: Charts, trends, and predictive modeling
6. **Notifications**: Real-time alerts for critical risks
7. **Audit Trail**: Complete activity logging and compliance

## 📝 Development Notes

- The MCP server runs on port 3001
- The React app runs on port 5173 (default Vite port)
- CORS is enabled for local development
- All authentication is currently mock-based for demo purposes

## 🤝 Contributing

This is an executive decision-making tool prototype. The system demonstrates:
- Multi-agent AI orchestration
- Role-based access patterns
- Enterprise data integration patterns
- Real-time decision support systems

## 📄 License

Private - Internal Use Only

---

**Built with ❤️ for executive decision-making excellence**
