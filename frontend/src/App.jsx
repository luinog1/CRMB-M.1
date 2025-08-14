import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

// Import components
import Navigation from './components/Navigation'

// Import pages
import Home from './pages/Home'
import Search from './pages/Search'
import Detail from './pages/Detail'
import Library from './pages/Library'

function App() {
  return (
    <Router>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/detail/:id" element={<Detail />} />
            <Route path="/library" element={<Library />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
