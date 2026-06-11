import React, { useMemo, useState } from 'react';
import { useStore } from '../store';
import { Search, BusFront, Archive, RotateCcw } from 'lucide-react';

export default function HistoryView() {
    const { defects, updateDefectStatus, searchQuery, setSearchQuery, vehicles } = useStore();
    const [vehicleFilter, setVehicleFilter] = useState('all');

    const sortedDefects = useMemo(() => {
        let filtered = defects.filter(d => d.status === 'resolved');

        if (vehicleFilter !== 'all') {
            filtered = filtered.filter(d => d.vehicle === vehicleFilter);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(d =>
                (d.part?.toLowerCase() || '').includes(q) ||
                (d.description?.toLowerCase() || '').includes(q) ||
                (d.vehicle?.toLowerCase() || '').includes(q)
            );
        }

        return [...filtered].sort((a, b) => {
            return new Date(b.reportedAt) - new Date(a.reportedAt);
        });
    }, [defects, searchQuery, vehicleFilter]);

    const formatTime = (date) => {
        const d = new Date(date);
        return d.toLocaleDateString('fi-FI') + ' klo ' + d.toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div style={{ padding: '2rem', overflowY: 'auto', height: '100%' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <Archive size={32} style={{ color: '#94a3b8' }} /> Huoltohistoria
            </h2>
            <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '1rem' }}>
                Arkistoidut ja korjatut vikailmoitukset.
            </p>

            {/* Search & Filter Bar */}
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={{
                    flex: 1, minWidth: '200px', display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.75rem', padding: '0.6rem 1rem',
                }}>
                    <Search size={18} style={{ color: '#64748b' }} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Hae arkistosta..."
                        style={{
                            background: 'transparent', border: 'none', color: '#f8fafc',
                            fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', width: '100%', outline: 'none',
                        }}
                    />
                </div>

                {/* Vehicle filter dropdown */}
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '0.75rem', padding: '0.4rem 0.75rem',
                }}>
                    <BusFront size={16} style={{ color: '#64748b' }} />
                    <select
                        value={vehicleFilter}
                        onChange={(e) => setVehicleFilter(e.target.value)}
                        style={{
                            background: 'transparent', border: 'none', color: '#f8fafc',
                            fontFamily: 'Inter, sans-serif', fontSize: '0.85rem', outline: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        <option value="all" style={{ background: '#1e293b' }}>Kaikki autot</option>
                        {vehicles.map(v => (
                            <option key={v.id} value={v.id} style={{ background: '#1e293b' }}>{v.id} — {v.model}</option>
                        ))}
                    </select>
                </div>
            </div>

            {sortedDefects.length === 0 ? (
                <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1rem', textAlign: 'center', color: '#64748b' }}>
                    Ei arkistoituja vikailmoituksia.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {sortedDefects.map((defect) => (
                        <div key={defect.id} className="glass-panel fade-in" style={{
                            padding: '1.25rem', borderRadius: '1rem',
                            borderLeft: `3px solid #94a3b8`,
                            transition: 'all 0.2s',
                        }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.25rem' }}>
                                {/* Details */}
                                <div style={{ flex: 1, minWidth: '150px' }}>
                                    <div style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ color: '#cbd5e1' }}>{defect.part}</span>
                                    </div>
                                    <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>
                                        {defect.description || 'Ei kuvausta'}
                                        <span style={{ marginLeft: '0.75rem', color: '#64748b' }}>
                                            🚌 {defect.vehicle || 'N/A'} &bull; Ilmoitettu: {formatTime(defect.reportedAt)}
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                                    <button
                                        onClick={() => updateDefectStatus(defect.id, 'yellow')}
                                        style={{
                                            background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.2)',
                                            color: '#eab308', padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                                            cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem'
                                        }}
                                        title="Palauta työn alle"
                                    >
                                        <RotateCcw size={16} /> Palauta
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
