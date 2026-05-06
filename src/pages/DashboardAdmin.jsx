import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Package, AlertTriangle, TrendingDown, Truck, PlusCircle, History, Users, LogOut, LayoutDashboard, Edit, Trash2, Save, X, Menu } from 'lucide-react';

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

const baseStyles = {
  shell: { display: 'flex', minHeight: '100vh', background: BG, fontFamily: "'DM Sans','Segoe UI',sans-serif", position: 'relative' },
  sidebar: { width: '230px', flexShrink: 0, background: NAVY, borderRadius: '0 24px 24px 0', display: 'flex', flexDirection: 'column', padding: '24px 14px', position: 'sticky', top: 0, height: '100vh', boxShadow: '4px 0 20px rgba(26,58,92,0.12)' },
  logoWrap: { padding: '0 8px 22px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px' },
  navBtn: (active) => ({ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 12px', borderRadius: '12px', marginBottom: '4px', cursor: 'pointer', border: 'none', background: active ? 'rgba(255,255,255,0.13)' : 'transparent', color: active ? '#fff' : 'rgba(255,255,255,0.55)', fontSize: '13px', fontWeight: active ? '600' : '400', textAlign: 'left' }),
  main: { flex: 1, padding: '28px 32px', minWidth: 0 },
  mainMobile: { padding: '70px 16px 20px' },
  pageTitle: { fontSize: '22px', fontWeight: '700', color: '#1a2332', margin: '0 0 4px' },
  pageSub: { fontSize: '13px', color: MUTED, margin: '0 0 24px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '20px' },
  statsGridMobile: { gridTemplateColumns: 'repeat(2,1fr)', gap: '10px' },
  stat: { background: '#fff', borderRadius: '16px', border: `1px solid ${BORDER}`, padding: '20px', position: 'relative', overflow: 'hidden' },
  statAccent: (c) => ({ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: c }),
  statIcon: (bg) => ({ width: '40px', height: '40px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }),
  statVal: { fontSize: '28px', fontWeight: '700', color: '#1a2332', lineHeight: 1, marginBottom: '4px' },
  statLbl: { fontSize: '12px', color: MUTED },
  card: { background: '#fff', borderRadius: '16px', border: `1px solid ${BORDER}`, marginBottom: '20px', overflow: 'hidden' },
  cardHead: { padding: '16px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' },
  cardTitle: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', color: '#1a2332' },
  cardIcon: { width: '28px', height: '28px', borderRadius: '8px', background: '#e8f0f8', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardBody: { padding: '18px 20px' },
  tableWrapper: { overflowX: 'auto', width: '100%' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '600px' },
  th: { padding: '8px 12px', textAlign: 'left', color: MUTED, fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', background: '#f8fafc', borderBottom: `1px solid ${BORDER}` },
  td: { padding: '10px 12px', borderBottom: `1px solid ${BORDER}`, color: '#1a2332', fontSize: '13px' },
  badge: (type) => {
    const map = { ok: { bg: SUCCESS_BG, color: SUCCESS }, low: { bg: DANGER_BG, color: DANGER }, mid: { bg: '#fef3c7', color: WARNING } };
    const { bg, color } = map[type] || map.ok;
    return { display: 'inline-block', padding: '3px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: bg, color: color };
  },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '10px', background: '#f8fafc', padding: '16px', borderRadius: '12px', marginTop: '14px' },
  input: { padding: '9px 12px', border: `1px solid ${BORDER}`, borderRadius: '10px', fontSize: '13px', background: '#fff', width: '100%', boxSizing: 'border-box', outline: 'none' },
  select: { padding: '9px 12px', border: `1px solid ${BORDER}`, borderRadius: '10px', fontSize: '13px', background: '#fff', width: '100%', boxSizing: 'border-box', outline: 'none' },
  btnNavy: { background: NAVY, color: '#fff', border: 'none', borderRadius: '10px', padding: '9px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' },
  btnOrange: { background: ORANGE, color: '#fff', border: 'none', borderRadius: '10px', padding: '9px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' },
  btnDanger: { background: DANGER_BG, color: DANGER, border: 'none', borderRadius: '8px', padding: '5px 10px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' },
  btnIcon: { background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '12px' },
  alertBanner: { background: DANGER_BG, border: `1px solid #fca5a5`, borderRadius: '14px', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  bonRow: { display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center', flexWrap: 'wrap' },
  hamburger: { position: 'fixed', top: '16px', left: '16px', zIndex: 1200, background: NAVY, border: 'none', borderRadius: '12px', padding: '8px', color: '#fff', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
  drawer: { position: 'fixed', top: 0, left: 0, bottom: 0, width: '260px', background: NAVY, zIndex: 1100, transform: 'translateX(-100%)', transition: 'transform 0.25s ease', display: 'flex', flexDirection: 'column', padding: '24px 14px', overflowY: 'auto', boxShadow: '2px 0 20px rgba(0,0,0,0.2)' },
  drawerOpen: { transform: 'translateX(0)' },
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)', zIndex: 1050, display: 'none' },
  overlayOpen: { display: 'block' },
};

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'stock', label: 'Stock', icon: Package },
  { id: 'commandes', label: 'Commandes', icon: Truck },
  { id: 'sorties', label: 'Sorties', icon: TrendingDown },
  { id: 'plombiers', label: 'Plombiers', icon: Users },
  { id: 'historique', label: 'Historique', icon: History },
];

export default function DashboardAdmin({ onLogout }) {
  const [tab, setTab] = useState('dashboard');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [articles, setArticles] = useState([]);
  const [sorties, setSorties] = useState([]);
  const [plombiers, setPlombiers] = useState([]);
  const [bons, setBons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newArt, setNewArt] = useState({ nom: '', reference: '', fournisseur: '', unite: 'Unité', seuil_alerte: 5, quantite_stock: 0 });  
  const [newPlombier, setNewPlombier] = useState({ nom: '', email: '', role: 'plombier' });
  const [saving, setSaving] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState(null);
  const [editSeuil, setEditSeuil] = useState('');

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => { if (isMobile) setDrawerOpen(false); }, [tab, isMobile]);
  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    setLoading(true);
    try {
      const [artSnap, sortSnap, plombSnap, bonSnap] = await Promise.all([
        getDocs(query(collection(db, 'articles'), orderBy('nom'))),
        getDocs(query(collection(db, 'sorties'), orderBy('date', 'desc'))),
        getDocs(query(collection(db, 'plombiers'), orderBy('nom'))),
        getDocs(collection(db, 'bons_commande')),
      ]);
      setArticles(artSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setSorties(sortSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setPlombiers(plombSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      setBons(bonSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { alert('Erreur chargement : ' + e.message); }
    setLoading(false);
  }

async function ajouterArticle() {
  if (!newArt.nom) return alert('Nom requis');
  setSaving(true);
  const dateAjout = new Date().toLocaleDateString('fr-FR');
  await addDoc(collection(db, 'articles'), {
    ...newArt,
    quantite_stock: Number(newArt.quantite_stock) || 0,
    seuil_alerte: Number(newArt.seuil_alerte) || 5,
    derniere_commande: dateAjout, // ← date d'insertion automatique
  });
  setNewArt({ nom: '', reference: '', fournisseur: '', unite: 'Unité', seuil_alerte: 5, quantite_stock: 0 });
  await loadAll();
  setSaving(false);
}

async function updateArticleQuantite(articleId, newQty) {
  if (isNaN(newQty) || newQty < 0) return;
  await updateDoc(doc(db, 'articles', articleId), {
    quantite_stock: Number(newQty),
    derniere_commande: new Date().toLocaleDateString('fr-FR'), // ← date du dernier update
  });
  await loadAll();
  setEditingArticleId(null);
}




  async function ajouterPlombier() {
    if (!newPlombier.nom || !newPlombier.email) return alert('Nom et email requis');
    setSaving(true);
    await addDoc(collection(db, 'plombiers'), { ...newPlombier });
    setNewPlombier({ nom: '', email: '', role: 'plombier' });
    await loadAll();
    setSaving(false);
  }

  async function supprimerPlombier(id, nom) {
    if (!confirm(`Supprimer ${nom} ?`)) return;
    await deleteDoc(doc(db, 'plombiers', id));
    await loadAll();
  }

  async function changerRolePlombier(id, role) {
    await updateDoc(doc(db, 'plombiers', id), { role });
    await loadAll();
  }

  async function updateArticleSeuil(articleId, newSeuil) {
    if (isNaN(newSeuil) || newSeuil < 0) return;
    await updateDoc(doc(db, 'articles', articleId), { seuil_alerte: Number(newSeuil) });
    await loadAll();
    setEditingArticleId(null);
  }

  async function deleteArticle(articleId, articleName) {
    if (!confirm(`Supprimer définitivement l'article "${articleName}" ?`)) return;
    await deleteDoc(doc(db, 'articles', articleId));
    await loadAll();
  }

  const alertArts = articles.filter(a => a.quantite_stock <= a.seuil_alerte);
  const getBadge = (a) => {
    if (a.quantite_stock <= a.seuil_alerte) return ['low', 'Stock bas'];
    if (a.quantite_stock <= a.seuil_alerte * 2) return ['mid', 'Moyen'];
    return ['ok', 'OK'];
  };

  const SidebarContent = () => (
    <>
      <div style={baseStyles.logoWrap}>
        <img src="https://sosfuitedeau.com/wp-content/uploads/2026/04/logo-removebg-preview.png" alt="Logo" style={{ height: '34px', objectFit: 'contain' }} />
      </div>
      <nav style={{ flex: 1 }}>
        {NAV.map(({ id, label, icon: Icon }) => (
          <button key={id} style={baseStyles.navBtn(tab === id)} onClick={() => setTab(id)}>
            <Icon size={16} style={{ flexShrink: 0 }} /> {label}
            {id === 'stock' && alertArts.length > 0 && (
              <span style={{ marginLeft: 'auto', background: ORANGE, color: '#fff', fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '20px' }}>{alertArts.length}</span>
            )}
          </button>
        ))}
      </nav>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '14px' }}>
        <button style={baseStyles.navBtn(false)} onClick={onLogout}><LogOut size={15} /> Changer de profil</button>
      </div>
    </>
  );

  const renderDashboard = () => (
    <>
      <div style={{ ...baseStyles.statsGrid, ...(isMobile ? baseStyles.statsGridMobile : {}) }}>
        {[
          { label: 'Total articles', val: articles.length, color: NAVY, iconBg: '#e8f0f8', icon: <Package size={18} color={NAVY} /> },
          { label: 'Stock faible', val: alertArts.length, color: DANGER, iconBg: DANGER_BG, icon: <AlertTriangle size={18} color={DANGER} /> },
          { label: 'Sorties totales', val: sorties.length, color: SUCCESS, iconBg: SUCCESS_BG, icon: <TrendingDown size={18} color={SUCCESS} /> },
          { label: 'Bons commande', val: bons.length, color: ORANGE, iconBg: '#fff0eb', icon: <Truck size={18} color={ORANGE} /> },
        ].map(({ label, val, color, iconBg, icon }) => (
          <div key={label} style={baseStyles.stat}>
            <div style={baseStyles.statAccent(color)} />
            <div style={baseStyles.statIcon(iconBg)}>{icon}</div>
            <div style={baseStyles.statVal}>{val}</div>
            <div style={baseStyles.statLbl}>{label}</div>
          </div>
        ))}
      </div>
      {alertArts.length > 0 && (
        <div style={baseStyles.alertBanner}>
          <AlertTriangle size={18} color={DANGER} />
          <div>
            <strong style={{ color: DANGER, fontSize: '13px' }}>{alertArts.length} article(s) en stock bas — </strong>
            <span style={{ fontSize: '13px', color: DANGER }}>{alertArts.map(a => `${a.nom} (${a.quantite_stock} ${a.unite})`).join(', ')}</span>
          </div>
        </div>
      )}
      <div style={baseStyles.card}>
        <div style={baseStyles.cardHead}>
          <div style={baseStyles.cardTitle}><div style={baseStyles.cardIcon}><TrendingDown size={14} color={NAVY} /></div>Dernières sorties</div>
        </div>
        <div style={baseStyles.tableWrapper}>
          <table style={baseStyles.table}>
            <thead><tr><th style={baseStyles.th}>Article</th><th style={baseStyles.th}>Qté</th><th style={baseStyles.th}>Chantier</th><th style={baseStyles.th}>Plombier</th><th style={baseStyles.th}>Date</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={5} style={{ ...baseStyles.td, textAlign: 'center', color: MUTED }}>Chargement…</td></tr>
                : sorties.length === 0 ? <tr><td colSpan={5} style={{ ...baseStyles.td, textAlign: 'center', color: MUTED }}>Aucune sortie</td></tr>
                : sorties.slice(0, 8).map(sv => (
                  <tr key={sv.id}>
                    <td style={{ ...baseStyles.td, fontWeight: '500' }}>{sv.articleNom}</td>
                    <td style={{ ...baseStyles.td, color: DANGER, fontWeight: '700' }}>−{sv.quantite}</td>
                    <td style={baseStyles.td}>{sv.chantier}</td>
                    <td style={baseStyles.td}>{sv.plombierNom}</td>
                    <td style={{ ...baseStyles.td, color: MUTED }}>{sv.date}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  // MODIFIÉ : Stock affiche les articles + colonne "Dernière commande"
  const renderStock = () => (
    <div style={baseStyles.card}>
      <div style={baseStyles.cardHead}>
        <div style={baseStyles.cardTitle}><div style={baseStyles.cardIcon}><Package size={14} color={NAVY} /></div>Articles en stock</div>
        <span style={{ fontSize: '12px', color: MUTED }}>{articles.length} articles</span>
      </div>
      <div style={baseStyles.tableWrapper}>
        <table style={baseStyles.table}>
          <thead>
            <tr>
              <th style={baseStyles.th}>Nom</th>
              <th style={baseStyles.th}>Réf</th>
              <th style={baseStyles.th}>Fournisseur</th>
              <th style={baseStyles.th}>Qté</th>
              <th style={baseStyles.th}>Seuil</th>
              <th style={baseStyles.th}>Unité</th>
              <th style={baseStyles.th}>Statut</th>
              <th style={baseStyles.th}>Dernière commande</th>
              <th style={baseStyles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.length === 0
              ? <tr><td colSpan={9} style={{ ...baseStyles.td, textAlign: 'center', color: MUTED }}>Aucun article</td></tr>
              : articles.map(a => {
                const [type, label] = getBadge(a);
                return (
                  <tr key={a.id}>
                    <td style={{ ...baseStyles.td, fontWeight: '500' }}>{a.nom}</td>
                    <td style={{ ...baseStyles.td, color: MUTED, fontFamily: 'monospace' }}>{a.reference || '—'}</td>
                    <td style={baseStyles.td}>{a.fournisseur || '—'}</td>
                    <td style={{ ...baseStyles.td, fontWeight: '700', color: type === 'low' ? DANGER : '#1a2332' }}>{a.quantite_stock}</td>
                    <td style={baseStyles.td}>
                      {editingArticleId === a.id ? (
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          <input type="number" value={editSeuil} onChange={e => setEditSeuil(e.target.value)} style={{ width: '70px', padding: '4px', borderRadius: '4px', border: `1px solid ${BORDER}` }} autoFocus />
                          <button onClick={() => updateArticleSeuil(a.id, editSeuil)} style={baseStyles.btnIcon}><Save size={14} color={SUCCESS} /></button>
                          <button onClick={() => setEditingArticleId(null)} style={baseStyles.btnIcon}><X size={14} color={DANGER} /></button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span>{a.seuil_alerte}</span>
                          <button onClick={() => { setEditingArticleId(a.id); setEditSeuil(a.seuil_alerte.toString()); }} style={baseStyles.btnIcon}><Edit size={14} color={NAVY} /></button>
                        </div>
                      )}
                    </td>
                    <td style={baseStyles.td}>{a.unite}</td>
                    <td style={baseStyles.td}><span style={baseStyles.badge(type)}>{label}</span></td>
                    <td style={{ ...baseStyles.td, color: MUTED, fontSize: '12px' }}>
                      {a.derniere_commande
                        ? <span style={{ background: '#e8f0f8', color: NAVY, padding: '2px 8px', borderRadius: '8px', fontSize: '11px' }}>{a.derniere_commande}</span>
                        : <span style={{ color: MUTED }}>Jamais commandé</span>}
                    </td>
                    <td style={baseStyles.td}><button onClick={() => deleteArticle(a.id, a.nom)} style={{ ...baseStyles.btnIcon, color: DANGER }}><Trash2 size={16} /></button></td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );

  // MODIFIÉ : Commandes = ajout article + réception livraison
const renderCommandes = () => (
  <>
    <div style={baseStyles.card}>
      <div style={baseStyles.cardHead}>
        <div style={baseStyles.cardTitle}>
          <div style={baseStyles.cardIcon}><Package size={14} color={NAVY} /></div>
          Ajouter un article
        </div>
      </div>
      <div style={baseStyles.cardBody}>
        <p style={{ fontSize: '11px', fontWeight: '600', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>
          Informations article + quantité initiale
        </p>
        <div style={baseStyles.formGrid}>
          <input style={baseStyles.input} placeholder="Nom *" value={newArt.nom} onChange={e => setNewArt({ ...newArt, nom: e.target.value })} />
          <input style={baseStyles.input} placeholder="Référence" value={newArt.reference} onChange={e => setNewArt({ ...newArt, reference: e.target.value })} />
          <input style={baseStyles.input} placeholder="Fournisseur" value={newArt.fournisseur} onChange={e => setNewArt({ ...newArt, fournisseur: e.target.value })} />
          <input style={baseStyles.input} placeholder="Unité (m, u, kg…)" value={newArt.unite === 'Unité' ? '' : newArt.unite} onChange={e => setNewArt({ ...newArt, unite: e.target.value })} />
          <input style={baseStyles.input} type="number" placeholder="Seuil alerte (ex: 5)" value={newArt.seuil_alerte === 5 ? '' : newArt.seuil_alerte} onChange={e => setNewArt({ ...newArt, seuil_alerte: e.target.value })} />
          <input style={baseStyles.input} type="number" placeholder="Quantité initiale" value={newArt.quantite_stock === 0 ? '' : newArt.quantite_stock} onChange={e => setNewArt({ ...newArt, quantite_stock: e.target.value })} />          <button style={{ ...baseStyles.btnNavy, opacity: saving ? 0.6 : 1 }} onClick={ajouterArticle} disabled={saving}>
            <PlusCircle size={14} /> {saving ? 'Enregistrement…' : 'Ajouter l\'article'}
          </button>
        </div>
      </div>
    </div>

    <div style={baseStyles.card}>
      <div style={baseStyles.cardHead}>
        <div style={baseStyles.cardTitle}>
          <div style={baseStyles.cardIcon}><Package size={14} color={NAVY} /></div>
          Catalogue &amp; stocks
        </div>
        <span style={{ fontSize: '12px', color: MUTED }}>{articles.length} articles</span>
      </div>
      <div style={baseStyles.tableWrapper}>
        <table style={baseStyles.table}>
          <thead>
            <tr>
              <th style={baseStyles.th}>Nom</th>
              <th style={baseStyles.th}>Réf</th>
              <th style={baseStyles.th}>Fournisseur</th>
              <th style={baseStyles.th}>Quantité</th>
              <th style={baseStyles.th}>Unité</th>
              <th style={baseStyles.th}>Seuil</th>
              <th style={baseStyles.th}>Statut</th>
              <th style={baseStyles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.length === 0
              ? <tr><td colSpan={8} style={{ ...baseStyles.td, textAlign: 'center', color: MUTED }}>Aucun article</td></tr>
              : articles.map(a => {
                const [type, label] = getBadge(a);
                return (
                  <tr key={a.id}>
                    <td style={{ ...baseStyles.td, fontWeight: '500' }}>{a.nom}</td>
                    <td style={{ ...baseStyles.td, color: MUTED, fontFamily: 'monospace' }}>{a.reference || '—'}</td>
                    <td style={baseStyles.td}>{a.fournisseur || '—'}</td>
                    <td style={baseStyles.td}>
                      {editingArticleId === a.id ? (
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          <input
                            type="number" value={editSeuil}
                            onChange={e => setEditSeuil(e.target.value)}
                            style={{ width: '70px', padding: '4px', borderRadius: '4px', border: `1px solid ${BORDER}` }}
                            autoFocus
                          />
                          <button onClick={() => updateArticleQuantite(a.id, editSeuil)} style={baseStyles.btnIcon}><Save size={14} color={SUCCESS} /></button>
                          <button onClick={() => setEditingArticleId(null)} style={baseStyles.btnIcon}><X size={14} color={DANGER} /></button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <span style={{ fontWeight: '700', color: type === 'low' ? DANGER : '#1a2332' }}>{a.quantite_stock}</span>
                          <button onClick={() => { setEditingArticleId(a.id); setEditSeuil(a.quantite_stock.toString()); }} style={baseStyles.btnIcon}>
                            <Edit size={14} color={NAVY} />
                          </button>
                        </div>
                      )}
                    </td>
                    <td style={baseStyles.td}>{a.unite}</td>
                    <td style={baseStyles.td}>{a.seuil_alerte}</td>
                    <td style={baseStyles.td}><span style={baseStyles.badge(type)}>{label}</span></td>
                    <td style={baseStyles.td}>
                      <button onClick={() => deleteArticle(a.id, a.nom)} style={{ ...baseStyles.btnIcon, color: DANGER }}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  </>
);

  const renderSorties = () => (
    <div style={baseStyles.card}>
      <div style={baseStyles.cardHead}>
        <div style={baseStyles.cardTitle}><div style={baseStyles.cardIcon}><TrendingDown size={14} color={NAVY} /></div>Toutes les sorties</div>
        <span style={{ fontSize: '12px', color: MUTED }}>{sorties.length} entrées</span>
      </div>
      <div style={baseStyles.tableWrapper}>
        <table style={baseStyles.table}>
          <thead><tr><th style={baseStyles.th}>Article</th><th style={baseStyles.th}>Qté</th><th style={baseStyles.th}>Chantier</th><th style={baseStyles.th}>Plombier</th><th style={baseStyles.th}>Date</th></tr></thead>
          <tbody>
            {sorties.length === 0 ? <tr><td colSpan={5} style={{ ...baseStyles.td, textAlign: 'center', color: MUTED }}>Aucune sortie</td></tr>
              : sorties.map(sv => (
                <tr key={sv.id}>
                  <td style={{ ...baseStyles.td, fontWeight: '500' }}>{sv.articleNom}</td>
                  <td style={{ ...baseStyles.td, color: DANGER, fontWeight: '700' }}>−{sv.quantite}</td>
                  <td style={baseStyles.td}>{sv.chantier}</td>
                  <td style={baseStyles.td}>{sv.plombierNom}</td>
                  <td style={{ ...baseStyles.td, color: MUTED }}>{sv.date}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPlombiers = () => (
    <div style={baseStyles.card}>
      <div style={baseStyles.cardHead}>
        <div style={baseStyles.cardTitle}><div style={baseStyles.cardIcon}><Users size={14} color={NAVY} /></div>Équipe</div>
        <span style={{ fontSize: '12px', color: MUTED }}>{plombiers.length} membres</span>
      </div>
      <div style={baseStyles.cardBody}>
        <p style={{ fontSize: '11px', fontWeight: '600', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>Ajouter un membre</p>
        <div style={baseStyles.formGrid}>
          <input style={baseStyles.input} placeholder="Nom complet *" value={newPlombier.nom} onChange={e => setNewPlombier({ ...newPlombier, nom: e.target.value })} />
          <input style={baseStyles.input} placeholder="Email *" value={newPlombier.email} onChange={e => setNewPlombier({ ...newPlombier, email: e.target.value })} />
          <select style={baseStyles.select} value={newPlombier.role} onChange={e => setNewPlombier({ ...newPlombier, role: e.target.value })}>
            <option value="plombier">Plombier</option>
            <option value="admin">Admin</option>
          </select>
          <button style={{ ...baseStyles.btnNavy, opacity: saving ? 0.6 : 1 }} onClick={ajouterPlombier} disabled={saving}>
            <PlusCircle size={14} /> Ajouter
          </button>
        </div>
      </div>
      <div style={baseStyles.tableWrapper}>
        <table style={baseStyles.table}>
          <thead><tr><th style={baseStyles.th}>Nom</th><th style={baseStyles.th}>Email</th><th style={baseStyles.th}>Rôle</th><th style={baseStyles.th}>Action</th></tr></thead>
          <tbody>
            {plombiers.length === 0 ? <tr><td colSpan={4} style={{ ...baseStyles.td, textAlign: 'center', color: MUTED }}>Aucun membre</td></tr>
              : plombiers.map(p => (
                <tr key={p.id}>
                  <td style={{ ...baseStyles.td, fontWeight: '500' }}>{p.nom}</td>
                  <td style={{ ...baseStyles.td, color: MUTED }}>{p.email}</td>
                  <td style={baseStyles.td}>
                    <select value={p.role} onChange={e => changerRolePlombier(p.id, e.target.value)} style={{ ...baseStyles.select, width: 'auto', padding: '4px 8px', fontSize: '12px' }}>
                      <option value="plombier">Plombier</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td style={baseStyles.td}>
                    <button style={baseStyles.btnDanger} onClick={() => supprimerPlombier(p.id, p.nom)}>Supprimer</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );

const renderHistorique = () => {
  // On fusionne sorties + bons en une seule liste
  const mouvements = [
    ...sorties.map(s => ({
      id: 'sortie-' + s.id,
      type: 'sortie',
      article: s.articleNom,
      quantite: s.quantite,
      detail: s.chantier,
      acteur: s.plombierNom,
      date: s.date,
    })),
    ...bons.map(b => ({
      id: 'bon-' + b.id,
      type: 'reception',
      article: b.lignes?.map(l => {
        const art = articles.find(a => a.id === l.articleId);
        return `${art?.nom || l.articleId} (×${l.quantite})`;
      }).join(', ') || '—',
      quantite: b.lignes?.reduce((sum, l) => sum + Number(l.quantite || 0), 0),
      detail: b.reference_bon || '—',
      acteur: b.fournisseur,
      date: b.date,
    })),
  ].sort((a, b) => {
    // Tri par date décroissante (format dd/mm/yyyy)
    const parse = d => {
      if (!d) return 0;
      const [day, month, year] = d.split('/');
      return new Date(year, month - 1, day).getTime();
    };
    return parse(b.date) - parse(a.date);
  });

  return (
    <div style={baseStyles.card}>
      <div style={baseStyles.cardHead}>
        <div style={baseStyles.cardTitle}>
          <div style={baseStyles.cardIcon}><History size={14} color={NAVY} /></div>
          Historique complet
        </div>
        <span style={{ fontSize: '12px', color: MUTED }}>{mouvements.length} mouvements</span>
      </div>
      <div style={baseStyles.tableWrapper}>
        <table style={baseStyles.table}>
          <thead>
            <tr>
              <th style={baseStyles.th}>Type</th>
              <th style={baseStyles.th}>Article(s)</th>
              <th style={baseStyles.th}>Qté</th>
              <th style={baseStyles.th}>Réf / Chantier</th>
              <th style={baseStyles.th}>Fournisseur / Plombier</th>
              <th style={baseStyles.th}>Date</th>
            </tr>
          </thead>
          <tbody>
            {mouvements.length === 0
              ? <tr><td colSpan={6} style={{ ...baseStyles.td, textAlign: 'center', color: MUTED }}>Aucun mouvement</td></tr>
              : mouvements.map(m => (
                <tr key={m.id}>
                  <td style={baseStyles.td}>
                    {m.type === 'sortie'
                      ? <span style={baseStyles.badge('low')}>Sortie</span>
                      : <span style={baseStyles.badge('ok')}>Réception</span>}
                  </td>
                  <td style={{ ...baseStyles.td, fontWeight: '500', maxWidth: '200px' }}>{m.article}</td>
                  <td style={{ ...baseStyles.td, fontWeight: '700', color: m.type === 'sortie' ? DANGER : SUCCESS }}>
                    {m.type === 'sortie' ? `−${m.quantite}` : `+${m.quantite}`}
                  </td>
                  <td style={baseStyles.td}>{m.detail}</td>
                  <td style={baseStyles.td}>{m.acteur}</td>
                  <td style={{ ...baseStyles.td, color: MUTED }}>{m.date}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

  return (
    <>
      <div style={{ ...baseStyles.overlay, ...(drawerOpen && baseStyles.overlayOpen) }} onClick={() => setDrawerOpen(false)} />
      <div style={{ ...baseStyles.drawer, ...(drawerOpen && baseStyles.drawerOpen) }}>
        <SidebarContent />
      </div>
      {isMobile && (
        <button style={baseStyles.hamburger} onClick={() => setDrawerOpen(true)}>
          <Menu size={24} />
        </button>
      )}
      <div style={baseStyles.shell}>
        {!isMobile && <aside style={baseStyles.sidebar}><SidebarContent /></aside>}
        <main style={{ ...baseStyles.main, ...(isMobile && baseStyles.mainMobile) }}>
          <div style={{ marginBottom: '24px' }}>
            <h1 style={baseStyles.pageTitle}>{NAV.find(n => n.id === tab)?.label}</h1>
            <p style={baseStyles.pageSub}>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          {tab === 'dashboard' && renderDashboard()}
          {tab === 'stock' && renderStock()}
          {tab === 'commandes' && renderCommandes()}
          {tab === 'sorties' && renderSorties()}
          {tab === 'plombiers' && renderPlombiers()}
          {tab === 'historique' && renderHistorique()}
        </main>
      </div>
    </>
  );
}