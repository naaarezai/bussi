import React from 'react';
import { useStore } from '../store';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

const typeConfig = {
    success: { icon: <CheckCircle2 size={18} />, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)' },
    error: { icon: <AlertCircle size={18} />, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
    info: { icon: <Info size={18} />, color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)' },
    warning: { icon: <AlertCircle size={18} />, color: '#eab308', bg: 'rgba(234, 179, 8, 0.15)' },
};

export default function ToastContainer() {
    const { toasts, removeToast } = useStore();

    if (toasts.length === 0) return null;

    return (
        <div style={{
            position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 200,
            display: 'flex', flexDirection: 'column', gap: '0.5rem',
            maxWidth: '380px',
        }}>
            {toasts.map(toast => {
                const type = typeConfig[toast.type] || typeConfig.info;
                return (
                    <div key={toast.id} className="glass-panel fade-in" style={{
                        padding: '0.85rem 1rem', borderRadius: '0.75rem',
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        borderLeft: `3px solid ${type.color}`,
                        background: type.bg,
                        backdropFilter: 'blur(12px)',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    }}>
                        <span style={{ color: type.color, flexShrink: 0 }}>{type.icon}</span>
                        <span style={{ flex: 1, fontSize: '0.85rem', color: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
                            {toast.message}
                        </span>
                        <button onClick={() => removeToast(toast.id)} style={{
                            background: 'transparent', border: 'none', color: '#64748b',
                            cursor: 'pointer', padding: 0, display: 'flex', flexShrink: 0,
                        }}>
                            <X size={16} />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
