import { useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './lib/firebase';
import DashboardAdmin from './pages/DashboardAdmin';
import DashboardPlombier from './pages/DashboardPlombier';

const NAVY = '#1a3a5c';
const ORANGE = '#e85d24';

export default function App() {
  const [role, setRole] = useState(null);
  const [plombierChoisi, setPlombierChoisi] = useState(null);
  const [etape, setEtape] = useState('role');
  const [plombiers, setPlombiers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
const [loginError, setLoginError] = useState('');
const ADMIN_PASSWORD = 'Lucioles535*';

  async function chargerPlombiers() {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'plombiers'));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setPlombiers(data.filter(p => p.role === 'plombier'));
    } catch (e) {
      console.error('Erreur chargement plombiers:', e);
    }
    setLoading(false);
  }

  if (role === 'admin') {
    return <DashboardAdmin onLogout={() => { setRole(null); setEtape('role'); }} />;
  }

  if (role === 'plombier' && plombierChoisi) {
    return <DashboardPlombier plombier={plombierChoisi} onLogout={() => { setRole(null); setPlombierChoisi(null); setEtape('role'); }} />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e8f0f8 0%, #f0f4f9 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'DM Sans','Segoe UI',sans-serif",
    }}>
      <div style={{
        background: '#fff', borderRadius: '24px', padding: '48px 40px',
        width: '100%', maxWidth: '420px',
        boxShadow: '0 8px 40px rgba(26,58,92,0.12)', textAlign: 'center',
      }}>
        <img
          src="https://sosfuitedeau.com/wp-content/uploads/2026/04/logo-removebg-preview.png"
          alt="SOS Fuite d'Eau"
          style={{ height: '60px', objectFit: 'contain', marginBottom: '20px' }}
          onError={e => { e.target.style.display = 'none'; }}
        />

        {etape === 'role' && (
          <>
            <h1 style={{ fontSize: '20px', fontWeight: '700', color: NAVY, margin: '0 0 6px' }}>Gestion de Stock</h1>
            <p style={{ fontSize: '13px', color: '#7a8a9a', margin: '0 0 32px' }}>Choisissez votre profil pour continuer</p>

          <button onClick={() => setEtape('login-admin')} style={{
            width: '100%', padding: '16px', marginBottom: '12px',
            background: NAVY, color: '#fff', border: 'none', borderRadius: '14px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px',
          }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>🛠️</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: '700', fontSize: '15px' }}>Administrateur</div>
              <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '2px' }}>Gérer stock, commandes, équipe</div>
            </div>
          </button>

            <button onClick={() => { setEtape('choix-plombier'); chargerPlombiers(); }} style={{
              width: '100%', padding: '16px',
              background: '#f0f4f9', color: NAVY, border: '2px solid #e2e8f0',
              borderRadius: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px',
            }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: '#e8f0f8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>🔧</div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: '700', fontSize: '15px' }}>Plombier</div>
                <div style={{ fontSize: '12px', color: '#7a8a9a', marginTop: '2px' }}>Voir stock, déclarer sorties</div>
              </div>
            </button>
          </>
        )}

        {etape === 'choix-plombier' && (
          <>
            <h1 style={{ fontSize: '18px', fontWeight: '700', color: NAVY, margin: '0 0 6px' }}>Qui êtes-vous ?</h1>
            <p style={{ fontSize: '13px', color: '#7a8a9a', margin: '0 0 24px' }}>Sélectionnez votre nom</p>

            {loading ? (
              <p style={{ color: '#7a8a9a', fontSize: '13px', padding: '20px 0' }}>Chargement…</p>
            ) : plombiers.length === 0 ? (
              <div style={{ color: '#7a8a9a', fontSize: '13px', padding: '16px', background: '#f8fafc', borderRadius: '12px', marginBottom: '12px' }}>
                Aucun plombier trouvé.<br />L'admin doit d'abord ajouter des plombiers.
              </div>
            ) : plombiers.map(p => (
              <button key={p.id} onClick={() => { setPlombierChoisi(p); setRole('plombier'); }} style={{
                width: '100%', padding: '14px 16px', marginBottom: '8px',
                background: '#f8fafc', color: NAVY, border: '1.5px solid #e2e8f0',
                borderRadius: '12px', cursor: 'pointer', textAlign: 'left',
                fontSize: '14px', fontWeight: '500',
                display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: NAVY, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>
                  {p.nom.split(' ').map(n => n[0]).join('').toUpperCase()}
                </div>
                {p.nom}
              </button>
            ))}

            <button onClick={() => setEtape('role')} style={{ marginTop: '8px', background: 'none', border: 'none', color: '#7a8a9a', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}>
              ← Retour
            </button>
          </>
        )}

        {etape === 'login-admin' && (
  <>
    <h1 style={{ fontSize: '18px', fontWeight: '700', color: NAVY, margin: '0 0 6px' }}>Accès Administrateur</h1>
    <p style={{ fontSize: '13px', color: '#7a8a9a', margin: '0 0 24px' }}>Entrez le mot de passe</p>

    <input
      type="password"
      placeholder="Mot de passe"
      value={passwordInput}
      onChange={e => { setPasswordInput(e.target.value); setLoginError(''); }}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          if (passwordInput === ADMIN_PASSWORD) { setRole('admin'); }
          else { setLoginError('Mot de passe incorrect.'); }
        }
      }}
      style={{
        width: '100%', padding: '12px 14px', borderRadius: '12px',
        border: `1.5px solid ${loginError ? '#dc2626' : '#e2e8f0'}`,
        fontSize: '14px', marginBottom: '8px', boxSizing: 'border-box', outline: 'none',
      }}
      autoFocus
    />

    {loginError && (
      <p style={{ color: '#dc2626', fontSize: '12px', margin: '0 0 12px' }}>{loginError}</p>
    )}

    <button
      onClick={() => {
        if (passwordInput === ADMIN_PASSWORD) { setRole('admin'); }
        else { setLoginError('Mot de passe incorrect.'); }
      }}
      style={{
        width: '100%', padding: '12px', background: NAVY, color: '#fff',
        border: 'none', borderRadius: '12px', fontSize: '14px',
        fontWeight: '600', cursor: 'pointer', marginBottom: '10px',
      }}
    >
      Connexion
    </button>

    <button onClick={() => { setEtape('role'); setPasswordInput(''); setLoginError(''); }}
      style={{ background: 'none', border: 'none', color: '#7a8a9a', fontSize: '13px', cursor: 'pointer', textDecoration: 'underline' }}>
      ← Retour
    </button>
  </>
)}
      </div>
    </div>
  );
}