import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AppProvider, useApp } from './context/AppContext'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import HomePage from './pages/HomePage'
import LibraryPage from './pages/LibraryPage'
import SettingsPage from './pages/SettingsPage'
import Detail from './pages/Detail'
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
      <div className="main-content">
        <Header />
        <main className="content-container">
          <Routes>
            <Route path="/" element={renderContent()} />
            <Route path="/detail/:type/:id" element={<Detail />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  )
}

export default App
