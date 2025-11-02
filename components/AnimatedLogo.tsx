'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export function AnimatedLogo() {
  const logoRef = useRef<SVGSVGElement>(null)
  const circleRef = useRef<SVGCircleElement>(null)
  const textRef = useRef<SVGGElement>(null)

  useEffect(() => {
    if (!logoRef.current || !circleRef.current || !textRef.current) return

    // Initial setup
    gsap.set(circleRef.current, { scale: 0, transformOrigin: 'center' })
    gsap.set(textRef.current.children, { opacity: 0, y: 20 })

    // Create timeline
    const tl = gsap.timeline({ delay: 0.3 })

    // Animate circle
    tl.to(circleRef.current, {
      scale: 1,
      duration: 0.8,
      ease: 'elastic.out(1, 0.5)'
    })

    // Animate letters
    tl.to(textRef.current.children, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      stagger: 0.05,
      ease: 'power2.out'
    }, '-=0.4')

    // Subtle floating animation
    gsap.to(circleRef.current, {
      y: -5,
      duration: 2,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true
    })

    // Rotate circle continuously
    gsap.to(circleRef.current, {
      rotation: 360,
      duration: 20,
      ease: 'none',
      repeat: -1
    })
  }, [])

  return (
    <div className="fixed top-6 left-6 z-50">
      <svg
        ref={logoRef}
        width="180"
        height="50"
        viewBox="0 0 180 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Animated circle icon */}
        <circle
          ref={circleRef}
          cx="25"
          cy="25"
          r="20"
          fill="url(#logoGradient)"
          opacity="0.2"
        />
        
        {/* Inner decorative elements */}
        <g ref={circleRef}>
          <circle cx="25" cy="25" r="15" fill="none" stroke="url(#logoGradient)" strokeWidth="2" opacity="0.6" />
          <circle cx="25" cy="25" r="5" fill="url(#logoGradient)" />
        </g>

        {/* Text */}
        <g ref={textRef} transform="translate(55, 32)">
          <text
            className="font-display font-bold"
            fontSize="24"
            fill="currentColor"
          >
            <tspan x="0" dy="0">C</tspan>
            <tspan dx="2">i</tspan>
            <tspan dx="2">r</tspan>
            <tspan dx="2">c</tspan>
            <tspan dx="2">l</tspan>
            <tspan dx="2">e</tspan>
            <tspan dx="4">D</tspan>
            <tspan dx="2">a</tspan>
            <tspan dx="2">y</tspan>
          </text>
        </g>

        {/* Gradient definition */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(18 100% 61%)" />
            <stop offset="100%" stopColor="hsl(38 92% 50%)" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

