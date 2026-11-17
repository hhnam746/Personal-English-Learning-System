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
  totalMeanings: number
  masteredMeanings: number
  listeningAnswers: number
  correctListeningAnswers: number
  learnedMeanings: number
  newMeanings: number
  availableNewMeanings: number
  dueMeanings: number
  levels: { level: number; count: number }[]
  assessmentAnswers: number
  correctAssessments: number
  accuracyPercent: number | null
  reinforcementAnswers: number
  flashcardReviews: number
  activity: DailyActivity[]
}
