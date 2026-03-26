import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { FilterProvider } from './contexts/FilterContext';
import { DecisionStateProvider } from './contexts/DecisionStateContext';
import { PromptProvider } from './contexts/PromptContext';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import SiBoNiLayout from './components/SiBoNiLayout';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import InsightsHub from './pages/InsightsHub';
import DecisionHub from './pages/DecisionHub';
import ExecutionHub from './pages/ExecutionHub';
import BoardBrief from './pages/BoardBrief';
import SignalsConsole from './pages/SignalsConsole';
import AdminPanel from './pages/AdminPanel';
import AnalystStudio from './pages/AnalystStudio';
import "./index.css";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <WorkspaceProvider>
          <FilterProvider>
            <DecisionStateProvider>
            <PromptProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />

              {/* Protected SiBoNi cockpit routes */}
              {/* Home = standalone page (no sidebar) — matches wireframe Screen 3 */}
              <Route
                path="/app/home"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/insights"
                element={
                  <ProtectedRoute>
                    <SiBoNiLayout><InsightsHub /></SiBoNiLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/decisions"
                element={
                  <ProtectedRoute>
                    <SiBoNiLayout><DecisionHub /></SiBoNiLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/decisions/:id"
                element={
                  <ProtectedRoute>
                    <SiBoNiLayout><DecisionHub /></SiBoNiLayout>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/execution"
                element={
                  <ProtectedRoute>
                    <SiBoNiLayout><ExecutionHub /></SiBoNiLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/app/board"
                element={
                  <ProtectedRoute>
                    <SiBoNiLayout><BoardBrief /></SiBoNiLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/app/signals"
                element={
                  <ProtectedRoute>
                    <SiBoNiLayout><SignalsConsole /></SiBoNiLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/app/admin"
                element={
                  <ProtectedRoute>
                    <SiBoNiLayout><AdminPanel /></SiBoNiLayout>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/app/analyst-studio"
                element={
                  <ProtectedRoute>
                    <SiBoNiLayout><AnalystStudio /></SiBoNiLayout>
                  </ProtectedRoute>
                }
              />

              {/* Legacy redirects */}
              <Route path="/dashboard" element={<Navigate to="/app/home" replace />} />
              <Route path="/decisions" element={<Navigate to="/app/decisions" replace />} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            </PromptProvider>
            </DecisionStateProvider>
          </FilterProvider>
        </WorkspaceProvider>
      </AuthProvider>
    </Router>
  );
}
