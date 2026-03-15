import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { WorkspaceProvider } from './contexts/WorkspaceContext';
import { FilterProvider } from './contexts/FilterContext';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import SiBoNiLayout from './components/SiBoNiLayout';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import InsightsHub from './pages/InsightsHub';
import DecisionHub from './pages/DecisionHub';
import ExecutionHub from './pages/ExecutionHub';
import "./index.css";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <WorkspaceProvider>
          <FilterProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />

              {/* Protected SiBoNi cockpit routes */}
              <Route
                path="/app/home"
                element={
                  <ProtectedRoute>
                    <SiBoNiLayout><HomePage /></SiBoNiLayout>
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

              {/* Board Brief – placeholder until page is built */}
              <Route path="/app/board" element={<Navigate to="/app/home" replace />} />

              {/* Legacy redirects */}
              <Route path="/dashboard" element={<Navigate to="/app/home" replace />} />
              <Route path="/decisions" element={<Navigate to="/app/decisions" replace />} />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </FilterProvider>
        </WorkspaceProvider>
      </AuthProvider>
    </Router>
  );
}
