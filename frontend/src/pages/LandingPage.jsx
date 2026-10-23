import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button.jsx';
import Card from '../components/common/Card.jsx';
import {
  TrendingUp,
  BrainCircuit,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  PieChart,
  FileText,
  Users
} from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      title: 'Deterministic Analytics Engine',
      description: 'Official backend calculations for Dependency Ratio, Financial Condition, Savings Rate, and Expense Ratios.',
      icon: TrendingUp,
      variant: 'peach'
    },
    {
      title: 'Random Forest ML Risk Model',
      description: 'Supervised Machine Learning microservice trained to predict household financial vulnerability (LOW, MEDIUM, HIGH).',
      icon: BrainCircuit,
      variant: 'pistachio'
    },
    {
      title: 'Google Gemini 2.5 Insights',
      description: 'AI-generated qualitative explanations structured into 5 key financial categories with strict safety boundaries.',
      icon: Sparkles,
      variant: 'lavender'
    },
    {
      title: 'Monthly Snapshot & PDF Reports',
      description: 'Track household financial trajectories over time and export official PDF financial condition summaries.',
      icon: FileText,
      variant: 'butter'
    }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '60px', paddingBottom: '40px' }}>
      {/* Navbar for Landing */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '20px 40px',
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        border: '1px solid var(--color-border)',
        marginTop: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            background: 'linear-gradient(135deg, var(--color-peach) 0%, var(--color-dark-peach) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-cocoa)'
          }}>
            <PieChart size={24} />
          </div>
          <span style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--color-dark-text)' }}>
            Household Analytics
          </span>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <Button variant="ghost" onClick={() => navigate('/login')}>
            Sign In
          </Button>
          <Button variant="primary" onClick={() => navigate('/register')}>
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '24px',
        maxWidth: '840px',
        margin: '0 auto',
        paddingTop: '20px'
      }} className="animate-fade-in">
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'var(--color-secondary-soft)',
          color: 'var(--color-dark-pistachio)',
          fontSize: '0.88rem',
          fontWeight: '600',
          border: '1px solid var(--color-pistachio)'
        }}>
          <ShieldCheck size={16} />
          <span>3-Tier Architecture: Deterministic Analytics → ML → Gemini AI</span>
        </div>

        <h1 style={{
          fontSize: '3.2rem',
          fontWeight: '800',
          color: 'var(--color-dark-text)',
          lineHeight: 1.15,
          letterSpacing: '-0.03em'
        }}>
          Household Dependency <br />
          <span style={{
            background: 'linear-gradient(135deg, var(--color-dark-peach) 0%, #B85B43 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Analytics & Prediction System
          </span>
        </h1>

        <p style={{
          fontSize: '1.2rem',
          color: 'var(--color-muted-text)',
          lineHeight: 1.6,
          maxWidth: '680px'
        }}>
          Understand your household structure. Track financial risk patterns. Discover actionable AI-powered suggestions tailored to your earning and dependency ratios.
        </p>

        <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
          <Button variant="primary" size="lg" icon={ArrowRight} onClick={() => navigate('/register')}>
            Create Account
          </Button>
          <Button variant="outline" size="lg" onClick={() => navigate('/login')}>
            Existing Member Sign In
          </Button>
        </div>
      </section>

      {/* 3D Pastel Concept Cards */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '24px'
      }}>
        {features.map((feat) => {
          const Icon = feat.icon;
          return (
            <Card key={feat.title} variant={feat.variant} hoverable style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-surface)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-cocoa)',
                boxShadow: 'var(--shadow-card)'
              }}>
                <Icon size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: 'var(--color-dark-text)', marginBottom: '8px' }}>
                  {feat.title}
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-muted-text)', lineHeight: 1.5 }}>
                  {feat.description}
                </p>
              </div>
            </Card>
          );
        })}
      </section>

      {/* Trust & Architecture Banner */}
      <section style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: 'var(--radius-lg)',
        padding: '36px 40px',
        boxShadow: 'var(--shadow-3d)',
        border: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '24px'
      }}>
        <div style={{ maxWidth: '520px' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: '700', color: 'var(--color-dark-text)', marginBottom: '8px' }}>
            Empowering Financial Resilience
          </h2>
          <p style={{ fontSize: '0.95rem', color: 'var(--color-muted-text)', lineHeight: 1.5 }}>
            Built with strict mathematical bounds. The backend remains the sole authority for financial calculations and ML predictions, ensuring zero ungrounded AI hallucinations.
          </p>
        </div>

        <Button variant="secondary" size="lg" onClick={() => navigate('/register')}>
          Launch Dashboard Demo
        </Button>
      </section>
    </div>
  );
};

export default LandingPage;
