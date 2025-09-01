import '@testing-library/jest-dom'

// Mock Supabase client for tests
jest.mock('./src/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
      }))
    }))
  },
  testSupabaseConnection: jest.fn(() => 
    Promise.resolve({ success: true, message: 'Mock connection successful' })
  ),
  createServerSupabaseClient: jest.fn()
}))

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn()
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return ''
  }
}))