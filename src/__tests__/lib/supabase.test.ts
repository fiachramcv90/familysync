import { testSupabaseConnection } from '@/lib/supabase'

describe('supabase', () => {
  describe('testSupabaseConnection', () => {
    it('should return success for mock connection', async () => {
      const result = await testSupabaseConnection()
      expect(result.success).toBe(true)
      expect(result.message).toContain('Mock connection successful')
    })
  })
})