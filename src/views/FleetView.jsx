import React, { useState } from 'react';
import { useStore } from '../store';
import { BusFront, AlertCircle, CheckCircle2, AlertTriangle, ArrowRightLeft, Plus, X, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function FleetView() {
    const { defects, vehicles, isLoadingVehicles, user, addVehicle, toggleVehicleStatus } = useStore();
    const redDefects = defects.filter(d => d.status === 'red');
    const yellowDefects = defects.filter(d => d.status === 'yellow');

    const [isAddingVehicle, setIsAddingVehicle] = useState(false);
    const [newId, setNewId] = useState('');
    const [newModel, setNewModel] = useState('');
    const [newLicense, setNewLicense] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        inactive: { label: 'Poistettu käytöstä', bg: 'rgba(100, 116, 139, 0.15)', color: '#64748b', icon: <EyeOff size={16} /> },
    };

    const activeVehicles = vehicles.filter(v => v.is_active);

    const handleAddVehicle = async (e) => {
        e.preventDefault();
        if (!newId.trim() || !newModel.trim()) return;
        setIsSubmitting(true);
        await addVehicle({
            id: newId,
            model: newModel,
            license_plate: newLicense,
            is_active: true
        });
        setIsSubmitting(false);
        setIsAddingVehicle(false);
        setNewId('');
        setNewModel('');
        setNewLicense('');
    };

    return (
        <div style={{ padding: '2rem', overflowY: 'auto', height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.5rem' }}>
                <h2 style={{ fontSize: '2.2rem', fontWeight: 'bold', margin: 0 }}>
                    🚌 Kaluston tila
                </h2>
                
                {user?.role === 'admin' && (
                    <button 
                        onClick={() => setIsAddingVehicle(true)}
                        className="btn btn-primary"
                        style={{ padding: '0.6rem 1.25rem' }}
                    >
                        <Plus size={18} /> Lisää auto
                    </button>
                )}
            </div>

            <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '1rem' }}>
                Reaaliaikainen kaluston valmiustilanne ja hallinta.
            </p>

            {isAddingVehicle && (
                <div className="glass-panel slide-up" style={{ padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem', border: '1px solid #38bdf8' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3 style={{ margin: 0, color: '#38bdf8' }}>Lisää uusi linja-auto</h3>
                        <button onClick={() => setIsAddingVehicle(false)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                    </div>
                    
                    <form onSubmit={handleAddVehicle} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1, minWidth: '150px' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#cbd5e1' }}>Tunnus (esim. Auto 12)</label>
                            <input 
                                value={newId} onChange={(e) => setNewId(e.target.value)} required
                                style={{ width: '100%', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.2)', color: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem' }}
                            />
                        </div>
                        <div style={{ flex: 1, minWidth: '150px' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#cbd5e1' }}>Malli (esim. Volvo B8R)</label>
                            <input 
                                value={newModel} onChange={(e) => setNewModel(e.target.value)} required
                                style={{ width: '100%', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.2)', color: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem' }}
                            />
                        </div>
                        <div style={{ flex: 1, minWidth: '150px' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#cbd5e1' }}>Rekisterinro (Valinnainen)</label>
                            <input 
                                value={newLicense} onChange={(e) => setNewLicense(e.target.value)}
                                style={{ width: '100%', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.2)', color: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem' }}
                            />
                        </div>
                        <button type="submit" disabled={isSubmitting} className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', height: '42px' }}>
                            {isSubmitting ? <Loader2 size={18} className="spin" /> : 'Tallenna'}
                        </button>
                    </form>
                </div>
            )}

            {/* Fleet Summary */}
            <div className="stats-grid-3" style={{ marginBottom: '2.5rem' }}>
                {[
                    { label: 'Ajokelpoisia', value: activeVehicles.length - redDefects.length, color: '#22c55e', total: activeVehicles.length },
                    { label: 'Ajokiellossa', value: redDefects.length, color: '#ef4444' },
                    { label: 'Yhteensä (Kaikki)', value: vehicles.length, color: '#38bdf8' },
                ].map((stat, i) => (
                    <div key={i} className="glass-panel" style={{
                        padding: '1.25rem', borderRadius: '1rem', textAlign: 'center',
                    }}>
                        <div style={{ color: '#94a3b8', fontSize: '0.8rem', marginBottom: '0.5rem' }}>{stat.label}</div>
                        <div style={{ fontSize: '1.8rem', fontWeight: 'bold', color: stat.color }}>
                            {stat.value}
                            {stat.total !== undefined && <span style={{ fontSize: '1rem', color: '#64748b' }}> / {stat.total}</span>}
                        </div>
                    </div>
                ))}
            </div>

            {/* Fleet Table */}
            <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '1rem' }}>
                Ajoneuvolista
            </h3>

            {isLoadingVehicles ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                    <Loader2 size={32} className="spin" style={{ color: '#38bdf8' }} />
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {vehicles.map((vehicle) => {
                        const isInactive = !vehicle.is_active;
                        const status = isInactive ? 'inactive' : getVehicleStatus(vehicle.id);
                        const s = statusConfig[status];

                        return (
                            <div key={vehicle.id} className="glass-panel" style={{
                                padding: '1rem 1.25rem', borderRadius: '1rem',
                                display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
                                borderLeft: `3px solid ${s.color}`,
                                opacity: isInactive ? 0.6 : 1
                            }}>
                                <BusFront size={28} style={{ color: s.color, flexShrink: 0 }} />

                                <div style={{ flex: 1, minWidth: '150px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.2rem' }}>
                                        <span style={{ fontWeight: '700', fontSize: '1rem' }}>{vehicle.id}</span>
                                        <span style={{ color: '#64748b', fontSize: '0.825rem' }}>{vehicle.model}</span>
                                    </div>
                                    <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>
                                        {vehicle.license_plate && <span>🆔 {vehicle.license_plate}</span>}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <div style={{
                                        background: s.bg, color: s.color, padding: '0.35rem 0.75rem',
                                        borderRadius: '2rem', fontSize: '0.75rem', fontWeight: '600',
                                        display: 'flex', alignItems: 'center', gap: '0.3rem',
                                    }}>
                                        {s.icon} {s.label}
                                    </div>
                                    
                                    {user?.role === 'admin' && (
                                        <button 
                                            onClick={() => toggleVehicleStatus(vehicle.id, !vehicle.is_active)}
                                            style={{
                                                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                                                color: '#f8fafc', padding: '0.35rem 0.75rem', borderRadius: '0.5rem',
                                                cursor: 'pointer', fontSize: '0.8rem', display: 'flex', gap: '0.5rem', alignItems: 'center'
                                            }}
                                            title={vehicle.is_active ? "Piilota (Poista käytöstä)" : "Palauta käyttöön"}
                                        >
                                            {vehicle.is_active ? <><EyeOff size={14}/> Piilota</> : <><Eye size={14}/> Palauta</>}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
