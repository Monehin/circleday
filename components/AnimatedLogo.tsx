'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export function AnimatedLogo() {
  const containerRef = useRef<HTMLDivElement>(null)
  const letterRefs = useRef<(HTMLSpanElement | null)[]>([])
  const sparklesRef = useRef<HTMLDivElement>(null)
  const confettiRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const letters = letterRefs.current.filter(Boolean) as HTMLSpanElement[]
    const sparkles = sparklesRef.current?.children
    const confetti = confettiRef.current?.children

    // Create master entrance timeline
    const entranceTL = gsap.timeline()

    // Bounce in each letter with different effects
    letters.forEach((letter, i) => {
      const isEven = i % 2 === 0
      
      // Each letter gets a unique entrance animation
      entranceTL.fromTo(letter,
        {
          scale: 0,
          rotation: isEven ? -180 : 180,
          y: -100,
          opacity: 0
        },
        {
          scale: 1,
          rotation: 0,
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'elastic.out(1, 0.5)',
          clearProps: 'all'
        },
        i * 0.1
      )
    })

    // Sparkles burst in
    if (sparkles) {
      entranceTL.fromTo(sparkles,
        { scale: 0, opacity: 0 },
        {
          scale: 1,
          opacity: 0.8,
          stagger: 0.05,
          duration: 0.5,
          ease: 'back.out(2)'
        },
        0.8
      )
    }

    // Confetti rain down
    if (confetti) {
      entranceTL.fromTo(confetti,
        { y: -50, opacity: 0, rotation: 0 },
        {
          y: 0,
          opacity: 1,
          rotation: 360,
          stagger: 0.08,
          duration: 0.8,
          ease: 'bounce.out'
        },
        1
      )
    }

    // === Continuous Playful Animations ===

    // Each letter bounces independently
    letters.forEach((letter, i) => {
      gsap.to(letter, {
        y: -10,
        duration: 0.6 + i * 0.1,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: i * 0.15
      })

      // Letters also wiggle slightly
      gsap.to(letter, {
        rotation: i % 2 === 0 ? 5 : -5,
        duration: 1 + i * 0.1,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: i * 0.2
      })

      // Random color pulses
      gsap.to(letter, {
        scale: 1.1,
        duration: 1.5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        delay: Math.random() * 2
      })
    })

    // Sparkles twinkle
    if (sparkles) {
      gsap.to(sparkles, {
        scale: 1.3,
        opacity: 1,
        duration: 0.8,
        stagger: {
          each: 0.15,
          repeat: -1,
          yoyo: true
        },
        ease: 'sine.inOut'
      })

      // Sparkles also rotate
      gsap.to(sparkles, {
        rotation: 360,
        duration: 4,
        stagger: 0.3,
        repeat: -1,
        ease: 'none'
      })
    }

    // Confetti pieces drift
    if (confetti) {
      gsap.to(confetti, {
        x: '+=20',
        y: '+=15',
        rotation: 360,
        duration: 3,
        stagger: {
          each: 0.2,
          repeat: -1,
          yoyo: true
        },
        ease: 'sine.inOut'
      })
    }

    // Container gentle sway
    gsap.to(containerRef.current, {
      rotation: 2,
      duration: 2,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true
    })
  }, [])

  const letters = 'CircleDay'.split('')
  const colors = [
    'text-pink-500',
    'text-purple-500',
    'text-blue-500',
    'text-green-500',
    'text-yellow-500',
    'text-orange-500',
    'text-red-500',
    'text-indigo-500',
    'text-pink-400'
  ]

  return (
    <div 
      ref={containerRef}
      className="absolute top-6 left-6 z-50"
      style={{ transformOrigin: 'center' }}
    >
      {/* Floating Sparkles */}
      <div 
        ref={sparklesRef}
        className="absolute inset-0 pointer-events-none"
        style={{ transform: 'scale(1.5)' }}
      >
        {[...Array(8)].map((_, i) => {
          const angle = (i / 8) * 360
          const x = Math.cos(angle * Math.PI / 180) * 120
          const y = Math.sin(angle * Math.PI / 180) * 30
          
          return (
            <div
              key={i}
              className="absolute w-3 h-3"
              style={{
                left: `${120 + x}px`,
                top: `${20 + y}px`,
                transformOrigin: 'center'
              }}
            >
              <div className="w-full h-full bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full shadow-lg" />
            </div>
          )
        })}
      </div>

      {/* Confetti Pieces */}
      <div 
        ref={confettiRef}
        className="absolute inset-0 pointer-events-none"
      >
        {[...Array(12)].map((_, i) => {
          const shapes = ['circle', 'square', 'triangle']
          const shape = shapes[i % 3]
          const colorClasses = [
            'bg-pink-400',
            'bg-purple-400',
            'bg-blue-400',
            'bg-green-400',
            'bg-yellow-400',
            'bg-red-400'
          ]
          const colorClass = colorClasses[i % colorClasses.length]
          
          return (
            <div
              key={i}
              className={`absolute w-2 h-2 ${colorClass} ${shape === 'circle' ? 'rounded-full' : shape === 'triangle' ? 'rotate-45' : ''}`}
              style={{
                left: `${Math.random() * 300}px`,
                top: `${Math.random() * 60}px`,
                transformOrigin: 'center'
              }}
            />
          )
        })}
      </div>

      {/* Main Logo Text with Individual Letter Animations */}
      <div className="relative flex items-center gap-1 text-5xl font-black">
        {letters.map((letter, i) => (
          <span
            key={i}
            ref={el => { letterRefs.current[i] = el }}
            className={`inline-block ${colors[i]} drop-shadow-lg`}
            style={{
              transformOrigin: 'center',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
            }}
          >
            {letter}
          </span>
        ))}
        
        {/* Fun emoji decoration */}
        <span className="inline-block ml-2 text-4xl">
          🎉
        </span>
      </div>

      {/* Playful tagline */}
      <div className="mt-2 text-sm font-semibold text-purple-600 opacity-80">
        Never miss a celebration! ✨
      </div>
    </div>
  )
}

