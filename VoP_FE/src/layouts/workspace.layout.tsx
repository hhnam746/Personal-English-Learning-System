import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate
} from 'react-router-dom'
import {
  CalendarDays,
  Search,
  Plus,
  Sun,
  Moon,
  Home,
  BookOpen,
  Zap,
  Layers,
  ChartNoAxesColumn
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useThemeStore } from '@/lib/zustand/theme.store'
import { useWordDialog } from '@/features/vocabularies/hooks/use-word-dialog'
const VocabularyDialog = lazy(() =>
  import('@/features/vocabularies/components/vocabulary-dialog').then(
    (module) => ({ default: module.VocabularyDialog })
  )
)
const nav = [
  { path: '/', label: 'Tổng quan', icon: Home },
  { path: '/library', label: 'Kho từ vựng', icon: BookOpen },
  { path: '/practice', label: 'Luyện tập', icon: Zap },
  { path: '/flashcards', label: 'Flashcard', icon: Layers },
  { path: '/progress', label: 'Tiến độ', icon: ChartNoAxesColumn }
]
export default function WorkspaceLayout() {
  const { dark, toggle } = useThemeStore()
  const dialog = useWordDialog()
  const location = useLocation()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const searchInput = useRef<HTMLInputElement>(null)
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])
  useEffect(() => {
    const focus = (e: KeyboardEvent) => {
      const el = e.target
      if (
        e.key === '/' &&
        !(
          el instanceof HTMLElement &&
          el.closest('input,textarea,[contenteditable=true]')
        )
      ) {
        e.preventDefault()
        searchInput.current?.focus()
      }
    }
    document.addEventListener('keydown', focus)
    return () => document.removeEventListener('keydown', focus)
  }, [])
  const links = (mobile = false) =>
    nav.map(({ path, label, icon: Icon }) => (
      <NavLink
        key={path}
        to={path}
        end={path === '/'}
        className={({ isActive }) =>
          `${mobile ? '' : 'nav-item'} ${isActive ? 'active' : ''}`
        }
      >
        <Icon className="icon" />
        <span>{label}</span>
      </NavLink>
    ))
  return (
    <>
      <a className="skip-link" href="#main">
        Chuyển đến nội dung
      </a>
      <div
        className="app-shell"
        data-view={
          location.pathname === '/' ? 'dashboard' : location.pathname.slice(1)
        }
      >
        <aside className="sidebar">
          <Link className="brand" to="/" aria-label="VOP — Tổng quan">
            vop<span>•</span>
          </Link>
          <nav aria-label="Điều hướng chính">{links()}</nav>
          <div className="sidebar-bottom">
            <button
              className="theme-toggle"
              aria-label="Chuyển giao diện sáng hoặc tối"
              aria-pressed={dark}
              onClick={toggle}
            >
              <Sun className="icon" />
              <Moon className="icon" />
            </button>
            <span className="muted">Không gian cá nhân</span>
          </div>
        </aside>
        <div className="workspace">
          <header className="topbar">
            <div className="breadcrumb">
              <CalendarDays className="icon" />
              <span>
                {new Intl.DateTimeFormat('vi-VN', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                }).format(new Date())}
              </span>
            </div>
            <div className="top-actions">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  navigate(`/library?search=${encodeURIComponent(search)}`)
                }}
              >
                <label className="top-search glass-control">
                  <Search className="icon" />
                  <input
                    ref={searchInput}
                    type="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Tìm từ vựng…"
                    aria-label="Tìm trong kho từ"
                  />
                  <kbd>/</kbd>
                </label>
              </form>
              <button
                className="mobile-theme icon-button"
                aria-label="Đổi giao diện"
                onClick={toggle}
              >
                {dark ? <Moon className="icon" /> : <Sun className="icon" />}
              </button>
              <Button className="btn btn-primary" onClick={dialog.openCreate}>
                <Plus />
                Thêm từ mới
              </Button>
            </div>
          </header>
          <main id="main" tabIndex={-1}>
            <Outlet />
          </main>
        </div>
        <nav className="mobile-nav" aria-label="Điều hướng di động">
          {links(true)}
        </nav>
      </div>
      {(dialog.create || dialog.detailId || dialog.editId) && (
        <Suspense fallback={null}>
          <VocabularyDialog />
        </Suspense>
      )}
    </>
  )
}
