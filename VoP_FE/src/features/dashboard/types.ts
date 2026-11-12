export interface DailyActivity {
  date: string
  assessmentAnswers: number
  correctAssessments: number
  reinforcementAnswers: number
  flashcardReviews: number
  completedSessions: number
}
export interface Dashboard {
  totalWords: number
  learnedWords: number
  newWords: number
  dueWords: number
  levels: { level: number; count: number }[]
  assessmentAnswers: number
  correctAssessments: number
  accuracyPercent: number | null
  reinforcementAnswers: number
  flashcardReviews: number
  activity: DailyActivity[]
}
