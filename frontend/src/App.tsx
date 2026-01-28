import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import { CullingPage } from './pages/CullingPage'
import { TierListPage } from './pages/TierListPage'

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <nav className="flex items-center gap-4 border-b border-white/10 pb-4">
            <NavLink
              to="/"
              end
              className={({ isActive }: { isActive: boolean }) =>
                `rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-500 text-gray-900'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              Culling
            </NavLink>
            <NavLink
              to="/tier-list"
              className={({ isActive }: { isActive: boolean }) =>
                `rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-amber-500 text-gray-900'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              Tier list
            </NavLink>
          </nav>

          <Routes>
            <Route path="/" element={<CullingPage />} />
            <Route path="/tier-list" element={<TierListPage />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

export default App
