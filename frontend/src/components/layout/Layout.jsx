import React, { useState } from 'react';
import Navbar from './Navbar.jsx';
import Sidebar from './Sidebar.jsx';
import Footer from './Footer.jsx';
import GeminiChatWidget from '../chat/GeminiChatWidget.jsx';
import { useHousehold } from '../../hooks/useHousehold.js';

const Layout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currentHousehold } = useHousehold();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      {/* 3D Ambient Background Blobs */}
      <div className="ambient-bg" aria-hidden="true">
        <div className="blob-3d blob-peach"></div>
        <div className="blob-3d blob-pistachio"></div>
        <div className="blob-3d blob-butter"></div>
        <div className="blob-3d blob-lavender"></div>
      </div>

      <Navbar onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />

      <div style={{ display: 'flex', flex: 1, position: 'relative', zIndex: 1 }}>
        <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

        <main style={{
          flex: 1,
          padding: '32px 36px',
          maxWidth: '1350px',
          width: '100%',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {children}
        </main>
      </div>

      <Footer />

      {/* Floating Gemini AI Chat Assistant Widget */}
      <GeminiChatWidget currentHouseholdId={currentHousehold?.id} />
    </div>
  );
};

export default Layout;
