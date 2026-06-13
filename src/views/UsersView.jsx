import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { Users, Shield, User, Loader2 } from 'lucide-react';
import { supabase } from '../supabase';

export default function UsersView() {
    const { user, addToast } = useStore();
    const [profiles, setProfiles] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.role === 'admin') {
            fetchProfiles();
        }
    }, [user]);

    const fetchProfiles = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('full_name');
            
        if (error) {
            addToast('Virhe käyttäjien hakemisessa.', 'error');
        } else {
            setProfiles(data || []);
        }
        setLoading(false);
    };

    const updateRole = async (id, newRole) => {
        const { error } = await supabase
            .from('profiles')
            .update({ role: newRole })
            .eq('id', id);

        if (error) {
            addToast('Roolin päivitys epäonnistui.', 'error');
        } else {
            setProfiles(profiles.map(p => p.id === id ? { ...p, role: newRole } : p));
            addToast('Rooli päivitetty!', 'success');
        }
    };

    if (user?.role !== 'admin') {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
                <h2>Pääsy evätty</h2>
                <p>Sinulla ei ole oikeuksia tälle sivulle.</p>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem', overflowY: 'auto', height: '100%' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Users size={32} style={{ color: '#a78bfa' }} />
                Käyttäjien hallinta
            </h2>
            <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '1rem' }}>
                Määritä käyttöoikeudet henkilökunnalle.
            </p>
            
            <div className="glass-panel" style={{ padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem', borderLeft: '3px solid #a78bfa' }}>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1' }}>
                    <strong>Huom:</strong> Uudet tilit pitää toistaiseksi luoda Supabasen "Authentication" -paneelin kautta, tai antamalla käyttäjien rekisteröityä itse ensin (jos salli). Täällä voit määrittää jo rekisteröityneiden käyttäjien roolin.
                </p>
            </div>

            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                    <Loader2 size={32} className="spin" style={{ color: '#a78bfa' }} />
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {profiles.map(p => (
                        <div key={p.id} className="glass-panel" style={{ padding: '1.25rem', borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(167, 139, 250, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <User size={20} style={{ color: '#a78bfa' }} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: '600', color: '#f8fafc', fontSize: '1.05rem' }}>{p.full_name || 'Nimetön käyttäjä'}</div>
                                    <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{p.id}</div>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <Shield size={16} style={{ color: '#94a3b8' }} />
                                <select 
                                    value={p.role} 
                                    onChange={(e) => updateRole(p.id, e.target.value)}
                                    disabled={p.id === user.id} // Ei voi vaihtaa omaa rooliaan
                                    style={{
                                        background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.2)',
                                        color: p.id === user.id ? '#64748b' : '#f8fafc', padding: '0.5rem 1rem', borderRadius: '0.5rem',
                                        fontFamily: 'Inter, sans-serif', outline: 'none', cursor: p.id === user.id ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    <option value="driver">Kuljettaja</option>
                                    <option value="mechanic">Korjaamo (Mekaanikko)</option>
                                    <option value="admin">Admin (Ylläpitäjä)</option>
                                </select>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
