import React, { useState } from 'react';
import { useStore } from '../store';
import { BusFront, Lock, Mail, Loader2 } from 'lucide-react';

export default function LoginView() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { signIn } = useStore();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await signIn(email, password);
        } catch (err) {
            setError(err.message || 'Kirjautuminen epäonnistui. Tarkista sähköposti ja salasana.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', flexDirection: 'column', 
            justifyContent: 'center', alignItems: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            padding: '1rem', color: '#f8fafc',
        }}>
            <div className="glass-panel" style={{
                width: '100%', maxWidth: '400px', padding: '2.5rem 2rem',
                borderRadius: '1.5rem', textAlign: 'center',
            }}>
                <div style={{
                    width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(56, 189, 248, 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto'
                }}>
                    <BusFront size={32} style={{ color: '#38bdf8' }} />
                </div>
                
                <h1 style={{ fontSize: '1.75rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Bussi Kalustohallinta</h1>
                <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '0.9rem' }}>
                    Kirjaudu sisään jatkaaksesi
                </p>

                {error && (
                    <div style={{ 
                        background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', 
                        padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.85rem' 
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Sähköposti"
                            required
                            style={{
                                width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem',
                                background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '0.75rem', color: '#f8fafc', outline: 'none',
                                fontFamily: 'Inter, sans-serif'
                            }}
                        />
                    </div>
                    
                    <div style={{ position: 'relative' }}>
                        <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Salasana"
                            required
                            style={{
                                width: '100%', padding: '0.75rem 1rem 0.75rem 2.75rem',
                                background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '0.75rem', color: '#f8fafc', outline: 'none',
                                fontFamily: 'Inter, sans-serif'
                            }}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="btn btn-primary" 
                        style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem', padding: '0.8rem' }}
                    >
                        {loading ? <Loader2 size={18} className="spin" /> : 'Kirjaudu sisään'}
                    </button>
                </form>
            </div>
            <div style={{ marginTop: '2rem', color: '#64748b', fontSize: '0.8rem' }}>
                &copy; {new Date().getFullYear()} Bussi Kalustohallinta
            </div>
        </div>
    );
}
