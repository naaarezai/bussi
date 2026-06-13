import React, { useMemo, useState } from 'react';
import { useStore } from '../store';
import { AlertTriangle, CheckCircle2, AlertCircle, Wrench, Clock, Search, Trash2, Edit3, X, Save, BusFront, Loader2 } from 'lucide-react';

export default function DashboardView() {
    const { defects, updateDefectStatus, removeDefect, filterStatus, setFilterStatus, searchQuery, setSearchQuery, activeVehicle, vehicles, updateDefect, isLoadingDefects, user } = useStore();
    const [vehicleFilter, setVehicleFilter] = useState('all');
    const [editingDefect, setEditingDefect] = useState(null);
    const [editDesc, setEditDesc] = useState('');
    const [editStatus, setEditStatus] = useState('');

    // Apply filters with useMemo for performance
    const sortedDefects = useMemo(() => {
        let filtered = defects.filter(d => d.status !== 'resolved');

        // Filter by vehicle
        if (vehicleFilter !== 'all') {
            filtered = filtered.filter(d => d.vehicle === vehicleFilter);
        }

        // Filter by status
        if (filterStatus !== 'all') {
            filtered = filtered.filter(d => d.status === filterStatus);
        }

        // Filter by search query (Safety check for nulls via Optional Chaining)
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(d =>
                (d.part?.toLowerCase() || '').includes(q) ||
                (d.description?.toLowerCase() || '').includes(q) ||
                (d.vehicle?.toLowerCase() || '').includes(q)
            );
        }

        // Sort by priority
        return [...filtered].sort((a, b) => {
            const priority = { red: 0, yellow: 1, green: 2 };
            return priority[a.status] - priority[b.status];
        });
    }, [defects, filterStatus, searchQuery, vehicleFilter]);

    const stats = useMemo(() => {
        const source = vehicleFilter !== 'all'
            ? defects.filter(d => d.vehicle === vehicleFilter && d.status !== 'resolved')
            : defects.filter(d => d.status !== 'resolved');
        return {
            total: source.length,
            red: source.filter(d => d.status === 'red').length,
            yellow: source.filter(d => d.status === 'yellow').length,
            green: source.filter(d => d.status === 'green').length,
        };
    }, [defects, vehicleFilter]);

    const statusLabels = {
        red: { label: 'Kriittinen', icon: <AlertCircle size={16} />, bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' },
        yellow: { label: 'Keskivakava', icon: <AlertTriangle size={16} />, bg: 'rgba(234, 179, 8, 0.15)', color: '#eab308' },
        green: { label: 'Lievä', icon: <CheckCircle2 size={16} />, bg: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' },
    };

    const formatTime = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diffMs = now - d;
        const diffH = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffH < 1) return 'Juuri nyt';
        if (diffH < 24) return `${diffH}h sitten`;
        return `${Math.floor(diffH / 24)}pv sitten`;
    };

    const filterButtons = [
        { id: 'all', label: 'Kaikki', color: '#38bdf8' },
        { id: 'red', label: 'Kriittiset', color: '#ef4444' },
        { id: 'yellow', label: 'Keskivakavat', color: '#eab308' },
        { id: 'green', label: 'Lievät', color: '#22c55e' },
    ];

    const startEdit = (defect) => {
        setEditingDefect(defect.id);
        setEditDesc(defect.description || '');
        setEditStatus(defect.status);
    };

    const saveEdit = () => {
        if (editingDefect) {
            updateDefect(editingDefect, { description: editDesc, status: editStatus });
            setEditingDefect(null);
        }
    };

    const cancelEdit = () => {
        setEditingDefect(null);
    };

    return (
        <div style={{ padding: '2rem', overflowY: 'auto', height: '100%' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
                🔧 Korjaamon hallintapaneeli
            </h2>
            <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '1rem' }}>
                Priorisoidut työtehtävät ja kaluston vikatilanne.
            </p>

            {/* Stats Grid */}
            <div className="stats-grid-4" style={{ marginBottom: '2rem' }}>
                {[
                    { label: 'Yhteensä', value: stats.total, color: '#38bdf8', icon: <Wrench size={20} /> },
                    { label: 'Kriittiset', value: stats.red, color: '#ef4444', icon: <AlertCircle size={20} /> },
                    { label: 'Keskivakavat', value: stats.yellow, color: '#eab308', icon: <AlertTriangle size={20} /> },
                    { label: 'Lievät', value: stats.green, color: '#22c55e', icon: <CheckCircle2 size={20} /> },
                ].map((stat, i) => (
                    <div key={i} className="glass-panel" style={{
                        padding: '1.25rem', borderRadius: '1rem',
                        borderLeft: `3px solid ${stat.color}`,
                        cursor: 'pointer', transition: 'all 0.2s',
                    }}
                        onClick={() => setFilterStatus(i === 0 ? 'all' : ['red', 'yellow', 'green'][i - 1])}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                            <span style={{ color: stat.color }}>{stat.icon}</span>
                            {stat.label}
                        </div>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: stat.color }}>
                            {stat.value}
                        </div>
                    </div>
                ))}
            </div>

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
                        placeholder="Hae osan nimellä, kuvauksella tai auton numerolla..."
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

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                    {filterButtons.map(f => (
                        <button key={f.id} onClick={() => setFilterStatus(f.id)} style={{
                            background: filterStatus === f.id ? `${f.color}22` : 'transparent',
                            border: filterStatus === f.id ? `1px solid ${f.color}55` : '1px solid rgba(255,255,255,0.1)',
                            color: filterStatus === f.id ? f.color : '#94a3b8',
                            padding: '0.4rem 0.75rem', borderRadius: '2rem', cursor: 'pointer',
                            fontFamily: 'Inter, sans-serif', fontSize: '0.8rem', fontWeight: '500',
                            transition: 'all 0.2s',
                        }}>
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Work Queue */}
            <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={20} style={{ color: '#38bdf8' }} />
                Työjono ({sortedDefects.length} ilmoitusta)
            </h3>

            {isLoadingDefects ? (
                <div className="glass-panel" style={{ padding: '3rem', borderRadius: '1rem', textAlign: 'center', color: '#64748b', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <Loader2 size={32} className="spin" style={{ color: '#38bdf8' }} />
                    Ladataan vikailmoituksia...
                </div>
            ) : sortedDefects.length === 0 ? (
                <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1rem', textAlign: 'center', color: '#64748b' }}>
                    Ei vikailmoituksia tällä suodatuksella.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {sortedDefects.map((defect) => {
                        const s = statusLabels[defect.status] || { label: 'Tuntematon', icon: <AlertCircle size={16} />, bg: 'rgba(148, 163, 184, 0.15)', color: '#94a3b8' };
                        const isEditing = editingDefect === defect.id;

                        return (
                            <div key={defect.id} className="glass-panel fade-in" style={{
                                padding: '1.25rem', borderRadius: '1rem',
                                borderLeft: `3px solid ${s.color}`,
                                transition: 'all 0.2s',
                            }}>
                                {isEditing ? (
                                    /* ---- Edit mode ---- */
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <span style={{ fontWeight: '600', fontSize: '1rem' }}>{defect.part}</span>
                                            <div style={{ display: 'flex', gap: '0.4rem' }}>
                                                <button onClick={saveEdit} className="btn btn-primary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}>
                                                    <Save size={14} /> Tallenna
                                                </button>
                                                <button onClick={cancelEdit} className="btn" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}>
                                                    <X size={14} /> Peruuta
                                                </button>
                                            </div>
                                        </div>
                                        <textarea
                                            value={editDesc}
                                            onChange={(e) => setEditDesc(e.target.value)}
                                            placeholder="Kuvaus..."
                                            style={{
                                                width: '100%', minHeight: '60px', background: 'rgba(30, 41, 59, 0.8)',
                                                border: '1px solid rgba(255,255,255,0.15)', borderRadius: '0.5rem',
                                                padding: '0.5rem 0.75rem', color: '#f8fafc', fontFamily: 'Inter, sans-serif',
                                                fontSize: '0.85rem', resize: 'vertical', outline: 'none',
                                            }}
                                        />
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            {['red', 'yellow', 'green'].map(st => (
                                                <button key={st} onClick={() => setEditStatus(st)} style={{
                                                    flex: 1, padding: '0.5rem', borderRadius: '0.5rem', cursor: 'pointer',
                                                    background: editStatus === st ? statusLabels[st].bg : 'transparent',
                                                    border: editStatus === st ? `2px solid ${statusLabels[st].color}` : '1px solid rgba(255,255,255,0.1)',
                                                    color: statusLabels[st].color, fontFamily: 'Inter, sans-serif',
                                                    fontSize: '0.8rem', fontWeight: '600', transition: 'all 0.2s',
                                                }}>
                                                    {statusLabels[st].label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    /* ---- View mode ---- */
                                    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.25rem' }}>
                                        {/* Status badge */}
                                        <div style={{
                                            background: s.bg, color: s.color, padding: '0.4rem 0.8rem',
                                            borderRadius: '2rem', fontSize: '0.75rem', fontWeight: '600',
                                            display: 'flex', alignItems: 'center', gap: '0.3rem',
                                            minWidth: '110px', justifyContent: 'center',
                                        }}>
                                            {s.icon} {s.label}
                                        </div>

                                        {/* Details */}
                                        <div style={{ flex: 1, minWidth: '150px' }}>
                                            <div style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '0.2rem' }}>
                                                {defect.part}
                                            </div>
                                            <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                                                {defect.description || 'Ei kuvausta'}
                                                <span style={{ marginLeft: '0.75rem', color: '#64748b' }}>
                                                    🚌 {defect.vehicle || 'N/A'} &bull; {formatTime(defect.reportedAt)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                                            {defect.status === 'red' && (
                                                <button
                                                    onClick={() => updateDefectStatus(defect.id, 'yellow')}
                                                    className="btn btn-primary"
                                                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                                                >
                                                    ⚡ Työn alle
                                                </button>
                                            )}
                                            <button
                                                onClick={() => updateDefectStatus(defect.id, 'resolved')}
                                                className="btn btn-primary"
                                                style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', background: 'rgba(34, 197, 94, 0.2)', color: '#22c55e', border: '1px solid #22c55e' }}
                                            >
                                                ✅ Arkistoi
                                            </button>
                                            <button
                                                onClick={() => startEdit(defect)}
                                                style={{
                                                    background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)',
                                                    color: '#38bdf8', padding: '0.4rem', borderRadius: '0.5rem',
                                                    cursor: 'pointer', transition: 'all 0.2s', display: 'flex',
                                                }}
                                            >
                                                <Edit3 size={16} />
                                            </button>
                                            {(user?.role === 'admin' || user?.role === 'mechanic') && (
                                                <button
                                                    onClick={() => removeDefect(defect.id)}
                                                    style={{
                                                        background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                                                        color: '#ef4444', padding: '0.4rem', borderRadius: '0.5rem',
                                                        cursor: 'pointer', transition: 'all 0.2s', display: 'flex',
                                                    }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
