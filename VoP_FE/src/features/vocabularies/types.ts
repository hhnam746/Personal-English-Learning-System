export interface Example {
  id?: string
  sentenceEn: string
  sentenceVi: string | null
  clozeSentenceEn: string | null
  clozeAnswer: string | null
}
export interface Meaning {
  id?: string
  meaningVi: string
  partOfSpeech: string | null
  ipaOverride: string | null
  examples: Example[]
}
export interface Vocabulary {
  id: string
  term: string
  ipa: string | null
  audioUrl: string | null
  createdAt: string
  updatedAt: string
  meanings: Meaning[]
  level: number
  nextReviewAt: string | null
  isSuspended: boolean
}
export interface VocabularyInput {
  term: string
  ipa: string | null
  audioUrl: string | null
  meanings: Meaning[]
}
export interface VocabularyFilters {
  search?: string
  level?: number
  dueOnly?: boolean
  sort?: string
  page?: number
  pageSize?: number
}
