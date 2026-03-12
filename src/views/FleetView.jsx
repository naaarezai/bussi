import React from 'react';
import { useStore } from '../store';
import { BusFront, AlertCircle, CheckCircle2, AlertTriangle, ArrowRightLeft } from 'lucide-react';
import { VEHICLES } from '../constants';

export default function FleetView() {
    const { defects } = useStore();
    const redDefects = defects.filter(d => d.status === 'red');
    const yellowDefects = defects.filter(d => d.status === 'yellow');

    const getVehicleStatus = (vehicleId) => {
        const vehicleDefects = defects.filter(d => d.vehicle === vehicleId);
        if (vehicleDefects.some(d => d.status === 'red')) return 'red';
        if (vehicleDefects.some(d => d.status === 'yellow')) return 'yellow';
        return 'green';
    };

    const statusConfig = {
        red: { label: 'Ajokielto', bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', icon: <AlertCircle size={16} /> },
        yellow: { label: 'Rajoitettu', bg: 'rgba(234, 179, 8, 0.15)', color: '#eab308', icon: <AlertTriangle size={16} /> },
        green: { label: 'Ajokelpoinen', bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e', icon: <CheckCircle2 size={16} /> },
    };

    return (
        <div style={{ padding: '2rem', overflowY: 'auto', height: '100%' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                🚌 Kaluston tila
            </h2>
            <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '1rem' }}>
                Reaaliaikainen kaluston valmiustilanne ja automaattinen reititys.
            </p>

            {/* Fleet Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
                {[
                    { label: 'Ajokelpoisia', value: VEHICLES.length - redDefects.length, color: '#22c55e', total: VEHICLES.length },
                    { label: 'Ajokiellossa', value: redDefects.length > 0 ? 1 : 0, color: '#ef4444' },
                    { label: 'Korvaava auto', value: redDefects.length > 0 ? '✅ Tilattu' : '—', color: '#38bdf8' },
                ].map((stat, i) => (
                    <div key={i} className="glass-panel" style={{
                        padding: '1.25rem', borderRadius: '1rem', textAlign: 'center',
                    }}>
                        <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{stat.label}</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: stat.color }}>
                            {typeof stat.value === 'string' ? stat.value : stat.value}
                            {stat.total && <span style={{ fontSize: '1rem', color: '#64748b' }}> / {stat.total}</span>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Auto-routing panel */}
            {redDefects.length > 0 && (
                <div className="glass-panel" style={{
                    padding: '1.25rem', borderRadius: '1rem', marginBottom: '2rem',
                    borderLeft: '3px solid #38bdf8',
                    background: 'rgba(56, 189, 248, 0.05)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                        <ArrowRightLeft size={20} style={{ color: '#38bdf8' }} />
                        <span style={{ fontWeight: '600', fontSize: '1rem' }}>🤖 Automaattinen reititys aktivoitu</span>
                    </div>
                    <p style={{ color: '#94a3b8', fontSize: '0.875rem', lineHeight: 1.6 }}>
                        BUS-042:ssa on kriittinen vika. Järjestelmä on automaattisesti siirtänyt reitin 611
                        korvaavalle autolle <strong style={{ color: '#f8fafc' }}>BUS-091</strong> ja ilmoittanut
                        kuljettajalle muutoksesta SMS-viestillä.
                    </p>
                </div>
            )}

            {/* Fleet Table */}
            <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1rem' }}>
                Ajoneuvolista
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {VEHICLES.map((vehicle) => {
                    const status = getVehicleStatus(vehicle.id);
                    const s = statusConfig[status];
                    return (
                        <div key={vehicle.id} className="glass-panel" style={{
                            padding: '1rem 1.25rem', borderRadius: '1rem',
                            display: 'flex', alignItems: 'center', gap: '1rem',
                            borderLeft: `3px solid ${s.color}`,
                        }}>
                            <BusFront size={28} style={{ color: s.color, flexShrink: 0 }} />

                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.2rem' }}>
                                    <span style={{ fontWeight: '700', fontSize: '1rem' }}>{vehicle.id}</span>
                                    <span style={{ color: '#64748b', fontSize: '0.825rem' }}>{vehicle.model}</span>
                                </div>
                                <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                                    🛣️ {vehicle.route} &nbsp;&bull;&nbsp; 📏 {vehicle.km}
                                </div>
                            </div>

                            <div style={{
                                background: s.bg, color: s.color, padding: '0.35rem 0.75rem',
                                borderRadius: '2rem', fontSize: '0.75rem', fontWeight: '600',
                                display: 'flex', alignItems: 'center', gap: '0.3rem',
                            }}>
                                {s.icon} {s.label}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
