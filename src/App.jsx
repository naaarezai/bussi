import React, { useEffect } from 'react'
import Layout from './components/Layout'
import { useStore } from './store'

function App() {
  const fetchDefects = useStore((state) => state.fetchDefects)

  useEffect(() => {
    fetchDefects()
  }, [fetchDefects])

  return (
    <div className="app">
      <Layout />
    </div>
  )
}

export default App
