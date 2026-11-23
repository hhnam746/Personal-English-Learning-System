import { useEffect, useRef, useState, useMemo } from 'react'
import {
  BookOpen,
  Check,
  Headphones,
  PenLine,
  X,
  Zap,
  RotateCcw,
  Delete,
  Shuffle,
  Volume2,
  Image as ImageIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SpeakButton } from '@/components/speak-button'
import { playTTS } from '@/shared/audio-tts'
import { useLanguageStore } from '@/lib/zustand/language.store'
import type { Question, Answer } from '../types'

const exerciseLabels = {
  meaning_mcq: 'CHỌN NGHĨA',
  fill_blank: 'ĐIỀN TỪ',
  listen_choose: 'NGHE VÀ CHỌN',
  listen_type: 'NGHE VÀ GÕ'
}

const titles = {
  meaning_mcq: 'Chọn nghĩa đúng',
  fill_blank: 'Điền từ vào câu',
  listen_choose: 'Nghe và chọn từ',
  listen_type: 'Nghe và gõ lại từ'
}

interface LetterTile {
  id: string
  char: string
}

const LANGUAGE_DISTRACTORS: Record<string, string[]> = {
  en: ['e', 'a', 'r', 's', 't', 'o', 'n', 'i'],
  ja: ['あ', 'い', 'う', 'え', 'お', 'か', 'き', 'く', 'け', 'こ', 'ん', 'た', 'て'],
  es: ['a', 'e', 'o', 'r', 's', 'n', 'á', 'é', 'í', 'ú'],
  it: ['a', 'e', 'i', 'o', 'r', 't', 's', 'à', 'è']
}

