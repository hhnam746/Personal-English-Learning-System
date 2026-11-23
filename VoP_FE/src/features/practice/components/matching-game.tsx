import { useState, useEffect, useMemo, useRef } from 'react'
import { Sparkles, Trophy, RotateCcw, Volume2, Timer, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { playTTS } from '@/shared/audio-tts'
import { useLanguageStore, SUPPORTED_LANGUAGES } from '@/lib/zustand/language.store'
import type { Vocabulary } from '@/features/vocabularies/types'

interface MatchingGameProps {
  vocabularies: Vocabulary[]
  onBack?: () => void
}

interface MatchCard {
  id: string // original vocabulary id
  instanceId: string
  text: string
  subtext?: string
  type: 'term' | 'meaning'
  language?: string
}

export function MatchingGame({ vocabularies, onBack }: MatchingGameProps) {
  const { currentLanguage } = useLanguageStore()
  const activeLang = SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0]

  // Filter words that belong to current language and have at least 1 meaning
  const eligibleWords = useMemo(() => {
    return vocabularies.filter(
      (v) => (!v.language || v.language === currentLanguage) && v.meanings && v.meanings.length > 0
    )
  }, [vocabularies, currentLanguage])

  const [roundWords, setRoundWords] = useState<Vocabulary[]>([])
  const [termCards, setTermCards] = useState<MatchCard[]>([])
  const [meaningCards, setMeaningCards] = useState<MatchCard[]>([])
  const [selectedTerm, setSelectedTerm] = useState<MatchCard | null>(null)
  const [selectedMeaning, setSelectedMeaning] = useState<MatchCard | null>(null)
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set())
  const [wrongPair, setWrongPair] = useState<{ termId: string; meaningId: string } | null>(null)
  const [timer, setTimer] = useState(0)
  const [isGameOver, setIsGameOver] = useState(false)
  const [moves, setMoves] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Start or reset a game round
  const startNewRound = () => {
    if (eligibleWords.length < 2) return

    // Pick up to 5 random words
    const shuffled = [...eligibleWords].sort(() => 0.5 - Math.random())
    const selected = shuffled.slice(0, Math.min(5, shuffled.length))

    setRoundWords(selected)
    setMatchedIds(new Set())
    setSelectedTerm(null)
    setSelectedMeaning(null)
    setWrongPair(null)
    setMoves(0)
    setTimer(0)
    setIsGameOver(false)

    // Create term cards and meaning cards
    const terms: MatchCard[] = selected.map((w) => ({
      id: w.id,
      instanceId: `term-${w.id}`,
      text: w.term,
      subtext: w.phoneticReading || w.ipa || undefined,
      type: 'term',
      language: w.language || currentLanguage
    }))

    const meanings: MatchCard[] = selected.map((w) => ({
      id: w.id,
      instanceId: `meaning-${w.id}`,
      text: w.meanings[0].meaningVi,
      type: 'meaning'
    }))

    // Shuffle both independently
    setTermCards(terms.sort(() => 0.5 - Math.random()))
    setMeaningCards(meanings.sort(() => 0.5 - Math.random()))
  }

  // Initialize round on mount or when language changes
  useEffect(() => {
    startNewRound()
  }, [eligibleWords.length, currentLanguage])

  // Timer loop
  useEffect(() => {
    if (isGameOver || eligibleWords.length < 2) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    timerRef.current = setInterval(() => {
      setTimer((prev) => prev + 1)
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isGameOver, eligibleWords.length])

  // Handle clicking term card
  const handleTermClick = (card: MatchCard) => {
    if (matchedIds.has(card.id) || wrongPair) return
    setSelectedTerm(card)

    // Pronounce the word
    void playTTS(card.text, card.language)

    // If meaning was already selected, evaluate match
    if (selectedMeaning) {
      evaluateMatch(card, selectedMeaning)
    }
  }

  // Handle clicking meaning card
  const handleMeaningClick = (card: MatchCard) => {
    if (matchedIds.has(card.id) || wrongPair) return
    setSelectedMeaning(card)

    // If term was already selected, evaluate match
    if (selectedTerm) {
      evaluateMatch(selectedTerm, card)
    }
  }

  // Evaluate pair
  const evaluateMatch = (term: MatchCard, meaning: MatchCard) => {
    setMoves((prev) => prev + 1)

    if (term.id === meaning.id) {
      // Correct match!
      const newMatched = new Set(matchedIds)
      newMatched.add(term.id)
      setMatchedIds(newMatched)
      setSelectedTerm(null)
      setSelectedMeaning(null)

      // Check if all matched
      if (newMatched.size === roundWords.length && roundWords.length > 0) {
        setIsGameOver(true)
      }
    } else {
      // Wrong match!
      setWrongPair({ termId: term.instanceId, meaningId: meaning.instanceId })
      setTimeout(() => {
        setWrongPair(null)
        setSelectedTerm(null)
        setSelectedMeaning(null)
      }, 700)
    }
  }

  if (eligibleWords.length < 2) {
    return (
      <div className="rounded-2xl p-8 bg-card/80 backdrop-blur-xl border border-border/60 text-center max-w-md mx-auto shadow-xl">
        <Sparkles className="w-12 h-12 text-[#FD5F01] mx-auto mb-3 animate-spin" />
        <h3 className="text-lg font-bold text-foreground mb-1">Cần tối thiểu 2 từ vựng</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Kho từ vựng {activeLang.label} cần ít nhất 2 từ để bắt đầu trò chơi ghép thẻ phản xạ.
        </p>
        {onBack && (
          <Button onClick={onBack} variant="outline" className="rounded-xl">
            Quay lại
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-card/80 backdrop-blur-xl border border-border/60 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#FD5F01]/10 text-[#FD5F01] flex items-center justify-center font-bold">
            ⚡
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Ghép thẻ phản xạ — {activeLang.label}</h2>
            <p className="text-[11px] text-muted-foreground">Chọn 1 từ và 1 nghĩa tương ứng để tạo cặp</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground bg-muted/50 px-3 py-1.5 rounded-xl border border-border/40">
            <Timer className="w-4 h-4 text-[#FD5F01]" />
            <span>{timer}s</span>
          </div>

          <div className="text-xs text-muted-foreground hidden sm:block">
            Tiến độ: <strong className="text-foreground">{matchedIds.size}</strong>/{roundWords.length}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={startNewRound}
            className="h-8 gap-1 rounded-xl text-xs cursor-pointer"
            title="Đổi lượt khác"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Đổi cặp
          </Button>
        </div>
      </div>

      {/* Victory Celebration Screen */}
      {isGameOver ? (
        <div className="p-8 rounded-3xl bg-card/90 backdrop-blur-2xl border border-[#FD5F01]/40 shadow-2xl text-center space-y-4 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FD5F01] to-amber-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20">
            <Trophy className="w-8 h-8" />
          </div>

          <h3 className="text-2xl font-black text-foreground">
            Tuyệt vời! Hoàn thành xuất sắc!
          </h3>

          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Bạn đã ghép đúng tất cả các cặp từ trong vòng <strong className="text-foreground">{timer} giây</strong> với <strong className="text-foreground">{moves} lượt chọn</strong>.
          </p>

          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              onClick={startNewRound}
              className="h-11 px-6 rounded-xl bg-[#FD5F01] hover:bg-[#e05401] text-white font-semibold shadow-md cursor-pointer gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Chơi lượt tiếp theo
            </Button>
            {onBack && (
              <Button onClick={onBack} variant="outline" className="h-11 rounded-xl cursor-pointer">
                Quay lại
              </Button>
            )}
          </div>
        </div>
      ) : (
        /* Matching Cards Grid (2 Columns: Terms vs Meanings) */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Left Column: Terms */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-bold text-muted-foreground px-1">
              Từ vựng ({activeLang.label})
            </h4>
            {termCards.map((card) => {
              const isMatched = matchedIds.has(card.id)
              const isSelected = selectedTerm?.instanceId === card.instanceId
              const isWrong = wrongPair?.termId === card.instanceId

              return (
                <button
                  key={card.instanceId}
                  type="button"
                  disabled={isMatched}
                  onClick={() => handleTermClick(card)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex items-center justify-between ${
                    isMatched
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 opacity-60 cursor-not-allowed'
                      : isWrong
                        ? 'bg-destructive/15 border-destructive text-destructive animate-shake'
                        : isSelected
                          ? 'bg-[#FD5F01]/15 border-[#FD5F01] text-[#FD5F01] shadow-md scale-[1.02]'
                          : 'bg-card/75 hover:bg-accent/60 border-border/60 text-foreground hover:scale-[1.01]'
                  }`}
                >
                  <div>
                    <span className="text-base font-bold block">{card.text}</span>
                    {card.subtext && (
                      <span className="text-xs text-muted-foreground block">{card.subtext}</span>
                    )}
                  </div>
                  {isMatched ? (
                    <Check className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-muted-foreground opacity-60" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Right Column: Meanings */}
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider font-bold text-muted-foreground px-1">
              Nghĩa tiếng Việt
            </h4>
            {meaningCards.map((card) => {
              const isMatched = matchedIds.has(card.id)
              const isSelected = selectedMeaning?.instanceId === card.instanceId
              const isWrong = wrongPair?.meaningId === card.instanceId

              return (
                <button
                  key={card.instanceId}
                  type="button"
                  disabled={isMatched}
                  onClick={() => handleMeaningClick(card)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex items-center justify-between ${
                    isMatched
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 opacity-60 cursor-not-allowed'
                      : isWrong
                        ? 'bg-destructive/15 border-destructive text-destructive animate-shake'
                        : isSelected
                          ? 'bg-[#FD5F01]/15 border-[#FD5F01] text-[#FD5F01] shadow-md scale-[1.02]'
                          : 'bg-card/75 hover:bg-accent/60 border-border/60 text-foreground hover:scale-[1.01]'
                  }`}
                >
                  <span className="text-sm font-semibold">{card.text}</span>
                  {isMatched && <Check className="w-5 h-5 text-emerald-500" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
