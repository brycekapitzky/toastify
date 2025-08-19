import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, fireEvent, waitFor } from '@testing-library/react'
import { render, createMockUser } from '../utils/test-utils'
import { AuthPage } from '../../components/AuthPage'

// Mock the AuthContext
vi.mock('../../components/AuthContext', () => ({
  useAuth: () => ({
    signIn: vi.fn().mockResolvedValue({ error: null }),
    signUp: vi.fn().mockResolvedValue({ error: null }),
    signInWithGoogle: vi.fn().mockResolvedValue({ error: null }),
    signInWithGitHub: vi.fn().mockResolvedValue({ error: null }),
    enterDemoMode: vi.fn(),
  }),
}))

describe('AuthPage', () => {
  const mockOnBackToLanding = vi.fn()
  const mockOnTryDemo = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders sign in form by default', () => {
    render(
      <AuthPage
        onBackToLanding={mockOnBackToLanding}
        onTryDemo={mockOnTryDemo}
        initialMode="login"
      />
    )

    expect(screen.getByText('Sign In to Your Account')).toBeInTheDocument()
    expect(screen.getByText('Sign In to Toastify')).toBeInTheDocument()
    expect(screen.getByText('Try Interactive Demo')).toBeInTheDocument()
  })

  it('renders sign up form when initialMode is signup', () => {
    render(
      <AuthPage
        onBackToLanding={mockOnBackToLanding}
        onTryDemo={mockOnTryDemo}
        initialMode="signup"
      />
    )

    expect(screen.getByText('Create Your Account')).toBeInTheDocument()
    expect(screen.getByText('Create Account & Start Free Trial')).toBeInTheDocument()
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument()
  })

  it('switches between login and signup modes', async () => {
    render(
      <AuthPage
        onBackToLanding={mockOnBackToLanding}
        onTryDemo={mockOnTryDemo}
        initialMode="login"
      />
    )

    // Start with login
    expect(screen.getByText('Sign In to Your Account')).toBeInTheDocument()

    // Switch to signup
    fireEvent.click(screen.getByText("Don't have an account? Sign up free"))
    
    await waitFor(() => {
      expect(screen.getByText('Create Your Account')).toBeInTheDocument()
    })

    // Switch back to login
    fireEvent.click(screen.getByText('Already have an account? Sign in'))
    
    await waitFor(() => {
      expect(screen.getByText('Sign In to Your Account')).toBeInTheDocument()
    })
  })

  it('validates required fields', async () => {
    render(
      <AuthPage
        onBackToLanding={mockOnBackToLanding}
        onTryDemo={mockOnTryDemo}
        initialMode="login"
      />
    )

    // Try to submit without filling fields
    fireEvent.click(screen.getByText('Sign In to Toastify'))

    await waitFor(() => {
      expect(screen.getByText('Email and password are required')).toBeInTheDocument()
    })
  })

  it('validates password length', async () => {
    render(
      <AuthPage
        onBackToLanding={mockOnBackToLanding}
        onTryDemo={mockOnTryDemo}
        initialMode="login"
      />
    )

    // Fill with short password
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: '123' }
    })

    fireEvent.click(screen.getByText('Sign In to Toastify'))

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters long')).toBeInTheDocument()
    })
  })

  it('calls onTryDemo when demo button is clicked', async () => {
    render(
      <AuthPage
        onBackToLanding={mockOnBackToLanding}
        onTryDemo={mockOnTryDemo}
        initialMode="login"
      />
    )

    fireEvent.click(screen.getByText('Try Interactive Demo'))

    expect(mockOnTryDemo).toHaveBeenCalledTimes(1)
  })

  it('calls onBackToLanding when back button is clicked', async () => {
    render(
      <AuthPage
        onBackToLanding={mockOnBackToLanding}
        onTryDemo={mockOnTryDemo}
        initialMode="login"
      />
    )

    fireEvent.click(screen.getByText('Back to Home'))

    expect(mockOnBackToLanding).toHaveBeenCalledTimes(1)
  })

  it('shows signup benefits for signup mode', () => {
    render(
      <AuthPage
        onBackToLanding={mockOnBackToLanding}
        onTryDemo={mockOnTryDemo}
        initialMode="signup"
      />
    )

    expect(screen.getByText("What's included in your free trial:")).toBeInTheDocument()
    expect(screen.getByText('✓ 2,500 free contacts')).toBeInTheDocument()
    expect(screen.getByText('✓ Unlimited sequences')).toBeInTheDocument()
    expect(screen.getByText('✓ Advanced analytics')).toBeInTheDocument()
    expect(screen.getByText('✓ Priority support')).toBeInTheDocument()
  })

  it('validates full name for signup', async () => {
    render(
      <AuthPage
        onBackToLanding={mockOnBackToLanding}
        onTryDemo={mockOnTryDemo}
        initialMode="signup"
      />
    )

    // Fill email and password but not name
    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'test@example.com' }
    })
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'password123' }
    })

    fireEvent.click(screen.getByText('Create Account & Start Free Trial'))

    await waitFor(() => {
      expect(screen.getByText('Full name is required for account creation')).toBeInTheDocument()
    })
  })
})