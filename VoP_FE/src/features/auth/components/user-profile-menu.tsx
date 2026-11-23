import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, LogIn, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '../auth.store'

export function UserProfileMenu() {
  const { user, signOut } = useAuthStore()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!user) {
    return (
      <Link to="/login">
        <Button
          variant="outline"
          size="sm"
          className="h-9 gap-2 rounded-xl border-border/80 text-xs font-medium cursor-pointer"
        >
          <LogIn className="w-3.5 h-3.5" />
          Đăng nhập
        </Button>
      </Link>
    )
  }

  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'Learner'
  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-accent/60 transition-colors border border-border/40 cursor-pointer"
        aria-label="User profile"
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName}
            className="w-7 h-7 rounded-lg object-cover border border-[#FD5F01]/40"
          />
        ) : (
          <div className="w-7 h-7 rounded-lg bg-[#FD5F01]/10 text-[#FD5F01] flex items-center justify-center font-bold text-xs">
            {displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-xs font-medium max-w-[100px] truncate hidden sm:inline">
          {displayName}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-2 border-b border-border/50 mb-1">
            <p className="text-xs font-semibold truncate">{displayName}</p>
            <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
          </div>

          <div className="space-y-0.5">
            <div className="px-3 py-1.5 text-[11px] text-muted-foreground flex items-center justify-between">
              <span>Học tập</span>
              <span className="text-[#FD5F01] font-semibold">Mochi SRS</span>
            </div>

            <button
              onClick={() => {
                setOpen(false)
                void signOut()
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-destructive hover:bg-destructive/10 rounded-xl transition-colors cursor-pointer text-left"
            >
              <LogOut className="w-3.5 h-3.5" />
              Đăng xuất
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
