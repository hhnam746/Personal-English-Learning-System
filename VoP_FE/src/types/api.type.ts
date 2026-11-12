export interface Page<T> {
  items: T[]
  pageNumber: number
  pageSize: number
  totalItems: number
}
export interface ProblemDetails {
  title?: string
  detail?: string
  errors?: Record<string, string[]>
}
