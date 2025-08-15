import React from 'react'
import { AppProvider, useApp } from './context/AppContext'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import LibraryPage from './pages/LibraryPage'
import SettingsPage from './pages/SettingsPage'
import './App.css'

function AppContent() {
  const { activeTab } = useApp()

  const renderContent = () => {
    switch(activeTab) {
      case 'home':
        return <HomePage />
      case 'library':
        return <LibraryPage />
      case 'settings':
        return <SettingsPage />
      default:
        return <HomePage />
    }
  }

  return (
    <div className="app">
      <Sidebar />
      <div className="main-container">
        <Header />
        <main className="content">
          {renderContent()}
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}

export default App
