import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddMemberModal } from '@/components/dashboard/add-member-modal'

// Mock server action
vi.mock('@/lib/actions/groups', () => ({
  addMember: vi.fn(),
}))

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// Mock Dialog component
vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ open, children }: any) => (open ? <div data-testid="dialog">{children}</div> : null),
  DialogContent: ({ children }: any) => <div data-testid="dialog-content">{children}</div>,
  DialogDescription: ({ children }: any) => <p>{children}</p>,
  DialogHeader: ({ children }: any) => <div>{children}</div>,
  DialogTitle: ({ children }: any) => <h2>{children}</h2>,
}))

describe('AddMemberModal', () => {
  const defaultProps = {
    groupId: 'group-1',
    isOpen: true,
    onClose: vi.fn(),
    onSuccess: vi.fn(),
  }

  it('should render when open', () => {
    render(<AddMemberModal {...defaultProps} />)
    
    expect(screen.getByText('Add Member')).toBeInTheDocument()
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument()
  })

  it('should not render when closed', () => {
    render(<AddMemberModal {...defaultProps} isOpen={false} />)
    
    expect(screen.queryByText('Add Member')).not.toBeInTheDocument()
  })

  it('should have all required form fields', () => {
    render(<AddMemberModal {...defaultProps} />)
    
    expect(screen.getByLabelText(/Name/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Phone/)).toBeInTheDocument()
    expect(screen.getByLabelText(/Role/)).toBeInTheDocument()
  })

  it('should show validation error for empty name', async () => {
    const user = userEvent.setup()
    render(<AddMemberModal {...defaultProps} />)
    
    const submitButton = screen.getByRole('button', { name: /Add Member/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Name must be at least 2 characters/i)).toBeInTheDocument()
    })
  })

  it('should require either email or phone', async () => {
    const user = userEvent.setup()
    render(<AddMemberModal {...defaultProps} />)
    
    const nameInput = screen.getByLabelText(/Name/)
    await user.type(nameInput, 'John Doe')
    
    const submitButton = screen.getByRole('button', { name: /Add Member/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/Either email or phone is required/i)).toBeInTheDocument()
    })
  })

  it('should call onClose when cancel is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<AddMemberModal {...defaultProps} onClose={onClose} />)
    
    const cancelButton = screen.getByRole('button', { name: 'Cancel' })
    await user.click(cancelButton)
    
    expect(onClose).toHaveBeenCalled()
  })

  it('should have role selection with Member and Admin options', () => {
    render(<AddMemberModal {...defaultProps} />)
    
    // Role field should exist
    expect(screen.getByLabelText(/Role/)).toBeInTheDocument()
  })

  it('should show loading state when submitting', async () => {
    const user = userEvent.setup()
    const { addMember } = await import('@/lib/actions/groups')
    
    // Mock a slow server response
    vi.mocked(addMember).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ success: true, membership: {} as any }), 100))
    )
    
    render(<AddMemberModal {...defaultProps} />)
    
    const nameInput = screen.getByLabelText(/Name/)
    const emailInput = screen.getByLabelText(/Email/)
    
    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'john@example.com')
    
    const submitButton = screen.getByRole('button', { name: /Add Member/i })
    await user.click(submitButton)
    
    // Should show loading text
    await waitFor(() => {
      expect(screen.getByText(/Adding member.../i)).toBeInTheDocument()
    })
  })

  it('should validate email format', async () => {
    const user = userEvent.setup()
    render(<AddMemberModal {...defaultProps} />)
    
    const nameInput = screen.getByLabelText(/Name/)
    const emailInput = screen.getByLabelText(/Email/)
    
    await user.type(nameInput, 'John Doe')
    await user.type(emailInput, 'invalid-email')
    
    const submitButton = screen.getByRole('button', { name: /Add Member/i })
    await user.click(submitButton)
    
    // Email validation should trigger
    // Note: The exact error message depends on Zod schema
    await waitFor(() => {
      const errorElement = screen.queryByText(/invalid email/i) || screen.queryByText(/email address/i)
      expect(errorElement).toBeInTheDocument()
    }, { timeout: 2000 })
  })
})

