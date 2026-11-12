import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Question } from '../types'
export function QuestionForm({
  question,
  pending,
  onAnswer
}: {
  question: Question
  pending: boolean
  onAnswer: (answer: string) => void
}) {
  const [answer, setAnswer] = useState('')
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (answer.trim()) onAnswer(answer)
      }}
      className="question-form"
    >
      <h2>
        {question.type === 'meaning_mcq'
          ? 'Chọn nghĩa đúng'
          : question.type === 'fill_blank'
            ? 'Điền từ vào câu'
            : 'Nghe và trả lời'}
      </h2>
      <p className="question-prompt">{question.prompt}</p>
      {question.audioUrl && (
        <audio controls src={question.audioUrl} preload="none">
          Thiết bị không hỗ trợ âm thanh.
        </audio>
      )}
      {question.options.length ? (
        <fieldset className="answer-options" disabled={pending}>
          <legend className="sr-only">Chọn câu trả lời</legend>
          {question.options.map((option) => (
            <label
              key={option}
              className={`glass-control ${answer === option ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name="answer"
                value={option}
                checked={answer === option}
                onChange={() => setAnswer(option)}
              />
              {option}
            </label>
          ))}
        </fieldset>
      ) : (
        <Input
          aria-label="Câu trả lời"
          autoFocus
          autoComplete="off"
          value={answer}
          disabled={pending}
          onChange={(e) => setAnswer(e.target.value)}
        />
      )}
      <Button className="btn btn-primary" disabled={pending || !answer.trim()}>
        {pending ? 'Đang kiểm tra…' : 'Kiểm tra'}
      </Button>
    </form>
  )
}
