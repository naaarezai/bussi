import React from 'react';
import { LayoutDashboard, AlertCircle, BusFront, Settings, QrCode } from 'lucide-react';
import { useStore } from '../store';

export default function Sidebar() {
    const { activeView, setActiveView, activeVehicle, setShowQRScanner, isMobileMenuOpen, setMobileMenuOpen } = useStore();

    const navItems = [
        { id: 'dashboard', icon: <LayoutDashboard size={24} />, label: 'Hallintapaneeli' },
        { id: 'report', icon: <AlertCircle size={24} />, label: 'Vikailmoitus' },
        { id: 'fleet', icon: <BusFront size={24} />, label: 'Kaluston tila' },
    ];

    const handleNav = (id) => {
        setActiveView(id);
        setMobileMenuOpen(false);
    };

    return (
        <div className={`glass-panel sidebar-container ${isMobileMenuOpen ? 'mobile-open' : ''}`} style={{ width: '250px', height: '100%', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', gap: '2px', borderLeft: 'none', borderTop: 'none', borderBottom: 'none', borderRadius: '0 1rem 1rem 0' }}>
            <div style={{ padding: '0 1rem 1.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px var(--accent-glow)' }}>
                    <BusFront size={24} color="#0f172a" />
                </div>
                <div>
                    <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0, letterSpacing: '1px' }}>BUSSI</h1>
                    <p style={{ fontSize: '0.75rem', color: 'var(--accent-color)', margin: 0 }}>Kalustohallinta</p>
                </div>
            </div>

            {/* Active vehicle badge */}
            <div style={{
                margin: '0 0.5rem 1rem', padding: '0.6rem 0.75rem', borderRadius: '0.75rem',
                background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.2)',
                cursor: 'pointer', transition: 'all 0.2s',
            }}
                onClick={() => setShowQRScanner(true)}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <QrCode size={16} style={{ color: '#38bdf8' }} />
                    <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: '600', color: '#38bdf8' }}>{activeVehicle.id}</div>
                        <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{activeVehicle.model}</div>
                    </div>
                </div>
            </div>

            <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => handleNav(item.id)}
                        style={{
                            background: activeView === item.id ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                            border: activeView === item.id ? '1px solid var(--accent-glow)' : '1px solid transparent',
                            color: activeView === item.id ? 'var(--accent-color)' : 'var(--text-muted)',
                            padding: '1rem',
                            borderRadius: '0.75rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            textAlign: 'left',
                            fontFamily: 'inherit',
                            fontSize: '1rem',
                            fontWeight: activeView === item.id ? '600' : '400',
                            boxShadow: activeView === item.id ? 'inset 4px 0 0 0 var(--accent-color)' : 'none'
                        }}
                    >
                        {item.icon}
                        {item.label}
                    </button>
                ))}
            </nav>

            <div style={{ marginTop: 'auto' }}>
                <button
                    onClick={() => handleNav('settings')}
                    style={{
                        background: activeView === 'settings' ? 'rgba(56, 189, 248, 0.1)' : 'transparent',
                        border: activeView === 'settings' ? '1px solid var(--accent-glow)' : 'none',
                        color: activeView === 'settings' ? 'var(--accent-color)' : 'var(--text-muted)',
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        cursor: 'pointer',
                        width: '100%',
                        textAlign: 'left',
                        fontFamily: 'inherit',
                        transition: 'color 0.2s',
                        borderRadius: '0.75rem',
                        fontWeight: activeView === 'settings' ? '600' : '400',
                    }}>
                    <Settings size={20} />
                    Asetukset
                </button>
            </div>
        </div>
    );
}
