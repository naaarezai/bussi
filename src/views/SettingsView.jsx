import React, { useState } from 'react';
import { useStore } from '../store';
import { QrCode, BusFront, User, Bell, Shield, Info, Moon, Sun, Trash2, Download } from 'lucide-react';

export default function SettingsView() {
    const { activeVehicle, vehicles, setActiveVehicle, setShowQRScanner, defects, exportDefectsCSV, addToast } = useStore();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);
    const [driverName, setDriverName] = useState('');
    const [isDarkMode, setIsDarkMode] = useState(true);

    const handleClearData = () => {
        localStorage.removeItem('bussi-store');
        addToast('Paikalliset tiedot tyhjennetty. Päivitä sivu.', 'warning');
    };

    const handleExport = () => {
        exportDefectsCSV();
        addToast('Vikailmoitukset viety CSV-tiedostoon', 'success');
    };

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        addToast(isDarkMode ? 'Vaalea teema tulossa pian!' : 'Tumma teema aktivoitu', 'info');
    };

    return (
        <div style={{ padding: '2rem', overflowY: 'auto', height: '100%' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                ⚙️ Asetukset
            </h2>
            <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '1rem' }}>
                Sovelluksen ja ajoneuvon asetukset.
            </p>

            {/* Active Vehicle Card */}
            <div className="glass-panel" style={{
                padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem',
                borderLeft: '3px solid #38bdf8',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                    <BusFront size={22} style={{ color: '#38bdf8' }} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: '600' }}>Aktiivinen ajoneuvo</h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                    <div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#38bdf8' }}>{activeVehicle.id}</div>
                        <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>{activeVehicle.model}</div>
                        <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                            🛣️ {activeVehicle.route} &bull; 📏 {activeVehicle.km}
                        </div>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowQRScanner(true)}
                        style={{ marginLeft: 'auto', padding: '0.6rem 1.25rem' }}>
                        <QrCode size={18} />
                        Vaihda auto (QR)
                    </button>
                </div>
            </div>

            {/* Vehicle List */}
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BusFront size={20} style={{ color: '#38bdf8' }} />
                Ajoneuvorekisteri
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '2.5rem' }}>
                {vehicles.map(v => {
                    const isActive = activeVehicle.id === v.id;
                    const vehicleDefects = defects.filter(d => d.vehicle === v.id);
                    return (
                        <div key={v.id} className="glass-panel" style={{
                            padding: '1rem 1.25rem', borderRadius: '1rem', cursor: 'pointer',
                            border: isActive ? '1px solid rgba(56, 189, 248, 0.4)' : '1px solid rgba(255,255,255,0.1)',
                            background: isActive ? 'rgba(56, 189, 248, 0.08)' : undefined,
                            transition: 'all 0.2s',
                        }}
                            onClick={() => setActiveVehicle(v.id)}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <BusFront size={20} style={{ color: isActive ? '#38bdf8' : '#64748b' }} />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: '600', fontSize: '0.95rem', color: isActive ? '#38bdf8' : '#f8fafc' }}>
                                        {v.id}
                                    </div>
                                    <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{v.model}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    {vehicleDefects.length > 0 && (
                                        <span style={{
                                            fontSize: '0.7rem', color: '#eab308',
                                            background: 'rgba(234, 179, 8, 0.15)', padding: '0.15rem 0.4rem',
                                            borderRadius: '1rem',
                                        }}>{vehicleDefects.length} vikaa</span>
                                    )}
                                    {isActive && (
                                        <span style={{
                                            fontSize: '0.7rem', color: '#38bdf8',
                                            background: 'rgba(56, 189, 248, 0.15)', padding: '0.2rem 0.5rem',
                                            borderRadius: '1rem',
                                        }}>Aktiivinen</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Settings Sections */}
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem' }}>Sovelluksen asetukset</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2.5rem' }}>
                {/* Driver Name */}
                <div className="glass-panel" style={{
                    padding: '1rem 1.25rem', borderRadius: '1rem',
                    display: 'flex', alignItems: 'center', gap: '1rem',
                }}>
                    <User size={20} style={{ color: '#a78bfa', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500', fontSize: '0.95rem', marginBottom: '0.5rem' }}>Kuljettajan nimi</div>
                        <input
                            type="text"
                            value={driverName}
                            onChange={(e) => setDriverName(e.target.value)}
                            placeholder="Syötä nimesi..."
                            style={{
                                width: '100%', padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                                background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(255,255,255,0.1)',
                                color: '#f8fafc', fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', outline: 'none',
                            }}
                        />
                    </div>
                </div>

                {/* Notifications Toggle */}
                <div className="glass-panel" style={{
                    padding: '1rem 1.25rem', borderRadius: '1rem',
                    display: 'flex', alignItems: 'center', gap: '1rem',
                }}>
                    <Bell size={20} style={{ color: '#fbbf24', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500', fontSize: '0.95rem' }}>Ilmoitukset</div>
                        <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Push-ilmoitukset uusista vikailmoituksista</div>
                    </div>
                    <button
                        onClick={() => {
                            setNotificationsEnabled(!notificationsEnabled);
                            addToast(notificationsEnabled ? 'Ilmoitukset pois päältä' : 'Ilmoitukset päällä', 'info');
                        }}
                        style={{
                            width: '48px', height: '26px', borderRadius: '13px', border: 'none', cursor: 'pointer',
                            background: notificationsEnabled ? '#38bdf8' : 'rgba(100,116,139,0.4)',
                            position: 'relative', transition: 'background 0.3s',
                        }}
                    >
                        <div style={{
                            width: '20px', height: '20px', borderRadius: '50%', background: 'white',
                            position: 'absolute', top: '3px',
                            left: notificationsEnabled ? '25px' : '3px',
                            transition: 'left 0.3s',
                        }} />
                    </button>
                </div>

                {/* Theme Toggle */}
                <div className="glass-panel" style={{
                    padding: '1rem 1.25rem', borderRadius: '1rem',
                    display: 'flex', alignItems: 'center', gap: '1rem',
                }}>
                    {isDarkMode ? <Moon size={20} style={{ color: '#a78bfa', flexShrink: 0 }} /> : <Sun size={20} style={{ color: '#fbbf24', flexShrink: 0 }} />}
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500', fontSize: '0.95rem' }}>Ulkoasu</div>
                        <div style={{ color: '#64748b', fontSize: '0.8rem' }}>{isDarkMode ? 'Tumma teema' : 'Vaalea teema'}</div>
                    </div>
                    <button
                        onClick={toggleTheme}
                        style={{
                            width: '48px', height: '26px', borderRadius: '13px', border: 'none', cursor: 'pointer',
                            background: isDarkMode ? '#a78bfa' : '#fbbf24',
                            position: 'relative', transition: 'background 0.3s',
                        }}
                    >
                        <div style={{
                            width: '20px', height: '20px', borderRadius: '50%', background: 'white',
                            position: 'absolute', top: '3px',
                            left: isDarkMode ? '25px' : '3px',
                            transition: 'left 0.3s',
                        }} />
                    </button>
                </div>

                {/* Export */}
                <div className="glass-panel" style={{
                    padding: '1rem 1.25rem', borderRadius: '1rem',
                    display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer',
                }} onClick={handleExport}>
                    <Download size={20} style={{ color: '#38bdf8', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500', fontSize: '0.95rem' }}>Vie vikailmoitukset</div>
                        <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Lataa kaikki vikailmoitukset CSV-tiedostona</div>
                    </div>
                </div>

                {/* Clear Data */}
                <div className="glass-panel" style={{
                    padding: '1rem 1.25rem', borderRadius: '1rem',
                    display: 'flex', alignItems: 'center', gap: '1rem', cursor: 'pointer',
                    borderLeft: '3px solid #ef4444',
                }} onClick={handleClearData}>
                    <Trash2 size={20} style={{ color: '#ef4444', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500', fontSize: '0.95rem', color: '#ef4444' }}>Tyhjennä paikalliset tiedot</div>
                        <div style={{ color: '#64748b', fontSize: '0.8rem' }}>Poista kaikki tallennetut tiedot selaimesta</div>
                    </div>
                </div>
            </div>

            {/* App Info */}
            <div className="glass-panel" style={{
                padding: '1rem 1.25rem', borderRadius: '1rem',
                display: 'flex', alignItems: 'center', gap: '1rem',
            }}>
                <Info size={20} style={{ color: '#38bdf8' }} />
                <div>
                    <div style={{ fontWeight: '500', fontSize: '0.95rem' }}>BUSSI Kalustohallinta</div>
                    <div style={{ color: '#64748b', fontSize: '0.8rem' }}>v1.1 — Viimeisin päivitys {new Date().toLocaleDateString('fi-FI')}</div>
                </div>
            </div>
        </div>
    );
}
