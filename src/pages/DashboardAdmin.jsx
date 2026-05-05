import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Package, AlertTriangle, TrendingDown, Truck, PlusCircle, History, Users, LogOut, LayoutDashboard, Edit, Trash2, Save, X, Menu } from 'lucide-react';

// ----- COULEURS (inchangées) -----
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

// ----- STYLES DE BASE -----
const s = {
  shell: { display: 'flex', minHeight: '100vh', background: BG, fontFamily: "'DM Sans','Segoe UI',sans-serif", position: 'relative' },
  // Sidebar : version desktop
  sidebar: (isOpen) => ({
    width: '230px',
    flexShrink: 0,
    background: NAVY,
    borderRadius: '0 24px 24px 0',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 14px',
    position: 'sticky',
    top: 0,
    height: '100vh',
    boxShadow: '4px 0 20px rgba(26,58,92,0.12)',
    transition: 'transform 0.2s ease',
    zIndex: 1000,
  }),
  // Sidebar mobile (overlay)
  sidebarMobile: (isOpen) => ({
    position: 'fixed',
    top: 0,
    left: 0,
    width: '260px',
    height: '100vh',
    background: NAVY,
    borderRadius: '0 24px 24px 0',
    display: 'flex',
    flexDirection: 'column',
    padding: '24px 14px',
    transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
    transition: 'transform 0.25s ease',
    zIndex: 1100,
    boxShadow: '2px 0 20px rgba(0,0,0,0.2)',
  }),
  overlay: (isOpen) => ({
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.4)',
    backdropFilter: 'blur(2px)',
    zIndex: 1050,
    display: isOpen ? 'block' : 'none',
    transition: 'all 0.2s',
  }),
  hamburger: {
    position: 'fixed',
    top: '16px',
    left: '16px',
    zIndex: 1200,
    background: NAVY,
    border: 'none',
    borderRadius: '12px',
    padding: '8px',
    color: '#fff',
    cursor: 'pointer',
    display: 'none', // caché par défaut (visible sur mobile via media)
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  main: { flex: 1, padding: '28px 32px', minWidth: 0, transition: 'padding 0.2s' },
  mainMobile: { padding: '70px 16px 20px' },
  pageTitle: { fontSize: '22px', fontWeight: '700', color: '#1a2332', margin: '0 0 4px' },
  pageSub: { fontSize: '13px', color: MUTED, margin: '0 0 24px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '20px' },
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
    const map = {
      ok: { bg: SUCCESS_BG, color: SUCCESS },
      low: { bg: DANGER_BG, color: DANGER },
      mid: { bg: '#fef3c7', color: WARNING }
    };
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
  // Ajout pour les boutons d'édition inline responsive
  inlineEdit: { display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' },
};

// ----- NAVIGATION (inchangée) -----
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
  const [articles, setArticles] = useState([]);
  const [sorties, setSorties] = useState([]);
  const [plombiers, setPlombiers] = useState([]);
  const [bons, setBons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newArt, setNewArt] = useState({ nom: '', reference: '', fournisseur: '', unite: 'Unité', seuil_alerte: 5 });
  const [bon, setBon] = useState({ fournisseur: '', reference_bon: '', lignes: [] });
  const [newPlombier, setNewPlombier] = useState({ nom: '', email: '', role: 'plombier' });
  const [saving, setSaving] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState(null);
  const [editSeuil, setEditSeuil] = useState('');
  
  // Responsive states
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Détection de la largeur d'écran
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fermeture automatique du menu mobile lors du changement d'onglet
  useEffect(() => {
    if (isMobile) setMobileMenuOpen(false);
  }, [tab, isMobile]);

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
    } catch (e) {
      alert('Erreur chargement : ' + e.message);
    }
    setLoading(false);
  }

  async function ajouterArticle() {
    if (!newArt.nom) return alert('Nom requis');
    setSaving(true);
    await addDoc(collection(db, 'articles'), { ...newArt, quantite_stock: 0, seuil_alerte: Number(newArt.seuil_alerte) });
    setNewArt({ nom: '', reference: '', fournisseur: '', unite: 'Unité', seuil_alerte: 5 });
    await loadAll();
    setSaving(false);
  }

  async function validerBon() {
    if (!bon.fournisseur || bon.lignes.length === 0) return alert('Fournisseur et au moins une ligne requis');
    setSaving(true);
    await addDoc(collection(db, 'bons_commande'), {
      fournisseur: bon.fournisseur,
      reference_bon: bon.reference_bon,
      date: new Date().toLocaleDateString('fr-FR'),
      lignes: bon.lignes,
    });
    for (const ligne of bon.lignes) {
      if (!ligne.articleId || !ligne.quantite) continue;
      const article = articles.find(a => a.id === ligne.articleId);
      if (!article) continue;
      await updateDoc(doc(db, 'articles', ligne.articleId), {
        quantite_stock: article.quantite_stock + Number(ligne.quantite),
      });
    }
    setBon({ fournisseur: '', reference_bon: '', lignes: [] });
    await loadAll();
    setSaving(false);
    alert('Bon enregistré — stock mis à jour ✓');
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
    if (!confirm(`Supprimer définitivement l'article "${articleName}" ? Cette action est irréversible.`)) return;
    await deleteDoc(doc(db, 'articles', articleId));
    await loadAll();
  }

  const alertArts = articles.filter(a => a.quantite_stock <= a.seuil_alerte);
  const getBadge = (a) => {
    if (a.quantite_stock <= a.seuil_alerte) return ['low', 'Stock bas'];
    if (a.quantite_stock <= a.seuil_alerte * 2) return ['mid', 'Moyen'];
    return ['ok', 'OK'];
  };

  // Composant réutilisable pour la barre latérale
  const SidebarContent = ({ closeMenu }) => (
    <>
      <div style={s.logoWrap}>
        <img src="https://sosfuitedeau.com/wp-content/uploads/2026/04/logo-removebg-preview.png" alt="Logo" style={{ height: '34px', objectFit: 'contain' }} />
      </div>
      <nav style={{ flex: 1 }}>
        {NAV.map(({ id, label, icon: Icon }) => (
          <button key={id} style={s.navBtn(tab === id)} onClick={() => { setTab(id); closeMenu && closeMenu(); }}>
            <Icon size={16} style={{ flexShrink: 0 }} /> {label}
            {id === 'stock' && alertArts.length > 0 && (
              <span style={{ marginLeft: 'auto', background: ORANGE, color: '#fff', fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '20px' }}>{alertArts.length}</span>
            )}
          </button>
        ))}
      </nav>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '14px' }}>
        <button style={s.navBtn(false)} onClick={onLogout}><LogOut size={15} /> Changer de profil</button>
      </div>
    </>
  );

  // Rendu Dashboard (adapté responsive via CSS Grid, les styles inline gèrent déjà les colonnes, mais on va ajouter une variante via media? Pas possible, donc on utilisera un style conditionnel)
  const renderDashboard = () => (
    <>
      <div style={{ ...s.statsGrid, ...(isMobile ? { gridTemplateColumns: 'repeat(2,1fr)' } : {}) }}>
        {[
          { label: 'Total articles', val: articles.length, color: NAVY, iconBg: '#e8f0f8', icon: <Package size={18} color={NAVY} /> },
          { label: 'Stock faible', val: alertArts.length, color: DANGER, iconBg: DANGER_BG, icon: <AlertTriangle size={18} color={DANGER} /> },
          { label: 'Sorties totales', val: sorties.length, color: SUCCESS, iconBg: SUCCESS_BG, icon: <TrendingDown size={18} color={SUCCESS} /> },
          { label: 'Bons commande', val: bons.length, color: ORANGE, iconBg: '#fff0eb', icon: <Truck size={18} color={ORANGE} /> },
        ].map(({ label, val, color, iconBg, icon }) => (
          <div key={label} style={s.stat}>
            <div style={s.statAccent(color)} />
            <div style={s.statIcon(iconBg)}>{icon}</div>
            <div style={s.statVal}>{val}</div>
            <div style={s.statLbl}>{label}</div>
          </div>
        ))}
      </div>
      {alertArts.length > 0 && (
        <div style={s.alertBanner}>
          <AlertTriangle size={18} color={DANGER} />
          <div>
            <strong style={{ color: DANGER, fontSize: '13px' }}>{alertArts.length} article(s) en stock bas — </strong>
            <span style={{ fontSize: '13px', color: DANGER }}>{alertArts.map(a => `${a.nom} (${a.quantite_stock} ${a.unite})`).join(', ')}</span>
          </div>
        </div>
      )}
      <div style={s.card}>
        <div style={s.cardHead}>
          <div style={s.cardTitle}><div style={s.cardIcon}><TrendingDown size={14} color={NAVY} /></div>Dernières sorties</div>
        </div>
        <div style={s.tableWrapper}>
          <table style={s.table}>
            <thead>
              <tr><th style={s.th}>Article</th><th style={s.th}>Qté</th><th style={s.th}>Chantier</th><th style={s.th}>Plombier</th><th style={s.th}>Date</th></tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={5} style={{ ...s.td, textAlign: 'center', color: MUTED }}>Chargement…</td></tr>
                : sorties.length === 0 ? <tr><td colSpan={5} style={{ ...s.td, textAlign: 'center', color: MUTED }}>Aucune sortie</td></tr>
                : sorties.slice(0, 8).map(sv => (
                  <tr key={sv.id}>
                    <td style={{ ...s.td, fontWeight: '500' }}>{sv.articleNom}</td>
                    <td style={{ ...s.td, color: DANGER, fontWeight: '700' }}>−{sv.quantite}</td>
                    <td style={s.td}>{sv.chantier}</td>
                    <td style={s.td}>{sv.plombierNom}</td>
                    <td style={{ ...s.td, color: MUTED }}>{sv.date}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const renderStock = () => (
    <div style={s.card}>
      <div style={s.cardHead}>
        <div style={s.cardTitle}><div style={s.cardIcon}><Package size={14} color={NAVY} /></div>Articles en stock</div>
        <span style={{ fontSize: '12px', color: MUTED }}>{articles.length} articles</span>
      </div>
      <div style={s.tableWrapper}>
        <table style={s.table}>
          <thead>
            <tr>
              <th style={s.th}>Nom</th><th style={s.th}>Réf</th><th style={s.th}>Fournisseur</th><th style={s.th}>Qté</th><th style={s.th}>Seuil</th><th style={s.th}>Unité</th><th style={s.th}>Statut</th><th style={s.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {articles.length === 0 ?
              <tr><td colSpan={8} style={{ ...s.td, textAlign: 'center', color: MUTED }}>Aucun article</td></tr>
              : articles.map(a => {
                const [type, label] = getBadge(a);
                return (
                  <tr key={a.id}>
                    <td style={{ ...s.td, fontWeight: '500' }}>{a.nom}</td>
                    <td style={{ ...s.td, color: MUTED, fontFamily: 'monospace' }}>{a.reference || '—'}</td>
                    <td style={s.td}>{a.fournisseur || '—'}</td>
                    <td style={{ ...s.td, fontWeight: '700', color: type === 'low' ? DANGER : '#1a2332' }}>{a.quantite_stock}</td>
                    <td style={s.td}>
                      {editingArticleId === a.id ? (
                        <div style={s.inlineEdit}>
                          <input type="number" value={editSeuil} onChange={e => setEditSeuil(e.target.value)} style={{ width: '70px', padding: '4px', borderRadius: '4px', border: `1px solid ${BORDER}` }} autoFocus />
                          <button onClick={() => updateArticleSeuil(a.id, editSeuil)} style={s.btnIcon}><Save size={14} color={SUCCESS} /></button>
                          <button onClick={() => setEditingArticleId(null)} style={s.btnIcon}><X size={14} color={DANGER} /></button>
                        </div>
                      ) : (
                        <div style={s.inlineEdit}>
                          <span>{a.seuil_alerte}</span>
                          <button onClick={() => { setEditingArticleId(a.id); setEditSeuil(a.seuil_alerte.toString()); }} style={s.btnIcon}><Edit size={14} color={NAVY} /></button>
                        </div>
                      )}
                    </td>
                    <td style={s.td}>{a.unite}</td>
                    <td style={s.td}><span style={s.badge(type)}>{label}</span></td>
                    <td style={s.td}>
                      <button onClick={() => deleteArticle(a.id, a.nom)} style={{ ...s.btnIcon, color: DANGER }}><Trash2 size={16} /></button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
      <div style={s.cardBody}>
        <p style={{ fontSize: '11px', fontWeight: '600', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>Ajouter un article</p>
        <div style={s.formGrid}>
          <input style={s.input} placeholder="Nom *" value={newArt.nom} onChange={e => setNewArt({ ...newArt, nom: e.target.value })} />
          <input style={s.input} placeholder="Référence" value={newArt.reference} onChange={e => setNewArt({ ...newArt, reference: e.target.value })} />
          <input style={s.input} placeholder="Fournisseur" value={newArt.fournisseur} onChange={e => setNewArt({ ...newArt, fournisseur: e.target.value })} />
          <input style={s.input} placeholder="Unité (m, u, kg…)" value={newArt.unite} onChange={e => setNewArt({ ...newArt, unite: e.target.value })} />
          <input style={s.input} type="number" placeholder="Seuil alerte" value={newArt.seuil_alerte} onChange={e => setNewArt({ ...newArt, seuil_alerte: e.target.value })} />
          <button style={{ ...s.btnNavy, opacity: saving ? 0.6 : 1 }} onClick={ajouterArticle} disabled={saving}>
            <PlusCircle size={14} /> {saving ? 'Enregistrement…' : 'Ajouter'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderCommandes = () => (
    <div style={s.card}>
      <div style={s.cardHead}>
        <div style={s.cardTitle}><div style={s.cardIcon}><Truck size={14} color={NAVY} /></div>Réceptionner un bon de commande</div>
      </div>
      <div style={s.cardBody}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <input style={{ ...s.input, flex: 1, minWidth: '160px' }} placeholder="Fournisseur *" value={bon.fournisseur} onChange={e => setBon({ ...bon, fournisseur: e.target.value })} />
          <input style={{ ...s.input, flex: 1, minWidth: '160px' }} placeholder="Référence bon" value={bon.reference_bon} onChange={e => setBon({ ...bon, reference_bon: e.target.value })} />
        </div>
        {bon.lignes.map((ligne, idx) => (
          <div key={idx} style={{ ...s.bonRow, flexWrap: isMobile ? 'wrap' : 'nowrap' }}>
            <select style={{ ...s.select, flex: 1 }} value={ligne.articleId} onChange={e => { const l = [...bon.lignes]; l[idx].articleId = e.target.value; setBon({ ...bon, lignes: l }); }}>
              <option value="">Choisir un article…</option>
              {articles.map(a => <option key={a.id} value={a.id}>{a.nom}</option>)}
            </select>
            <input style={{ ...s.input, width: '90px', flexShrink: 0 }} type="number" placeholder="Qté" value={ligne.quantite} onChange={e => { const l = [...bon.lignes]; l[idx].quantite = e.target.value; setBon({ ...bon, lignes: l }); }} />
            <button style={{ ...s.btnDanger, flexShrink: 0 }} onClick={() => setBon({ ...bon, lignes: bon.lignes.filter((_, i) => i !== idx) })}>✕</button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
          <button style={{ ...s.btnNavy, background: '#f0f4f9', color: NAVY }} onClick={() => setBon(b => ({ ...b, lignes: [...b.lignes, { articleId: '', quantite: '' }] }))}>
            <PlusCircle size={14} /> Ajouter ligne
          </button>
          <button style={{ ...s.btnOrange, opacity: saving ? 0.6 : 1 }} onClick={validerBon} disabled={saving}>
            <Truck size={14} /> {saving ? 'Enregistrement…' : 'Valider le bon'}
          </button>
        </div>
      </div>
    </div>
  );

  const renderSorties = () => (
    <div style={s.card}>
      <div style={s.cardHead}>
        <div style={s.cardTitle}><div style={s.cardIcon}><TrendingDown size={14} color={NAVY} /></div>Toutes les sorties</div>
        <span style={{ fontSize: '12px', color: MUTED }}>{sorties.length} entrées</span>
      </div>
      <div style={s.tableWrapper}>
        <table style={s.table}>
          <thead>
            <tr><th style={s.th}>Article</th><th style={s.th}>Qté</th><th style={s.th}>Chantier</th><th style={s.th}>Plombier</th><th style={s.th}>Date</th></tr>
          </thead>
          <tbody>
            {sorties.length === 0 ? <tr><td colSpan={5} style={{ ...s.td, textAlign: 'center', color: MUTED }}>Aucune sortie</td></tr>
              : sorties.map(sv => (
                <tr key={sv.id}>
                  <td style={{ ...s.td, fontWeight: '500' }}>{sv.articleNom}</td>
                  <td style={{ ...s.td, color: DANGER, fontWeight: '700' }}>−{sv.quantite}</td>
                  <td style={s.td}>{sv.chantier}</td>
                  <td style={s.td}>{sv.plombierNom}</td>
                  <td style={{ ...s.td, color: MUTED }}>{sv.date}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPlombiers = () => (
    <div style={s.card}>
      <div style={s.cardHead}>
        <div style={s.cardTitle}><div style={s.cardIcon}><Users size={14} color={NAVY} /></div>Équipe</div>
        <span style={{ fontSize: '12px', color: MUTED }}>{plombiers.length} membres</span>
      </div>
      <div style={s.cardBody}>
        <p style={{ fontSize: '11px', fontWeight: '600', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>Ajouter un membre</p>
        <div style={s.formGrid}>
          <input style={s.input} placeholder="Nom complet *" value={newPlombier.nom} onChange={e => setNewPlombier({ ...newPlombier, nom: e.target.value })} />
          <input style={s.input} placeholder="Email *" value={newPlombier.email} onChange={e => setNewPlombier({ ...newPlombier, email: e.target.value })} />
          <select style={s.select} value={newPlombier.role} onChange={e => setNewPlombier({ ...newPlombier, role: e.target.value })}>
            <option value="plombier">Plombier</option>
            <option value="admin">Admin</option>
          </select>
          <button style={{ ...s.btnNavy, opacity: saving ? 0.6 : 1 }} onClick={ajouterPlombier} disabled={saving}>
            <PlusCircle size={14} /> Ajouter
          </button>
        </div>
      </div>
      <div style={s.tableWrapper}>
        <table style={s.table}>
          <thead>
            <tr><th style={s.th}>Nom</th><th style={s.th}>Email</th><th style={s.th}>Rôle</th><th style={s.th}>Action</th></tr>
          </thead>
          <tbody>
            {plombiers.length === 0 ? <tr><td colSpan={4} style={{ ...s.td, textAlign: 'center', color: MUTED }}>Aucun membre</td></tr>
              : plombiers.map(p => (
                <tr key={p.id}>
                  <td style={{ ...s.td, fontWeight: '500' }}>{p.nom}</td>
                  <td style={{ ...s.td, color: MUTED }}>{p.email}</td>
                  <td style={s.td}>
                    <select value={p.role} onChange={e => changerRolePlombier(p.id, e.target.value)} style={{ ...s.select, width: 'auto', padding: '4px 8px', fontSize: '12px' }}>
                      <option value="plombier">Plombier</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td style={s.td}>
                    <button style={s.btnDanger} onClick={() => supprimerPlombier(p.id, p.nom)}>🗑 Supprimer</button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderHistorique = () => (
    <div style={s.card}>
      <div style={s.cardHead}>
        <div style={s.cardTitle}><div style={s.cardIcon}><History size={14} color={NAVY} /></div>Historique complet</div>
        <span style={{ fontSize: '12px', color: MUTED }}>{sorties.length} mouvements</span>
      </div>
      <div style={s.tableWrapper}>
        <table style={s.table}>
          <thead>
            <tr><th style={s.th}>Article</th><th style={s.th}>Qté</th><th style={s.th}>Chantier</th><th style={s.th}>Plombier</th><th style={s.th}>Date</th></tr>
          </thead>
          <tbody>
            {sorties.length === 0 ? <tr><td colSpan={5} style={{ ...s.td, textAlign: 'center', color: MUTED }}>Aucun mouvement</td></tr>
              : sorties.map(sv => (
                <tr key={sv.id}>
                  <td style={{ ...s.td, fontWeight: '500' }}>{sv.articleNom}</td>
                  <td style={{ ...s.td, color: DANGER, fontWeight: '700' }}>−{sv.quantite}</td>
                  <td style={s.td}>{sv.chantier}</td>
                  <td style={s.td}>{sv.plombierNom}</td>
                  <td style={{ ...s.td, color: MUTED }}>{sv.date}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Ajout d'un style dynamique pour le bouton hamburger
  const hamburgerStyle = { ...s.hamburger, display: isMobile ? 'block' : 'none' };

  return (
    <div style={s.shell}>
      {/* Overlay mobile */}
      <div style={s.overlay(mobileMenuOpen)} onClick={() => setMobileMenuOpen(false)} />

      {/* Bouton hamburger (mobile uniquement) */}
      <button style={hamburgerStyle} onClick={() => setMobileMenuOpen(true)}>
        <Menu size={24} />
      </button>

      {/* Sidebar desktop */}
      {!isMobile && <div style={s.sidebar(false)}><SidebarContent /></div>}

      {/* Sidebar mobile (drawer) */}
      {isMobile && (
        <div style={s.sidebarMobile(mobileMenuOpen)}>
          <SidebarContent closeMenu={() => setMobileMenuOpen(false)} />
        </div>
      )}

      <main style={{ ...s.main, ...(isMobile ? s.mainMobile : {}) }}>
        <div style={{ marginBottom: '24px' }}>
          <h1 style={s.pageTitle}>{NAV.find(n => n.id === tab)?.label}</h1>
          <p style={s.pageSub}>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        {tab === 'dashboard' && renderDashboard()}
        {tab === 'stock' && renderStock()}
        {tab === 'commandes' && renderCommandes()}
        {tab === 'sorties' && renderSorties()}
        {tab === 'plombiers' && renderPlombiers()}
        {tab === 'historique' && renderHistorique()}
      </main>
    </div>
  );
}