import { useEffect, useRef, useState } from 'react'
import { BookOpen, Check, Headphones, PenLine, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SpeakButton } from '@/components/speak-button'
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
export function QuestionForm({
  question,
  pending,
  onAnswer,
  feedback,
  onNext,
  onSkipAudio,
  advancing,
  ipa
}: {
  question: Question
  pending: boolean
  onAnswer: (answer: string) => void
  feedback?: Answer
  onNext: () => void
  onSkipAudio: () => void
  advancing: boolean
  ipa?: string | null
}) {
  const [answer, setAnswer] = useState('')
  const [audioError, setAudioError] = useState(false)
  const form = useRef<HTMLFormElement>(null)
  const heading = useRef<HTMLHeadingElement>(null)
  const submit = useRef<HTMLButtonElement>(null)
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
  const listening = question.type.startsWith('listen')
  const Icon = listening
    ? Headphones
    : question.type === 'fill_blank'
      ? PenLine
      : BookOpen
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
      className="question-form question-content glass-panel motion-question"
    >
      <div className="exercise-label">
        <Icon className="icon" aria-hidden="true" />
        {question.role === 'reinforcement'
          ? 'LƯỢT CỦNG CỐ'
          : exerciseLabels[question.type]}
      </div>
      <h2 ref={heading} tabIndex={-1}>
        {titles[question.type]}
      </h2>
      {!listening && (
        <div
          className={
            question.type === 'fill_blank' ? 'sentence' : 'question-word'
          }
        >
          <span className="whitespace-pre-line">{question.prompt}</span>
          {question.type === 'meaning_mcq' && (
            <SpeakButton term={question.prompt} />
          )}
        </div>
      )}
      {question.type === 'meaning_mcq' && ipa && (
        <p className="question-ipa">{ipa}</p>
      )}
      {listening && (
        <div className="practice-audio">
          {question.audioUrl && <audio
            aria-label="Âm thanh câu hỏi"
            controls
            src={question.audioUrl}
            preload="none"
            onError={() => setAudioError(true)}
          />}
          {(audioError || !question.audioUrl) && <p role="alert">Không phát được âm thanh offline.</p>}
          {!feedback && <Button type="button" className="btn btn-secondary" disabled={pending} onClick={onSkipAudio}>
            Bỏ qua câu nghe
          </Button>}
        </div>
      )}
      {question.options.length ? (
        <fieldset className="answer-options" disabled={pending || !!feedback}>
          <legend className="sr-only">Chọn câu trả lời</legend>
          {question.options.map((option, i) => (
            <label
              key={option}
              className={`answer-option glass-control ${answer === option ? 'selected' : ''} ${feedback && option === feedback.correctAnswer ? 'correct-answer' : ''} ${feedback && !feedback.isCorrect && answer === option ? 'wrong-answer' : ''}`}
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
        <label className="typing-answer">
          <Input
            className="glass-control"
            aria-label="Câu trả lời"
            placeholder="Nhập từ tiếng Anh…"
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            value={answer}
            disabled={pending || !!feedback}
            onChange={(e) => setAnswer(e.target.value)}
          />
        </label>
      )}
      <div
        className={`answer-bottom ${feedback ? (feedback.isCorrect ? 'feedback-correct' : 'feedback-wrong') : ''}`}
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
