import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { VEHICLES, INITIAL_DEFECTS } from './constants';

export const useStore = create(
  persist(
    (set, get) => ({
      activeView: 'dashboard',
      setActiveView: (view) => set({ activeView: view }),

      // Multi-vehicle support
      vehicles: VEHICLES,
      activeVehicle: VEHICLES[0],
      setActiveVehicle: (vehicleId) => set({
        activeVehicle: VEHICLES.find(v => v.id === vehicleId) || VEHICLES[0]
      }),
      setActiveVehicleByQR: (qrCode) => {
        const vehicle = VEHICLES.find(v => v.qrCode === qrCode);
        if (vehicle) {
          set({ activeVehicle: vehicle, activeView: 'report' });
          return true;
        }
        return false;
      },

      // Defects
      defects: INITIAL_DEFECTS,
      addDefect: (defect) => set((state) => ({
        defects: [...state.defects, {
          ...defect,
          id: Date.now(),
          reportedAt: new Date().toISOString(),
          vehicle: get().activeVehicle.id,
        }]
      })),
      updateDefectStatus: (id, newStatus) => set((state) => ({
        defects: state.defects.map(d => d.id === id ? { ...d, status: newStatus } : d)
      })),
      removeDefect: (id) => set((state) => ({
        defects: state.defects.filter(d => d.id !== id)
      })),
      updateDefect: (id, updates) => set((state) => ({
        defects: state.defects.map(d => d.id === id ? { ...d, ...updates } : d)
      })),

      // Toast notifications
      toasts: [],
      addToast: (message, type = 'info') => {
        const id = Date.now();
        set((state) => ({
          toasts: [...state.toasts, { id, message, type }]
        }));
        setTimeout(() => {
          set((state) => ({
            toasts: state.toasts.filter(t => t.id !== id)
          }));
        }, 4000);
      },
      removeToast: (id) => set((state) => ({
        toasts: state.toasts.filter(t => t.id !== id)
      })),

      // Export
      exportDefectsCSV: () => {
        const { defects } = get();
        const header = 'ID,Osa,Status,Kuvaus,Ajoneuvo,Ilmoitettu\n';
        const rows = defects.map(d =>
          `${d.id},"${d.part}",${d.status},"${d.description || ''}",${d.vehicle},${d.reportedAt}`
        ).join('\n');
        const csv = header + rows;
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vikailmoitukset_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      },

      // Filters
      filterStatus: 'all', // all, red, yellow, green
      setFilterStatus: (status) => set({ filterStatus: status }),
      searchQuery: '',
      setSearchQuery: (q) => set({ searchQuery: q }),

      activePart: null,
      setActivePart: (part) => set({ activePart: part }),

      // QR Scanner state
      showQRScanner: false,
      setShowQRScanner: (show) => set({ showQRScanner: show }),

      // Mobile Menu
      isMobileMenuOpen: false,
      setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
    }),
    {
      name: 'bussi-store', // name of the item in the storage (must be unique)
      partialize: (state) => ({
        defects: state.defects,
        // Optional: you can save active vehicle or view if you want:
        activeVehicle: state.activeVehicle,
        activeView: state.activeView
      }),
    }
  )
);
