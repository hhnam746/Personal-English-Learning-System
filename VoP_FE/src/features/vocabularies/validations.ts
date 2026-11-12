import { z } from 'zod'
const optionalText = (max: number) => z.string().max(max, 'Nội dung quá dài')
export const vocabularySchema = z.object({
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
        meaningVi: z.string().trim().min(1, 'Nhập nghĩa tiếng Việt').max(3000),
        partOfSpeech: optionalText(40),
        ipaOverride: optionalText(160),
        examples: z
          .array(
            z
              .object({
                id: z.string().optional(),
                sentenceEn: z
                  .string()
                  .trim()
                  .min(1, 'Nhập câu ví dụ')
                  .max(5000),
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
export type VocabularyFormValues = z.infer<typeof vocabularySchema>
