import { useEffect } from 'react'
import {
  FormProvider,
  useFieldArray,
  useForm,
  useFormContext,
  type FieldPathByValue
} from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldError
} from '@/components/ui/field'
import { vocabularySchema, type VocabularyFormValues } from '../validations'
import type { Vocabulary, VocabularyInput } from '../types'

function TextField({
  name,
  label,
  placeholder
}: {
  name: FieldPathByValue<VocabularyFormValues, string | undefined>
  label: string
  placeholder?: string
}) {
  const { register, getFieldState, formState } =
    useFormContext<VocabularyFormValues>()
  const { error } = getFieldState(name, formState)
  return (
    <Field data-invalid={!!error}>
      <FieldLabel htmlFor={name}>{label}</FieldLabel>
      <Input
        className="glass-control"
        id={name}
        {...register(name)}
        placeholder={placeholder}
        aria-invalid={!!error}
      />
      <FieldError>{error?.message}</FieldError>
    </Field>
  )
}
function Examples({ index }: { index: number }) {
  const { control } = useFormContext<VocabularyFormValues>()
  const { fields, append, remove } = useFieldArray({
    control,
    name: `meanings.${index}.examples`,
    keyName: 'formKey'
  })
  return (
    <div className="example-fields">
      {fields.map((field, i) => (
        <FieldGroup className="example-editor" key={field.formKey}>
          <TextField
            name={`meanings.${index}.examples.${i}.sentenceEn`}
            label="Câu ví dụ tiếng Anh"
          />
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
          <Button type="button" variant="ghost" onClick={() => remove(i)}>
            Bỏ ví dụ
          </Button>
        </FieldGroup>
      ))}
      <Button
        type="button"
        variant="outline"
        disabled={fields.length >= 30}
        onClick={() =>
          append({
            sentenceEn: '',
            sentenceVi: '',
            clozeSentenceEn: '',
            clozeAnswer: ''
          })
        }
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
  onCancel,
  onDirtyChange
}: {
  word?: Vocabulary
  pending: boolean
  onSave: (data: VocabularyInput) => Promise<void>
  onCancel: () => void
  onDirtyChange: (dirty: boolean) => void
}) {
  const methods = useForm<VocabularyFormValues>({
    resolver: zodResolver(vocabularySchema),
    defaultValues: {
      term: word?.term || '',
      ipa: word?.ipa || '',
      audioUrl: word?.audioUrl || '',
      meanings: word?.meanings.map((m) => ({
        ...m,
        partOfSpeech: m.partOfSpeech || '',
        ipaOverride: m.ipaOverride || '',
        examples: m.examples.map((e) => ({
          ...e,
          sentenceVi: e.sentenceVi || '',
          clozeSentenceEn: e.clozeSentenceEn || '',
          clozeAnswer: e.clozeAnswer || ''
        }))
      })) || [
        { meaningVi: '', partOfSpeech: '', ipaOverride: '', examples: [] }
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
        onSubmit={methods.handleSubmit(async (values) => {
          try {
            await onSave({
              ...values,
              ipa: values.ipa || null,
              audioUrl: values.audioUrl || null,
              meanings: values.meanings.map((m) => ({
                ...m,
                partOfSpeech: m.partOfSpeech || null,
                ipaOverride: m.ipaOverride || null,
                examples: m.examples.map((e) => ({
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
        })}
        className="vocabulary-form"
      >
        <fieldset disabled={pending}>
          <FieldGroup>
            <TextField name="term" label="Từ / cụm từ tiếng Anh" />
            <TextField name="ipa" label="Phiên âm IPA" />
            <TextField name="audioUrl" label="URL âm thanh (không bắt buộc)" />
            {fields.map((field, i) => (
              <section className="meaning-editor" key={field.formKey}>
                <h3>Nghĩa {i + 1}</h3>
                <FieldGroup>
                  <TextField
                    name={`meanings.${i}.meaningVi`}
                    label="Nghĩa tiếng Việt"
                  />
                  <TextField
                    name={`meanings.${i}.partOfSpeech`}
                    label="Từ loại"
                  />
                  <TextField
                    name={`meanings.${i}.ipaOverride`}
                    label="IPA riêng cho nghĩa này"
                  />
                  <Examples index={i} />
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => remove(i)}
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
        </fieldset>
        <p className="muted">
          Lưu từ không tự bắt đầu luyện tập hoặc thay đổi Level.
        </p>
        <div className="form-actions">
          <Button
            className="btn btn-secondary"
            type="button"
            disabled={pending}
            onClick={() => {
              if (
                !methods.formState.isDirty ||
                window.confirm('Bỏ thay đổi chưa lưu?')
              )
                onCancel()
            }}
          >
            Hủy
          </Button>
          <Button className="btn btn-primary" type="submit" disabled={pending}>
            {pending ? 'Đang lưu…' : 'Lưu từ'}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}
