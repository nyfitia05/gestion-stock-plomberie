import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Package, AlertTriangle, TrendingDown, Truck, PlusCircle, History, Users, LogOut, LayoutDashboard, Edit, Trash2, Save, X } from 'lucide-react';

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

const s = {
  shell: { display: 'flex', minHeight: '100vh', background: BG, fontFamily: "'DM Sans','Segoe UI',sans-serif" },
  sidebar: { width: '230px', flexShrink: 0, background: NAVY, borderRadius: '0 24px 24px 0', display: 'flex', flexDirection: 'column', padding: '24px 14px', position: 'sticky', top: 0, height: '100vh', boxShadow: '4px 0 20px rgba(26,58,92,0.12)' },
  logoWrap: { padding: '0 8px 22px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px' },
  navBtn: (active) => ({ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 12px', borderRadius: '12px', marginBottom: '4px', cursor: 'pointer', border: 'none', background: active ? 'rgba(255,255,255,0.13)' : 'transparent', color: active ? '#fff' : 'rgba(255,255,255,0.55)', fontSize: '13px', fontWeight: active ? '600' : '400', textAlign: 'left' }),
  main: { flex: 1, padding: '28px 32px', minWidth: 0 },
  pageTitle: { fontSize: '22px', fontWeight: '700', color: '#1a2332', margin: '0 0 4px' },
  pageSub: { fontSize: '13px', color: MUTED, margin: '0 0 24px' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px', marginBottom: '20px' },
  stat: { background: '#fff', borderRadius: '16px', border: `1px solid ${BORDER}`, padding: '20px', position: 'relative', overflow: 'hidden' },
  statAccent: (c) => ({ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: c }),
  statIcon: (bg) => ({ width: '40px', height: '40px', borderRadius: '12px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }),
  statVal: { fontSize: '28px', fontWeight: '700', color: '#1a2332', lineHeight: 1, marginBottom: '4px' },
  statLbl: { fontSize: '12px', color: MUTED },
  card: { background: '#fff', borderRadius: '16px', border: `1px solid ${BORDER}`, marginBottom: '20px', overflow: 'hidden' },
  cardHead: { padding: '16px 20px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '600', color: '#1a2332' },
  cardIcon: { width: '28px', height: '28px', borderRadius: '8px', background: '#e8f0f8', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardBody: { padding: '18px 20px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
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
  alertBanner: { background: DANGER_BG, border: `1px solid #fca5a5`, borderRadius: '14px', padding: '14px 18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' },
  bonRow: { display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' },
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
  const [articles, setArticles] = useState([]);
  const [sorties, setSorties] = useState([]);
  const [plombiers, setPlombiers] = useState([]);
  const [bons, setBons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newArt, setNewArt] = useState({ nom: '', reference: '', fournisseur: '', unite: 'Unit\u00e9', seuil_alerte: 5 });
  const [bon, setBon] = useState({ fournisseur: '', reference_bon: '', lignes: [] });
  const [newPlombier, setNewPlombier] = useState({ nom: '', email: '', role: 'plombier' });
  const [saving, setSaving] = useState(false);
  const [editingArticleId, setEditingArticleId] = useState(null);
  const [editSeuil, setEditSeuil] = useState('');

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
    setNewArt({ nom: '', reference: '', fournisseur: '', unite: 'Unit\u00e9', seuil_alerte: 5 });
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
    alert('Bon enregistr\u00e9 \u2014 stock mis \u00e0 jour \u2713');
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
    if (!confirm('Supprimer cet article ? Cette action est irr\u00e9versible.')) return;
    await deleteDoc(doc(db, 'articles', articleId));
    await loadAll();
  }

  const alertArts = articles.filter(a => a.quantite_stock <= a.seuil_alerte);

  const getBadge = (a) => {
    if (a.quantite_stock <= a.seuil_alerte) return ['low', 'Stock bas'];
    if (a.quantite_stock <= a.seuil_alerte * 2) return ['mid', 'Moyen'];
    return ['ok', 'OK'];
  };

  const renderDashboard = () => (
    <>
      <div style={s.statsGrid}>
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
          <div style={s.cardTitle}><div style={s.cardIcon}><TrendingDown size={14} color={NAVY} /></div>Derni\u00e8res sorties</div>
        </div>
        <table style={s.table}>
          <thead><tr><th style={s.th}>Article</th><th style={s.th}>Qt\u00e9</th><th style={s.th}>Chantier</th><th style={s.th}>Plombier</th><th style={s.th}>Date</th></tr></thead>
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
    </>
  );

  const renderStock = () => (
    <div style={s.card}>
      <div style={s.cardHead}>
        <div style={s.cardTitle}><div style={s.cardIcon}><Package size={14} color={NAVY} /></div>Articles en stock</div>
        <span style={{ fontSize: '12px', color: MUTED }}>{articles.length} articles</span>
      </div>
      <table style={s.table}>
        <thead>
          <tr><th style={s.th}>Nom</th><th style={s.th}>R\u00e9f</th><th style={s.th}>Fournisseur</th><th style={s.th}>Qt\u00e9</th><th style={s.th}>Seuil</th><th style={s.th}>Unit\u00e9</th><th style={s.th}>Statut</th><th style={s.th}>Actions</th></tr>
        </thead>
        <tbody>
          {articles.length === 0
            ? <tr><td colSpan={8} style={{ ...s.td, textAlign: 'center', color: MUTED }}>Aucun article</td></tr>
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
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <input type="number" value={editSeuil} onChange={e => setEditSeuil(e.target.value)} style={{ width: '70px', padding: '4px', borderRadius: '4px', border: `1px solid ${BORDER}` }} autoFocus />
                        <button onClick={() => updateArticleSeuil(a.id, editSeuil)} style={s.btnIcon}><Save size={14} color={SUCCESS} /></button>
                        <button onClick={() => setEditingArticleId(null)} style={s.btnIcon}><X size={14} color={DANGER} /></button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span>{a.seuil_alerte}</span>
                        <button onClick={() => { setEditingArticleId(a.id); setEditSeuil(a.seuil_alerte.toString()); }} style={s.btnIcon}><Edit size={14} color={NAVY} /></button>
                      </div>
                    )}
                  </td>
                  <td style={s.td}>{a.unite}</td>
                  <td style={s.td}><span style={s.badge(type)}>{label}</span></td>
                  <td style={s.td}><button onClick={() => deleteArticle(a.id, a.nom)} style={{ ...s.btnIcon, color: DANGER }}><Trash2 size={16} /></button></td>
                </tr>
              );
            })}
        </tbody>
      </table>
      <div style={s.cardBody}>
        <p style={{ fontSize: '11px', fontWeight: '600', color: MUTED, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>Ajouter un article</p>
        <div style={s.formGrid}>
          <input style={s.input} placeholder="Nom *" value={newArt.nom} onChange={e => setNewArt({ ...newArt, nom: e.target.value })} />
          <input style={s.input} placeholder="R\u00e9f\u00e9rence" value={newArt.reference} onChange={e => setNewArt({ ...newArt, reference: e.target.value })} />
          <input style={s.input} placeholder="Fournisseur" value={newArt.fournisseur} onChange={e => setNewArt({ ...newArt, fournisseur: e.target.value })} />
          <input style={s.input} placeholder="Unit\u00e9 (m, u, kg…)" value={newArt.unite} onChange={e => setNewArt({ ...newArt, unite: e.target.value })} />
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
        <div style={s.cardTitle}><div style={s.cardIcon}><Truck size={14} color={NAVY} /></div>R\u00e9ceptionner un bon de commande</div>
      </div>
      <div style={s.cardBody}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <input style={{ ...s.input, flex: 1, minWidth: '160px' }} placeholder="Fournisseur *" value={bon.fournisseur} onChange={e => setBon({ ...bon, fournisseur: e.target.value })} />
          <input style={{ ...s.input, flex: 1, minWidth: '160px' }} placeholder="R\u00e9f\u00e9rence bon" value={bon.reference_bon} onChange={e => setBon({ ...bon, reference_bon: e.target.value })} />
        </div>
        {bon.lignes.map((ligne, idx) => (
          <div key={idx} style={s.bonRow}>
            <select style={{ ...s.select, flex: 1 }} value={ligne.articleId} onChange={e => { const l = [...bon.lignes]; l[idx].articleId = e.target.value; setBon({ ...bon, lignes: l }); }}>
              <option value="">Choisir un article…</option>
              {articles.map(a => <option key={a.id} value={a.id}>{a.nom}</option>)}
            </select>
            <input style={{ ...s.input, width: '90px', flexShrink: 0 }} type="number" placeholder="Qt\u00e9" value={ligne.quantite} onChange={e => { const l = [...bon.lignes]; l[idx].quantite = e.target.value; setBon({ ...bon, lignes: l }); }} />
            <button style={{ ...s.btnDanger, flexShrink: 0 }} onClick={() => setBon({ ...bon, lignes: bon.lignes.filter((_, i) => i !== idx) })}>✕</button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
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
        <span style={{ fontSize: '12px', color: MUTED }}>{sorties.length} entr\u00e9es</span>
      </div>
      <table style={s.table}>
        <thead><tr><th style={s.th}>Article</th><th style={s.th}>Qt\u00e9</th><th style={s.th}>Chantier</th><th style={s.th}>Plombier</th><th style={s.th}>Date</th></tr></thead>
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
      <table style={s.table}>
        <thead><tr><th style={s.th}>Nom</th><th style={s.th}>Email</th><th style={s.th}>Rôle</th><th style={s.th}>Action</th></tr></thead>
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
                  <button style={s.btnDanger} onClick={() => supprimerPlombier(p.id, p.nom)}>Supprimer</button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );

  const renderHistorique = () => (
    <div style={s.card}>
      <div style={s.cardHead}>
        <div style={s.cardTitle}><div style={s.cardIcon}><History size={14} color={NAVY} /></div>Historique complet</div>
        <span style={{ fontSize: '12px', color: MUTED }}>{sorties.length} mouvements</span>
      </div>
      <table style={s.table}>
        <thead><tr><th style={s.th}>Article</th><th style={s.th}>Qt\u00e9</th><th style={s.th}>Chantier</th><th style={s.th}>Plombier</th><th style={s.th}>Date</th></tr></thead>
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
  );

  const sidebarContent = (
    <>
      <div style={s.logoWrap}>
        <img src="https://sosfuitedeau.com/wp-content/uploads/2026/04/logo-removebg-preview.png" alt="Logo" style={{ height: '34px', objectFit: 'contain' }} />
      </div>
      <nav style={{ flex: 1 }}>
        {NAV.map(({ id, label, icon: Icon }) => (
          <button key={id} style={s.navBtn(tab === id)} onClick={() => { setTab(id); setDrawerOpen(false); }}>
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

  return (
    <>
      <style>{`
        @media (max-width: 900px) {
          .adm-sidebar { display: none !important; }
          .adm-shell { display: block !important; }
          .adm-topbar  { display: flex !important; }
          .adm-main    { padding: 16px !important; }
          .adm-stats   { grid-template-columns: repeat(2,1fr) !important; gap: 10px !important; }
        }

        @media (max-width: 900px) {
          .adm-shell { display: block !important; }
        }
        @media (min-width: 901px) {
          .adm-topbar  { display: none !important; }
          .adm-drawer  { display: none !important; }
          .adm-overlay { display: none !important; }
        }
        .adm-topbar { background: #1a3a5c; padding: 14px 16px; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; }
        .adm-drawer { position: fixed; top: 0; left: 0; bottom: 0; width: 260px; background: #1a3a5c; z-index: 200; transform: translateX(-100%); transition: transform .25s; display: flex; flex-direction: column; padding: 24px 14px; overflow-y: auto; }
        .adm-drawer.open { transform: translateX(0); }
        .adm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.4); z-index: 190; display: none; }
        .adm-overlay.open { display: block; }
      `}
      
      </style>

      <div className={`adm-overlay${drawerOpen ? ' open' : ''}`} onClick={() => setDrawerOpen(false)} />
      <div className={`adm-drawer${drawerOpen ? ' open' : ''}`}>{sidebarContent}</div>

      <div style={s.shell}>
        <div className="adm-topbar" style={{ display: 'none' }}>
          <span style={{ color: '#fff', fontSize: '14px', fontWeight: '700' }}>SOS Stock — {NAV.find(n => n.id === tab)?.label}</span>
          <button onClick={() => setDrawerOpen(true)} style={{ background: 'rgba(255,255,255,.15)', color: '#fff', border: 'none', borderRadius: '8px', padding: '7px 12px', cursor: 'pointer', fontSize: '18px', lineHeight: 1 }}>☰</button>
        </div>

<aside className="adm-sidebar" style={{ ...s.sidebar, display: 'flex' }}>{sidebarContent}</aside>

        <main style={s.main} className="adm-main">
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
    </>
  );
}