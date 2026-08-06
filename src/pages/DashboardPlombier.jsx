import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, getDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Package, TrendingDown, PlusCircle, AlertTriangle, LogOut, Users, LogIn, Edit, Trash2, Save, X, Lock } from 'lucide-react';

// ----- COULEURS -----
const NAVY = '#1a3a5c';
const ORANGE = '#e85d24';
const BG = '#f0f4f9';
const BORDER = '#e2e8f0';
const MUTED = '#7a8a9a';
const DANGER = '#dc2626';
const DANGER_BG = '#fee2e2';
const SUCCESS = '#16a34a';
const SUCCESS_BG = '#dcfce7';
const WARNING = '#d97706';

// ----- RESPONSIVE HOOK -----
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
};

// ----- STYLES -----
const s = {
  shell: (isMobile) => ({
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    minHeight: '100vh',
    background: BG,
    fontFamily: "'DM Sans','Segoe UI',sans-serif",
  }),
  sidebar: (isMobile) => ({
    width: isMobile ? '100%' : '230px',
    flexShrink: 0,
    background: NAVY,
    borderRadius: isMobile ? '0 0 20px 20px' : '0 24px 24px 0',
    display: 'flex',
    flexDirection: isMobile ? 'row' : 'column',
    alignItems: isMobile ? 'center' : 'stretch',
    padding: isMobile ? '10px 14px' : '24px 14px',
    position: isMobile ? 'relative' : 'sticky',
    top: 0,
    height: isMobile ? 'auto' : '100vh',
    boxShadow: isMobile
      ? '0 4px 20px rgba(26,58,92,0.12)'
      : '4px 0 20px rgba(26,58,92,0.12)',
    zIndex: 10,
  }),
  logoWrap: (isMobile) => ({
    padding: isMobile ? '0 12px 0 0' : '0 8px 22px',
    borderBottom: isMobile ? 'none' : '1px solid rgba(255,255,255,0.1)',
    borderRight: isMobile ? '1px solid rgba(255,255,255,0.1)' : 'none',
    marginBottom: isMobile ? 0 : '16px',
    marginRight: isMobile ? '12px' : 0,
    display: 'flex',
    alignItems: 'center',
  }),
  nav: (isMobile) => ({
    flex: 1,
    display: 'flex',
    flexDirection: isMobile ? 'row' : 'column',
    gap: isMobile ? '6px' : 0,
    alignItems: isMobile ? 'center' : 'stretch',
  }),
  navBtn: (active, isMobile) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: isMobile ? 'auto' : '100%',
    padding: isMobile ? '8px 12px' : '10px 12px',
    borderRadius: '12px',
    marginBottom: isMobile ? 0 : '4px',
    cursor: 'pointer',
    border: 'none',
    background: active ? 'rgba(255,255,255,0.13)' : 'transparent',
    color: active ? '#fff' : 'rgba(255,255,255,0.55)',
    fontSize: '13px',
    fontWeight: active ? '600' : '400',
    textAlign: 'left',
    whiteSpace: 'nowrap',
  }),
  main: (isMobile) => ({
    flex: 1,
    padding: isMobile ? '18px 14px' : '28px 32px',
    minWidth: 0,
  }),
  pageTitle: { fontSize: '22px', fontWeight: '700', color: '#1a2332', margin: '0 0 4px' },
  pageSub: { fontSize: '13px', color: MUTED, margin: '0 0 24px' },
  statsGrid: (isMobile) => ({
    display: 'grid',
    gridTemplateColumns: isMobile ? 'repeat(3,1fr)' : 'repeat(3,1fr)',
    gap: isMobile ? '10px' : '16px',
    marginBottom: '20px',
  }),
  stat: { background: '#fff', borderRadius: '16px', border: `1px solid ${BORDER}`, padding: '20px', position: 'relative', overflow: 'hidden' },
  statAccent: (c) => ({ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: c }),
  statVal: { fontSize: '28px', fontWeight: '700', color: '#1a2332', lineHeight: 1, marginBottom: '4px' },
  statLbl: { fontSize: '12px', color: MUTED },
  card: { background: '#fff', borderRadius: '16px', border: `1px solid ${BORDER}`, marginBottom: '20px', overflow: 'hidden' },
  cardHead: { padding: '16px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: '8px' },
  cardIcon: { width: '28px', height: '28px', borderRadius: '8px', background: '#e8f0f8', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: '14px', fontWeight: '600', color: '#1a2332' },
  cardBody: { padding: '18px 20px' },
  label: { fontSize: '11px', fontWeight: '600', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '5px' },
  input: { padding: '9px 12px', border: `1px solid ${BORDER}`, borderRadius: '10px', fontSize: '13px', background: '#fff', width: '100%', boxSizing: 'border-box', marginBottom: '12px', outline: 'none' },
  select: { padding: '9px 12px', border: `1px solid ${BORDER}`, borderRadius: '10px', fontSize: '13px', background: '#fff', width: '100%', boxSizing: 'border-box', marginBottom: '12px', outline: 'none' },
  btnPrimary: { background: NAVY, color: '#fff', border: 'none', borderRadius: '10px', padding: '9px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', width: '100%', justifyContent: 'center' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  th: { padding: '8px 12px', textAlign: 'left', color: MUTED, fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', background: '#f8fafc', borderBottom: `1px solid ${BORDER}` },
  td: { padding: '10px 12px', borderBottom: `1px solid ${BORDER}`, color: '#1a2332', fontSize: '13px' },
  badge: (type) => {
    const map = {
      ok: { bg: SUCCESS_BG, color: SUCCESS },
      low: { bg: DANGER_BG, color: DANGER },
      mid: { bg: '#fef3c7', color: WARNING }
    };
    const { bg, color } = map[type] || map.ok;
    return { display: 'inline-block', padding: '3px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: bg, color: color };
  },
  logoutBtn: (isMobile) => ({
    background: 'rgba(255,255,255,0.15)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '6px 12px',
    fontSize: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    marginLeft: isMobile ? 'auto' : 0,
  }),
  tableWrapper: { overflowX: 'auto' },
  selectorContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: BG,
    fontFamily: "'DM Sans','Segoe UI',sans-serif",
    padding: '20px'
  },
  selectorCard: {
    background: '#fff',
    borderRadius: '24px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.05)',
    padding: '28px 24px',
    maxWidth: '500px',
    width: '100%',
    border: `1px solid ${BORDER}`
  },
  selectorButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    background: '#fff',
    border: `1px solid ${BORDER}`,
    borderRadius: '16px',
    padding: '16px 18px',
    width: '100%',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'left',
    boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
  },
  iconBtn: { background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '4px', display: 'inline-flex', alignItems: 'center' },
  editRow: { display: 'flex', gap: '8px', alignItems: 'center' },
  photoThumb: { width: '34px', height: '34px', objectFit: 'cover', borderRadius: '8px', border: `1px solid ${BORDER}` },
  photoPlaceholder: { width: '34px', height: '34px', borderRadius: '8px', background: '#f0f4f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: MUTED, fontSize: '10px' },
  passwordOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(26,58,92,0.45)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 2000, padding: '20px',
  },
  passwordCard: {
    background: '#fff', borderRadius: '20px', padding: '28px 26px',
    maxWidth: '360px', width: '100%', boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
  },
};

export default function DashboardPlombier({ onLogout }) {
  const isMobile = useIsMobile();
  const [selectedPlombierId, setSelectedPlombierId] = useState(null);
  const [plombier, setPlombier] = useState(null);
  const [plombiersList, setPlombiersList] = useState([]);
  const [articles, setArticles] = useState([]);
  const [sorties, setSorties] = useState([]);
  const [form, setForm] = useState({ articleId: '', quantite: 1, chantier: '' });
  const [loading, setLoading] = useState(true);
  const [loadingList, setLoadingList] = useState(false);
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState('espace');
  const [editingSortieId, setEditingSortieId] = useState(null);
  const [editQuantite, setEditQuantite] = useState('');
  const [editChantier, setEditChantier] = useState('');
  const [initializing, setInitializing] = useState(true);

  // ── Gate mot de passe ──
  const [pendingPlombier, setPendingPlombier] = useState(null); // plombier en attente de saisie du mdp
  const [pwdInput, setPwdInput] = useState('');
  const [pwdError, setPwdError] = useState('');

  // Charger l'ID depuis localStorage au montage
  useEffect(() => {
    const storedId = localStorage.getItem('plombierId');
    if (storedId) setSelectedPlombierId(storedId);
    setInitializing(false);
  }, []);

  // Charger la liste des plombiers (si pas d'ID sélectionné)
  useEffect(() => {
    if (selectedPlombierId || initializing) return;
    const fetchPlombiersList = async () => {
      setLoadingList(true);
      try {
        const q = query(collection(db, 'plombiers'), where('role', '==', 'plombier'));
        const snap = await getDocs(q);
        const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setPlombiersList(list);
      } catch (err) {
        setError('Erreur chargement plombiers : ' + err.message);
      }
      setLoadingList(false);
    };
    fetchPlombiersList();
  }, [selectedPlombierId, initializing]);

  // Charger le plombier sélectionné
  useEffect(() => {
    if (!selectedPlombierId) {
      setPlombier(null);
      return;
    }
    const fetchPlombier = async () => {
      try {
        const docRef = doc(db, 'plombiers', selectedPlombierId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setPlombier({ id: snap.id, ...snap.data() });
        } else {
          setError('Plombier introuvable.');
          localStorage.removeItem('plombierId');
          setSelectedPlombierId(null);
        }
      } catch (err) {
        setError('Erreur chargement profil : ' + err.message);
      }
    };
    fetchPlombier();
  }, [selectedPlombierId]);

  // Charger les données (articles + sorties)
  const loadData = async () => {
    if (!plombier) return;
    setLoading(true);
    try {
      const articlesSnap = await getDocs(query(collection(db, 'articles')));
      let articlesData = articlesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      articlesData.sort((a, b) => (a.nom || '').localeCompare(b.nom));
      setArticles(articlesData);

      const sortiesSnap = await getDocs(query(collection(db, 'sorties'), where('plombierId', '==', plombier.id)));
      let sortiesData = sortiesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      sortiesData.sort((a, b) => new Date(b.date) - new Date(a.date));
      setSorties(sortiesData);
    } catch (err) {
      console.error(err);
      setError('Erreur de chargement : ' + err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [plombier]);

  // Ajouter une sortie
  const handleSortie = async () => {
    setError('');
    if (!form.articleId || !form.quantite || !form.chantier) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    const article = articles.find(a => a.id === form.articleId);
    if (!article) return;
    if (article.quantite_stock < form.quantite) {
      setError(`Stock insuffisant (${article.quantite_stock} ${article.unite} disponible(s)).`);
      return;
    }
    try {
      await addDoc(collection(db, 'sorties'), {
        articleId: form.articleId,
        articleNom: article.nom,
        quantite: Number(form.quantite),
        chantier: form.chantier,
        plombierId: plombier.id,
        plombierNom: plombier.nom,
        date: new Date().toLocaleDateString('fr-FR'),
      });
      await updateDoc(doc(db, 'articles', form.articleId), {
        quantite_stock: increment(-Number(form.quantite))
      });
      await loadData();
      setForm({ articleId: '', quantite: 1, chantier: '' });
      setError(`✓ Sortie enregistrée : ${form.quantite} ${article.unite} pour ${form.chantier}`);
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      setError('Erreur : ' + err.message);
    }
  };

  // Modifier une sortie
  const handleEditSortie = async (sortie) => {
    if (!editQuantite || editQuantite <= 0) {
      setError('Quantité invalide');
      return;
    }
    const newQuantite = Number(editQuantite);
    const ancienneQuantite = sortie.quantite;
    const difference = newQuantite - ancienneQuantite; // >0 = on sort plus, <0 = on sort moins
    const article = articles.find(a => a.id === sortie.articleId);
    if (!article) return;

    if (difference > 0 && article.quantite_stock < difference) {
      setError(`Stock insuffisant pour augmenter la sortie de ${difference} ${article.unite}`);
      return;
    }

    try {
      await updateDoc(doc(db, 'sorties', sortie.id), {
        quantite: newQuantite,
        chantier: editChantier,
      });
      await updateDoc(doc(db, 'articles', sortie.articleId), {
        quantite_stock: increment(-difference)
      });
      await loadData();
      setEditingSortieId(null);
      setError(`✓ Sortie modifiée : ${newQuantite} ${article.unite} pour ${editChantier}`);
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      setError('Erreur modification : ' + err.message);
    }
  };

  // Supprimer une sortie
  const handleDeleteSortie = async (sortie) => {
    if (!confirm(`Supprimer cette sortie de ${sortie.quantite} ${sortie.articleNom} ? Le stock sera remis à jour.`)) return;
    try {
      await updateDoc(doc(db, 'articles', sortie.articleId), {
        quantite_stock: increment(sortie.quantite)
      });
      await deleteDoc(doc(db, 'sorties', sortie.id));
      await loadData();
      setError(`✓ Sortie supprimée, ${sortie.quantite} réintégré(s) au stock`);
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      setError('Erreur suppression : ' + err.message);
    }
  };

  // Étape 1 : clic sur un nom → ouvre le gate mot de passe (ne connecte PAS directement)
  const handlePlombierClick = (p) => {
    setPendingPlombier(p);
    setPwdInput('');
    setPwdError('');
  };

  // Étape 2 : validation du mot de passe saisi contre celui stocké sur le profil
  const handlePasswordSubmit = () => {
    if (!pendingPlombier) return;
    if (pwdInput === pendingPlombier.motDePasse) {
      localStorage.setItem('plombierId', pendingPlombier.id);
      setSelectedPlombierId(pendingPlombier.id);
      setPendingPlombier(null);
      setPwdInput('');
      setError('');
    } else {
      setPwdError('Mot de passe incorrect.');
    }
  };

  const handleLogoutClick = () => {
    localStorage.removeItem('plombierId');
    setSelectedPlombierId(null);
    setPlombier(null);
    setSorties([]);
    setForm({ articleId: '', quantite: 1, chantier: '' });
    if (onLogout) onLogout();
  };

  // Écran de chargement initial
  if (initializing) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: BG }}>Chargement...</div>;
  }

  // Écran de sélection des plombiers (si aucun ID stocké) + gate mot de passe
  if (!selectedPlombierId) {
    return (
      <div style={s.selectorContainer}>
        <div style={s.selectorCard}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <img src="https://sosfuitedeau.com/wp-content/uploads/2026/04/logo-removebg-preview.png" alt="Logo" style={{ height: '50px', marginBottom: '16px' }} />
            <h2 style={{ fontSize: '20px', fontWeight: '600', margin: '0 0 6px', color: '#1a2332' }}>Choisissez votre profil</h2>
            <p style={{ fontSize: '13px', color: '#7a8a9a', margin: 0 }}>Sélectionnez votre nom, puis entrez votre mot de passe</p>
          </div>
          {loadingList ? (
            <div style={{ textAlign: 'center', padding: '20px', color: NAVY }}>Chargement des plombiers...</div>
          ) : plombiersList.length === 0 ? (
            <div style={{ textAlign: 'center', color: DANGER, padding: '20px' }}>
              Aucun plombier trouvé. Veuillez en créer un dans l'onglet Plombiers (admin).
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {plombiersList.map(p => (
                <button
                  key={p.id}
                  onClick={() => handlePlombierClick(p)}
                  style={s.selectorButton}
                  onMouseEnter={(e) => e.currentTarget.style.borderColor = NAVY}
                  onMouseLeave={(e) => e.currentTarget.style.borderColor = BORDER}
                >
                  <div style={{
                    background: '#e8f0f8',
                    width: '48px',
                    height: '48px',
                    borderRadius: '30px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: NAVY
                  }}>
                    <Users size={24} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '16px', color: '#1a2332' }}>{p.nom}</div>
                    <div style={{ fontSize: '12px', color: '#7a8a9a' }}>{p.email}</div>
                  </div>
                  <Lock size={16} color={MUTED} />
                </button>
              ))}
            </div>
          )}
        </div>

        {pendingPlombier && (
          <div style={s.passwordOverlay} onClick={() => setPendingPlombier(null)}>
            <div style={s.passwordCard} onClick={e => e.stopPropagation()}>
              <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e8f0f8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                  <Lock size={22} color={NAVY} />
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a2332', margin: '0 0 4px' }}>{pendingPlombier.nom}</h3>
                <p style={{ fontSize: '12px', color: MUTED, margin: 0 }}>Entrez votre mot de passe pour continuer</p>
              </div>
              <input
                type="password"
                autoFocus
                value={pwdInput}
                onChange={e => { setPwdInput(e.target.value); setPwdError(''); }}
                onKeyDown={e => { if (e.key === 'Enter') handlePasswordSubmit(); }}
                placeholder="Mot de passe"
                style={{
                  width: '100%', padding: '12px 14px', borderRadius: '12px',
                  border: `1.5px solid ${pwdError ? DANGER : BORDER}`,
                  fontSize: '14px', marginBottom: '8px', boxSizing: 'border-box', outline: 'none',
                }}
              />
              {pwdError && <p style={{ color: DANGER, fontSize: '12px', margin: '0 0 12px' }}>{pwdError}</p>}
              <button onClick={handlePasswordSubmit} style={{ ...s.btnPrimary, marginBottom: '10px' }}>
                <LogIn size={15} /> Continuer
              </button>
              <button
                onClick={() => setPendingPlombier(null)}
                style={{ background: 'none', border: 'none', color: MUTED, fontSize: '13px', cursor: 'pointer', textDecoration: 'underline', width: '100%' }}
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Dashboard du plombier connecté
  if (error && !plombier) return <div style={{ padding: '40px', color: DANGER }}>{error}</div>;
  if (!plombier) return <div style={{ padding: '40px' }}>Chargement du profil...</div>;

  const stockBas = articles.filter(a => a.quantite_stock <= a.seuil_alerte);

  return (
    <div style={s.shell(isMobile)}>
      <aside style={s.sidebar(isMobile)}>
        <div style={s.logoWrap(isMobile)}>
          <img src="https://sosfuitedeau.com/wp-content/uploads/2026/04/logo-removebg-preview.png" alt="Logo" style={{ height: '34px', objectFit: 'contain' }} />
        </div>
        <nav style={s.nav(isMobile)}>
          <button style={s.navBtn(activeView === 'espace', isMobile)} onClick={() => setActiveView('espace')}>
            <TrendingDown size={16} /> Mon espace
          </button>
          <button style={s.navBtn(activeView === 'stock', isMobile)} onClick={() => setActiveView('stock')}>
            <Package size={16} /> Stock
          </button>
        </nav>
        <div style={{ borderTop: isMobile ? 'none' : '1px solid rgba(255,255,255,0.1)', borderLeft: isMobile ? '1px solid rgba(255,255,255,0.1)' : 'none', paddingTop: isMobile ? 0 : '14px', paddingLeft: isMobile ? '12px' : 0, marginLeft: isMobile ? '8px' : 0 }}>
          <button style={s.logoutBtn(isMobile)} onClick={handleLogoutClick}><LogOut size={13} /> Changer de profil</button>
        </div>
      </aside>

      <main style={s.main(isMobile)}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={s.pageTitle}>Bonjour {plombier.nom}</h1>
          <p style={s.pageSub}>{activeView === 'espace' ? 'Déclarez vos utilisations et consultez votre historique' : 'Consultez le stock disponible'}</p>
        </div>

        {activeView === 'espace' && (
          <div style={s.statsGrid(isMobile)}>
            <div style={s.stat}>
              <div style={s.statAccent(NAVY)} />
              <div style={s.statVal}>{articles.length}</div>
              <div style={s.statLbl}>Articles</div>
            </div>
            <div style={s.stat}>
              <div style={s.statAccent(DANGER)} />
              <div style={{ ...s.statVal, color: stockBas.length ? DANGER : '#1a2332' }}>{stockBas.length}</div>
              <div style={s.statLbl}>Stock bas</div>
            </div>
            <div style={s.stat}>
              <div style={s.statAccent(ORANGE)} />
              <div style={s.statVal}>{sorties.length}</div>
              <div style={s.statLbl}>Mes sorties</div>
            </div>
          </div>
        )}

        {error && (
          <div style={{
            background: error.startsWith('✓') ? SUCCESS_BG : DANGER_BG,
            border: `1px solid ${error.startsWith('✓') ? '#86efac' : '#fca5a5'}`,
            borderRadius: '12px', padding: '12px', marginBottom: '20px',
            color: error.startsWith('✓') ? SUCCESS : DANGER
          }}>
            {error}
          </div>
        )}

        {activeView === 'espace' && (
          <>
            <div style={s.card}>
              <div style={s.cardHead}>
                <div style={s.cardIcon}><TrendingDown size={14} color={NAVY} /></div>
                <span style={s.cardTitle}>Déclarer une utilisation</span>
              </div>
              <div style={s.cardBody}>
                <label style={s.label}>Article utilisé</label>
                <select style={s.select} value={form.articleId} onChange={e => setForm({ ...form, articleId: e.target.value })}>
                  <option value="">Choisir un article…</option>
                  {articles.map(a => (
                    <option key={a.id} value={a.id} disabled={a.quantite_stock <= 0}>
                      {a.nom} — {a.quantite_stock} {a.unite}{a.quantite_stock <= 0 ? ' (épuisé)' : ''}
                    </option>
                  ))}
                </select>
                <label style={s.label}>Quantité</label>
                <input style={s.input} type="number" min="1" value={form.quantite} onChange={e => setForm({ ...form, quantite: e.target.value })} />
                <label style={s.label}>Chantier</label>
                <input style={s.input} type="text" placeholder="Nom ou numéro du chantier" value={form.chantier} onChange={e => setForm({ ...form, chantier: e.target.value })} />
                <button style={s.btnPrimary} onClick={handleSortie}><PlusCircle size={15} /> Confirmer la sortie</button>
              </div>
            </div>

            <div style={s.card}>
              <div style={s.cardHead}>
                <div style={s.cardIcon}><TrendingDown size={14} color={NAVY} /></div>
                <span style={s.cardTitle}>Mes sorties - Modifier / Supprimer</span>
              </div>
              <div style={s.tableWrapper}>
                <table style={s.table}>
                  <thead>
                    <tr><th style={s.th}>Article</th><th style={s.th}>Qté</th><th style={s.th}>Chantier</th><th style={s.th}>Date</th><th style={s.th}>Actions</th></tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="5" style={s.td}>Chargement…</td></tr>
                    ) : sorties.length === 0 ? (
                      <tr><td colSpan="5" style={{ ...s.td, textAlign: 'center' }}>Aucune sortie</td></tr>
                    ) : (
                      sorties.map(s => (
                        <tr key={s.id}>
                          {editingSortieId === s.id ? (
                            <>
                              <td style={s.td}>{s.articleNom}</td>
                              <td style={s.td}>
                                <input type="number" value={editQuantite} onChange={e => setEditQuantite(e.target.value)} style={{ width: '80px', padding: '4px', borderRadius: '4px', border: `1px solid ${BORDER}` }} />
                              </td>
                              <td style={s.td}>
                                <input type="text" value={editChantier} onChange={e => setEditChantier(e.target.value)} style={{ padding: '4px', borderRadius: '4px', border: `1px solid ${BORDER}` }} />
                              </td>
                              <td style={s.td}>{s.date}</td>
                              <td style={s.td}>
                                <div style={s.editRow}>
                                  <button onClick={() => handleEditSortie(s)} style={s.iconBtn}><Save size={16} color={SUCCESS} /></button>
                                  <button onClick={() => setEditingSortieId(null)} style={s.iconBtn}><X size={16} color={DANGER} /></button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td style={s.td}>{s.articleNom}</td>
                              <td style={{ ...s.td, color: DANGER, fontWeight: '700' }}>-{s.quantite}</td>
                              <td style={s.td}>{s.chantier}</td>
                              <td style={s.td}>{s.date}</td>
                              <td style={s.td}>
                                <div style={s.editRow}>
                                  <button onClick={() => { setEditingSortieId(s.id); setEditQuantite(s.quantite); setEditChantier(s.chantier); }} style={s.iconBtn}><Edit size={16} color={NAVY} /></button>
                                  <button onClick={() => handleDeleteSortie(s)} style={s.iconBtn}><Trash2 size={16} color={DANGER} /></button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeView === 'stock' && (
          <div style={s.card}>
            <div style={s.cardHead}>
              <div style={s.cardIcon}><Package size={14} color={NAVY} /></div>
              <span style={s.cardTitle}>Stock disponible</span>
              {stockBas.length > 0 && (
                <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: DANGER, fontWeight: '600' }}>
                  <AlertTriangle size={12} /> {stockBas.length} article(s) bas
                </span>
              )}
            </div>
            <div style={s.tableWrapper}>
              <table style={s.table}>
                <thead>
                  <tr><th style={s.th}>Photo</th><th style={s.th}>Article</th><th style={s.th}>Réf</th><th style={s.th}>Stock</th><th style={s.th}>Unité</th><th style={s.th}>Statut</th></tr>
                </thead>
                <tbody>
                  {articles.map(a => {
                    const type = a.quantite_stock <= a.seuil_alerte ? 'low' : (a.quantite_stock <= a.seuil_alerte * 2 ? 'mid' : 'ok');
                    const label = { ok: 'OK', mid: 'Moyen', low: 'Stock bas' }[type];
                    return (
                      <tr key={a.id}>
                        <td style={s.td}>
                          {a.photoUrl
                            ? <img src={a.photoUrl} alt={a.nom} style={s.photoThumb} />
                            : <div style={s.photoPlaceholder}>—</div>}
                        </td>
                        <td style={{ ...s.td, fontWeight: '500' }}>{a.nom}</td>
                        <td style={s.td}>{a.reference || '—'}</td>
                        <td style={{ ...s.td, fontWeight: '700', color: type === 'low' ? DANGER : '#1a2332' }}>{a.quantite_stock}</td>
                        <td style={s.td}>{a.unite}</td>
                        <td style={s.td}><span style={s.badge(type)}>{label}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}