import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import App from '../App.jsx';
import Button from '../components/common/Button.jsx';
import Input from '../components/common/Input.jsx';
import PageLoader from '../components/common/PageLoader.jsx';
import ErrorState from '../components/common/ErrorState.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import Layout from '../components/layout/Layout.jsx';
import ProtectedRoute from '../components/layout/ProtectedRoute.jsx';
import { AuthProvider, AuthContext } from '../context/AuthContext.jsx';
import { HouseholdProvider, HouseholdContext } from '../context/HouseholdContext.jsx';
import { ToastProvider } from '../context/ToastContext.jsx';
import api from '../services/api.js';

import LandingPage from '../pages/LandingPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import HouseholdsPage from '../pages/HouseholdsPage.jsx';
import HouseholdNewPage from '../pages/HouseholdNewPage.jsx';
import AnalyticsPage from '../pages/AnalyticsPage.jsx';
import PredictionPage from '../pages/PredictionPage.jsx';
import InsightsPage from '../pages/InsightsPage.jsx';

vi.mock('react-chartjs-2', () => ({
  Bar: () => <div data-testid="bar-chart-mock" />,
  Doughnut: () => <div data-testid="doughnut-chart-mock" />
}));

const renderWithRouter = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  return render(ui);
};

describe('Phase 11: End-to-End Frontend Integration Test Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  /* ----------------------------------------------------
   * 1. AUTHENTICATION INTEGRATION TESTS
   * ---------------------------------------------------- */
  describe('1. Authentication Integration', () => {
    test('TC-INT-01: Login success updates session state and redirects', async () => {
      vi.spyOn(api, 'post').mockResolvedValue({
        success: true,
        data: {
          token: 'jwt_mock_token_123',
          user: { id: 10, name: 'Integration User', email: 'user@example.com' }
        }
      });
      vi.spyOn(api, 'get').mockResolvedValue({
        success: true,
        data: []
      });

      renderWithRouter(<App />, { route: '/login' });

      fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'user@example.com' } });
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'Password123!' } });
      fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

      await waitFor(() => {
        expect(localStorage.getItem('auth_token')).toBe('jwt_mock_token_123');
      });
    });

    test('TC-INT-02: Login failure displays error toast message', async () => {
      vi.spyOn(api, 'post').mockRejectedValue({
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      });

      renderWithRouter(<App />, { route: '/login' });

      fireEvent.change(screen.getByLabelText(/Email Address/i), { target: { value: 'wrong@example.com' } });
      fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrongpass' } });
      fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));

      await waitFor(() => {
        expect(screen.getByText(/Invalid email or password/i)).toBeInTheDocument();
      });
    });

    test('TC-INT-03: Session restoration loads profile on refresh', async () => {
      localStorage.setItem('auth_token', 'stored_jwt_token');
      vi.spyOn(api, 'get').mockImplementation((url) => {
        if (url === '/auth/me') return Promise.resolve({ success: true, data: { user: { id: 2, name: 'Restored User', email: 'restored@example.com' } } });
        if (url === '/households') return Promise.resolve({ success: true, data: [] });
        return Promise.resolve({ success: true, data: {} });
      });

      renderWithRouter(<App />, { route: '/dashboard' });

      await waitFor(() => {
        expect(screen.getAllByText(/Restored User/i)[0]).toBeInTheDocument();
      });
    });
  });

  /* ----------------------------------------------------
   * 2. HOUSEHOLD CRUD INTEGRATION TESTS
   * ---------------------------------------------------- */
  describe('2. Household CRUD Integration', () => {
    test('TC-INT-04: Household list renders empty state when user has no households', async () => {
      localStorage.setItem('auth_token', 'valid_token');
      vi.spyOn(api, 'get').mockImplementation((url) => {
        if (url === '/auth/me') return Promise.resolve({ success: true, data: { user: { id: 1, name: 'Test User' } } });
        if (url === '/households') return Promise.resolve({ success: true, data: [] });
        return Promise.reject(new Error('Not found'));
      });

      render(
        <MemoryRouter initialEntries={['/households']}>
          <AuthProvider>
            <HouseholdProvider>
              <ToastProvider>
                <Routes>
                  <Route path="/households" element={<ProtectedRoute><HouseholdsPage /></ProtectedRoute>} />
                </Routes>
              </ToastProvider>
            </HouseholdProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/No Households Created Yet/i)).toBeInTheDocument();
      });
    });

    test('TC-INT-05: Household creation sends POST /api/households with valid body', async () => {
      localStorage.setItem('auth_token', 'valid_token');
      vi.spyOn(api, 'get').mockImplementation((url) => {
        if (url === '/auth/me') return Promise.resolve({ success: true, data: { user: { id: 1, name: 'Test User' } } });
        if (url === '/households') return Promise.resolve({ success: true, data: [] });
        return Promise.resolve({ success: true, data: {} });
      });

      const postSpy = vi.spyOn(api, 'post').mockResolvedValue({
        success: true,
        data: { id: 101, name: 'Sharma Household', totalMembers: 4, earningMembers: 2, dependentMembers: 2, childrenCount: 1, elderlyCount: 0, monthlyIncome: 85000 }
      });

      render(
        <MemoryRouter initialEntries={['/households/new']}>
          <AuthProvider>
            <HouseholdProvider>
              <ToastProvider>
                <Routes>
                  <Route path="/households/new" element={<ProtectedRoute><HouseholdNewPage /></ProtectedRoute>} />
                </Routes>
              </ToastProvider>
            </HouseholdProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByLabelText(/Household Name/i)).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/Household Name/i), { target: { value: 'Sharma Household' } });
      fireEvent.click(screen.getByRole('button', { name: /Create Household/i }));

      await waitFor(() => {
        expect(postSpy).toHaveBeenCalledWith('/households', expect.objectContaining({
          name: 'Sharma Household'
        }));
      });
    });
  });

  /* ----------------------------------------------------
   * 3. ANALYTICS & ZERO EARNERS EDGE CASE TESTS
   * ---------------------------------------------------- */
  describe('3. Analytics Integration & Zero Earners Edge Case', () => {
    test('TC-INT-06: Zero earning members renders "Not Computable" for dependency ratio', async () => {
      localStorage.setItem('auth_token', 'valid_token');
      vi.spyOn(api, 'get').mockImplementation((url) => {
        if (url === '/auth/me') return Promise.resolve({ success: true, data: { user: { id: 1, name: 'Test User' } } });
        if (url === '/households') return Promise.resolve({ success: true, data: [{ id: 50, name: 'Zero Earner Household', totalMembers: 3, earningMembers: 0, dependentMembers: 3, monthlyIncome: 0 }] });
        if (url === '/households/50/analytics') return Promise.resolve({
          success: true,
          data: {
            demographics: { totalMembers: 3, earningMembers: 0, dependentMembers: 3 },
            dependencyRatio: null,
            dependencyLevel: 'HIGH',
            financials: { monthlyIncome: 0, totalExpenses: 15000, savings: -15000, savingsRate: null, financialCondition: 'NO_INCOME', essentialExpenses: 15000, nonEssentialExpenses: 0, essentialPercentage: 100, nonEssentialPercentage: 0, expenseRatio: null },
            explanations: { dependencyText: 'Zero earners', financialText: 'No income' }
          }
        });
        return Promise.resolve({ success: true, data: {} });
      });

      render(
        <MemoryRouter initialEntries={['/households/50/analytics']}>
          <AuthProvider>
            <HouseholdProvider>
              <ToastProvider>
                <Routes>
                  <Route path="/households/:id/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
                </Routes>
              </ToastProvider>
            </HouseholdProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getAllByText(/Not Computable/i)[0]).toBeInTheDocument();
        expect(screen.getByText(/Zero Earning Members Warning/i)).toBeInTheDocument();
      });
    });
  });

  /* ----------------------------------------------------
   * 4. ML PREDICTION INTEGRATION TESTS
   * ---------------------------------------------------- */
  describe('4. ML Prediction Integration', () => {
    test('TC-INT-07: Prediction page renders risk level badge and model confidence estimate', async () => {
      localStorage.setItem('auth_token', 'valid_token');
      vi.spyOn(api, 'get').mockImplementation((url) => {
        if (url === '/auth/me') return Promise.resolve({ success: true, data: { user: { id: 1, name: 'Test User' } } });
        if (url === '/households') return Promise.resolve({ success: true, data: [{ id: 1, name: 'Test Household' }] });
        if (url === '/households/1/prediction') return Promise.resolve({
          success: true,
          data: {
            predictionId: 5,
            householdId: 1,
            predictedRiskLevel: 'HIGH',
            confidence: '98.50%',
            modelVersion: 'rf-v1.0.0',
            topFactors: ['High dependency ratio'],
            isStale: false
          }
        });
        return Promise.resolve({ success: true, data: {} });
      });

      render(
        <MemoryRouter initialEntries={['/households/1/prediction']}>
          <AuthProvider>
            <HouseholdProvider>
              <ToastProvider>
                <Routes>
                  <Route path="/households/:id/prediction" element={<ProtectedRoute><PredictionPage /></ProtectedRoute>} />
                </Routes>
              </ToastProvider>
            </HouseholdProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Predicted Vulnerability Status/i)).toBeInTheDocument();
        expect(screen.getAllByText(/Model Confidence Estimate/i)[0]).toBeInTheDocument();
        expect(screen.getByText(/98.50%/i)).toBeInTheDocument();
      });
    });
  });

  /* ----------------------------------------------------
   * 5. GEMINI AI INSIGHTS INTEGRATION TESTS
   * ---------------------------------------------------- */
  describe('5. Gemini AI Insights Integration', () => {
    test('TC-INT-08: Insights page renders 5 required categories and disclaimer', async () => {
      localStorage.setItem('auth_token', 'valid_token');
      vi.spyOn(api, 'get').mockImplementation((url) => {
        if (url === '/auth/me') return Promise.resolve({ success: true, data: { user: { id: 1, name: 'Test User' } } });
        if (url === '/households') return Promise.resolve({ success: true, data: [{ id: 1, name: 'Test Household' }] });
        return Promise.resolve({ success: true, data: {} });
      });

      vi.spyOn(api, 'post').mockResolvedValue({
        success: true,
        data: {
          insightId: 10,
          cached: true,
          modelName: 'gemini-2.5-flash',
          sections: {
            understandHousehold: 'Household summary text',
            expenseReview: 'Expense review text',
            savingsStability: 'Savings stability text',
            growthOpportunities: 'Growth opportunities text',
            thingsToMonitor: 'Things to monitor text'
          },
          disclaimer: 'Official test disclaimer'
        }
      });

      render(
        <MemoryRouter initialEntries={['/households/1/insights']}>
          <AuthProvider>
            <HouseholdProvider>
              <ToastProvider>
                <Routes>
                  <Route path="/households/:id/insights" element={<ProtectedRoute><InsightsPage /></ProtectedRoute>} />
                </Routes>
              </ToastProvider>
            </HouseholdProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/1. Understand Your Household/i)).toBeInTheDocument();
        expect(screen.getByText(/2. Expense Review/i)).toBeInTheDocument();
        expect(screen.getByText(/3. Savings & Financial Stability/i)).toBeInTheDocument();
        expect(screen.getByText(/4. Growth & Optimization Opportunities/i)).toBeInTheDocument();
        expect(screen.getByText(/5. Things to Monitor/i)).toBeInTheDocument();
        expect(screen.getByText(/Official test disclaimer/i)).toBeInTheDocument();
      });
    });
  });

  /* ----------------------------------------------------
   * 6. FLOATING GEMINI CHATBOT WIDGET TESTS
   * ---------------------------------------------------- */
  describe('6. Floating Gemini Chatbot Widget', () => {
    test('TC-INT-09: Gemini AI Insights is absent from sidebar navigation and floating chatbot toggles correctly', async () => {
      localStorage.setItem('auth_token', 'valid_token');
      vi.spyOn(api, 'get').mockImplementation((url) => {
        if (url === '/auth/me') return Promise.resolve({ success: true, data: { user: { id: 1, name: 'Test User' } } });
        if (url === '/households') return Promise.resolve({ success: true, data: [{ id: 1, name: 'Test Household' }] });
        return Promise.resolve({ success: true, data: {} });
      });

      const postSpy = vi.spyOn(api, 'post').mockResolvedValue({
        success: true,
        data: {
          reply: 'Here is your personalized household savings advice from Gemini.',
          disclaimer: 'Educational disclaimer'
        }
      });

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <AuthProvider>
            <HouseholdProvider>
              <ToastProvider>
                <Routes>
                  <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                </Routes>
              </ToastProvider>
            </HouseholdProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Command Center/i)).toBeInTheDocument();
      });

      // 1. Verify Gemini is NOT in sidebar navigation
      const navLinks = screen.getAllByRole('link');
      const sidebarGeminiLink = navLinks.find(link => link.textContent.includes('Gemini AI Insights'));
      expect(sidebarGeminiLink).toBeUndefined();

      // 2. Verify floating chatbot trigger button exists
      const toggleBtn = screen.getByRole('button', { name: /Open Gemini AI Assistant/i });
      expect(toggleBtn).toBeInTheDocument();

      // 3. Click to open chatbot window
      fireEvent.click(toggleBtn);

      await waitFor(() => {
        expect(screen.getByText(/Hi! How can I help you understand your household finances today\?/i)).toBeInTheDocument();
      });

      // 4. Send question to backend
      const input = screen.getByPlaceholderText(/Ask me anything about your household finances\.\.\./i);
      const sendBtn = screen.getByRole('button', { name: /Send Message/i });

      fireEvent.change(input, { target: { value: 'How can I save more money?' } });
      fireEvent.click(sendBtn);

      await waitFor(() => {
        expect(postSpy).toHaveBeenCalledWith('/ai/chat', expect.objectContaining({
          message: 'How can I save more money?'
        }));
        expect(screen.getByText(/Here is your personalized household savings advice from Gemini\./i)).toBeInTheDocument();
      });

      // 5. Close chatbot window
      const closeBtn = screen.getByRole('button', { name: /Close Chat/i });
      fireEvent.click(closeBtn);

      await waitFor(() => {
        expect(screen.queryByText(/Hi! How can I help you understand your household finances today\?/i)).not.toBeInTheDocument();
      });
    });
  });
});
