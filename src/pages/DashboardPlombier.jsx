import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Package, TrendingDown, PlusCircle, AlertTriangle, LogOut, Trash2 } from 'lucide-react';

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

const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
};

const getStyles = (isMobile) => ({
  shell: { display: 'flex', flexDirection: isMobile ? 'column' : 'row', minHeight: '100vh', background: BG },
  sidebar: { width: isMobile ? '100%' : '230px', background: NAVY, padding: isMobile ? '10px' : '24px 14px' },
  main: { flex: 1, padding: isMobile ? '18px 14px' : '28px 32px' },
  card: { background: '#fff', borderRadius: '16px', border: `1px solid ${BORDER}`, marginBottom: '20px', padding: '16px' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { textAlign: 'left', padding: '8px', background: '#f8fafc' },
  td: { padding: '8px', borderBottom: `1px solid ${BORDER}` },
  btnPrimary: { background: NAVY, color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' },
  btnDanger: { background: DANGER_BG, color: DANGER, border: 'none', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer' },
  input: { border: `1px solid ${BORDER}`, padding: '8px', borderRadius: '8px', width: '100%', marginBottom: '12px' },
  select: { border: `1px solid ${BORDER}`, padding: '8px', borderRadius: '8px', width: '100%', marginBottom: '12px' },
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
      setError('Erreur chargement : ' + err.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (plombier) loadData();
  }, [plombier]);

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

  const supprimerSortie = async (sortie) => {
    if (!confirm(`Annuler la sortie de ${sortie.quantite} "${sortie.articleNom}" ?`)) return;
    try {
      const articleSnap = await getDocs(query(collection(db, 'articles'), where('id', '==', sortie.articleId)));
      if (!articleSnap.empty) {
        const article = articleSnap.docs[0].data();
        await updateDoc(doc(db, 'articles', sortie.articleId), {
          quantite_stock: article.quantite_stock + sortie.quantite,
        });
      }
      await deleteDoc(doc(db, 'sorties', sortie.id));
      await loadData();
      setError(`✓ Sortie annulée.`);
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      setError('Erreur : ' + err.message);
    }
  };

  if (error && !plombier) return <div>{error}</div>;
  if (!plombier) return <div>Chargement...</div>;

  const stockBas = articles.filter(a => a.quantite_stock <= a.seuil_alerte);

  return (
    <div style={styles.shell}>
      <aside style={styles.sidebar}>
        <nav style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => setActiveView('espace')} style={{ background: activeView === 'espace' ? '#fff' : 'transparent', color: activeView === 'espace' ? NAVY : '#fff', border: 'none', padding: '8px 12px', borderRadius: '8px' }}>Mon espace</button>
          <button onClick={() => setActiveView('stock')} style={{ background: activeView === 'stock' ? '#fff' : 'transparent', color: activeView === 'stock' ? NAVY : '#fff', border: 'none', padding: '8px 12px', borderRadius: '8px' }}>Stock</button>
          <button onClick={onLogout} style={{ marginLeft: 'auto', background: 'rgba(255,255,255,0.2)', border: 'none', padding: '8px 12px', borderRadius: '8px', color: '#fff' }}>Changer profil</button>
        </nav>
      </aside>
      <main style={styles.main}>
        <h1>Bonjour {plombier.nom}</h1>
        {activeView === 'espace' && (
          <>
            <div style={styles.card}>
              <h2>Déclarer une sortie</h2>
              <select value={form.articleId} onChange={e => setForm({ ...form, articleId: e.target.value })} style={styles.select}>
                <option value="">Choisir un article</option>
                {articles.map(a => <option key={a.id} value={a.id}>{a.nom} (stock: {a.quantite_stock} {a.unite})</option>)}
              </select>
              <input type="number" min="1" placeholder="Quantité" value={form.quantite} onChange={e => setForm({ ...form, quantite: e.target.value })} style={styles.input} />
              <input type="text" placeholder="Chantier" value={form.chantier} onChange={e => setForm({ ...form, chantier: e.target.value })} style={styles.input} />
              <button onClick={handleSortie} style={styles.btnPrimary}>Confirmer</button>
            </div>
            <div style={styles.card}>
              <h2>Mes sorties</h2>
              <table style={styles.table}>
                <thead><tr><th style={styles.th}>Article</th><th>Quantité</th><th>Chantier</th><th>Datvere</th><th></th></tr></thead>
                <tbody>
                  {sorties.map(s => (
                    <tr key={s.id}>
                      <td style={styles.td}>{s.articleNom}</td>
                      <td style={styles.td}>{s.quantite}</td>
                      <td style={styles.td}>{s.chantier}</td>
                      <td style={styles.td}>{s.date}</td>
                      <td style={styles.td}><button onClick={() => supprimerSortie(s)} style={styles.btnDanger}>Annuler</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        {activeView === 'stock' && (
          <div style={styles.card}>
            <h2>Stock disponible</h2>
            <table style={styles.table}>
              <thead><tr><th>Article</th><th>Réf</th><th>Stock</th><th>Unité</th><th>Statut</th></tr></thead>
              <tbody>
                {articles.map(a => (
                  <tr key={a.id}>
                    <td>{a.nom}</td><td>{a.reference}</td><td>{a.quantite_stock}</td><td>{a.unite}</td>
                    <td>{a.quantite_stock <= a.seuil_alerte ? 'Stock bas' : (a.quantite_stock <= a.seuil_alerte*2 ? 'Moyen' : 'OK')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {error && <div style={{ color: error.startsWith('✓') ? SUCCESS : DANGER, marginTop: '16px' }}>{error}</div>}
      </main>
    </div>
  );
}