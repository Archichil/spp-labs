import { } from 'react'
import './App.css'
import Nav from './components/Nav'
import Home from './pages/Home'
import Projects from './pages/Projects'
import Profile from './pages/Profile'
import ProjectBoard from './pages/ProjectBoard'
import { Routes, Route } from 'react-router-dom'

function App() {
  return (
    <div className="p-4">
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/projects/:id" element={<ProjectBoard />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  )
}

export default App