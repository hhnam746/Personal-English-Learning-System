import { useEffect, useRef } from 'react'
import {
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
  type FieldPathByValue
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { BookOpen, Check } from 'lucide-react'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError
} from '@/components/ui/field'
import {
  isEmptyExample,
  vocabularySchema,
  type VocabularyFormValues
} from '../validations'
import type { Vocabulary, VocabularyInput } from '../types'

const partsOfSpeech = [
  ['noun', 'Danh từ'],
  ['verb', 'Động từ'],
  ['adjective', 'Tính từ'],
  ['adverb', 'Trạng từ'],
  ['phrase', 'Cụm từ'],
  ['other', 'Khác']
]

const emptyExample = {
  sentenceEn: '',
  sentenceVi: '',
  clozeSentenceEn: '',
  clozeAnswer: ''
}

function TextField({
  name,
  label,
  placeholder,
  required,
  multiline,
  partOfSpeech
}: {
  name: FieldPathByValue<VocabularyFormValues, string | undefined>
  label: string
  placeholder?: string
  required?: boolean
  multiline?: boolean
  partOfSpeech?: string
}) {
  const { register, getFieldState, formState } =
    useFormContext<VocabularyFormValues>()
  const { error } = getFieldState(name, formState)
  const props = {
    ...register(name),
    className: 'glass-control',
    id: name,
    placeholder,
    'aria-required': required,
    'aria-invalid': !!error,
    'aria-describedby': error ? `${name}-error` : undefined
  }
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={name} data-required={required || undefined}>
        {label}
      </FieldLabel>
      {partOfSpeech !== undefined ? (
        <NativeSelect {...props}>
          <NativeSelectOption value="">Không bắt buộc</NativeSelectOption>
          {partsOfSpeech.map(([value, text]) => (
            <NativeSelectOption key={value} value={value}>
              {text}
            </NativeSelectOption>
          ))}
          {partOfSpeech &&
            !partsOfSpeech.some(([value]) => value === partOfSpeech) && (
              <NativeSelectOption value={partOfSpeech}>
                {partOfSpeech}
              </NativeSelectOption>
            )}
        </NativeSelect>
      ) : multiline ? (
        <Textarea {...props} rows={2} />
      ) : (
        <Input {...props} autoComplete="off" />
      )}
      <FieldError id={`${name}-error`}>{error?.message}</FieldError>
    </Field>
  )
}

