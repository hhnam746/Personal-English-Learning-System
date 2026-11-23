import { useEffect, useRef } from 'react'
import {
  Controller,
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
  type FieldPathByValue
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { BookOpen, Check } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
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
import { useLanguageStore } from '@/lib/zustand/language.store'
import type { Vocabulary, VocabularyInput } from '../types'

import { partsOfSpeech } from '../part-of-speech'

const emptyExample = {
  sentenceEn: '',
  sentenceVi: '',
  clozeSentenceEn: '',
  clozeAnswer: '',
  clozeConfirmed: false
}

function TextField({
  name,
  label,
  placeholder,
  required,
  multiline,
  readOnly,
  partOfSpeech
}: {
  name: FieldPathByValue<VocabularyFormValues, string | undefined>
  label: string
  placeholder?: string
  required?: boolean
  multiline?: boolean
  readOnly?: boolean
  partOfSpeech?: string
}) {
  const { control, register, getFieldState, formState, getValues, setValue } =
    useFormContext<VocabularyFormValues>()
  const { error } = getFieldState(name, formState)
  const clearConfirmation = () => {
    if (name === 'term') {
      getValues('meanings').forEach((m, i) => m.examples.forEach((_, j) =>
        setValue(`meanings.${i}.examples.${j}.clozeConfirmed`, false)))
    }
    const meaning = /^meanings\.(\d+)\.meaningVi$/.exec(name)
    if (meaning) {
      const i = Number(meaning[1])
      getValues(`meanings.${i}.examples`).forEach((_, j) =>
        setValue(`meanings.${i}.examples.${j}.clozeConfirmed`, false))
    }
    const example = /^meanings\.(\d+)\.examples\.(\d+)\.(sentenceEn|clozeSentenceEn|clozeAnswer)$/.exec(name)
    if (example) setValue(`meanings.${Number(example[1])}.examples.${Number(example[2])}.clozeConfirmed`, false)
  }
  const props = {
    ...register(name, { onChange: clearConfirmation }),
    readOnly,
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
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Select
              value={`pos:${field.value ?? ''}`}
              onValueChange={(value) => field.onChange(value.slice(4))}
            >
              <SelectTrigger
                className="glass-control"
                id={name}
                ref={field.ref}
                onBlur={field.onBlur}
                aria-invalid={props['aria-invalid']}
                aria-describedby={props['aria-describedby']}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper" align="start">
                <SelectGroup>
                  <SelectItem value="pos:">Không bắt buộc</SelectItem>
                  {partsOfSpeech.map(([value, text]) => (
                    <SelectItem key={value} value={`pos:${value}`}>
                      {text}
                    </SelectItem>
                  ))}
                  {partOfSpeech &&
                    !partsOfSpeech.some(
                      ([value]) => value === partOfSpeech
                    ) && (
                      <SelectItem value={`pos:${partOfSpeech}`}>
                        {partOfSpeech}
                      </SelectItem>
                    )}
                </SelectGroup>
              </SelectContent>
            </Select>
          )}
        />
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
            <Controller
              control={control}
              name={`meanings.${index}.examples.${i}.clozeConfirmed`}
              render={({ field }) => (
                <label className="flex items-start gap-2">
                  <Checkbox checked={!!field.value} onCheckedChange={(value) => field.onChange(value === true)} />
                  <span>Dùng để điền từ nếu câu đúng nghĩa và có một đáp án rõ ràng</span>
                </label>
              )}
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
  initial,
  pending,
  onSave,
  onDirtyChange
}: {
  word?: Vocabulary
  initial?: VocabularyInput
  pending: boolean
  onSave: (data: VocabularyInput) => Promise<void>
  onDirtyChange: (dirty: boolean) => void
}) {
  const source = word ?? initial
  const advanced = useRef<HTMLDetailsElement>(null)
  const methods = useForm<VocabularyFormValues>({
    resolver: zodResolver(vocabularySchema),
    defaultValues: {
      term: source?.term || '',
      ipa: source?.ipa || '',
      imageUrl: source?.imageUrl || '',
      audioUrl: source?.audioUrl || '',
      meanings: source?.meanings.length ? source.meanings.map((m, i) => ({
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
      })) : [
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
    onDirtyChange(methods.formState.isDirty || !!initial?.meanings.length)
    return () => onDirtyChange(false)
  }, [methods.formState.isDirty, onDirtyChange, initial])
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
                  language: source?.language || useLanguageStore.getState().currentLanguage,
                  ipa: values.ipa || null,
                  imageUrl: values.imageUrl || null,
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
              readOnly={!!initial?.meanings.length}
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
            Để luyện điền từ, dùng nguyên từ đã lưu và xác nhận ví dụ trong mục
            Thông tin bổ sung.
          </p>
          <details ref={advanced} className="word-form-advanced">
            <summary>Thông tin bổ sung</summary>
            <FieldGroup>
              <TextField
                name="audioUrl"
                label="URL âm thanh (không bắt buộc)"
              />
              <TextField
                name="imageUrl"
                label="Link ảnh minh họa (URL hình ảnh đoán nghĩa)"
              />
              {methods.watch('imageUrl') && (
                <div className="flex items-center gap-3 p-2.5 rounded-xl bg-card/60 border border-border/40">
                  <img
                    src={methods.watch('imageUrl') || ''}
                    alt="Xem trước ảnh minh họa"
                    className="h-14 w-14 object-cover rounded-lg border border-border/60 shrink-0"
                    onError={(e) => {
                      ;(e.target as HTMLElement).style.display = 'none'
                    }}
                  />
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground block">Ảnh minh họa đang dùng</span>
                    Sẽ hiển thị trong Flashcard và bài tập "Hình đoán nghĩa"
                  </div>
                </div>
              )}
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
