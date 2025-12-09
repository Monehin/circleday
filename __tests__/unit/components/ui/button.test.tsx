import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'

describe.skip('Button', () => {
  it('renders children correctly', () => {
    render(<Button>Click me</Button>)
    
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument()
  })

  it('applies default variant classes', () => {
    render(<Button>Default</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toHaveClass('inline-flex')
  })

  it('applies different variants', () => {
    const { rerender } = render(<Button variant="destructive">Delete</Button>)
    
    let button = screen.getByRole('button')
    expect(button.className).toContain('destructive')
    
    rerender(<Button variant="outline">Outline</Button>)
    button = screen.getByRole('button')
    expect(button.className).toContain('outline')
  })

  it('applies different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>)
    
    let button = screen.getByRole('button')
    // Small button has specific height class
    expect(button.className).toContain('h-8')
    
    rerender(<Button size="lg">Large</Button>)
    button = screen.getByRole('button')
    // Large button has different height class
    expect(button.className).toContain('h-10')
  })

  it('handles click events', async () => {
    let clicked = false
    const handleClick = () => { clicked = true }
    
    render(<Button onClick={handleClick}>Click me</Button>)
    
    const user = userEvent.setup()
    await user.click(screen.getByRole('button'))
    
    expect(clicked).toBe(true)
  })

  it('can be disabled', () => {
    render(<Button disabled>Disabled</Button>)
    
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('supports asChild prop for custom elements', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    )
    
    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/test')
  })
})

