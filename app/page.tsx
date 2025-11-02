'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { AnimatedLogo } from '@/components/AnimatedLogo'
import { useEffect, useState } from 'react'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 }
}

const stagger = {
  visible: { transition: { staggerChildren: 0.15 } }
}

// Generate static decorative circles to avoid hydration mismatch
const generateCircles = () => {
  return [...Array(20)].map((_, i) => ({
    cx: Math.random() * 400,
    cy: Math.random() * 400,
    r: Math.random() * 3 + 1,
    opacity: Math.random() * 0.5 + 0.5
  }))
}

export default function Home() {
  const [circles, setCircles] = useState<Array<{ cx: number; cy: number; r: number; opacity: number }>>([])
  
  useEffect(() => {
    setCircles(generateCircles())
  }, [])
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-primary/[0.02] to-white">
      {/* Animated Logo */}
      <AnimatedLogo />
      
      {/* Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <motion.section 
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="relative px-6 py-24 sm:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeUp}>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full mb-8">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium text-primary">Thoughtfully designed</span>
              </div>
              
              <h1 className="font-display text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Never miss a
                <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  celebration
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Elegant reminder system for birthdays, anniversaries, and meaningful moments. 
                Beautiful, simple, unforgettable.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="px-8 shadow-lifted">
                  <Link href="/login">Start celebrating</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="px-8">
                  <Link href="/login">View demo</Link>
                </Button>
              </div>
            </motion.div>

            {/* Illustration */}
            <motion.div 
              variants={fadeUp}
              className="relative h-[500px] hidden lg:block"
            >
              <svg
                viewBox="0 0 400 500"
                className="w-full h-full"
                fill="none"
              >
                {/* Calendar Icon */}
                <motion.rect
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  x="50" y="100" width="300" height="350"
                  rx="20"
                  fill="url(#gradient1)"
                  className="drop-shadow-2xl"
                />
                
                {/* Calendar Header */}
                <rect x="50" y="100" width="300" height="60" rx="20" fill="hsl(18 100% 61%)" />
                
                {/* Calendar Grid */}
                {[0,1,2,3,4].map((row) => 
                  [0,1,2,3,4,5,6].map((col) => (
                    <motion.circle
                      key={`${row}-${col}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ 
                        delay: 0.5 + (row * 0.05) + (col * 0.02),
                        duration: 0.4 
                      }}
                      cx={80 + col * 40}
                      cy={200 + row * 45}
                      r="12"
                      fill={row === 2 && col === 3 ? "hsl(18 100% 61%)" : "hsl(210 40% 96%)"}
                    />
                  ))
                )}

                {/* Floating Elements */}
                <motion.circle
                  animate={{ 
                    y: [-5, 5, -5],
                    opacity: [0.5, 0.8, 0.5]
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  cx="320" cy="80" r="30" fill="hsl(38 92% 50%)" opacity="0.3"
                />
                <motion.circle
                  animate={{ 
                    y: [5, -5, 5],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1
                  }}
                  cx="80" cy="420" r="40" fill="hsl(18 100% 61%)" opacity="0.2"
                />

                {/* Gradients */}
                <defs>
                  <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(0 0% 100%)" />
                    <stop offset="100%" stopColor="hsl(210 40% 98%)" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
        className="relative px-6 py-24 sm:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-6xl">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Everything you need
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Thoughtfully crafted features to help you stay connected
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                    <path d="M12 8v4l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                ),
                title: 'Smart reminders',
                description: 'Intelligent notifications delivered at the perfect time, respecting every timezone'
              },
              {
                icon: (
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                    <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="15" cy="17" r="4" stroke="currentColor" strokeWidth="2"/>
                    <path d="M9 11c-3.314 0-6 2.462-6 5.5V20h12v-3.5c0-1.424-.526-2.73-1.391-3.74" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                ),
                title: 'Group coordination',
                description: 'Organize celebrations with family and friends effortlessly'
              },
              {
                icon: (
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="8" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M7 8V6a5 5 0 0110 0v2" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                ),
                title: 'Private & secure',
                description: 'Your data stays yours with enterprise-grade encryption'
              }
            ].map((feature, i) => (
              <motion.div key={i} variants={fadeUp}>
                <Card className="group p-8 h-full border-border/50 hover:border-primary/30 hover:shadow-lifted transition-all duration-500">
                  <div className="mb-6 text-primary group-hover:scale-110 transition-transform duration-500">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Visual Separator */}
      <div className="relative h-px bg-gradient-to-r from-transparent via-border to-transparent mx-auto max-w-4xl" />

      {/* Process */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={stagger}
        className="px-6 py-24 sm:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-4xl">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Simple, powerful workflow
            </h2>
          </motion.div>

          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary/0 via-primary/20 to-primary/0 hidden md:block" />
            
            <div className="space-y-16">
              {[
                { step: '01', title: 'Create your circle', desc: 'Add birthdays, anniversaries, and special dates for people who matter' },
                { step: '02', title: 'Customize reminders', desc: 'Set your preferences for timing, channels, and message templates' },
                { step: '03', title: 'Never forget', desc: 'Receive beautiful, timely reminders and make every moment count' }
              ].map((item, i) => (
                <motion.div key={i} variants={fadeUp} className="relative flex items-start gap-8">
                  <div className="flex-shrink-0">
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg" />
                      <div className="relative w-16 h-16 rounded-full bg-white border-2 border-primary flex items-center justify-center">
                        <span className="text-xl font-bold text-primary">{item.step}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 pt-3">
                    <h3 className="text-2xl font-semibold mb-2 text-foreground">{item.title}</h3>
                    <p className="text-lg text-muted-foreground">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      {/* CTA */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        className="px-6 py-24 sm:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-accent to-primary p-12 text-center">
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 400 400">
                {circles.map((circle, i) => (
                  <circle
                    key={i}
                    cx={circle.cx}
                    cy={circle.cy}
                    r={circle.r}
                    fill="white"
                    opacity={circle.opacity}
                  />
                ))}
              </svg>
            </div>
            <div className="relative">
              <h2 className="text-4xl font-bold text-white mb-4">
                Start celebrating today
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Join CircleDay and never miss another special moment
              </p>
              <Button asChild size="lg" variant="secondary" className="px-8 shadow-xl">
                <Link href="/login">
                  Get started free
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="border-t px-6 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl flex items-center justify-between">
          <div className="font-semibold text-lg">CircleDay</div>
          <p className="text-sm text-muted-foreground">
            © 2024 CircleDay
          </p>
        </div>
      </footer>
    </div>
  )
}
