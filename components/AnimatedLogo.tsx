'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export function AnimatedLogo() {
  const containerRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (!containerRef.current || !iconRef.current || !textRef.current) return

    // Simple entrance animation
    const tl = gsap.timeline({ delay: 0.2 })

    // Icon fades and scales in
    tl.fromTo(iconRef.current,
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' }
    )

    // Text fades in
    tl.fromTo(textRef.current,
      { opacity: 0, x: -10 },
      { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' },
      '-=0.3'
    )

    // Subtle continuous animations
    gsap.to(iconRef.current, {
      scale: 1.05,
      duration: 2,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true
    })

    gsap.to(containerRef.current, {
      y: -3,
      duration: 2.5,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true
    })
  }, [])

  return (
    <div 
      ref={containerRef}
      className="absolute top-6 left-6 z-50"
    >
      <div className="flex items-center gap-3">
        {/* Simple circle icon */}
        <div ref={iconRef} className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent shadow-md" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-white opacity-30" />
          </div>
        </div>

        {/* Clean text */}
        <h1 
          ref={textRef}
          className="text-3xl font-bold text-gray-900 tracking-tight"
        >
          CircleDay
        </h1>
      </div>
    </div>
  )
}
