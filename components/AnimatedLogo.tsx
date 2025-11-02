'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

export function AnimatedLogo() {
  const logoRef = useRef<SVGSVGElement>(null)
  const circleGroupRef = useRef<SVGGElement>(null)
  const outerRingRef = useRef<SVGCircleElement>(null)
  const middleRingRef = useRef<SVGCircleElement>(null)
  const innerCircleRef = useRef<SVGCircleElement>(null)
  const accentDotsRef = useRef<SVGGElement>(null)
  const textRef = useRef<SVGGElement>(null)

  useEffect(() => {
    if (!logoRef.current || !circleGroupRef.current || !textRef.current || !innerCircleRef.current) return

    // Master entrance timeline
    const entranceTL = gsap.timeline({ defaults: { ease: 'power3.out' } })

    // Outer ring - expand with rotation
    if (outerRingRef.current) {
      entranceTL.fromTo(outerRingRef.current,
        { scale: 0, rotation: -180, opacity: 0, transformOrigin: 'center' },
        { scale: 1, rotation: 0, opacity: 0.95, duration: 1.2, ease: 'elastic.out(1, 0.4)' },
        0
      )
    }

    // Middle ring - bounce in
    if (middleRingRef.current) {
      entranceTL.fromTo(middleRingRef.current,
        { scale: 0, opacity: 0, transformOrigin: 'center' },
        { scale: 1, opacity: 0.85, duration: 1, ease: 'back.out(2.5)' },
        0.15
      )
    }

    // Inner circle - pop in
    entranceTL.fromTo(innerCircleRef.current,
      { scale: 0, opacity: 0, transformOrigin: 'center' },
      { scale: 1, opacity: 0.95, duration: 0.8, ease: 'back.out(3)' },
      0.3
    )

    // Accent dots - staggered spiral appearance
    if (accentDotsRef.current) {
      const dots = accentDotsRef.current.children
      entranceTL.fromTo(dots,
        { scale: 0, opacity: 0, transformOrigin: 'center', rotation: -180 },
        { scale: 1, opacity: 0.7, rotation: 0, stagger: 0.08, duration: 0.6, ease: 'back.out(2)' },
        0.4
      )
    }

    // Text - wave reveal with 3D rotation
    const letters = Array.from(textRef.current.children)
    entranceTL.fromTo(letters,
      { opacity: 0, y: 30, rotationX: -90, scale: 0.8 },
      { opacity: 1, y: 0, rotationX: 0, scale: 1, stagger: 0.05, duration: 0.7, ease: 'back.out(2)' },
      0.5
    )

    // === Continuous Animations ===
    
    // Gentle floating for entire logo
    gsap.to(logoRef.current, {
      y: -8,
      duration: 3,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true
    })

    // Slow rotation of outer ring
    if (outerRingRef.current) {
      gsap.to(outerRingRef.current, {
        rotation: 360,
        duration: 20,
        ease: 'none',
        repeat: -1,
        transformOrigin: 'center'
      })
    }

    // Counter-rotation of middle ring
    if (middleRingRef.current) {
      gsap.to(middleRingRef.current, {
        rotation: -360,
        duration: 15,
        ease: 'none',
        repeat: -1,
        transformOrigin: 'center'
      })
    }

    // Pulsing inner circle
    gsap.to(innerCircleRef.current, {
      scale: 1.15,
      opacity: 0.7,
      duration: 2,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true,
      transformOrigin: 'center'
    })

    // Orbital animation for accent dots
    if (accentDotsRef.current) {
      gsap.to(accentDotsRef.current, {
        rotation: 360,
        duration: 25,
        ease: 'none',
        repeat: -1,
        transformOrigin: 'center'
      })
      
      // Individual pulsing for each dot
      gsap.to(accentDotsRef.current.children, {
        scale: 1.3,
        opacity: 0.9,
        duration: 1.5,
        stagger: 0.2,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        transformOrigin: 'center'
      })
    }

    // Subtle text shimmer
    gsap.to(textRef.current, {
      opacity: 0.92,
      duration: 2.5,
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
        {/* Enhanced circle group with multiple layers */}
        <g ref={circleGroupRef}>
          {/* Outer glow */}
          <circle 
            cx="40" 
            cy="40" 
            r="35" 
            fill="url(#logoGradient)" 
            opacity="0.12"
            filter="url(#enhancedGlow)"
          />
          
          {/* Outer ring with gradient */}
          <circle 
            ref={outerRingRef}
            cx="40" 
            cy="40" 
            r="28" 
            fill="url(#logoGradient)" 
            opacity="0.95"
          />
          
          {/* Decorative ring 1 */}
          <circle 
            cx="40" 
            cy="40" 
            r="24" 
            fill="none" 
            stroke="white" 
            strokeWidth="1.5" 
            opacity="0.4" 
          />
          
          {/* Middle ring with accent gradient */}
          <circle 
            ref={middleRingRef}
            cx="40" 
            cy="40" 
            r="20" 
            fill="url(#accentGradient)" 
            opacity="0.85"
          />
          
          {/* Decorative ring 2 */}
          <circle 
            cx="40" 
            cy="40" 
            r="16" 
            fill="none" 
            stroke="white" 
            strokeWidth="1" 
            opacity="0.5" 
          />
          
          {/* Inner circle */}
          <circle 
            ref={innerCircleRef}
            cx="40" 
            cy="40" 
            r="11" 
            fill="white"
            opacity="0.95"
          />
        </g>

        {/* Accent dots orbiting the logo */}
        <g ref={accentDotsRef} style={{ transformOrigin: '40px 40px' }}>
          <circle cx="40" cy="8" r="2.5" fill="hsl(18 100% 61%)" opacity="0.7" />
          <circle cx="68" cy="20" r="2" fill="hsl(28 96% 56%)" opacity="0.6" />
          <circle cx="72" cy="40" r="2.5" fill="hsl(38 92% 50%)" opacity="0.7" />
          <circle cx="68" cy="60" r="2" fill="hsl(18 100% 61%)" opacity="0.6" />
          <circle cx="40" cy="72" r="2.5" fill="hsl(28 96% 56%)" opacity="0.7" />
          <circle cx="12" cy="60" r="2" fill="hsl(38 92% 50%)" opacity="0.6" />
          <circle cx="8" cy="40" r="2.5" fill="hsl(18 100% 61%)" opacity="0.7" />
          <circle cx="12" cy="20" r="2" fill="hsl(28 96% 56%)" opacity="0.6" />
        </g>

        {/* Enhanced text with shadow */}
        <g ref={textRef}>
          {/* Text shadow for depth */}
          <text
            className="font-display"
            fontSize="36"
            fontWeight="800"
            fill="rgba(0,0,0,0.08)"
            letterSpacing="1.5"
            transform="translate(1.5, 1.5)"
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
          
          {/* Main text */}
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

        {/* Enhanced gradient definitions */}
        <defs>
          {/* Main logo gradient with more stops */}
          <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(18 100% 61%)" />
            <stop offset="35%" stopColor="hsl(23 98% 58%)" />
            <stop offset="65%" stopColor="hsl(28 96% 56%)" />
            <stop offset="100%" stopColor="hsl(38 92% 50%)" />
          </linearGradient>
          
          {/* Accent gradient for middle ring */}
          <linearGradient id="accentGradient" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="hsl(38 92% 58%)" />
            <stop offset="50%" stopColor="hsl(28 96% 60%)" />
            <stop offset="100%" stopColor="hsl(18 100% 65%)" />
          </linearGradient>
          
          {/* Enhanced glow filter */}
          <filter id="enhancedGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" />
            <feColorMatrix 
              type="matrix" 
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1.2 0"
            />
          </filter>
        </defs>
      </svg>
    </div>
  )
}

