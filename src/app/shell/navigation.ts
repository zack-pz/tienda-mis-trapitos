export const primaryNavigation = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Admin', to: '/admin/categories' },
] as const

export const demoNavigation = [
  { label: 'Sentry', to: '/demo/sentry/testing' },
  { label: 'Drizzle', to: '/demo/drizzle' },
  { label: 'Simple Form', to: '/demo/form/simple' },
  { label: 'Address Form', to: '/demo/form/address' },
  { label: 'MCP', to: '/demo/mcp-todos' },
  { label: 'TanStack Table', to: '/demo/table' },
  { label: 'Better Auth', to: '/demo/better-auth' },
  { label: 'Store', to: '/demo/store' },
  { label: 'PostHog', to: '/demo/posthog' },
  { label: 'TanStack Query', to: '/demo/tanstack-query' },
  { label: 'Neon', to: '/demo/neon' },
] as const

export const socialLinks = [
  {
    label: 'Follow TanStack on X',
    href: 'https://x.com/tan_stack',
  },
  {
    label: 'Go to TanStack GitHub',
    href: 'https://github.com/TanStack',
  },
] as const