export function QuestionForm({
  question,
  pending,
  onAnswer,
  feedback,
  onNext,
  onSkipAudio,
  advancing,
  ipa,
  imageUrl,
  targetWord
}: {
  question: Question
  pending: boolean
  onAnswer: (answer: string) => void
  feedback?: Answer
  onNext: () => void
  onSkipAudio: () => void
  advancing: boolean
  ipa?: string | null
  imageUrl?: string | null
  targetWord?: string
}) {
  const { currentLanguage } = useLanguageStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const [answer, setAnswer] = useState('')
  const [audioError, setAudioError] = useState(false)
  const form = useRef<HTMLFormElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const submit = useRef<HTMLButtonElement>(null)

  // Speed Challenge (15s blitz timer)
  const [speedChallenge, setSpeedChallenge] = useState(false)
  const [timeLeft, setTimeLeft] = useState(15)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Mode for typing questions: 'keyboard' or 'tiles' (Duolingo-style word scramble)
  const [inputMode, setInputMode] = useState<'keyboard' | 'tiles'>('keyboard')
  const [selectedTileIds, setSelectedTileIds] = useState<string[]>([])

  const SPECIAL_CHARS: Record<string, string[]> = {
    es: ['á', 'é', 'í', 'ó', 'ú', 'ñ', 'ü', '¿', '¡'],
    it: ['à', 'è', 'é', 'ì', 'ò', 'ù']
  }
  const specialChars = SPECIAL_CHARS[currentLanguage] || []

  // Generate scrambled letter tiles for "Ghép chữ" mode
  const cleanTarget = useMemo(() => {
    return targetWord ? targetWord.trim() : ''
  }, [targetWord])

  const initialTiles = useMemo<LetterTile[]>(() => {
    if (!cleanTarget) return []
    // Split target characters
    const chars = Array.from(cleanTarget)
    const distractors = LANGUAGE_DISTRACTORS[currentLanguage] || LANGUAGE_DISTRACTORS.en
    // Add 2-3 distractor letters
    const distractorChars: string[] = []
    for (let i = 0; i < Math.min(3, 8 - chars.length); i++) {
      const randomChar = distractors[Math.floor(Math.random() * distractors.length)]
      if (randomChar) distractorChars.push(randomChar)
    }

    const all = [...chars, ...distractorChars].map((char, index) => ({
      id: `${char}-${index}-${Math.random().toString(36).substring(2, 6)}`,
      char
    }))

    // Shuffle
    return all.sort(() => 0.5 - Math.random())
  }, [cleanTarget, currentLanguage])

  const [availableTiles, setAvailableTiles] = useState<LetterTile[]>(initialTiles)

  // Keep tiles synchronized when question changes
  useEffect(() => {
    setAvailableTiles(initialTiles)
    setSelectedTileIds([])
  }, [initialTiles])

  // Speed challenge timer countdown
  useEffect(() => {
    if (!speedChallenge || feedback) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }

    setTimeLeft(15)
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [speedChallenge, feedback, question.id])

  // Handle timeout auto-submission
  useEffect(() => {
    if (speedChallenge && timeLeft === 0 && !feedback && !pending) {
      onAnswer(answer.trim() || 'TIMEOUT')
    }
  }, [speedChallenge, timeLeft, feedback, pending, answer, onAnswer])

  useEffect(() => {
    heading.current?.focus()
  }, [])

  useEffect(() => {
    if (!feedback) return
    const active = document.activeElement
    if (active === document.body || form.current?.contains(active)) {
      submit.current?.focus()
    }
  }, [feedback])

  // Tile click handling for "Ghép chữ" mode
  const handleTileClick = (tile: LetterTile) => {
    if (feedback || pending) return
    setSelectedTileIds((prev) => {
      const next = [...prev, tile.id]
      const newAnswer = next
        .map((id) => availableTiles.find((t) => t.id === id)?.char)
        .filter(Boolean)
        .join('')
      setAnswer(newAnswer)
      return next
    })
  }

  const handlePlacedTileClick = (index: number) => {
    if (feedback || pending) return
    setSelectedTileIds((prev) => {
      const next = prev.filter((_, i) => i !== index)
      const newAnswer = next
        .map((id) => availableTiles.find((t) => t.id === id)?.char)
        .filter(Boolean)
        .join('')
      setAnswer(newAnswer)
      return next
    })
  }

  const handleBackspace = () => {
    if (selectedTileIds.length === 0) return
    handlePlacedTileClick(selectedTileIds.length - 1)
  }

  const handleClearTiles = () => {
    setSelectedTileIds([])
    setAnswer('')
  }

  const handleShuffleTiles = () => {
    setAvailableTiles((prev) => [...prev].sort(() => 0.5 - Math.random()))
  }

  const listening = question.type.startsWith('listen')
  const Icon = listening
    ? Headphones
    : question.type === 'fill_blank'
      ? PenLine
      : BookOpen

  const displayImage = question.imageUrl || imageUrl

  return (
    <form
      ref={form}
      onSubmit={(e) => {
        e.preventDefault()
        if (feedback) {
          if (!advancing) onNext()
          return
        }
        if (answer.trim() && !pending) onAnswer(answer)
      }}
      className="question-form question-content glass-panel motion-question relative"
    >
      {/* Top Exercise Bar */}
      <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
        <div className="exercise-label !mb-0">
          <Icon className="icon" aria-hidden="true" />
          {question.role === 'reinforcement'
            ? 'LƯỢT CỦNG CỐ'
            : exerciseLabels[question.type]}
        </div>

        {/* Speed Challenge Toggle */}
        <button
          type="button"
          onClick={() => setSpeedChallenge((prev) => !prev)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
            speedChallenge
              ? 'bg-amber-500/15 border-amber-500 text-amber-600 dark:text-amber-400 shadow-sm'
              : 'bg-card/60 hover:bg-muted/80 border-border/50 text-muted-foreground'
          }`}
          title="Bật/tắt chế độ phản xạ nhanh 15 giây"
        >
          <Zap className={`w-3.5 h-3.5 ${speedChallenge ? 'text-amber-500 fill-amber-500' : ''}`} />
          {speedChallenge ? `⚡ ${timeLeft}s` : 'Phản xạ (15s)'}
        </button>
      </div>

      {/* Speed Timer Countdown Bar */}
      {speedChallenge && !feedback && (
        <div className="w-full h-1.5 bg-muted/60 rounded-full overflow-hidden mb-3">
          <div
            className={`h-full transition-all duration-1000 ease-linear rounded-full ${
              timeLeft <= 5 ? 'bg-destructive animate-pulse' : 'bg-amber-500'
            }`}
            style={{ width: `${(timeLeft / 15) * 100}%` }}
          />
        </div>
      )}

      <h2 ref={heading} tabIndex={-1}>
        {titles[question.type]}
      </h2>

      {/* Picture Association Card ("Hình đoán nghĩa") */}
      {displayImage && (
        <div className="picture-quiz-card flex flex-col items-center justify-center my-3 p-3 rounded-2xl bg-card/60 backdrop-blur-md border border-border/60 shadow-sm animate-in fade-in zoom-in-95">
          <img
            src={displayImage}
            alt="Minh họa câu hỏi"
            className="max-h-48 sm:max-h-56 w-auto max-w-full rounded-xl object-contain shadow-md transition-transform hover:scale-105 duration-200"
            loading="lazy"
          />
          <span className="text-[11px] text-muted-foreground mt-2 font-medium flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-[#FD5F01]" />
            Nhìn hình đoán đáp án
          </span>
        </div>
      )}

      {!listening && (
        <div
          className={
            question.type === 'fill_blank' ? 'sentence' : 'question-word'
          }
        >
          <span className="whitespace-pre-line">{question.prompt}</span>
          {question.type === 'meaning_mcq' && (
            <SpeakButton term={question.prompt} language={currentLanguage} />
          )}
        </div>
      )}
      {question.type === 'meaning_mcq' && ipa && (
        <p className="question-ipa">{ipa}</p>
      )}

      {/* Listening Question Controls */}
      {listening && (
        <div className="practice-audio space-y-3">
          {question.audioUrl && (
            <audio
              aria-label="Âm thanh câu hỏi"
              controls
              src={question.audioUrl}
              preload="none"
              onError={() => setAudioError(true)}
            />
          )}

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void playTTS(cleanTarget || question.prompt, currentLanguage, 1.0)}
              className="gap-1.5 rounded-xl text-xs h-9 cursor-pointer"
            >
              <Volume2 className="w-4 h-4 text-[#FD5F01]" />
              Nghe lại (1x)
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void playTTS(cleanTarget || question.prompt, currentLanguage, 0.7)}
              className="gap-1.5 rounded-xl text-xs h-9 cursor-pointer"
              title="Phát âm chậm tốc độ 0.75x để nghe rõ từng âm tiết"
            >
              <span>🐢</span>
              Nghe chậm (0.75x)
            </Button>

            {!feedback && (
              <Button
                type="button"
                className="btn btn-secondary h-9 text-xs rounded-xl"
                disabled={pending}
                onClick={onSkipAudio}
              >
                Bỏ qua câu nghe
              </Button>
            )}
          </div>

          {(audioError || !question.audioUrl) && (
            <p role="alert" className="text-xs text-muted-foreground text-center">
              (Hệ thống tự động sử dụng phát âm chuẩn Web Speech API {currentLanguage.toUpperCase()})
            </p>
          )}
        </div>
      )}

      {/* Answer Options (Multiple Choice or Typing / Tile Mode) */}
      {question.options.length ? (
        <fieldset className="answer-options" disabled={pending || !!feedback}>
          <legend className="sr-only">Chọn câu trả lời</legend>
          {question.options.map((option, i) => (
            <label
              key={option}
              className={`answer-option glass-control ${answer === option ? 'selected' : ''} ${
                feedback && option === feedback.correctAnswer ? 'correct-answer' : ''
              } ${feedback && !feedback.isCorrect && answer === option ? 'wrong-answer' : ''}`}
            >
              <span className="option-key" aria-hidden="true">
                {i + 1}
              </span>
              <span>{option}</span>
              {feedback && option === feedback.correctAnswer && (
                <Check className="icon" aria-label="Đáp án đúng" />
              )}
              <input
                type="radio"
                name="answer"
                value={option}
                checked={answer === option}
                onChange={() => setAnswer(option)}
                aria-label={option}
              />
            </label>
          ))}
        </fieldset>
      ) : (
        <div className="typing-container space-y-3">
          {/* Toggle between Keyboard and Tile mode when target word is available */}
          {cleanTarget.length > 0 && cleanTarget.length <= 25 && !feedback && (
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold text-muted-foreground">
                Phương thức nhập:
              </span>
              <div className="flex p-0.5 rounded-xl bg-muted/60 border border-border/40 text-xs">
                <button
                  type="button"
                  onClick={() => setInputMode('keyboard')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    inputMode === 'keyboard'
                      ? 'bg-card text-foreground shadow-sm font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  ⌨️ Bàn phím
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('tiles')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                    inputMode === 'tiles'
                      ? 'bg-[#FD5F01] text-white shadow-sm font-semibold'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  🧩 Ghép chữ
                </button>
              </div>
            </div>
          )}

          {/* Mode 1: Tile Bank (Duolingo / Word Builder Scramble) */}
          {inputMode === 'tiles' && !feedback ? (
            <div className="space-y-4 p-4 rounded-2xl bg-card/60 backdrop-blur-md border border-border/60">
              {/* Placed Answer Slots */}
              <div className="min-h-14 p-2 rounded-xl border border-dashed border-border flex flex-wrap items-center justify-center gap-1.5 bg-muted/20">
                {selectedTileIds.length === 0 ? (
                  <span className="text-xs text-muted-foreground italic">
                    Chạm các mảnh chữ bên dưới để ghép từ hoàn chỉnh…
                  </span>
                ) : (
                  selectedTileIds.map((id, index) => {
                    const tile = availableTiles.find((t) => t.id === id)
                    if (!tile) return null
                    return (
                      <button
                        key={`${id}-${index}`}
                        type="button"
                        onClick={() => handlePlacedTileClick(index)}
                        className="min-w-9 h-10 px-2.5 rounded-xl bg-[#FD5F01] text-white font-bold text-base shadow-sm hover:bg-[#e05401] transition-transform active:scale-95 cursor-pointer animate-in zoom-in-75 duration-150"
                        title="Chạm để gỡ chữ này"
                      >
                        {tile.char}
                      </button>
                    )
                  })
                )}
              </div>

              {/* Letter Tiles Bank */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                {availableTiles.map((tile) => {
                  const isUsed = selectedTileIds.includes(tile.id)
                  return (
                    <button
                      key={tile.id}
                      type="button"
                      disabled={isUsed}
                      onClick={() => handleTileClick(tile)}
                      className={`min-w-10 h-11 px-3 rounded-xl font-bold text-base border transition-all cursor-pointer ${
                        isUsed
                          ? 'opacity-20 border-border/40 bg-muted/40 text-muted-foreground cursor-not-allowed scale-90'
                          : 'bg-card hover:bg-accent/80 border-border/80 text-foreground shadow-sm hover:scale-105 active:scale-95'
                      }`}
                    >
                      {tile.char}
                    </button>
                  )
                })}
              </div>

              {/* Action Buttons: Backspace, Clear, Shuffle */}
              <div className="flex items-center justify-center gap-2 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleBackspace}
                  disabled={selectedTileIds.length === 0}
                  className="rounded-xl h-8 px-3 text-xs gap-1.5 cursor-pointer"
                >
                  <Delete className="w-3.5 h-3.5" />
                  Xóa chữ cuối
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleClearTiles}
                  disabled={selectedTileIds.length === 0}
                  className="rounded-xl h-8 px-3 text-xs gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Làm lại
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleShuffleTiles}
                  className="rounded-xl h-8 px-2.5 text-xs gap-1 cursor-pointer"
                  title="Trộn lại vị trí các chữ"
                >
                  <Shuffle className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
              </div>
            </div>
          ) : (
            /* Mode 2: Standard Keyboard Input */
            <>
              <label className="typing-answer block">
                <Input
                  ref={inputRef}
                  className="glass-control"
                  aria-label="Câu trả lời"
                  placeholder={
                    currentLanguage === 'ja'
                      ? 'Nhập từ tiếng Nhật (Kanji/Kana/Romaji)…'
                      : currentLanguage === 'es'
                        ? 'Nhập từ tiếng Tây Ban Nha…'
                        : currentLanguage === 'it'
                          ? 'Nhập từ tiếng Ý…'
                          : 'Nhập từ tiếng Anh…'
                  }
                  autoComplete="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  value={answer}
                  disabled={pending || !!feedback}
                  onChange={(e) => setAnswer(e.target.value)}
                />
              </label>

              {specialChars.length > 0 && !feedback && (
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] text-muted-foreground mr-1">Ký tự đặc biệt:</span>
                  {specialChars.map((char) => (
                    <button
                      key={char}
                      type="button"
                      onClick={() => {
                        setAnswer((prev) => prev + char)
                        inputRef.current?.focus()
                      }}
                      className="w-7 h-7 rounded-lg bg-card/80 border border-border/70 hover:border-[#FD5F01]/60 hover:text-[#FD5F01] text-xs font-semibold flex items-center justify-center transition-colors cursor-pointer"
                    >
                      {char}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Bottom Feedback / Actions Bar */}
      <div
        className={`answer-bottom ${
          feedback ? (feedback.isCorrect ? 'feedback-correct' : 'feedback-wrong') : ''
        }`}
      >
        {feedback ? (
          <div className="feedback-copy" role="status">
            {feedback.isCorrect ? (
              <Check className="icon" />
            ) : (
              <X className="icon" />
            )}
            <div>
              <h3>{feedback.isCorrect ? 'Chính xác!' : 'Chưa đúng'}</h3>
              <p>
                Đáp án: <strong>{feedback.correctAnswer}</strong>
              </p>
              {!feedback.isCorrect && (
                <small>Ghi nhớ đáp án rồi tiếp tục luyện tập.</small>
              )}
            </div>
          </div>
        ) : (
          <span className="keyboard-hint">
            <kbd>Enter</kbd> để kiểm tra
          </span>
        )}
        <Button
          ref={submit}
          className="btn btn-primary"
          disabled={feedback ? advancing : pending || !answer.trim()}
        >
          {feedback ? 'Tiếp tục' : pending ? 'Đang kiểm tra…' : 'Kiểm tra'}
          <span className="btn-icon">
            <Check className="icon" aria-hidden="true" />
          </span>
        </Button>
      </div>
    </form>
  )
}
