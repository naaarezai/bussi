import React, { useMemo, useState } from 'react';
import { useStore } from '../store';
import { Search, BusFront, Archive, RotateCcw, PenTool, Plus, X, Loader2 } from 'lucide-react';

export default function HistoryView() {
    const { defects, maintenanceLogs, isLoadingLogs, updateDefectStatus, searchQuery, setSearchQuery, vehicles, user, addMaintenanceLog } = useStore();
    const [vehicleFilter, setVehicleFilter] = useState('all');
    
    // Add maintenance modal state
    const [isAddingLog, setIsAddingLog] = useState(false);
    const [newLogDesc, setNewLogDesc] = useState('');
    const [newLogVehicle, setNewLogVehicle] = useState(vehicles[0]?.id || '');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [editDesc, setEditDesc] = useState('');
    
    const { updateDefect } = useStore();

    // Combine resolved defects and maintenance logs
    const combinedHistory = useMemo(() => {
        let resolvedDefects = defects
            .filter(d => d.status === 'resolved')
            .map(d => ({
                id: d.id,
                type: 'defect',
                title: d.part,
                description: d.description,
                vehicle: d.vehicle,
                date: d.reportedAt,
                author: 'Vikailmoitus',
                imageUrl: d.imageUrl
            }));

        let logs = maintenanceLogs.map(m => ({
            id: m.id,
            type: 'maintenance',
            title: 'Huoltotyö',
            description: m.description,
            vehicle: m.vehicle,
            date: m.date,
            author: m.profiles?.full_name || 'Tuntematon mekaanikko'
        }));

        let all = [...resolvedDefects, ...logs];

        if (vehicleFilter !== 'all') {
            all = all.filter(item => item.vehicle === vehicleFilter);
        }

        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase();
            all = all.filter(item =>
                (item.title?.toLowerCase() || '').includes(q) ||
                (item.description?.toLowerCase() || '').includes(q) ||
                (item.vehicle?.toLowerCase() || '').includes(q) ||
                (item.author?.toLowerCase() || '').includes(q)
            );
        }

        return all.sort((a, b) => new Date(b.date) - new Date(a.date));
    }, [defects, maintenanceLogs, searchQuery, vehicleFilter]);

    const formatTime = (date) => {
        const d = new Date(date);
        return d.toLocaleDateString('fi-FI') + ' klo ' + d.toLocaleTimeString('fi-FI', { hour: '2-digit', minute: '2-digit' });
    };

    const handleAddLog = async (e) => {
        e.preventDefault();
        if (!newLogDesc.trim() || !newLogVehicle) return;
        
        setIsSubmitting(true);
        await addMaintenanceLog({
            vehicle: newLogVehicle,
            description: newLogDesc
        });
        setIsSubmitting(false);
        setIsAddingLog(false);
        setNewLogDesc('');
    };

    return (
        <div style={{ padding: '2rem', overflowY: 'auto', height: '100%', position: 'relative' }}>
            {/* Fullscreen Image Modal */}
            {selectedImage && (
                <div 
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 9999,
                        display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '1rem'
                    }}
                    onClick={() => setSelectedImage(null)}
                >
                    <button 
                        onClick={() => setSelectedImage(null)}
                        style={{
                            position: 'absolute', top: '1rem', right: '1rem',
                            background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white',
                            borderRadius: '50%', padding: '0.5rem', cursor: 'pointer'
                        }}
                    >
                        <X size={24} />
                    </button>
                    <img 
                        src={selectedImage} 
                        alt="Vikakuva" 
                        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '0.5rem' }} 
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.5rem' }}>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 'bold', margin: 0, display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Archive size={32} style={{ color: '#94a3b8' }} /> Huoltohistoria
                </h2>
                
                {(user?.role === 'admin' || user?.role === 'mechanic') && (
                    <button 
                        onClick={() => setIsAddingLog(true)}
                        className="btn btn-primary"
                        style={{ padding: '0.6rem 1.25rem' }}
                    >
                        <Plus size={18} /> Lisää huoltomerkintä
                    </button>
                )}
            </div>
            
            <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '1rem' }}>
                Arkistoidut viat ja korjaamon tekemät huoltomerkinnät.
            </p>

            {/* Add Maintenance Log Form */}
            {isAddingLog && (
                <div className="glass-panel slide-up" style={{ padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem', border: '1px solid #38bdf8' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#38bdf8' }}>
                            <PenTool size={20} /> Uusi huoltomerkintä
                        </h3>
                        <button onClick={() => setIsAddingLog(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                    </div>
                    
                    <form onSubmit={handleAddLog} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                            <div style={{ flex: 1, minWidth: '200px' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#cbd5e1' }}>Ajoneuvo</label>
                                <select 
                                    value={newLogVehicle}
                                    onChange={(e) => setNewLogVehicle(e.target.value)}
                                    style={{
                                        width: '100%', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.2)',
                                        color: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '0.5rem',
                                        fontFamily: 'Inter, sans-serif', outline: 'none'
                                    }}
                                >
                                    {vehicles.map(v => (
                                        <option key={v.id} value={v.id}>{v.id} — {v.model}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#cbd5e1' }}>Kuvaus huollosta</label>
                            <textarea 
                                value={newLogDesc}
                                onChange={(e) => setNewLogDesc(e.target.value)}
                                placeholder="Mitä autolle tehtiin? Esim. Määräaikaishuolto, öljyt ja suodattimet vaihdettu."
                                required
                                style={{
                                    width: '100%', minHeight: '100px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.2)',
                                    color: '#f8fafc', padding: '0.75rem 1rem', borderRadius: '0.5rem',
                                    fontFamily: 'Inter, sans-serif', outline: 'none', resize: 'vertical'
                                }}
                            />
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
                            <button type="button" onClick={() => setIsAddingLog(false)} className="btn" style={{ padding: '0.75rem 1.5rem' }}>
                                Peruuta
                            </button>
                            <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem' }}>
                                {isSubmitting ? <Loader2 size={18} className="spin" /> : 'Tallenna merkintä'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

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

            {isLoadingLogs ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
                    <Loader2 size={32} className="spin" style={{ color: '#94a3b8' }} />
                </div>
            ) : combinedHistory.length === 0 ? (
                <div className="glass-panel" style={{ padding: '2rem', borderRadius: '1rem', textAlign: 'center', color: '#64748b' }}>
                    Ei merkintöjä tällä suodatuksella.
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {combinedHistory.map((item) => (
                        <div key={`${item.type}-${item.id}`} className="glass-panel fade-in" style={{
                            padding: '1.25rem', borderRadius: '1rem',
                            borderLeft: `3px solid ${item.type === 'maintenance' ? '#a78bfa' : '#94a3b8'}`,
                            background: item.type === 'maintenance' ? 'rgba(167, 139, 250, 0.05)' : 'rgba(15, 23, 42, 0.6)',
                            transition: 'all 0.2s',
                        }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.25rem' }}>
                                {/* Details */}
                                <div style={{ flex: 1, minWidth: '150px' }}>
                                    <div style={{ fontWeight: '600', fontSize: '1rem', marginBottom: '0.3rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ color: item.type === 'maintenance' ? '#a78bfa' : '#cbd5e1' }}>
                                            {item.type === 'maintenance' ? <PenTool size={16} style={{ display: 'inline', marginRight: '0.25rem' }}/> : null}
                                            {item.title}
                                        </span>
                                    </div>
                                    <div style={{ color: '#e2e8f0', fontSize: '0.9rem', marginBottom: '0.5rem', whiteSpace: 'pre-wrap' }}>
                                        {editingItem === item.id ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                <textarea 
                                                    value={editDesc}
                                                    onChange={(e) => setEditDesc(e.target.value)}
                                                    style={{
                                                        width: '100%', minHeight: '60px', background: 'rgba(30, 41, 59, 0.8)',
                                                        border: '1px solid rgba(255,255,255,0.15)', borderRadius: '0.5rem',
                                                        padding: '0.5rem 0.75rem', color: '#f8fafc', fontFamily: 'Inter, sans-serif',
                                                        fontSize: '0.85rem', resize: 'vertical', outline: 'none',
                                                    }}
                                                />
                                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                    <button onClick={() => {
                                                        if (item.type === 'defect') updateDefect(item.id, { description: editDesc });
                                                        setEditingItem(null);
                                                    }} className="btn btn-primary" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}>
                                                        Tallenna
                                                    </button>
                                                    <button onClick={() => setEditingItem(null)} className="btn" style={{ padding: '0.3rem 0.7rem', fontSize: '0.8rem' }}>
                                                        Peruuta
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            item.description || 'Ei kuvausta'
                                        )}
                                    </div>
                                    
                                    {item.imageUrl && (
                                        <div style={{ marginBottom: '1rem', marginTop: '0.5rem' }}>
                                            <img 
                                                src={item.imageUrl} 
                                                alt="Vika" 
                                                onClick={() => setSelectedImage(item.imageUrl)}
                                                style={{ 
                                                    height: '80px', width: '120px', objectFit: 'cover', 
                                                    borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.1)',
                                                    cursor: 'zoom-in'
                                                }} 
                                            />
                                        </div>
                                    )}

                                    <div style={{ color: '#64748b', fontSize: '0.8rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                                        <span>🚌 {item.vehicle || 'N/A'}</span>
                                        <span>👤 {item.author}</span>
                                        <span>⏰ {formatTime(item.date)}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                {item.type === 'defect' && (user?.role === 'admin' || user?.role === 'mechanic') && (
                                    <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                                        {editingItem !== item.id && (
                                            <button
                                                onClick={() => {
                                                    setEditingItem(item.id);
                                                    setEditDesc(item.description || '');
                                                }}
                                                style={{
                                                    background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)',
                                                    color: '#38bdf8', padding: '0.5rem 0.75rem', borderRadius: '0.5rem',
                                                    cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem'
                                                }}
                                                title="Muokkaa kuvausta"
                                            >
                                                <PenTool size={16} /> Muokkaa
                                            </button>
                                        )}
                                        <button
                                            onClick={() => updateDefectStatus(item.id, 'yellow')}
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
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
