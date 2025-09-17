import { useState } from 'react'
import './App.css'
import Nav from './components/Nav'
import Home from './pages/Home'
import Projects from './pages/Projects'
import Profile from './pages/Profile'

type PageKey = 'home' | 'projects' | 'profile'

function App() {
  const [page, setPage] = useState<PageKey>('home')

  return (
    <div className="p-4">
      <h1 className="mb-4 text-3xl font-semibold">Lab 1</h1>
      <Nav current={page} onChange={setPage} />
      {page === 'home' && <Home />}
      {page === 'projects' && <Projects />}
      {page === 'profile' && <Profile />}
    </div>
  )
}

export default App