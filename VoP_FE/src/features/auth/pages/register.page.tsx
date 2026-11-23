import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, UserPlus, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react'
import recallMark from '@/assets/recall-mark.png'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAuthStore } from '../auth.store'

function formatAuthError(msg: string): string {
  const lower = msg.toLowerCase()
  if (lower.includes('invalid login credentials')) {
    return 'Email hoặc mật khẩu không chính xác. Nếu chưa có tài khoản, hãy chuyển sang tab "Tạo tài khoản" bên trên!'
  }
  if (lower.includes('user already registered') || lower.includes('already exists')) {
    return 'Email này đã được đăng ký. Bạn hãy chuyển sang tab "Đăng nhập" để vào học nhé!'
  }
  if (lower.includes('password should be at least') || lower.includes('password is too short')) {
    return 'Mật khẩu cần tối thiểu 6 ký tự.'
  }
  if (lower.includes('provider is not enabled') || lower.includes('unsupported provider')) {
    return 'Đăng nhập Google chưa được cấu hình Client ID trên Supabase Dashboard. Bạn hãy dùng Email & Mật khẩu bên dưới để đăng nhập hoặc tạo tài khoản mới ngay nhé!'
  }
  if (lower.includes('email not confirmed')) {
    return 'Email chưa được xác nhận. Vui lòng kiểm tra hòm thư hoặc đăng ký với email khác.'
  }
  return msg
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('register')

  const { signInWithEmail, signUpWithEmail, signInWithGoogle, loading, error: storeError } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const handleGoogleAuth = async () => {
    setLocalError(null)
    setSuccessMessage(null)
    const { error } = await signInWithGoogle()
    if (error) {
      setLocalError(formatAuthError(error.message))
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLocalError(null)
    setSuccessMessage(null)

    if (!email.trim() || !password) {
      setLocalError('Vui lòng nhập đầy đủ email và mật khẩu.')
      return
    }

    if (mode === 'register') {
      if (password !== confirmPassword) {
        setLocalError('Mật khẩu xác nhận không khớp.')
        return
      }
      if (password.length < 6) {
        setLocalError('Mật khẩu cần tối thiểu 6 ký tự.')
        return
      }

      setSubmitting(true)
      const { error } = await signUpWithEmail(email.trim(), password)
      setSubmitting(false)

      if (!error) {
        setSuccessMessage('Tạo tài khoản thành công! Đang chuyển hướng vào học...')
        setTimeout(() => navigate('/'), 1000)
      } else {
        setLocalError(formatAuthError(error.message))
      }
    } else {
      setSubmitting(true)
      const { error } = await signInWithEmail(email.trim(), password)
      setSubmitting(false)

      if (!error) {
        navigate('/')
      } else {
        setLocalError(formatAuthError(error.message))
      }
    }
  }

  const displayedError = localError || (storeError ? formatAuthError(storeError) : null)

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      {/* Background ambient blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#FD5F01]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-card/85 backdrop-blur-2xl border border-border/70 rounded-3xl p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand header */}
        <div className="flex flex-col items-center text-center mb-6">
          <img src={recallMark} alt="VOP Recall" className="w-14 h-14 mb-2 drop-shadow" />
          <h1 className="text-2xl font-bold tracking-tight">
            VOP <span className="text-[#FD5F01]">Recall</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Học từ vựng đa ngôn ngữ theo thời điểm vàng MochiMochi & Spaced Repetition
          </p>
        </div>

        {/* Mode Selector Tab Bar */}
        <div className="flex p-1 rounded-2xl bg-muted/70 border border-border/60 mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('login')
              setLocalError(null)
              setSuccessMessage(null)
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register')
              setLocalError(null)
              setSuccessMessage(null)
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-[#FD5F01] text-white shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Tạo tài khoản mới
          </button>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {displayedError && (
          <div className="mb-5 p-3 rounded-2xl bg-destructive/10 border border-destructive/25 text-destructive text-xs font-medium flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{displayedError}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        <Button
          type="button"
          variant="outline"
          className="w-full h-11 rounded-2xl flex items-center justify-center gap-2.5 font-medium border-border/80 hover:bg-accent/60 transition-all cursor-pointer mb-2 text-xs"
          onClick={handleGoogleAuth}
          disabled={loading || submitting}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          {mode === 'login' ? 'Đăng nhập với Google' : 'Đăng ký với Google'}
        </Button>
        <p className="text-[11px] text-muted-foreground text-center mb-5">
          (Khuyên dùng: Đăng ký & đăng nhập nhanh bằng Email bên dưới)
        </p>

        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border/60" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase tracking-wider font-semibold">
            <span className="bg-card px-3 text-muted-foreground">
              hoặc sử dụng email
            </span>
          </div>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Địa chỉ Email
            </label>
            <Input
              type="email"
              placeholder="ten@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 rounded-xl bg-background/50 border-border/80 text-sm"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">
              Mật khẩu {mode === 'register' && '(tối thiểu 6 ký tự)'}
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-10 rounded-xl bg-background/50 border-border/80 text-sm"
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            />
          </div>

          {mode === 'register' && (
            <div className="animate-in fade-in duration-150">
              <label className="block text-xs font-semibold text-muted-foreground mb-1">
                Xác nhận lại mật khẩu
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-10 rounded-xl bg-background/50 border-border/80 text-sm"
                required
                autoComplete="new-password"
              />
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-11 rounded-2xl bg-[#FD5F01] hover:bg-[#e05401] text-white font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer mt-3 text-sm"
            disabled={submitting || loading}
          >
            {submitting ? (
              <Sparkles className="w-4 h-4 animate-spin" />
            ) : mode === 'login' ? (
              <>
                <LogIn className="w-4 h-4" />
                Đăng nhập
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Tạo tài khoản & Vào học ngay
              </>
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}
