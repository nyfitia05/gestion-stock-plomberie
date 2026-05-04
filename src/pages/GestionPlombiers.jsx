import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Users, PlusCircle, Trash2 } from 'lucide-react';

const NAVY = '#1a3a5c';
const ORANGE = '#e85d24';
const BORDER = '#e2e8f0';
const MUTED = '#7a8a9a';
const DANGER = '#dc2626';
const DANGER_BG = '#fee2e2';
const SUCCESS = '#16a34a';
const SUCCESS_BG = '#dcfce7';

const s = {
  pageTitle: { fontSize: '22px', fontWeight: '700', color: '#1a2332', margin: '0 0 4px' },
  pageSub: { fontSize: '13px', color: MUTED, margin: '0 0 24px' },
  card: { background: '#fff', borderRadius: '16px', border: `1px solid ${BORDER}`, overflow: 'hidden', marginBottom: '20px' },
  cardHeader: { padding: '16px 20px 12px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: '8px' },
  cardIconWrap: { width: '28px', height: '28px', borderRadius: '8px', background: '#e8f0f8', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: '14px', fontWeight: '600', color: '#1a2332' },
  cardBody: { padding: '18px 20px' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', background: '#f8fafc', padding: '16px', borderRadius: '12px' },
  input: { padding: '9px 12px', border: `1px solid ${BORDER}`, borderRadius: '10px', fontSize: '13px', background: '#fff', color: '#1a2332', width: '100%', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' },
  select: { padding: '9px 12px', border: `1px solid ${BORDER}`, borderRadius: '10px', fontSize: '13px', background: '#fff', color: '#1a2332', width: '100%', boxSizing: 'border-box', outline: 'none', fontFamily: 'inherit' },
  btnPrimary: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px 16px', background: NAVY, color: '#fff', border: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', gridColumn: '1 / -1' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '13px' },
  th: { padding: '8px 12px', textAlign: 'left', color: MUTED, fontWeight: '600', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', background: '#f8fafc', borderBottom: `1px solid ${BORDER}` },
  td: { padding: '11px 12px', borderBottom: `1px solid ${BORDER}`, color: '#1a2332' },
  badgeAdmin: { display: 'inline-block', padding: '3px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: '#e8f0f8', color: NAVY },
  badgePlombier: { display: 'inline-block', padding: '3px 9px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', background: '#f0fdf4', color: SUCCESS },
  successMsg: { background: SUCCESS_BG, border: '1px solid #86efac', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: SUCCESS, marginBottom: '14px' },
  errorMsg: { background: DANGER_BG, border: '1px solid #fca5a5', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: DANGER, marginBottom: '14px' },
  infoBox: { background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px', padding: '12px 16px', fontSize: '12px', color: '#9a3412', marginBottom: '16px', lineHeight: '1.6' },
};

export default function GestionPlombiers() {
  const [plombiers, setPlombiers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ email: '', nom: '', role: 'plombier', password: '' });
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => { fetchPlombiers(); }, []);

  async function fetchPlombiers() {
    setLoading(true);
    const { data, error } = await supabase.from('plombiers').select('*').order('nom');
    if (!error) setPlombiers(data || []);
    setLoading(false);
  }

  async function ajouterPlombier(e) {
    e.preventDefault();
    setMsg({ text: '', type: '' });
    if (!form.email || !form.password || !form.nom) {
      setMsg({ text: 'Tous les champs sont requis.', type: 'error' });
      return;
    }
    if (form.password.length < 6) {
      setMsg({ text: 'Le mot de passe doit faire au moins 6 caractères.', type: 'error' });
      return;
    }
    setSubmitting(true);

    // Supabase v2 : signUp côté client (pas auth.admin)
    // Le plombier reçoit un email de confirmation — on peut désactiver ça dans Supabase > Auth > Settings
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { nom: form.nom } },
    });

    if (authError) {
      setMsg({ text: 'Erreur Auth : ' + authError.message, type: 'error' });
      setSubmitting(false);
      return;
    }

    const userId = authData.user?.id;
    if (!userId) {
      setMsg({ text: 'Utilisateur créé mais ID introuvable. Vérifiez Supabase Auth.', type: 'error' });
      setSubmitting(false);
      return;
    }

    const { error: insertError } = await supabase.from('plombiers').insert([{
      id: userId,
      nom: form.nom,
      email: form.email,
      role: form.role,
    }]);

    if (insertError) {
      setMsg({ text: 'Erreur insertion : ' + insertError.message, type: 'error' });
    } else {
      setMsg({ text: `✓ ${form.nom} créé avec succès (rôle : ${form.role})`, type: 'success' });
      setForm({ email: '', nom: '', role: 'plombier', password: '' });
      fetchPlombiers();
    }
    setSubmitting(false);
  }

  async function changerRole(id, nouveauRole) {
    await supabase.from('plombiers').update({ role: nouveauRole }).eq('id', id);
    fetchPlombiers();
  }

  async function supprimerPlombier(id, nom) {
    if (!window.confirm(`Supprimer ${nom} ? Cette action est irréversible.`)) return;
    await supabase.from('plombiers').delete().eq('id', id);
    fetchPlombiers();
  }

  return (
    <div>
      <h1 style={s.pageTitle}>Gestion des utilisateurs</h1>
      <p style={s.pageSub}>Créez et gérez les comptes plombiers et admins</p>

      {/* Formulaire ajout */}
      <div style={s.card}>
        <div style={s.cardHeader}>
          <div style={s.cardIconWrap}><PlusCircle size={15} color={NAVY} /></div>
          <span style={s.cardTitle}>Ajouter un utilisateur</span>
        </div>
        <div style={s.cardBody}>
          <div style={s.infoBox}>
            <strong>Important :</strong> après la création, le plombier recevra un email de confirmation à son adresse.
            Pour éviter ça (réseau interne), désactivez la confirmation email dans <strong>Supabase → Authentication → Settings → "Enable email confirmations"</strong>.
          </div>
          {msg.text && <div style={msg.type === 'success' ? s.successMsg : s.errorMsg}>{msg.text}</div>}
          <div style={s.formGrid}>
            <input style={s.input} type="text" placeholder="Nom complet" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} required />
            <input style={s.input} type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            <input style={s.input} type="password" placeholder="Mot de passe (min. 6 car.)" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            <select style={s.select} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="plombier">Plombier</option>
              <option value="admin">Admin</option>
            </select>
            <button style={{ ...s.btnPrimary, opacity: submitting ? 0.6 : 1 }} onClick={ajouterPlombier} disabled={submitting}>
              <PlusCircle size={15} />
              {submitting ? 'Création en cours…' : 'Créer le compte'}
            </button>
          </div>
        </div>
      </div>

      {/* Liste des utilisateurs */}
      <div style={s.card}>
        <div style={s.cardHeader}>
          <div style={s.cardIconWrap}><Users size={15} color={NAVY} /></div>
          <span style={s.cardTitle}>Utilisateurs enregistrés</span>
          <span style={{ marginLeft: 'auto', fontSize: '12px', color: MUTED }}>{plombiers.length} comptes</span>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={s.th}>Nom</th>
                <th style={s.th}>Email</th>
                <th style={s.th}>Rôle</th>
                <th style={s.th}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={4} style={{ ...s.td, textAlign: 'center', color: MUTED }}>Chargement…</td></tr>
              ) : plombiers.length === 0 ? (
                <tr><td colSpan={4} style={{ ...s.td, textAlign: 'center', color: MUTED }}>Aucun utilisateur</td></tr>
              ) : plombiers.map(p => (
                <tr key={p.id}>
                  <td style={{ ...s.td, fontWeight: '500' }}>{p.nom}</td>
                  <td style={{ ...s.td, color: MUTED }}>{p.email}</td>
                  <td style={s.td}>
                    <select
                      value={p.role}
                      onChange={e => changerRole(p.id, e.target.value)}
                      style={{ ...s.select, width: 'auto', marginBottom: 0, padding: '4px 8px', fontSize: '12px' }}
                    >
                      <option value="plombier">Plombier</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td style={s.td}>
                    <button
                      onClick={() => supprimerPlombier(p.id, p.nom)}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', background: DANGER_BG, color: DANGER, border: 'none', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', fontWeight: '500' }}
                    >
                      <Trash2 size={13} /> Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}