import React from 'react';
import Sidebar from './Sidebar';
import { useStore } from '../store';
import DashboardView from '../views/DashboardView';
import ReportView from '../views/ReportView';
import FleetView from '../views/FleetView';
import HistoryView from '../views/HistoryView';
import SettingsView from '../views/SettingsView';
import UsersView from '../views/UsersView';
import QRScanner from './QRScanner';
import ToastContainer from './ToastContainer';
import { Menu, Download } from 'lucide-react';

export default function Layout() {
    const { activeView, showQRScanner, isMobileMenuOpen, setMobileMenuOpen, exportDefectsCSV, addToast, user } = useStore();

    const views = {
        dashboard: <DashboardView />,
        report: <ReportView />,
        fleet: <FleetView />,
        history: <HistoryView />,
        settings: <SettingsView />,
        users: <UsersView />,
    };

    const handleExport = () => {
        exportDefectsCSV();
        addToast('Vikailmoitukset viety CSV-tiedostoon', 'success');
    };

    let currentView = activeView;
    if (user?.role === 'driver' && !['report', 'settings'].includes(currentView)) {
        currentView = 'report';
    }

    return (
        <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', position: 'relative' }}>
            <Sidebar />

            <main style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
                {/* Mobile menu button */}
                <button
                    className="mobile-menu-btn"
                    onClick={() => setMobileMenuOpen(true)}
                >
                    <Menu size={24} />
                </button>

                {/* CSV Export button */}
                {activeView === 'dashboard' && (
                    <button
                        onClick={handleExport}
                        className="btn"
                        style={{
                            position: 'absolute', top: '1.5rem', right: '5rem', zIndex: 5,
                            borderRadius: '0.75rem', fontSize: '0.8rem', padding: '0.5rem 1rem',
                        }}
                    >
                        <Download size={16} /> Vie CSV
                    </button>
                )}

                {views[currentView] || <DashboardView />}
            </main>

            {/* Mobile overlay */}
            {isMobileMenuOpen && (
                <div
                    className="mobile-overlay"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}
            {showQRScanner && <QRScanner />}
            <ToastContainer />
        </div>
    );
}
