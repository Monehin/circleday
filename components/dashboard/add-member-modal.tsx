'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader } from '@/components/ui/loader'
import { addMember } from '@/lib/actions/groups'

const addMemberSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100).trim(),
  email: z.string().email('Invalid email address').trim().optional().or(z.literal('')),
  phone: z.string().trim().optional().or(z.literal('')),
  timezone: z.string().optional(),
  role: z.enum(['MEMBER', 'ADMIN']).default('MEMBER'),
}).refine(data => data.email || data.phone, {
  message: 'Either email or phone is required',
  path: ['email'], // Show error on email field
})

type AddMemberInput = z.infer<typeof addMemberSchema>

interface AddMemberModalProps {
  groupId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddMemberModal({ groupId, isOpen, onClose, onSuccess }: AddMemberModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
  } = useForm({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      timezone: '',
      role: 'MEMBER' as const,
    },
  })

  const onSubmit = async (data: any) => {
    setIsSubmitting(true)
    try {
      const result = await addMember({
        groupId,
        ...data,
        // Convert empty strings to undefined
        email: data.email || undefined,
        phone: data.phone || undefined,
        timezone: data.timezone || undefined,
      })

      if (result.error) {
        setError('root', {
          type: 'manual',
          message: result.error,
        })
        setIsSubmitting(false)
        return
      }

      // Success - reset form and close modal
      reset()
      onSuccess()
      onClose()
    } catch (error) {
      setError('root', {
        type: 'manual',
        message: 'Failed to add member. Please try again.',
      })
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      reset()
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={handleClose}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-background rounded-lg shadow-lifted border border-border/50 w-full max-w-md p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-foreground mb-4">Add Member</h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    {...register('name')}
                    disabled={isSubmitting}
                    className="h-11"
                    aria-invalid={errors.name ? 'true' : 'false'}
                  />
                  <AnimatePresence>
                    {errors.name && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-destructive"
                      >
                        {errors.name.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email <span className="text-muted-foreground text-xs">(Email or Phone required)</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    {...register('email')}
                    disabled={isSubmitting}
                    className="h-11"
                    aria-invalid={errors.email ? 'true' : 'false'}
                  />
                  <AnimatePresence>
                    {errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-destructive"
                      >
                        {errors.email.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone <span className="text-muted-foreground text-xs">(Optional)</span>
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    {...register('phone')}
                    disabled={isSubmitting}
                    className="h-11"
                  />
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-sm font-medium">
                    Role
                  </Label>
                  <select
                    id="role"
                    {...register('role')}
                    disabled={isSubmitting}
                    className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                {/* Timezone (Optional) */}
                <div className="space-y-2">
                  <Label htmlFor="timezone" className="text-sm font-medium">
                    Timezone <span className="text-muted-foreground text-xs">(Optional)</span>
                  </Label>
                  <Input
                    id="timezone"
                    type="text"
                    placeholder="America/New_York"
                    {...register('timezone')}
                    disabled={isSubmitting}
                    className="h-11"
                  />
                </div>

                {/* Root Error */}
                <AnimatePresence>
                  {errors.root && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -10, height: 0 }}
                      className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 overflow-hidden"
                    >
                      <p className="text-sm text-destructive">{errors.root.message}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    className="flex-1 h-11"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader size="sm" variant="primary" />
                        Adding...
                      </span>
                    ) : (
                      'Add Member'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-11"
                    onClick={handleClose}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}

