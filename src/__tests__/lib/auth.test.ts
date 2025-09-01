import { validatePassword, PASSWORD_REQUIREMENTS } from '@/lib/auth'

describe('Auth Service', () => {
  describe('validatePassword', () => {
    it('should accept valid passwords', () => {
      const validPasswords = [
        'Password123',
        'SecurePass1',
        'MyP@ssw0rd',
        'Test1234ABC',
      ]

      validPasswords.forEach(password => {
        const result = validatePassword(password)
        expect(result.valid).toBe(true)
        expect(result.errors).toHaveLength(0)
      })
    })

    it('should reject passwords shorter than minimum length', () => {
      const result = validatePassword('Pass1')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain(
        `Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters`
      )
    })

    it('should reject passwords without uppercase letters', () => {
      const result = validatePassword('password123')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain(
        'Password must contain at least one uppercase letter'
      )
    })

    it('should reject passwords without lowercase letters', () => {
      const result = validatePassword('PASSWORD123')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain(
        'Password must contain at least one lowercase letter'
      )
    })

    it('should reject passwords without numbers', () => {
      const result = validatePassword('PasswordABC')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain(
        'Password must contain at least one number'
      )
    })

    it('should return multiple errors for invalid passwords', () => {
      const result = validatePassword('pass')
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
    })
  })
})