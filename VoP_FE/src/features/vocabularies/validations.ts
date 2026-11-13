import { z } from 'zod'
const optionalText = (max: number) => z.string().max(max, 'Nội dung quá dài')
export function isEmptyExample(example: {
  id?: string
  sentenceEn: string
  sentenceVi: string
  clozeSentenceEn: string
  clozeAnswer: string
}) {
  return (
    !example.id &&
    ![
      example.sentenceEn,
      example.sentenceVi,
      example.clozeSentenceEn,
      example.clozeAnswer
    ].some((value) => value.trim())
  )
}

export const vocabularySchema = z
  .object({
    term: z
      .string()
      .trim()
      .min(1, 'Nhập từ tiếng Anh')
      .max(255, 'Tối đa 255 ký tự'),
    ipa: optionalText(160),
    audioUrl: z
      .string()
      .refine(
        (v) => !v || /^https?:\/\//i.test(v),
        'URL âm thanh phải bắt đầu bằng http:// hoặc https://'
      )
      .refine((v) => !v || URL.canParse(v), 'URL không hợp lệ')
      .max(2048),
    meanings: z
      .array(
        z.object({
          id: z.string().optional(),
          meaningVi: z
            .string()
            .trim()
            .min(1, 'Nhập nghĩa tiếng Việt')
            .max(3000),
          partOfSpeech: optionalText(40),
          ipaOverride: optionalText(160),
          examples: z
            .array(
              z
                .object({
                  id: z.string().optional(),
                  sentenceEn: z.string().trim().max(5000),
                  sentenceVi: optionalText(5000),
                  clozeSentenceEn: optionalText(5000),
                  clozeAnswer: optionalText(255)
                })
                .superRefine((v, ctx) => {
                  if (
                    !!v.clozeSentenceEn.trim() !== !!v.clozeAnswer.trim() ||
                    (v.clozeSentenceEn.trim() &&
                      !v.clozeSentenceEn.includes('________'))
                  )
                    ctx.addIssue({
                      code: 'custom',
                      path: ['clozeSentenceEn'],
                      message:
                        'Điền cả câu có ________ và đáp án, hoặc để trống cả hai'
                    })
                })
            )
            .max(30)
        })
      )
      .min(1)
      .max(30)
  })
  .superRefine(({ meanings }, ctx) => {
    meanings.forEach(({ examples }, meaningIndex) => {
      examples.forEach((example, exampleIndex) => {
        const isOptional = meaningIndex === 0 && exampleIndex === 0
        if (!example.sentenceEn && !(isOptional && isEmptyExample(example))) {
          ctx.addIssue({
            code: 'custom',
            path: [
              'meanings',
              meaningIndex,
              'examples',
              exampleIndex,
              'sentenceEn'
            ],
            message: 'Nhập câu ví dụ'
          })
        }
      })
    })
  })
export type VocabularyFormValues = z.infer<typeof vocabularySchema>
