import { isAxiosError } from 'axios'
import type { ProblemDetails } from '@/types/api.type'
export function apiError(error: unknown) {
  if (isAxiosError<ProblemDetails>(error)) {
    if (!error.response)
      return 'Không kết nối được API. Kiểm tra backend rồi thử lại.'
    const body = error.response.data
    if (body?.errors) return Object.values(body.errors).flat().join(' ')
    return (
      body?.detail ||
      body?.title ||
      'Yêu cầu chưa thực hiện được. Vui lòng thử lại.'
    )
  }
  return 'Đã xảy ra lỗi. Vui lòng thử lại.'
}
