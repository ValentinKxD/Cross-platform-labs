import { useEffect, useState } from 'react'
import Header from './components/header'
import Nav, { type Page } from './components/nav'
import Home from './components/home'
import Invoice from './components/invoice'
import Cabinet from './components/cabinet'
import LoginModal from './components/loginModal'
import { useAuth } from './auth/AuthContext'

const PAGES: Page[] = ['home', 'create', 'cabinet']

function pageFromHash(): Page {
  const page = window.location.hash.replace('#', '') as Page
  return PAGES.includes(page) ? page : 'home'
}

function App() {
  const { user, loading } = useAuth()
  const [page, setPage] = useState<Page>(pageFromHash)

  useEffect(() => {
    const onHashChange = () => setPage(pageFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  const navigate = (next: Page) => {
    window.location.hash = next === 'home' ? '' : next
    setPage(next)
    window.scrollTo(0, 0)
  }

  const needsLogin = page !== 'home' && !user && !loading
  const visiblePage = needsLogin ? 'home' : page

  return (
    <div className="flex min-h-screen flex-col font-sans text-ink">
      <Header />
      <Nav page={page} onNavigate={navigate} />

      <main className="flex grow flex-col items-center gap-5 bg-page px-5 py-10 max-sm:px-4 max-sm:py-6">
        {visiblePage === 'home' && <Home />}
        {visiblePage === 'create' && user && <Invoice onOpenCabinet={() => navigate('cabinet')} />}
        {visiblePage === 'cabinet' && user && <Cabinet onCreate={() => navigate('create')} onSignOut={() => navigate('home')} />}
      </main>

      <footer className="bg-footer px-5 py-7.5 text-center">
        <p className="my-4">&copy; 2026 PostProject. Кросплатформна розробка</p>
      </footer>

      {needsLogin && <LoginModal onClose={() => navigate('home')} />}
    </div>
  )
}

export default App
