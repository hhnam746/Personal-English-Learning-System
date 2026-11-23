import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Globe } from 'lucide-react'
import {
  useLanguageStore,
  SUPPORTED_LANGUAGES,
  type TargetLanguage
} from '@/lib/zustand/language.store'

export function LanguageSelector() {
  const { currentLanguage, setLanguage } = useLanguageStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const active = SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0]

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-border/50 bg-background/50 hover:bg-accent/60 transition-colors text-xs font-medium cursor-pointer"
        aria-label="Chọn ngôn ngữ học"
      >
        <span className="text-base">{active.flag}</span>
        <span className="hidden md:inline">{active.label}</span>
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-52 rounded-2xl bg-card/95 backdrop-blur-xl border border-border/80 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2.5 py-1.5 text-[10px] uppercase tracking-wider font-semibold text-muted-foreground flex items-center gap-1.5 border-b border-border/40 mb-1">
            <Globe className="w-3 h-3 text-[#FD5F01]" />
            Ngôn ngữ học tập
          </div>

          <div className="space-y-0.5">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = lang.code === currentLanguage
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    setLanguage(lang.code as TargetLanguage)
                    setOpen(false)
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                    isSelected
                      ? 'bg-[#FD5F01]/10 text-[#FD5F01] font-semibold'
                      : 'hover:bg-accent/60 text-foreground'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{lang.flag}</span>
                    <div>
                      <p>{lang.label}</p>
                      <p className="text-[10px] text-muted-foreground font-normal">{lang.sublabel}</p>
                    </div>
                  </div>
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#FD5F01]" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
