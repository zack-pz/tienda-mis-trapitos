import { useStore } from '@tanstack/react-form'

import { Button } from '#/shared/ui/button'
import { Input } from '#/shared/ui/input'
import { Label } from '#/shared/ui/label'
import { Textarea } from '#/shared/ui/textarea'

import { useFieldContext, useFormContext } from '../model/form-context'

function getErrors(errors: unknown) {
  return Array.isArray(errors)
    ? (errors as Array<string | { message: string }>)
    : []
}

export function SubscribeButton({ label }: { label: string }) {
  const form = useFormContext()

  return (
    <form.Subscribe selector={(state) => state.isSubmitting}>
      {(isSubmitting) => (
        <Button type="submit" disabled={isSubmitting}>
          {label}
        </Button>
      )}
    </form.Subscribe>
  )
}

function ErrorMessages({
  errors,
}: {
  errors: Array<string | { message: string }>
}) {
  return (
    <>
      {errors.map((error) => (
        <div
          key={typeof error === 'string' ? error : error.message}
          className="mt-1 font-bold text-red-300"
        >
          {typeof error === 'string' ? error : error.message}
        </div>
      ))}
    </>
  )
}

export function TextField({
  label,
  placeholder,
}: {
  label: string
  placeholder?: string
}) {
  const field = useFieldContext<string>()
  const errors = getErrors(useStore(field.store, (state) => state.meta.errors))

  return (
    <div>
      <Label htmlFor={field.name}>{label}</Label>
      <Input
        id={field.name}
        value={field.state.value}
        placeholder={placeholder}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
      />
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}

export function TextArea({
  label,
  rows = 3,
}: {
  label: string
  rows?: number
}) {
  const field = useFieldContext<string>()
  const errors = getErrors(useStore(field.store, (state) => state.meta.errors))

  return (
    <div>
      <Label htmlFor={field.name}>{label}</Label>
      <Textarea
        id={field.name}
        rows={rows}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
      />
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}

export function Select({
  label,
  values,
  placeholder,
}: {
  label: string
  values: Array<{ label: string; value: string }>
  placeholder?: string
}) {
  const field = useFieldContext<string>()
  const errors = getErrors(useStore(field.store, (state) => state.meta.errors))

  return (
    <div>
      <Label htmlFor={field.name}>{label}</Label>
      <select
        id={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(event) => field.handleChange(event.target.value)}
        className="flex h-10 w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-300"
      >
        <option value="">{placeholder ?? `Select ${label}`}</option>
        {values.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {field.state.meta.isTouched && <ErrorMessages errors={errors} />}
    </div>
  )
}
