import React, { useEffect } from 'react'
import Layout from './components/Layout'
import LoginView from './views/LoginView'
import { useStore } from './store'
import { Loader2 } from 'lucide-react'

function App() {
  const fetchDefects = useStore((state) => state.fetchDefects)
  const subscribeToDefects = useStore((state) => state.subscribeToDefects)
  const fetchMaintenanceLogs = useStore((state) => state.fetchMaintenanceLogs)
  const fetchVehicles = useStore((state) => state.fetchVehicles)
  const initializeAuth = useStore((state) => state.initializeAuth)
  const user = useStore((state) => state.user)
  const isInitializingAuth = useStore((state) => state.isInitializingAuth)

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  useEffect(() => {
    if (user) {
      fetchVehicles()
      fetchDefects()
      fetchMaintenanceLogs()
      subscribeToDefects()
    }
  }, [user, fetchVehicles, fetchDefects, fetchMaintenanceLogs, subscribeToDefects])

  if (isInitializingAuth) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: '#f8fafc' }}>
        <Loader2 size={32} className="spin" style={{ color: '#38bdf8' }} />
      </div>
    )
  }

  if (!user) {
    return <LoginView />
  }

  return (
    <div className="app">
      <Layout />
    </div>
  )
}

export default App