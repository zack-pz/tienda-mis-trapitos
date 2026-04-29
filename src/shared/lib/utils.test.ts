import { describe, expect, it } from 'vitest'

import { cn } from './utils'

describe('cn', () => {
  it('merges duplicate tailwind classes keeping the latest one', () => {
    expect(cn('px-2 text-white', 'px-4')).toBe('text-white px-4')
  })
})
