import { cn } from '#/shared/lib/utils'

import type { InputHTMLAttributes } from 'react'

export function Input({
  className,
  type = 'text',
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      className={cn(
        'flex h-10 w-full rounded-md border border-white/20 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-300',
        className,
      )}
      {...props}
    />
  )
}
