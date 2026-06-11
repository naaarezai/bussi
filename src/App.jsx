import React, { useEffect } from 'react'
import Layout from './components/Layout'
import { useStore } from './store'

function App() {
  const fetchDefects = useStore((state) => state.fetchDefects)
  const subscribeToDefects = useStore((state) => state.subscribeToDefects)

  useEffect(() => {
    fetchDefects()
    subscribeToDefects()
  }, [fetchDefects, subscribeToDefects])

  return (
    <div className="app">
      <Layout />
    </div>
  )
}

export default App

// tässä on kommentti.