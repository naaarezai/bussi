import { create } from 'zustand';
import { supabase } from './supabase';

// Helper function to upload base64 image/video to Supabase Storage
const uploadMedia = async (base64Data, mimeType) => {
  if (!base64Data || !mimeType) return null;
  try {
    const fileExt = mimeType.split('/')[1] || 'jpg';
    const fileName = `defect_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    // Convert base64 to Blob
    const res = await fetch(base64Data);
    const blob = await res.blob();
    
    // Upload to 'media' bucket
    const { data, error } = await supabase.storage
      .from('media')
      .upload(fileName, blob, { contentType: mimeType });
      
    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(fileName);
      
    return publicUrl;
  } catch (error) {
    console.error('Virhe median latauksessa:', error);
    return null;
  }
};

export const useStore = create((set, get) => ({
  activeView: 'dashboard',
  setActiveView: (view) => set({ activeView: view }),

  // Auth & User Profile
  user: null,
  session: null,
  isInitializingAuth: true,

  initializeAuth: async () => {
    // Haetaan nykyinen sessio
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      await get().fetchUserProfile(session.user);
    } else {
      set({ session: null, user: null, isInitializingAuth: false });
    }

    // Kuunnellaan muutoksia (login/logout)
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        await get().fetchUserProfile(session.user);
      } else {
        set({ session: null, user: null, defects: [] }); // Tyhjennetään tiedot kirjauduttaessa ulos
      }
    });
  },

  fetchUserProfile: async (authUser) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
        
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = No rows found

      set({
        session: authUser,
        user: {
          id: authUser.id,
          email: authUser.email,
          role: data?.role || 'driver', // Oletuksena kuljettaja
          full_name: data?.full_name || authUser.email
        },
        isInitializingAuth: false
      });
    } catch (error) {
      console.error('Virhe profiilin latauksessa:', error);
      set({ isInitializingAuth: false });
    }
  },

  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  },

  signOut: async () => {
    await supabase.auth.signOut();
  },

  // Multi-vehicle support
  vehicles: [],
  activeVehicle: null,
  isLoadingVehicles: false,
  
  fetchVehicles: async () => {
    set({ isLoadingVehicles: true });
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('*')
        .order('id');
      if (error) throw error;
      set({ vehicles: data || [], activeVehicle: data?.[0] || null, isLoadingVehicles: false });
    } catch (error) {
      console.error('Virhe autojen haussa:', error);
      set({ isLoadingVehicles: false });
    }
  },

  addVehicle: async (vehicleData) => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .insert([vehicleData])
        .select();
      if (error) throw error;
      set((state) => ({ vehicles: [...state.vehicles, data[0]] }));
      get().addToast('Auto lisätty', 'success');
    } catch (error) {
      console.error('Virhe auton lisäyksessä:', error);
      get().addToast('Auton lisäys epäonnistui', 'error');
    }
  },

  toggleVehicleStatus: async (id, isActive) => {
    try {
      const { error } = await supabase
        .from('vehicles')
        .update({ is_active: isActive })
        .eq('id', id);
      if (error) throw error;
      set((state) => ({
        vehicles: state.vehicles.map(v => v.id === id ? { ...v, is_active: isActive } : v)
      }));
      get().addToast(`Auto ${isActive ? 'aktivoitu' : 'piilotettu'}`, 'success');
    } catch (error) {
      console.error('Virhe auton tilan vaihdossa:', error);
      get().addToast('Tilan vaihto epäonnistui', 'error');
    }
  },

  setActiveVehicle: (vehicleId) => set({
    activeVehicle: get().vehicles.find(v => v.id === vehicleId) || get().vehicles[0]
  }),
  setActiveVehicleByQR: (qrCode) => {
    const vehicle = get().vehicles.find(v => v.qrCode === qrCode);
    if (vehicle) {
      set({ activeVehicle: vehicle, activeView: 'report' });
      return true;
    }
    return false;
  },

  // Defects
  defects: [],
  isLoadingDefects: false,
  
  fetchDefects: async () => {
    set({ isLoadingDefects: true });
    try {
      const { data, error } = await supabase
        .from('defects')
        .select('*')
        .order('reported_at', { ascending: false });
        
      if (error) throw error;
      
      const mapped = data.map(d => ({
        id: d.id,
        vehicle: d.vehicle,
        part: d.part,
        status: d.status,
        description: d.description,
        photo: d.photo,
        mediaType: d.media_type,
        coordinates: d.coordinates,
        reportedAt: d.reported_at
      }));
      
      set({ defects: mapped, isLoadingDefects: false });
    } catch (error) {
      console.error('Virhe vikojen haussa:', error);
      set({ isLoadingDefects: false });
      get().addToast('Virhe yhdistettäessä tietokantaan.', 'error');
    }
  },

  subscribeToDefects: () => {
    supabase.channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'defects' },
        (payload) => {
          // Kun kanta muuttuu, haetaan viat uudelleen tai päivitetään lokaalisti.
          get().fetchDefects();
          if (payload.eventType === 'INSERT') {
             get().addToast('Uusi vikailmoitus vastaanotettu!', 'info');
          }
        }
      )
      .subscribe();

    supabase.channel('custom-maintenance-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'maintenance_logs' },
        (payload) => {
          get().fetchMaintenanceLogs();
        }
      )
      .subscribe();
  },

  addDefect: async (defect) => {
    get().addToast('Ladataan raporttia ja kuvaa pilveen...', 'info');
    
    try {
      let photoUrl = null;
      if (defect.photo) {
        photoUrl = await uploadMedia(defect.photo, defect.mediaType);
      }
      
      const newDefect = {
        vehicle: get().activeVehicle.id,
        part: defect.part,
        status: defect.status,
        description: defect.description,
        photo: photoUrl,
        media_type: defect.mediaType,
        coordinates: defect.coordinates
      };
      
      const { data, error } = await supabase
        .from('defects')
        .insert([newDefect])
        .select();
        
      if (error) throw error;
      
      const d = data[0];
      const mappedDefect = {
        id: d.id,
        vehicle: d.vehicle,
        part: d.part,
        status: d.status,
        description: d.description,
        photo: d.photo,
        mediaType: d.media_type,
        coordinates: d.coordinates,
        reportedAt: d.reported_at
      };
      
      set((state) => ({
        defects: [mappedDefect, ...state.defects]
      }));
      
      get().addToast('Ilmoitus tallennettu onnistuneesti reaaliaikaan!', 'success');
    } catch (error) {
      console.error('Virhe uuden vian lisäämisessä:', error);
      get().addToast('Tallennus pilveen epäonnistui.', 'error');
    }
  },

  updateDefectStatus: async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('defects')
        .update({ status: newStatus })
        .eq('id', id);
        
      if (error) throw error;
      
      set((state) => ({
        defects: state.defects.map(d => d.id === id ? { ...d, status: newStatus } : d)
      }));
    } catch (error) {
      console.error('Virhe päivityksessä:', error);
      get().addToast('Päivitys epäonnistui.', 'error');
    }
  },

  removeDefect: async (id) => {
    try {
      const { error } = await supabase
        .from('defects')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      set((state) => ({
        defects: state.defects.filter(d => d.id !== id)
      }));
    } catch (error) {
      console.error('Virhe poistossa:', error);
      get().addToast('Poisto epäonnistui.', 'error');
    }
  },

  updateDefect: async (id, updates) => {
    const apiUpdates = {};
    if (updates.status) apiUpdates.status = updates.status;
    if (updates.description !== undefined) apiUpdates.description = updates.description;
    
    try {
      const { error } = await supabase
        .from('defects')
        .update(apiUpdates)
        .eq('id', id);
        
      if (error) throw error;
      
      set((state) => ({
        defects: state.defects.map(d => d.id === id ? { ...d, ...updates } : d)
      }));
    } catch (error) {
      console.error('Virhe päivityksessä:', error);
      get().addToast('Päivitys epäonnistui.', 'error');
    }
  },

  // Maintenance Logs
  maintenanceLogs: [],
  isLoadingLogs: false,

  fetchMaintenanceLogs: async () => {
    set({ isLoadingLogs: true });
    try {
      const { data, error } = await supabase
        .from('maintenance_logs')
        .select(`
          id, vehicle, description, date,
          profiles:mechanic_id(full_name)
        `)
        .order('date', { ascending: false });
        
      if (error) throw error;
      set({ maintenanceLogs: data || [], isLoadingLogs: false });
    } catch (error) {
      console.error('Virhe huoltohistorian haussa:', error);
      set({ isLoadingLogs: false });
    }
  },

  addMaintenanceLog: async (logData) => {
    try {
      const { data, error } = await supabase
        .from('maintenance_logs')
        .insert([{
          vehicle: logData.vehicle,
          description: logData.description,
          mechanic_id: get().user?.id
        }])
        .select(`
          id, vehicle, description, date,
          profiles:mechanic_id(full_name)
        `);
        
      if (error) throw error;
      
      set((state) => ({
        maintenanceLogs: [data[0], ...state.maintenanceLogs]
      }));
      get().addToast('Huoltomerkintä tallennettu', 'success');
    } catch (error) {
      console.error('Virhe huoltomerkinnän lisäyksessä:', error);
      get().addToast('Huoltomerkinnän lisäys epäonnistui', 'error');
    }
  },

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
}));