function Examples({ index }: { index: number }) {
  const { control } = useFormContext<VocabularyFormValues>()
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: `meanings.${index}.examples`,
    keyName: 'formKey'
  })
  return (
    <div className="example-fields">
      {fields.map((field, i) => {
        const primary = index === 0 && i === 0
        return (
          <FieldGroup
            className="example-editor motion-field"
            key={field.formKey}
          >
            {primary ? (
              <h4>Chi tiết câu ví dụ chính</h4>
            ) : (
              <TextField
                name={`meanings.${index}.examples.${i}.sentenceEn`}
                label="Câu ví dụ tiếng Anh"
                multiline
              />
            )}
            <TextField
              name={`meanings.${index}.examples.${i}.sentenceVi`}
              label="Dịch nghĩa ví dụ"
            />
            <TextField
              name={`meanings.${index}.examples.${i}.clozeSentenceEn`}
              label="Câu điền từ (không bắt buộc)"
              placeholder="She is ________."
            />
            <TextField
              name={`meanings.${index}.examples.${i}.clozeAnswer`}
              label="Đáp án điền từ"
            />
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                primary && fields.length === 1
                  ? update(0, emptyExample)
                  : remove(i)
              }
            >
              {primary ? 'Bỏ ví dụ chính' : 'Bỏ ví dụ'}
            </Button>
          </FieldGroup>
        )
      })}
      <Button
        type="button"
        variant="outline"
        disabled={fields.length >= 30}
        onClick={() => append(emptyExample)}
      >
        Thêm ví dụ
      </Button>
    </div>
  )
}
export function VocabularyForm({
  word,
  pending,
  onSave,
  onDirtyChange
}: {
  word?: Vocabulary
  pending: boolean
  onSave: (data: VocabularyInput) => Promise<void>
  onDirtyChange: (dirty: boolean) => void
}) {
  const advanced = useRef<HTMLDetailsElement>(null)
  const methods = useForm<VocabularyFormValues>({
    resolver: zodResolver(vocabularySchema),
    defaultValues: {
      term: word?.term || '',
      ipa: word?.ipa || '',
      audioUrl: word?.audioUrl || '',
      meanings: word?.meanings.map((m, i) => ({
        ...m,
        partOfSpeech: m.partOfSpeech || '',
        ipaOverride: m.ipaOverride || '',
        examples:
          i === 0 && !m.examples.length
            ? [emptyExample]
            : m.examples.map((e) => ({
                ...e,
                sentenceVi: e.sentenceVi || '',
                clozeSentenceEn: e.clozeSentenceEn || '',
                clozeAnswer: e.clozeAnswer || ''
              }))
      })) || [
        {
          meaningVi: '',
          partOfSpeech: '',
          ipaOverride: '',
          examples: [emptyExample]
        }
      ]
    }
  })
  useEffect(() => {
    onDirtyChange(methods.formState.isDirty)
    return () => onDirtyChange(false)
  }, [methods.formState.isDirty, onDirtyChange])
  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: 'meanings',
    keyName: 'formKey'
  })
  return (
    <FormProvider {...methods}>
      <form
        onSubmit={(event) =>
          void methods.handleSubmit(
            async (values) => {
              try {
                await onSave({
                  ...values,
                  ipa: values.ipa || null,
                  audioUrl: values.audioUrl || null,
                  meanings: values.meanings.map((m, meaningIndex) => ({
                    ...m,
                    partOfSpeech: m.partOfSpeech || null,
                    ipaOverride: m.ipaOverride || null,
                    examples: m.examples
                      .filter(
                        (example, exampleIndex) =>
                          meaningIndex !== 0 ||
                          exampleIndex !== 0 ||
                          !isEmptyExample(example)
                      )
                      .map((e) => ({
                        ...e,
                        sentenceVi: e.sentenceVi || null,
                        clozeSentenceEn: e.clozeSentenceEn || null,
                        clozeAnswer: e.clozeAnswer || null
                      }))
                  }))
                })
              } catch {
                /* Mutation displays the API error; keep the draft. */
              }
            },
            (errors) => {
              const first = errors.meanings?.[0]
              const example = first?.examples?.[0]
              if (
                advanced.current &&
                (errors.audioUrl ||
                  first?.ipaOverride ||
                  example?.sentenceVi ||
                  example?.clozeSentenceEn ||
                  example?.clozeAnswer ||
                  (Array.isArray(first?.examples) &&
                    first.examples.some((error, i) => i > 0 && error)) ||
                  (Array.isArray(errors.meanings) &&
                    errors.meanings.some((error, i) => i > 0 && error)))
              )
                advanced.current.open = true
            }
          )(event)
        }
        className="vocabulary-form"
      >
        <fieldset disabled={pending}>
          <div className="word-form-main">
            <TextField
              name="term"
              label="Từ / Cụm từ tiếng Anh"
              placeholder="Ví dụ: resilient"
              required
            />
            <TextField
              name="meanings.0.meaningVi"
              label="Nghĩa tiếng Việt"
              placeholder="Ví dụ: kiên cường; có khả năng phục hồi"
              required
            />
            <div className="form-pair">
              <TextField
                name="ipa"
                label="Phiên âm IPA"
                placeholder="/rɪˈzɪliənt/"
              />
              <TextField
                name="meanings.0.partOfSpeech"
                label="Từ loại"
                partOfSpeech={fields[0].partOfSpeech}
              />
            </div>
            <TextField
              name="meanings.0.examples.0.sentenceEn"
              label="Câu ví dụ tiếng Anh"
              placeholder="She remained resilient in the face of change."
              multiline
            />
          </div>
          <p className="field-help">
            Dùng nguyên từ đã lưu trong câu để có thể luyện điền từ. Phát âm sử
            dụng giọng đọc trình duyệt khi chưa có URL âm thanh.
          </p>
          <details ref={advanced} className="word-form-advanced">
            <summary>Thông tin bổ sung</summary>
            <FieldGroup>
              <TextField
                name="audioUrl"
                label="URL âm thanh (không bắt buộc)"
              />
              {fields.map((field, i) => (
                <section
                  className="meaning-editor motion-field"
                  key={field.formKey}
                >
                  <h3>Nghĩa {i + 1}</h3>
                  <FieldGroup>
                    {i > 0 && (
                      <>
                        <TextField
                          name={`meanings.${i}.meaningVi`}
                          label="Nghĩa tiếng Việt"
                          required
                        />
                        <TextField
                          name={`meanings.${i}.partOfSpeech`}
                          label="Từ loại"
                          partOfSpeech={field.partOfSpeech}
                        />
                      </>
                    )}
                    <TextField
                      name={`meanings.${i}.ipaOverride`}
                      label="IPA riêng cho nghĩa này"
                    />
                    <Examples key={i} index={i} />
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          if (
                            i === 0 &&
                            !methods.getValues('meanings.1.examples').length
                          ) {
                            methods.setValue('meanings.1.examples', [
                              emptyExample
                            ])
                          }
                          remove(i)
                        }}
                      >
                        Bỏ nghĩa này
                      </Button>
                    )}
                  </FieldGroup>
                </section>
              ))}
              <Button
                type="button"
                variant="outline"
                disabled={fields.length >= 30}
                onClick={() =>
                  append({
                    meaningVi: '',
                    partOfSpeech: '',
                    ipaOverride: '',
                    examples: []
                  })
                }
              >
                Thêm nghĩa
              </Button>
            </FieldGroup>
          </details>
        </fieldset>
        <div className="form-bottom">
          <span>
            <BookOpen className="icon" aria-hidden="true" />
            {word
              ? 'Tiến độ được giữ nguyên'
              : 'Từ được lưu ở trạng thái Chưa học'}
          </span>
          <Button className="btn btn-primary" type="submit" disabled={pending}>
            {pending ? 'Đang lưu…' : word ? 'Lưu thay đổi' : 'Lưu từ mới'}
            <span className="btn-icon">
              <Check className="icon" aria-hidden="true" />
            </span>
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
