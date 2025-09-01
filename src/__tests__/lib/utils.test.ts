import { generateInviteCode, formatDate, formatDateTime } from '@/lib/utils'

describe('utils', () => {
  describe('generateInviteCode', () => {
    it('should generate invite code of default length 6', () => {
      const code = generateInviteCode()
      expect(code).toHaveLength(6)
      expect(code).toMatch(/^[A-Z0-9]+$/)
    })

    it('should generate invite code of custom length', () => {
      const code = generateInviteCode(8)
      expect(code).toHaveLength(8)
      expect(code).toMatch(/^[A-Z0-9]+$/)
    })
  })

  describe('formatDate', () => {
    it('should format date string correctly', () => {
      const date = '2025-01-15'
      const formatted = formatDate(date)
      expect(formatted).toMatch(/Jan 15, 2025/)
    })

    it('should format Date object correctly', () => {
      const date = new Date('2025-01-15')
      const formatted = formatDate(date)
      expect(formatted).toMatch(/Jan 15, 2025/)
    })
  })

  describe('formatDateTime', () => {
    it('should format datetime string correctly', () => {
      const date = '2025-01-15T14:30:00Z'
      const formatted = formatDateTime(date)
      expect(formatted).toMatch(/Jan 15, 2025/)
      expect(formatted).toMatch(/\d{1,2}:\d{2}/)
    })
  })
})