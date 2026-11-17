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
  meaningId?: string | null
  meaningVi?: string | null
  isLegacy?: boolean
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

export interface Attempt {
  id: string
  sessionWordId: string
  type: Question['type']
  role: string
  submittedAnswer: string | null
  isCorrect: boolean
  answeredAt: string
}
