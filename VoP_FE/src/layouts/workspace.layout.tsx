import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
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
import { motion } from 'motion/react'
import { flushSync } from 'react-dom'
import recallMark from '@/assets/recall-mark.png'
import { Button } from '@/components/ui/button'
import { useThemeStore } from '@/lib/zustand/theme.store'
import { useWordDialog } from '@/features/vocabularies/hooks/use-word-dialog'
import { LanguageSelector } from '@/components/language-selector'
import { UserProfileMenu } from '@/features/auth/components/user-profile-menu'
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
  const themeTransition = useRef<ViewTransition | null>(null)
  const changeTheme = (event: MouseEvent<HTMLButtonElement>) => {
    themeTransition.current?.skipTransition()
    if (
      !document.startViewTransition ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      toggle()
      return
    }

    const root = document.documentElement
    const button = event.currentTarget.getBoundingClientRect()
    const x = button.left + button.width / 2
    const y = button.top + button.height / 2
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    )
    root.style.setProperty('--theme-reveal-origin', `${x}px ${y}px`)
    root.style.setProperty('--theme-reveal-radius', `${radius}px`)
    root.dataset.themeReveal = ''
    const transition = document.startViewTransition(() => flushSync(toggle))
    themeTransition.current = transition
    const cleanup = () => {
      if (themeTransition.current !== transition) return
      themeTransition.current = null
      delete root.dataset.themeReveal
      root.style.removeProperty('--theme-reveal-origin')
      root.style.removeProperty('--theme-reveal-radius')
    }
    void transition.ready.catch(() => {})
    void transition.finished.then(cleanup, cleanup)
  }
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
        const input =
          document.getElementById('word-search') || searchInput.current
        input?.focus()
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
        aria-label={label}
        className={({ isActive }) =>
          `${mobile ? '' : 'nav-item'} ${isActive ? 'active' : ''}`
        }
      >
        {({ isActive }) => (
          <>
            {!mobile && isActive && (
              <motion.span
                aria-hidden="true"
                className="nav-selection"
                layoutId="sidebar-selection"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <Icon className="icon" aria-hidden="true" />
            <span className="nav-label">
              {mobile && path === '/library' ? 'Kho từ' : label}
            </span>
          </>
        )}
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
          <Link className="brand" to="/" aria-label="Recall — Tổng quan">
            <img src={recallMark} width={30} height={30} alt="" />
            <span>recall</span>
          </Link>
          <nav aria-label="Điều hướng chính">{links()}</nav>
          <div className="sidebar-bottom">
            <button
              className="theme-toggle"
              aria-label="Chuyển giao diện sáng hoặc tối"
              aria-pressed={dark}
              onClick={changeTheme}
            >
              <Sun className="icon" aria-hidden="true" />
              <Moon className="icon" aria-hidden="true" />
            </button>
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
                </label>
              </form>
              <LanguageSelector />
              <button
                className="mobile-theme icon-button"
                aria-label="Đổi giao diện"
                aria-pressed={dark}
                onClick={changeTheme}
              >
                {dark ? <Moon className="icon" /> : <Sun className="icon" />}
              </button>
              <Button className="btn btn-primary" onClick={dialog.openCreate}>
                <Plus />
                Thêm từ mới
              </Button>
              <UserProfileMenu />
            </div>
          </header>
          <main id="main" tabIndex={-1}>
            <div className="page-transition" key={location.pathname}>
              <Outlet />
            </div>
          </main>
        </div>
        <nav className="mobile-nav" aria-label="Điều hướng di động">
          {links(true)}
        </nav>
      </div>
      {(dialog.create || dialog.detailId || dialog.editId || dialog.deleteId) && (
        <Suspense fallback={null}>
          <VocabularyDialog />
        </Suspense>
      )}
    </>
  )
}
