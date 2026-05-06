import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Package, TrendingDown, PlusCircle, AlertTriangle, LogOut, Undo } from 'lucide-react';

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

// ----- RESPONSIVE -----
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

// ----- STYLES (adaptés mobile + desktop) -----
const getStyles = (isMobile) => ({
  shell: {
    display: 'flex',
    flexDirection: isMobile ? 'column' : 'row',
    minHeight: '100vh',
    background: BG,
    fontFamily: "'DM Sans','Segoe UI',sans-serif",
  },
  sidebar: {
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
  },
  logoWrap: {
    padding: isMobile ? '0 12px 0 0' : '0 8px 22px',
    borderBottom: isMobile ? 'none' : '1px solid rgba(255,255,255,0.1)',
    borderRight: isMobile ? '1px solid rgba(255,255,255,0.1)' : 'none',
    marginBottom: isMobile ? 0 : '16px',
    marginRight: isMobile ? '12px' : 0,
    display: 'flex',
    alignItems: 'center',
  },
  nav: {
    flex: 1,
    display: 'flex',
    flexDirection: isMobile ? 'row' : 'column',
    gap: isMobile ? '6px' : 0,
    alignItems: isMobile ? 'center' : 'stretch',
  },
  navBtn: (active) => ({
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
  main: {
    flex: 1,
    padding: isMobile ? '18px 14px' : '28px 32px',
    minWidth: 0,
  },
  pageTitle: { fontSize: '22px', fontWeight: '700', color: '#1a2332', margin: '0 0 4px' },
  pageSub: { fontSize: '13px', color: MUTED, margin: '0 0 20px' },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: isMobile ? 'repeat(3,1fr)' : 'repeat(3,1fr)',
    gap: isMobile ? '10px' : '16px',
    marginBottom: '20px',
  },
  stat: { background: '#fff', borderRadius: '16px', border: `1px solid ${BORDER}`, padding: '20px', position: 'relative', overflow: 'hidden' },
  statAccent: (c) => ({ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: c }),
  statVal: { fontSize: '28px', fontWeight: '700', color: '#1a2332', lineHeight: 1, marginBottom: '4px' },
  statLbl: { fontSize: '12px', color: MUTED },
  card: { background: '#fff', borderRadius: '16px', border: `1px solid ${BORDER}`, marginBottom: '20px', overflow: 'hidden' },
  cardHead: { padding: '16px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' },
  cardIcon: { width: '28px', height: '28px', borderRadius: '8px', background: '#e8f0f8', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: '14px', fontWeight: '600', color: '#1a2332' },
  cardBody: { padding: '18px 20px' },
  label: { fontSize: '11px', fontWeight: '600', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '5px' },
  input: { padding: '9px 12px', border: `1px solid ${BORDER}`, borderRadius: '10px', fontSize: '13px', background: '#fff', width: '100%', boxSizing: 'border-box', marginBottom: '12px', outline: 'none' },
  select: { padding: '9px 12px', border: `1px solid ${BORDER}`, borderRadius: '10px', fontSize: '13px', background: '#fff', width: '100%', boxSizing: 'border-box', marginBottom: '12px', outline: 'none' },
  btnPrimary: { background: NAVY, color: '#fff', border: 'none', borderRadius: '10px', padding: '9px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', width: '100%', justifyContent: 'center' },
  btnDanger: { background: DANGER_BG, color: DANGER, border: 'none', borderRadius: '8px', padding: '5px 10px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '500px' },
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
  logoutBtn: {
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
  },
  tableWrapper: { overflowX: 'auto', width: '100%' },
});

export default function DashboardPlombier({ onLogout }) {
  const isMobile = useIsMobile();
  const styles = getStyles(isMobile);
  const [plombier, setPlombier] = useState(null);
  const [articles, setArticles] = useState([]);
  const [sorties, setSorties] = useState([]);
  const [form, setForm] = useState({ articleId: '', quantite: 1, chantier: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState('espace');

  // Charger le premier plombier
  useEffect(() => {
    const fetchPlombier = async () => {
      const q = query(collection(db, 'plombiers'), where('role', '==', 'plombier'));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        setPlombier({ id: docSnap.id, ...docSnap.data() });
      } else {
        setError('Aucun plombier trouvé. Créez-en un dans l’onglet Plombiers (admin).');
      }
    };
    fetchPlombier();
  }, []);

  // Charger articles + sorties
  const loadData = async () => {
    if (!plombier) return;
    setLoading(true);
    try {
      const articlesSnap = await getDocs(collection(db, 'articles'));
      let articlesData = articlesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      articlesData.sort((a, b) => (a.nom || '').localeCompare(b.nom));
      setArticles(articlesData);

      const sortiesSnap = await getDocs(query(collection(db, 'sorties'), where('plombierId', '==', plombier.id)));
      let sortiesData = sortiesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      sortiesData.sort((a, b) => new Date(b.date) - new Date(a.date));
      setSorties(sortiesData);
    } catch (err) {
      console.error(err);
      setError('Erreur chargement : ' + err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (plombier) loadData();
  }, [plombier]);

  // Déclarer une sortie
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
        quantite_stock: article.quantite_stock - Number(form.quantite),
      });
      await loadData();
      setForm({ articleId: '', quantite: 1, chantier: '' });
      setError(`✓ Sortie enregistrée : ${form.quantite} ${article.unite} pour ${form.chantier}`);
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      setError('Erreur : ' + err.message);
    }
  };

  // Annuler une sortie (supprimer et restituer le stock)
  const annulerSortie = async (sortie) => {
    if (!confirm(`Annuler la sortie de ${sortie.quantite} "${sortie.articleNom}" ? Le stock sera remis.`)) return;
    try {
      // Récupérer l'article actuel
      const articleRef = doc(db, 'articles', sortie.articleId);
      const articleSnap = await getDocs(query(collection(db, 'articles'), where('id', '==', sortie.articleId)));
      let article = null;
      if (!articleSnap.empty) {
        article = { id: articleSnap.docs[0].id, ...articleSnap.docs[0].data() };
      } else {
        // Si l'article a été supprimé, on ne peut pas restituer
        setError('Impossible de restituer le stock, l’article n’existe plus.');
        return;
      }
      // Restituer le stock
      await updateDoc(doc(db, 'articles', sortie.articleId), {
        quantite_stock: article.quantite_stock + sortie.quantite,
      });
      // Supprimer la sortie
      await deleteDoc(doc(db, 'sorties', sortie.id));
      await loadData();
      setError(`✓ Sortie annulée : ${sortie.quantite} ${article.unite} remis en stock.`);
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      setError('Erreur lors de l’annulation : ' + err.message);
    }
  };

  if (error && !plombier) return <div style={{ padding: '40px', color: DANGER }}>{error}</div>;
  if (!plombier) return <div style={{ padding: '40px' }}>Chargement du profil...</div>;

  const stockBas = articles.filter(a => a.quantite_stock <= a.seuil_alerte);
  const initiales = plombier.nom.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div style={styles.shell}>
      <aside style={styles.sidebar}>
        <div style={styles.logoWrap}>
          <img src="https://sosfuitedeau.com/wp-content/uploads/2026/04/logo-removebg-preview.png" alt="Logo" style={{ height: '34px', objectFit: 'contain' }} />
        </div>
        <nav style={styles.nav}>
          <button style={styles.navBtn(activeView === 'espace')} onClick={() => setActiveView('espace')}>
            <TrendingDown size={16} /> Mon espace
          </button>
          <button style={styles.navBtn(activeView === 'stock')} onClick={() => setActiveView('stock')}>
            <Package size={16} /> Stock
          </button>
        </nav>
        <div>
          <button style={styles.logoutBtn} onClick={onLogout}><LogOut size={13} /> Changer profil</button>
        </div>
      </aside>

      <main style={styles.main}>
        <div>
          <h1 style={styles.pageTitle}>Bonjour {plombier.nom}</h1>
          <p style={styles.pageSub}>{activeView === 'espace' ? 'Déclarez vos utilisations et gérez vos sorties' : 'Consultez le stock disponible'}</p>
        </div>

        {activeView === 'espace' && (
          <div style={styles.statsGrid}>
            <div style={styles.stat}>
              <div style={styles.statAccent(NAVY)} />
              <div style={styles.statVal}>{articles.length}</div>
              <div style={styles.statLbl}>Articles</div>
            </div>
            <div style={styles.stat}>
              <div style={styles.statAccent(DANGER)} />
              <div style={{ ...styles.statVal, color: stockBas.length ? DANGER : '#1a2332' }}>{stockBas.length}</div>
              <div style={styles.statLbl}>Stock bas</div>
            </div>
            <div style={styles.stat}>
              <div style={styles.statAccent(ORANGE)} />
              <div style={styles.statVal}>{sorties.length}</div>
              <div style={styles.statLbl}>Mes sorties</div>
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
            <div style={styles.card}>
              <div style={styles.cardHead}>
                <div style={styles.cardIcon}><TrendingDown size={14} color={NAVY} /></div>
                <span style={styles.cardTitle}>Déclarer une utilisation</span>
              </div>
              <div style={styles.cardBody}>
                <label style={styles.label}>Article utilisé</label>
                <select style={styles.select} value={form.articleId} onChange={e => setForm({ ...form, articleId: e.target.value })}>
                  <option value="">Choisir un article…</option>
                  {articles.map(a => (
                    <option key={a.id} value={a.id} disabled={a.quantite_stock <= 0}>
                      {a.nom} — {a.quantite_stock} {a.unite}{a.quantite_stock <= 0 ? ' (épuisé)' : ''}
                    </option>
                  ))}
                </select>
                <label style={styles.label}>Quantité</label>
                <input style={styles.input} type="number" min="1" value={form.quantite} onChange={e => setForm({ ...form, quantite: e.target.value })} />
                <label style={styles.label}>Chantier</label>
                <input style={styles.input} type="text" placeholder="Nom ou numéro du chantier" value={form.chantier} onChange={e => setForm({ ...form, chantier: e.target.value })} />
                <button style={styles.btnPrimary} onClick={handleSortie}><PlusCircle size={15} /> Confirmer la sortie</button>
              </div>
            </div>

            <div style={styles.card}>
              <div style={styles.cardHead}>
                <div style={styles.cardIcon}><TrendingDown size={14} color={NAVY} /></div>
                <span style={styles.cardTitle}>Mes dernières sorties</span>
              </div>
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr><th style={styles.th}>Article</th><th style={styles.th}>Qté</th><th style={styles.th}>Chantier</th><th style={styles.th}>Date</th><th style={styles.th}>Action</th></tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="5" style={styles.td}>Chargement…</td></tr>
                    ) : sorties.length === 0 ? (
                      <tr><td colSpan="5" style={{ ...styles.td, textAlign: 'center' }}>Aucune sortie</td></tr>
                    ) : (
                      sorties.map(s => (
                        <tr key={s.id}>
                          <td style={styles.td}>{s.articleNom}</td>
                          <td style={{ ...styles.td, color: DANGER, fontWeight: '700' }}>-{s.quantite}</td>
                          <td style={styles.td}>{s.chantier}</td>
                          <td style={styles.td}>{s.date}</td>
                          <td style={styles.td}>
                            <button style={styles.btnDanger} onClick={() => annulerSortie(s)}>
                              <Undo size={14} /> Annuler
                            </button>
                          </td>
                        </table>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeView === 'stock' && (
          <div style={styles.card}>
            <div style={styles.cardHead}>
              <div style={styles.cardIcon}><Package size={14} color={NAVY} /></div>
              <span style={styles.cardTitle}>Stock disponible</span>
              {stockBas.length > 0 && (
                <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: DANGER, fontWeight: '600' }}>
                  <AlertTriangle size={12} /> {stockBas.length} article(s) bas
                </span>
              )}
            </div>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr><th style={styles.th}>Article</th><th style={styles.th}>Réf</th><th style={styles.th}>Stock</th><th style={styles.th}>Unité</th><th style={styles.th}>Statut</th></tr>
                </thead>
                <tbody>
                  {articles.map(a => {
                    const type = a.quantite_stock <= a.seuil_alerte ? 'low' : (a.quantite_stock <= a.seuil_alerte * 2 ? 'mid' : 'ok');
                    const label = { ok: 'OK', mid: 'Moyen', low: 'Stock bas' }[type];
                    return (
                      <tr key={a.id}>
                        <td style={{ ...styles.td, fontWeight: '500' }}>{a.nom}</td>
                        <td style={styles.td}>{a.reference || '—'}</td>
                        <td style={{ ...styles.td, fontWeight: '700', color: type === 'low' ? DANGER : '#1a2332' }}>{a.quantite_stock}</td>
                        <td style={styles.td}>{a.unite}</td>
                        <td style={styles.td}><span style={styles.badge(type)}>{label}</span></td>
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