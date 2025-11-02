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
    <div className="fixed top-8 left-8 z-50 filter drop-shadow-lg">
      <svg
        ref={logoRef}
        width="240"
        height="70"
        viewBox="0 0 240 70"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Circle group */}
        <g ref={circleGroupRef}>
          {/* Outer glow */}
          <circle 
            cx="35" 
            cy="35" 
            r="28" 
            fill="url(#logoGradient)" 
            opacity="0.15"
            filter="url(#glow)"
          />
          
          {/* Main circle */}
          <circle 
            cx="35" 
            cy="35" 
            r="22" 
            fill="url(#logoGradient)" 
            opacity="0.9"
          />
          
          {/* Ring */}
          <circle 
            cx="35" 
            cy="35" 
            r="18" 
            fill="none" 
            stroke="white" 
            strokeWidth="2.5" 
            opacity="0.4" 
          />
          
          {/* Inner circle */}
          <circle 
            ref={innerCircleRef}
            cx="35" 
            cy="35" 
            r="8" 
            fill="white"
            opacity="0.8"
          />
        </g>

        {/* Text */}
        <g ref={textRef}>
          <text
            x="75"
            y="45"
            className="font-display"
            fontSize="32"
            fontWeight="700"
            fill="url(#textGradient)"
            letterSpacing="1"
          >
            <tspan>C</tspan>
            <tspan dx="2">i</tspan>
            <tspan dx="2">r</tspan>
            <tspan dx="2">c</tspan>
            <tspan dx="2">l</tspan>
            <tspan dx="2">e</tspan>
            <tspan dx="6">D</tspan>
            <tspan dx="2">a</tspan>
            <tspan dx="2">y</tspan>
          </text>
        </g>

        {/* Gradient definitions */}
        <defs>
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(18 100% 61%)" />
            <stop offset="50%" stopColor="hsl(28 96% 56%)" />
            <stop offset="100%" stopColor="hsl(38 92% 50%)" />
          </linearGradient>
          <linearGradient id="textGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="hsl(222 47% 11%)" />
            <stop offset="100%" stopColor="hsl(18 100% 61%)" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="4" />
          </filter>
        </defs>
      </svg>
    </div>
  )
}

