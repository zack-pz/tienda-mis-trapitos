import { cn } from '#/shared/lib/utils'

import type { LabelHTMLAttributes } from 'react'

export function Label({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn('mb-2 block text-xl font-bold', className)} {...props} />
  )
}
