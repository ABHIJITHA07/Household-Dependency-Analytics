import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { HouseholdProvider } from './context/HouseholdContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import ProtectedRoute from './components/layout/ProtectedRoute.jsx';

import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import HouseholdsPage from './pages/HouseholdsPage.jsx';
import HouseholdNewPage from './pages/HouseholdNewPage.jsx';
import HouseholdDetailPage from './pages/HouseholdDetailPage.jsx';
import HouseholdEditPage from './pages/HouseholdEditPage.jsx';
import ExpensesPage from './pages/ExpensesPage.jsx';
import AnalyticsPage from './pages/AnalyticsPage.jsx';
import PredictionPage from './pages/PredictionPage.jsx';
import InsightsPage from './pages/InsightsPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import ReportPreviewPage from './pages/ReportPreviewPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <HouseholdProvider>
          <ToastProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
              <Route path="/households" element={<ProtectedRoute><HouseholdsPage /></ProtectedRoute>} />
              <Route path="/households/new" element={<ProtectedRoute><HouseholdNewPage /></ProtectedRoute>} />
              <Route path="/households/:id" element={<ProtectedRoute><HouseholdDetailPage /></ProtectedRoute>} />
              <Route path="/households/:id/edit" element={<ProtectedRoute><HouseholdEditPage /></ProtectedRoute>} />
              <Route path="/households/:id/expenses" element={<ProtectedRoute><ExpensesPage /></ProtectedRoute>} />
              <Route path="/households/:id/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
              <Route path="/households/:id/prediction" element={<ProtectedRoute><PredictionPage /></ProtectedRoute>} />
              <Route path="/households/:id/insights" element={<ProtectedRoute><InsightsPage /></ProtectedRoute>} />
              <Route path="/households/:id/history" element={<ProtectedRoute><HistoryPage /></ProtectedRoute>} />
              <Route path="/households/:id/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
              <Route path="/households/:id/reports/preview" element={<ProtectedRoute><ReportPreviewPage /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

              {/* 404 Fallback */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </ToastProvider>
        </HouseholdProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
