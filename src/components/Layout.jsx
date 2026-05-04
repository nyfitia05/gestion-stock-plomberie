import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { LayoutDashboard, Users, LogOut, Package } from 'lucide-react';

const NAV = '#1a3a5c';
const ORANGE = '#e85d24';

export default function Layout({ children, session, isAdmin }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const adminLinks = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/plombiers', label: 'Plombiers', icon: Users },
  ];

  const plombierLinks = [
    { path: '/', label: 'Mon espace', icon: Package },
  ];

  const links = isAdmin ? adminLinks : plombierLinks;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f0f4f9', fontFamily: "'DM Sans','Segoe UI',sans-serif" }}>
      {/* SIDEBAR */}
      <aside style={{
        width: '220px',
        flexShrink: 0,
        background: NAV,
        borderRadius: '0 24px 24px 0',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px 14px',
        position: 'sticky',
        top: 0,
        height: '100vh',
        boxShadow: '4px 0 20px rgba(26,58,92,0.12)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '18px' }}>
          <img
            src="https://sosfuitedeau.com/wp-content/uploads/2026/04/logo-removebg-preview.png"
            alt="SOS Fuite d'Eau"
            style={{ height: '36px', objectFit: 'contain' }}
            onError={e => { e.target.style.display = 'none'; }}
          />
        </div>

        {/* Nav */}
        <nav style={{ flex: 1 }}>
          {links.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  width: '100%', padding: '10px 12px', borderRadius: '12px',
                  marginBottom: '4px', cursor: 'pointer', border: 'none',
                  background: active ? 'rgba(255,255,255,0.13)' : 'transparent',
                  color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                  fontSize: '13px', fontWeight: active ? '600' : '400',
                  textAlign: 'left',
                }}
              >
                <Icon size={16} style={{ flexShrink: 0 }} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Footer sidebar */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '14px' }}>
          <div style={{ padding: '0 8px 10px', fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
            {session.user.email}
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              width: '100%', padding: '9px 12px', borderRadius: '12px',
              border: 'none', background: 'transparent',
              color: 'rgba(255,255,255,0.5)', fontSize: '13px', cursor: 'pointer',
            }}
          >
            <LogOut size={15} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* CONTENT */}
      <main style={{ flex: 1, padding: '28px 32px', minWidth: 0, overflowX: 'hidden' }}>
        {children}
      </main>
    </div>
  );
}