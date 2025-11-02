'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export function AnimatedLogo() {
  const containerRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (!containerRef.current || !iconRef.current || !textRef.current) return

    // Playful entrance animation
    const tl = gsap.timeline({ delay: 0.2 })

    // Icon bounces in with rotation
    tl.fromTo(iconRef.current,
      { scale: 0, rotation: -180, opacity: 0 },
      { 
        scale: 1, 
        rotation: 0, 
        opacity: 1, 
        duration: 0.8, 
        ease: 'elastic.out(1, 0.5)' 
      }
    )

    // Text bounces in with slight delay
    tl.fromTo(textRef.current,
      { opacity: 0, y: 20, scale: 0.8 },
      { 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        duration: 0.6, 
        ease: 'back.out(1.7)' 
      },
      '-=0.4'
    )

    // === Continuous Playful Animations ===

    // Heartbeat effect - pulsing scale
    gsap.to(iconRef.current, {
      scale: 1.15,
      duration: 0.3,
      ease: 'power2.inOut',
      repeat: -1,
      repeatDelay: 0.5,
      yoyo: true
    })

    // Gentle rotation
    gsap.to(iconRef.current, {
      rotation: 360,
      duration: 20,
      ease: 'none',
      repeat: -1
    })

    // Bouncy float
    gsap.to(containerRef.current, {
      y: -8,
      duration: 2,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true
    })

    // Subtle wiggle
    gsap.to(containerRef.current, {
      rotation: 2,
      duration: 3,
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
        {/* Circle with heart icon */}
        <div ref={iconRef} className="relative">
          {/* Outer circle with gradient */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent shadow-md flex items-center justify-center">
            {/* Heart SVG */}
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              className="text-white"
            >
              <path
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                fill="currentColor"
              />
            </svg>
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
