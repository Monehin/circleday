'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export function AnimatedLogo() {
  const logoRef = useRef<SVGSVGElement>(null)
  const circleGroupRef = useRef<SVGGElement>(null)
  const innerCircleRef = useRef<SVGCircleElement>(null)
  const textRef = useRef<SVGGElement>(null)

  useEffect(() => {
    if (!logoRef.current || !circleGroupRef.current || !textRef.current || !innerCircleRef.current) return

    // Initial setup
    gsap.set(circleGroupRef.current, { scale: 0, transformOrigin: 'center' })
    gsap.set(textRef.current.children, { opacity: 0, y: 30, scale: 0.8 })
    gsap.set(innerCircleRef.current, { scale: 0 })

    // Create master timeline
    const tl = gsap.timeline({ delay: 0.2 })

    // Animate circle group with bounce
    tl.to(circleGroupRef.current, {
      scale: 1,
      duration: 1.2,
      ease: 'elastic.out(1, 0.4)'
    })

    // Animate inner circle
    tl.to(innerCircleRef.current, {
      scale: 1,
      duration: 0.6,
      ease: 'back.out(2)'
    }, '-=0.6')

    // Animate letters with stagger
    tl.to(textRef.current.children, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.8,
      stagger: 0.06,
      ease: 'back.out(1.5)'
    }, '-=0.8')

    // Continuous animations
    // Floating circle
    gsap.to(circleGroupRef.current, {
      y: -8,
      duration: 2.5,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true
    })

    // Rotating inner circle
    gsap.to(innerCircleRef.current, {
      rotation: 360,
      duration: 15,
      ease: 'none',
      repeat: -1
    })

    // Pulsing glow effect
    gsap.to(innerCircleRef.current, {
      opacity: 0.6,
      duration: 1.5,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true
    })
  }, [])

  return (
    <div className="absolute top-6 left-6 z-50 filter drop-shadow-2xl">
      <svg
        ref={logoRef}
        width="320"
        height="80"
        viewBox="0 0 320 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        {/* Circle group */}
        <g ref={circleGroupRef}>
          {/* Outer glow */}
          <circle 
            cx="40" 
            cy="40" 
            r="32" 
            fill="url(#logoGradient)" 
            opacity="0.15"
            filter="url(#glow)"
          />
          
          {/* Main circle */}
          <circle 
            cx="40" 
            cy="40" 
            r="26" 
            fill="url(#logoGradient)" 
            opacity="0.95"
          />
          
          {/* Ring */}
          <circle 
            cx="40" 
            cy="40" 
            r="20" 
            fill="none" 
            stroke="white" 
            strokeWidth="3" 
            opacity="0.5" 
          />
          
          {/* Inner circle */}
          <circle 
            ref={innerCircleRef}
            cx="40" 
            cy="40" 
            r="10" 
            fill="white"
            opacity="0.9"
          />
        </g>

        {/* Text - Solid color, full width with proper spacing */}
        <g ref={textRef}>
          <text
            className="font-display"
            fontSize="36"
            fontWeight="800"
            fill="hsl(222 47% 11%)"
            letterSpacing="1.5"
          >
            <tspan x="88" y="52">C</tspan>
            <tspan>i</tspan>
            <tspan>r</tspan>
            <tspan>c</tspan>
            <tspan>l</tspan>
            <tspan>e</tspan>
            <tspan dx="6">D</tspan>
            <tspan>a</tspan>
            <tspan>y</tspan>
          </text>
        </g>

        {/* Gradient definitions */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(18 100% 61%)" />
            <stop offset="50%" stopColor="hsl(28 96% 56%)" />
            <stop offset="100%" stopColor="hsl(38 92% 50%)" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" />
          </filter>
        </defs>
      </svg>
    </div>
  )
}

