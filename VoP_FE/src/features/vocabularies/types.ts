export interface Example {
  id?: string
  sentenceEn: string
  sentenceVi: string | null
  clozeSentenceEn: string | null
  clozeAnswer: string | null
  clozeConfirmed?: boolean
}

export interface Meaning {
  id?: string
  dictionaryEntryId?: number | null
  dictionaryDefinitionId?: number | null
  level?: number
  nextReviewAt?: string | null
  meaningVi: string
  partOfSpeech: string | null
  ipaOverride: string | null
  examples: Example[]
}

export interface Vocabulary {
  id: string
  term: string
  language?: string
  phoneticReading?: string | null
  scriptType?: string | null
  ipa: string | null
  audioUrl: string | null
  createdAt: string
  updatedAt: string
  meanings: Meaning[]
  level: number
  nextReviewAt: string | null
  isSuspended: boolean
  mixedLevels?: boolean
}

export interface VocabularyInput {
  term: string
  language?: string
  phoneticReading?: string | null
  scriptType?: string | null
  ipa: string | null
  audioUrl: string | null
  meanings: Meaning[]
}

export interface VocabularyFilters {
  search?: string
  exactTerm?: string
  language?: string
  level?: number
  dueOnly?: boolean
  sort?: string
  page?: number
  pageSize?: number
}
