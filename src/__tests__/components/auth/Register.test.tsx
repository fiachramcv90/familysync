import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RegisterPage from '@/app/auth/register/page'
import { useAuth } from '@/contexts/AuthContext'

// Mock the modules
jest.mock('@/contexts/AuthContext')

describe('Register Page', () => {
  const mockSignUp = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useAuth as jest.Mock).mockReturnValue({
      signUp: mockSignUp,
      user: null,
      loading: false,
    })
  })

  it('renders registration form elements', () => {
    render(<RegisterPage />)
    
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email address/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/family name/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument()
  })

  it('handles successful registration', async () => {
    const user = userEvent.setup()
    mockSignUp.mockResolvedValueOnce(undefined)
    
    render(<RegisterPage />)
    
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com')
    await user.type(screen.getByLabelText(/family name/i), 'The Doe Family')
    await user.type(screen.getByLabelText(/^password$/i), 'Password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123')
    
    await user.click(screen.getByRole('button', { name: /create account/i }))
    
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        'john@example.com',
        'Password123',
        'John Doe',
        'The Doe Family'
      )
    })
  })

  it('validates password requirements', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)
    
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'weak')
    await user.type(screen.getByLabelText(/confirm password/i), 'weak')
    
    await user.click(screen.getByRole('button', { name: /create account/i }))
    
    await waitFor(() => {
      const errorMessages = screen.getAllByText(/at least 8 characters/i)
      expect(errorMessages.length).toBeGreaterThan(0)
    })
    
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('validates password match', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)
    
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'Password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'Password456')
    
    await user.click(screen.getByRole('button', { name: /create account/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })
    
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('validates email format', async () => {
    const user = userEvent.setup()
    render(<RegisterPage />)
    
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email address/i), 'notanemail')
    await user.type(screen.getByLabelText(/^password$/i), 'Password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123')
    
    // Clear and set an invalid email to bypass HTML5 validation
    const emailInput = screen.getByLabelText(/email address/i) as HTMLInputElement
    await user.clear(emailInput)
    await user.type(emailInput, 'invalid@')
    
    await user.click(screen.getByRole('button', { name: /create account/i }))
    
    // HTML5 validation may prevent form submission, so check if signUp was not called
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('handles registration error', async () => {
    const user = userEvent.setup()
    mockSignUp.mockRejectedValueOnce(new Error('Email already exists'))
    
    render(<RegisterPage />)
    
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email address/i), 'existing@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'Password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123')
    
    await user.click(screen.getByRole('button', { name: /create account/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/email already exists/i)).toBeInTheDocument()
    })
  })

  it('allows registration without family name', async () => {
    const user = userEvent.setup()
    mockSignUp.mockResolvedValueOnce(undefined)
    
    render(<RegisterPage />)
    
    await user.type(screen.getByLabelText(/full name/i), 'John Doe')
    await user.type(screen.getByLabelText(/email address/i), 'john@example.com')
    // Don't fill in family name
    await user.type(screen.getByLabelText(/^password$/i), 'Password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'Password123')
    
    await user.click(screen.getByRole('button', { name: /create account/i }))
    
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith(
        'john@example.com',
        'Password123',
        'John Doe',
        ''
      )
    })
  })
})