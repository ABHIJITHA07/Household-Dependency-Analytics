import React from 'react';
import { NavLink } from 'react-router-dom';
import { useHousehold } from '../../hooks/useHousehold.js';
import {
  LayoutDashboard,
  Home,
  Receipt,
  TrendingUp,
  BrainCircuit,
  Sparkles,
  History,
  FileSpreadsheet,
  Settings
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { activeHouseholdId } = useHousehold();

  const id = activeHouseholdId || 1;

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Households', path: '/households', icon: Home },
    { label: 'Expenses Manager', path: `/households/${id}/expenses`, icon: Receipt },
    { label: 'Analytics Engine', path: `/households/${id}/analytics`, icon: TrendingUp },
    { label: 'ML Risk Prediction', path: `/households/${id}/prediction`, icon: BrainCircuit },
    { label: 'Monthly History', path: `/households/${id}/history`, icon: History },
    { label: 'PDF Reports', path: `/households/${id}/reports`, icon: FileSpreadsheet },
    { label: 'Settings', path: '/settings', icon: Settings }
  ];

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        height: 'calc(100vh - 72px)',
        position: 'sticky',
        top: '72px',
        boxShadow: 'var(--shadow-soft)',
        zIndex: 90
      }}
    >
      <div style={{
        fontSize: '0.75rem',
        fontWeight: '700',
        color: 'var(--color-muted-text)',
        letterSpacing: '0.08em',
        padding: '0 12px 8px 12px',
        textTransform: 'uppercase'
      }}>
        Command Center
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                borderRadius: 'var(--radius-md)',
                textDecoration: 'none',
                fontSize: '0.92rem',
                fontWeight: isActive ? '700' : '500',
                color: isActive ? 'var(--color-cocoa)' : 'var(--color-dark-text)',
                backgroundColor: isActive ? 'var(--color-primary-soft)' : 'transparent',
                boxShadow: isActive ? '0 4px 12px rgba(246, 183, 168, 0.3)' : 'none',
                transition: 'var(--transition-fast)'
              })}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Active Household Badge in Sidebar */}
      <div style={{
        marginTop: 'auto',
        background: 'linear-gradient(135deg, var(--color-soft-pistachio) 0%, var(--color-warm-butter) 100%)',
        padding: '16px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-pistachio)'
      }}>
        <div style={{ fontSize: '0.82rem', fontWeight: '700', color: 'var(--color-cocoa)', marginBottom: '4px' }}>
          Active Household ID #{id}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-muted-text)' }}>
          Random Forest Predictor & Gemini 2.5 Engine connected.
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
