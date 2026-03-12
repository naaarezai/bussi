import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useStore } from '../store';
import { QrCode, X, Camera, CheckCircle2, AlertCircle } from 'lucide-react';

export default function QRScanner() {
    const { setShowQRScanner, setActiveVehicleByQR, vehicles } = useStore();
    const [scanResult, setScanResult] = useState(null);
    const [error, setError] = useState(null);
    const [manualMode, setManualMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const scannerRef = useRef(null);
    const containerRef = useRef(null);

    useEffect(() => {
        let scanner = null;

        const startScanner = async () => {
            try {
                scanner = new Html5Qrcode('qr-reader');
                scannerRef.current = scanner;

                await scanner.start(
                    { facingMode: 'environment' },
                    { fps: 10, qrbox: { width: 250, height: 250 } },
                    (decodedText) => {
                        const success = setActiveVehicleByQR(decodedText);
                        if (success) {
                            setScanResult(decodedText);
                            try {
                                scanner.stop().catch(() => { });
                            } catch (e) {
                                // Ignore synchronous stop errors
                            }
                            setTimeout(() => setShowQRScanner(false), 1500);
                        } else {
                            setError('Tuntematon QR-koodi');
                            setTimeout(() => setError(null), 3000);
                        }
                    },
                    () => { } // Ignore scan failures
                );
            } catch (err) {
                console.log('Camera not available, switching to manual mode');
                setManualMode(true);
            }
        };

        if (!manualMode) {
            startScanner();
        }

        return () => {
            if (scannerRef.current) {
                try {
                    scannerRef.current.stop().catch(() => { });
                } catch (e) {
                    // Ignore synchronous stop errors
                }
            }
        };
    }, [manualMode]);

    const handleManualSelect = (vehicleId) => {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        if (vehicle) {
            setActiveVehicleByQR(vehicle.qrCode);
            setTimeout(() => setShowQRScanner(false), 500);
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(15, 23, 42, 0.95)', zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(8px)',
        }}>
            <div className="glass-panel fade-in" style={{
                width: '100%', maxWidth: '480px', margin: '0 1rem', padding: '1.5rem',
                borderRadius: '1.25rem', position: 'relative',
            }}>
                {/* Close button */}
                <button onClick={() => setShowQRScanner(false)} style={{
                    position: 'absolute', top: '1rem', right: '1rem', background: 'transparent',
                    border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.5rem',
                    transition: 'color 0.2s', zIndex: 10,
                }}
                    onMouseEnter={e => e.target.style.color = 'white'}
                    onMouseLeave={e => e.target.style.color = '#94a3b8'}
                ><X size={24} /></button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <QrCode size={28} style={{ color: '#38bdf8' }} />
                    <div>
                        <h2 style={{ fontSize: '1.4rem', fontWeight: '700' }}>QR-skanneri</h2>
                        <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Skannaa auton ovessa oleva QR-koodi</p>
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <div className="fade-in" style={{
                        background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                        color: '#ef4444', padding: '0.75rem 1rem', borderRadius: '0.75rem', marginBottom: '1.5rem',
                        display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem'
                    }}>
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                {/* Success state */}
                {scanResult && (
                    <div className="fade-in" style={{ textAlign: 'center', padding: '2rem 0' }}>
                        <CheckCircle2 size={64} style={{ color: '#22c55e', marginBottom: '1rem' }} />
                        <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>Auto tunnistettu!</h3>
                        <p style={{ color: '#94a3b8' }}>Siirrytään 3D-tarkastukseen...</p>
                    </div>
                )}

                {/* Scanner / Manual mode */}
                {!scanResult && (
                    <>
                        {!manualMode ? (
                            <div>
                                <div id="qr-reader" ref={containerRef} style={{
                                    width: '100%', borderRadius: '1rem', overflow: 'hidden',
                                    marginBottom: '1rem',
                                }} />
                                <button onClick={() => setManualMode(true)} style={{
                                    background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#94a3b8', padding: '0.6rem 1rem', borderRadius: '0.75rem',
                                    cursor: 'pointer', width: '100%', fontFamily: 'Inter, sans-serif',
                                    fontSize: '0.85rem', transition: 'all 0.2s',
                                }}
                                    onMouseEnter={e => e.target.style.borderColor = 'rgba(56, 189, 248, 0.4)'}
                                    onMouseLeave={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                >
                                    📋 Valitse auto manuaalisesti
                                </button>
                            </div>
                        ) : (
                            <div>
                                <input
                                    type="text"
                                    placeholder="Hae numerolla, mallilla tai linjalla..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    style={{
                                        width: '100%', padding: '0.75rem 1rem', borderRadius: '0.75rem',
                                        background: 'rgba(30, 41, 59, 1)', border: '1px solid rgba(255,255,255,0.1)',
                                        color: '#f8fafc', marginBottom: '1rem', fontFamily: 'Inter, sans-serif',
                                        outline: 'none', transition: 'border-color 0.2s'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = 'rgba(56, 189, 248, 0.4)'}
                                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                />
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                                    {vehicles.filter(v =>
                                        v.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                        v.route.toLowerCase().includes(searchQuery.toLowerCase())
                                    ).map(v => (
                                        <button key={v.id} onClick={() => handleManualSelect(v.id)} style={{
                                            background: 'rgba(30, 41, 59, 0.8)', border: '1px solid rgba(255,255,255,0.1)',
                                            color: '#f8fafc', padding: '0.85rem 1rem', borderRadius: '0.75rem',
                                            cursor: 'pointer', textAlign: 'left', fontFamily: 'Inter, sans-serif',
                                            transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '0.75rem',
                                        }}
                                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)'; e.currentTarget.style.background = 'rgba(56, 189, 248, 0.1)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(30, 41, 59, 0.8)'; }}
                                        >
                                            <QrCode size={20} style={{ color: '#38bdf8', flexShrink: 0 }} />
                                            <div>
                                                <div style={{ fontWeight: '600', fontSize: '0.95rem' }}>{v.id}</div>
                                                <div style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{v.model} — {v.route}</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>

                                <button onClick={() => setManualMode(false)} style={{
                                    background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                                    color: '#94a3b8', padding: '0.6rem 1rem', borderRadius: '0.75rem',
                                    cursor: 'pointer', width: '100%', fontFamily: 'Inter, sans-serif',
                                    fontSize: '0.85rem', marginTop: '0.75rem', transition: 'all 0.2s',
                                }}
                                    onMouseEnter={e => e.target.style.borderColor = 'rgba(56, 189, 248, 0.4)'}
                                    onMouseLeave={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                                >
                                    📸 Kokeile kameraa uudelleen
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
