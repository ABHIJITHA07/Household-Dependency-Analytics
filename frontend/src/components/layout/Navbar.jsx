import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { useHousehold } from '../../hooks/useHousehold.js';
import { PieChart, User, LogOut, Menu, Home, ChevronDown } from 'lucide-react';
import IconButton from '../common/IconButton.jsx';
import Button from '../common/Button.jsx';

const Navbar = ({ onMobileMenuToggle }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { households, activeHousehold, selectHousehold } = useHousehold();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  return (
    <header
      style={{
        height: '72px',
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-soft)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        {/* Left: Brand Logo & Mobile Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {isAuthenticated && (
            <div className="mobile-toggle" style={{ display: 'flex' }}>
              <IconButton
                icon={Menu}
                title="Toggle Sidebar"
                onClick={onMobileMenuToggle}
              />
            </div>
          )}

          <Link
            to={isAuthenticated ? '/dashboard' : '/'}
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--color-peach) 0%, var(--color-dark-peach) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-cocoa)',
              boxShadow: '0 4px 12px rgba(246, 183, 168, 0.4)'
            }}>
              <PieChart size={22} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--color-dark-text)', lineHeight: 1.1 }}>
                Household Dependency
              </span>
              <span style={{ fontSize: '0.72rem', fontWeight: '600', color: 'var(--color-dark-pistachio)', letterSpacing: '0.04em' }}>
                ANALYTICS & PREDICTION
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Active Household Selector & Auth User Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {isAuthenticated && households.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: 'var(--color-surface-alt)', padding: '4px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
              <Home size={16} color="var(--color-muted-text)" />
              <select
                value={activeHousehold?.id || ''}
                onChange={(e) => selectHousehold(e.target.value)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '0.88rem',
                  fontWeight: '600',
                  color: 'var(--color-dark-text)',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {households.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} (#{h.id})
                  </option>
                ))}
              </select>
            </div>
          )}

          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  background: 'var(--color-surface-alt)',
                  border: '1px solid var(--color-border)',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  cursor: 'pointer',
                  transition: 'var(--transition-fast)'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-pistachio)',
                  color: 'var(--color-cocoa)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '0.85rem'
                }}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--color-dark-text)' }}>
                  {user?.name || 'User'}
                </span>
                <ChevronDown size={14} color="var(--color-muted-text)" />
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <div
                  className="animate-slide-up"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '48px',
                    width: '220px',
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-3d)',
                    border: '1px solid var(--color-border)',
                    padding: '8px',
                    zIndex: 101
                  }}
                >
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border)', marginBottom: '4px' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: '700', color: 'var(--color-dark-text)' }}>
                      {user?.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--color-muted-text)', wordBreak: 'break-all' }}>
                      {user?.email}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setDropdownOpen(false); navigate('/settings'); }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.88rem',
                      fontWeight: '500',
                      color: 'var(--color-dark-text)',
                      background: 'none',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer'
                    }}
                  >
                    <User size={16} />
                    <span>Account Settings</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.88rem',
                      fontWeight: '500',
                      color: 'var(--color-danger)',
                      background: 'none',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      marginTop: '4px'
                    }}
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Button variant="ghost" onClick={() => navigate('/login')} size="sm">
                Sign In
              </Button>
              <Button variant="primary" onClick={() => navigate('/register')} size="sm">
                Get Started
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
