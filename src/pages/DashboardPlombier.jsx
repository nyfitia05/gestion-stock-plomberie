import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Package, TrendingDown, PlusCircle, AlertTriangle, LogOut, LayoutDashboard } from 'lucide-react';

const NAVY = '#1a3a5c';
const ORANGE = '#e85d24';
const BORDER = '#e2e8f0';
const MUTED = '#7a8a9a';
const DANGER = '#dc2626';
const DANGER_BG = '#fee2e2';
const SUCCESS = '#16a34a';
const SUCCESS_BG = '#dcfce7';
const WARNING = '#d97706';
const WARNING_BG = '#fef3c7';

export default function DashboardPlombier({ plombier, onLogout }) {
  const [tab, setTab] = useState('dashboard');
  const [articles, setArticles] = useState([]);
  const [sorties, setSorties] = useState([]);
  const [form, setForm] = useState({ articleId: '', quantite: 1, chantier: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    setLoading(true);
    try {
      const artSnap = await getDocs(query(collection(db, 'articles')));
      let arts = artSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      arts.sort((a, b) => (a.nom || '').localeCompare(b.nom));
      setArticles(arts);
      const sortSnap = await getDocs(query(collection(db, 'sorties'), where('plombierId', '==', plombier.id)));
      let sorts = sortSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      sorts.sort((a, b) => new Date(b.date) - new Date(a.date));
      setSorties(sorts);
    } catch (e) { console.error(e); }
    setLoading(false);
  }

  async function handleSortie() {
    setMsg({ text: '', type: '' });
    if (!form.articleId || !form.quantite || !form.chantier) {
      setMsg({ text: 'Tous les champs sont requis.', type: 'error' }); return;
    }
    const article = articles.find(a => a.id === form.articleId);
    if (!article) return;
    if (article.quantite_stock < Number(form.quantite)) {
      setMsg({ text: `Stock insuffisant — seulement ${article.quantite_stock} ${article.unite} disponible(s).`, type: 'error' }); return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, 'sorties'), {
        articleId: form.articleId, articleNom: article.nom,
        quantite: Number(form.quantite), chantier: form.chantier,
        plombierId: plombier.id, plombierNom: plombier.nom,
        date: new Date().toLocaleDateString('fr-FR'),
      });
      await updateDoc(doc(db, 'articles', form.articleId), {
        quantite_stock: article.quantite_stock - Number(form.quantite),
      });
      setMsg({ text: `✓ ${form.quantite} ${article.unite} sorti(s) — chantier "${form.chantier}"`, type: 'success' });
      setForm({ articleId: '', quantite: 1, chantier: '' });
      await loadData();
    } catch (e) { setMsg({ text: 'Erreur : ' + e.message, type: 'error' }); }
    setSaving(false);
  }

  const stockBas = articles.filter(a => a.quantite_stock <= a.seuil_alerte);
  const initiales = plombier.nom.split(' ').map(n => n[0]).join('').toUpperCase();

  const getBadgeStyle = (type) => {
    const m = { ok: [SUCCESS_BG, SUCCESS], low: [DANGER_BG, DANGER], mid: [WARNING_BG, WARNING] };
    const [bg, color] = m[type] || m.ok;
    return { display: 'inline-block', padding: '3px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: bg, color };
  };

  const css = `
    *{box-sizing:border-box}body{margin:0}
    .ps{min-height:100vh;background:#f0f4f9;font-family:'DM Sans','Segoe UI',sans-serif;padding-bottom:72px}
    .ptb{background:${NAVY};padding:14px 16px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100}
    .pav{width:34px;height:34px;border-radius:50%;background:${ORANGE};color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0}
    .pnm{color:#fff;font-size:14px;font-weight:600;margin-left:10px}
    .plb{background:rgba(255,255,255,0.15);color:#fff;border:none;border-radius:8px;padding:6px 10px;font-size:12px;cursor:pointer;display:flex;align-items:center;gap:4px}
    .pm{padding:16px;max-width:600px;margin:0 auto}
    .ptt{font-size:20px;font-weight:700;color:#1a2332;margin:0 0 2px}
    .pts{font-size:12px;color:${MUTED};margin:0 0 16px}
    .psg{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px}
    .pst{background:#fff;border-radius:14px;border:1px solid ${BORDER};padding:14px 10px;position:relative;overflow:hidden;text-align:center}
    .psa{position:absolute;top:0;left:0;right:0;height:3px}
    .psv{font-size:24px;font-weight:700;color:#1a2332;line-height:1;margin-bottom:4px}
    .psl{font-size:11px;color:${MUTED}}
    .pc{background:#fff;border-radius:16px;border:1px solid ${BORDER};margin-bottom:14px;overflow:hidden}
    .pch{padding:14px 16px;border-bottom:1px solid ${BORDER};display:flex;align-items:center;gap:8px}
    .pci{width:26px;height:26px;border-radius:7px;background:#e8f0f8;display:flex;align-items:center;justify-content:center;flex-shrink:0}
    .pct{font-size:13px;font-weight:600;color:#1a2332}
    .pcb{padding:14px 16px}
    .plbl{font-size:11px;font-weight:600;color:${MUTED};text-transform:uppercase;letter-spacing:.05em;display:block;margin-bottom:5px}
    .pinp,.psel{padding:11px 12px;border:1px solid ${BORDER};border-radius:10px;font-size:15px;background:#fff;color:#1a2332;width:100%;margin-bottom:12px;outline:none;font-family:inherit;-webkit-appearance:none}
    .pinp:focus,.psel:focus{border-color:${NAVY};box-shadow:0 0 0 3px rgba(26,58,92,0.1)}
    .pbtn{width:100%;padding:14px;background:${NAVY};color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;font-family:inherit;margin-top:4px}
    .pbtn:disabled{opacity:.6}
    .pms{background:${SUCCESS_BG};border:1px solid #86efac;border-radius:10px;padding:12px 14px;font-size:13px;color:${SUCCESS};margin-bottom:14px}
    .pme{background:${DANGER_BG};border:1px solid #fca5a5;border-radius:10px;padding:12px 14px;font-size:13px;color:${DANGER};margin-bottom:14px}
    .pal{background:${DANGER_BG};border:1px solid #fca5a5;border-radius:12px;padding:12px 14px;margin-bottom:14px;display:flex;align-items:flex-start;gap:10px;font-size:13px;color:${DANGER}}
    .sc{background:#f8fafc;border-radius:10px;padding:12px 14px;margin-bottom:8px;border:1px solid ${BORDER}}
    .sct{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}
    .scn{font-size:13px;font-weight:600;color:#1a2332}
    .scq{font-size:13px;font-weight:700;color:${DANGER}}
    .scb{display:flex;justify-content:space-between;font-size:11px;color:${MUTED}}
    .pbn{position:fixed;bottom:0;left:0;right:0;background:#fff;border-top:1px solid ${BORDER};display:flex;z-index:100;box-shadow:0 -4px 16px rgba(0,0,0,.08)}
    .pnb{flex:1;padding:10px 4px 8px;display:flex;flex-direction:column;align-items:center;gap:3px;border:none;background:transparent;cursor:pointer;color:${MUTED};font-size:10px;font-weight:500;font-family:'DM Sans','Segoe UI',sans-serif}
    .pnb.act{color:${NAVY}}
    .pnbw{position:relative}
    .pnbg{position:absolute;top:-4px;right:-8px;background:${ORANGE};color:#fff;font-size:9px;font-weight:700;padding:1px 5px;border-radius:10px}
    .ptbl{width:100%;border-collapse:collapse;font-size:13px}
    .ptbl th{padding:8px 10px;text-align:left;color:${MUTED};font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:.05em;background:#f8fafc;border-bottom:1px solid ${BORDER}}
    .ptbl td{padding:10px 10px;border-bottom:1px solid ${BORDER};color:#1a2332;font-size:13px}
    .dtbl{display:none}
    .mcrd{display:block}
    @media(min-width:768px){
      .ps{display:flex;padding-bottom:0}
      .ptb{display:none}
      .pbn{display:none}
      .psd{display:flex!important;width:230px;flex-shrink:0;background:${NAVY};border-radius:0 24px 24px 0;flex-direction:column;padding:24px 14px;position:sticky;top:0;height:100vh;box-shadow:4px 0 20px rgba(26,58,92,.12)}
      .pm{padding:28px 32px;max-width:none}
      .dtbl{display:block}
      .mcrd{display:none}
    }
  `;

  const NavBtn = ({ id, label, Icon }) => (
    <button className={`pnb${tab === id ? ' act' : ''}`} onClick={() => { setTab(id); setMsg({ text: '', type: '' }); }}>
      <div className="pnbw">
        <Icon size={20} />
        {id === 'declarer' && <span className="pnbg">+</span>}
      </div>
      {label}
    </button>
  );

  const SideBtn = ({ id, label, Icon }) => (
    <button onClick={() => setTab(id)} style={{
      display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
      padding: '10px 12px', borderRadius: '12px', marginBottom: '4px',
      cursor: 'pointer', border: 'none',
      background: tab === id ? 'rgba(255,255,255,0.13)' : 'transparent',
      color: tab === id ? '#fff' : 'rgba(255,255,255,0.55)',
      fontSize: '13px', fontWeight: tab === id ? '600' : '400', textAlign: 'left',
    }}>
      <Icon size={16} /> {label}
      {id === 'declarer' && <span style={{ marginLeft: 'auto', background: ORANGE, color: '#fff', fontSize: '10px', fontWeight: '700', padding: '2px 6px', borderRadius: '20px' }}>+</span>}
    </button>
  );

  return (
    <>
      <style>{css}</style>
      <div className="ps">

        {/* Sidebar desktop */}
        <aside className="psd" style={{ display: 'none' }}>
          <div style={{ padding: '0 8px 22px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px' }}>
            <img src="https://sosfuitedeau.com/wp-content/uploads/2026/04/logo-removebg-preview.png" alt="Logo" style={{ height: '34px', objectFit: 'contain' }} onError={e => { e.target.style.display = 'none'; }} />
          </div>
          <div style={{ padding: '0 8px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="pav">{initiales}</div>
            <div>
              <div style={{ color: '#fff', fontSize: '13px', fontWeight: '600' }}>{plombier.nom}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11px' }}>Plombier</div>
            </div>
          </div>
          <nav style={{ flex: 1 }}>
            <SideBtn id="dashboard" label="Dashboard" Icon={LayoutDashboard} />
            <SideBtn id="declarer" label="Déclarer" Icon={PlusCircle} />
            <SideBtn id="stock" label="Stock" Icon={Package} />
          </nav>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '14px' }}>
            <button onClick={onLogout} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '9px 12px', borderRadius: '12px', border: 'none', background: 'transparent', color: 'rgba(255,255,255,0.5)', fontSize: '13px', cursor: 'pointer' }}>
              <LogOut size={15} /> Changer de profil
            </button>
          </div>
        </aside>

        {/* Topbar mobile */}
        <div className="ptb">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className="pav">{initiales}</div>
            <span className="pnm">{plombier.nom}</span>
          </div>
          <button className="plb" onClick={onLogout}><LogOut size={13} /> Quitter</button>
        </div>

        {/* Main */}
        <main className="pm">
          <h1 className="ptt">
            {tab === 'dashboard' && `Bonjour, ${plombier.nom.split(' ')[0]} 👋`}
            {tab === 'declarer' && 'Déclarer une sortie'}
            {tab === 'stock' && 'Stock disponible'}
          </h1>
          <p className="pts">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>

          {tab === 'dashboard' && <>
            <div className="psg">
              <div className="pst"><div className="psa" style={{ background: NAVY }} /><div className="psv">{articles.length}</div><div className="psl">Articles</div></div>
              <div className="pst"><div className="psa" style={{ background: DANGER }} /><div className="psv" style={{ color: stockBas.length > 0 ? DANGER : '#1a2332' }}>{stockBas.length}</div><div className="psl">Stock bas</div></div>
              <div className="pst"><div className="psa" style={{ background: ORANGE }} /><div className="psv">{sorties.length}</div><div className="psl">Mes sorties</div></div>
            </div>
            {stockBas.length > 0 && <div className="pal"><AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} /><span>Stock bas : {stockBas.map(a => `${a.nom} (${a.quantite_stock} ${a.unite})`).join(', ')}</span></div>}
            <div className="pc">
              <div className="pch"><div className="pci"><TrendingDown size={14} color={NAVY} /></div><span className="pct">Mes dernières sorties</span></div>
              <div className="mcrd" style={{ padding: '10px 14px' }}>
                {loading ? <div style={{ padding: '8px', color: MUTED, fontSize: '13px' }}>Chargement…</div>
                  : sorties.length === 0 ? <div style={{ padding: '8px', color: MUTED, fontSize: '13px', textAlign: 'center' }}>Aucune sortie</div>
                  : sorties.slice(0, 8).map(sv => (
                    <div key={sv.id} className="sc">
                      <div className="sct"><span className="scn">{sv.articleNom}</span><span className="scq">−{sv.quantite}</span></div>
                      <div className="scb"><span>📍 {sv.chantier}</span><span>{sv.date}</span></div>
                    </div>
                  ))}
              </div>
              <div className="dtbl">
                <table className="ptbl">
                  <thead><tr><th>Article</th><th>Qté</th><th>Chantier</th><th>Date</th></tr></thead>
                  <tbody>
                    {loading ? <tr><td colSpan={4} style={{ color: MUTED, textAlign: 'center', padding: '12px' }}>Chargement…</td></tr>
                      : sorties.length === 0 ? <tr><td colSpan={4} style={{ color: MUTED, textAlign: 'center', padding: '12px' }}>Aucune sortie</td></tr>
                      : sorties.slice(0, 8).map(sv => <tr key={sv.id}><td style={{ fontWeight: '500' }}>{sv.articleNom}</td><td style={{ color: DANGER, fontWeight: '700' }}>−{sv.quantite}</td><td>{sv.chantier}</td><td style={{ color: MUTED }}>{sv.date}</td></tr>)}
                  </tbody>
                </table>
              </div>
            </div>
          </>}

          {tab === 'declarer' && (
            <div className="pc">
              <div className="pch"><div className="pci"><PlusCircle size={14} color={NAVY} /></div><span className="pct">Déclarer une utilisation</span></div>
              <div className="pcb">
                {msg.text && <div className={msg.type === 'success' ? 'pms' : 'pme'}>{msg.text}</div>}
                <label className="plbl">Article utilisé</label>
                <select className="psel" value={form.articleId} onChange={e => setForm({ ...form, articleId: e.target.value })}>
                  <option value="">Choisir un article…</option>
                  {articles.map(a => <option key={a.id} value={a.id} disabled={a.quantite_stock <= 0}>{a.nom} — {a.quantite_stock} {a.unite}{a.quantite_stock <= 0 ? ' (épuisé)' : ''}</option>)}
                </select>
                <label className="plbl">Quantité utilisée</label>
                <input className="pinp" type="number" min="1" placeholder="ex: 5" value={form.quantite} onChange={e => setForm({ ...form, quantite: e.target.value })} />
                <label className="plbl">Chantier</label>
                <input className="pinp" type="text" placeholder="Nom ou N° du chantier" value={form.chantier} onChange={e => setForm({ ...form, chantier: e.target.value })} />
                <button className="pbtn" onClick={handleSortie} disabled={saving}><PlusCircle size={16} />{saving ? 'Enregistrement…' : 'Confirmer la sortie'}</button>
              </div>
            </div>
          )}

          {tab === 'stock' && (
            <div className="pc">
              <div className="pch">
                <div className="pci"><Package size={14} color={NAVY} /></div>
                <span className="pct">Stock disponible</span>
                {stockBas.length > 0 && <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: DANGER, fontWeight: '600' }}><AlertTriangle size={12} /> {stockBas.length} bas</span>}
              </div>
              <div className="mcrd" style={{ padding: '10px 14px' }}>
                {articles.map(a => {
                  const type = a.quantite_stock <= a.seuil_alerte ? 'low' : a.quantite_stock <= a.seuil_alerte * 2 ? 'mid' : 'ok';
                  return (
                    <div key={a.id} className="sc">
                      <div className="sct"><span className="scn">{a.nom}</span><span style={{ fontWeight: '700', fontSize: '15px', color: type === 'low' ? DANGER : '#1a2332' }}>{a.quantite_stock} {a.unite}</span></div>
                      <div className="scb"><span style={{ fontFamily: 'monospace' }}>{a.reference || '—'}</span><span style={getBadgeStyle(type)}>{type === 'ok' ? 'Disponible' : type === 'mid' ? 'Moyen' : 'Stock bas'}</span></div>
                    </div>
                  );
                })}
              </div>
              <div className="dtbl">
                <table className="ptbl">
                  <thead><tr><th>Article</th><th>Référence</th><th>Disponible</th><th>Unité</th><th>Statut</th></tr></thead>
                  <tbody>
                    {articles.map(a => {
                      const type = a.quantite_stock <= a.seuil_alerte ? 'low' : a.quantite_stock <= a.seuil_alerte * 2 ? 'mid' : 'ok';
                      return <tr key={a.id}><td style={{ fontWeight: '500' }}>{a.nom}</td><td style={{ color: MUTED, fontFamily: 'monospace' }}>{a.reference || '—'}</td><td style={{ fontWeight: '700', color: type === 'low' ? DANGER : '#1a2332' }}>{a.quantite_stock}</td><td>{a.unite}</td><td><span style={getBadgeStyle(type)}>{type === 'ok' ? 'Disponible' : type === 'mid' ? 'Moyen' : 'Stock bas'}</span></td></tr>;
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>

        {/* Bottom nav mobile */}
        <nav className="pbn">
          <NavBtn id="dashboard" label="Accueil" Icon={LayoutDashboard} />
          <NavBtn id="declarer" label="Déclarer" Icon={PlusCircle} />
          <NavBtn id="stock" label="Stock" Icon={Package} />
        </nav>
      </div>
    </>
  );
}