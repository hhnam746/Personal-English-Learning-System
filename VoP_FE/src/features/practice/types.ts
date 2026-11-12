export interface Session {
  id: string
  status: 'in_progress' | 'completed' | 'abandoned'
  startedAt: string
  finishedAt: string | null
  answeredCount: number
  remainingCount: number
  words: {
    id: string
    vocabularyId: string
    source: string
    levelAtStart: number
    term: string
    ipa: string | null
  }[]
}
export interface Question {
  id: string
  sessionWordId: string
  type: 'meaning_mcq' | 'listen_choose' | 'listen_type' | 'fill_blank'
  role: string
  prompt: string
  audioUrl: string | null
  options: string[]
}
export interface Answer {
  attemptId: string
  isCorrect: boolean
  correctAnswer: string
  role: string
}
