'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { fadeIn, slideUp, staggerContainer, staggerItem } from '@/lib/animations/variants'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background">
      {/* Hero Section */}
      <motion.section 
        className="relative overflow-hidden px-6 pt-20 pb-16 sm:px-8 lg:px-12"
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        <div className="mx-auto max-w-6xl">
          {/* Hero Content */}
          <motion.div className="text-center" variants={staggerItem}>
            <motion.div 
              className="mb-6 inline-block"
              whileHover={{ scale: 1.05, rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-6xl">🎉</span>
            </motion.div>
            
            <motion.h1 
              className="font-display text-5xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl mb-6"
              variants={slideUp}
            >
              Never miss a{' '}
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-gradient">
                celebration
              </span>
            </motion.h1>
            
            <motion.p 
              className="mx-auto max-w-2xl text-xl text-muted-foreground mb-8"
              variants={slideUp}
            >
              CircleDay helps you remember birthdays, anniversaries, and special moments with the people you care about.
              Beautiful reminders, perfect timing, celebrated together.
            </motion.p>
            
            <motion.div 
              className="flex gap-4 justify-center flex-wrap"
              variants={slideUp}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button asChild size="lg" className="text-lg px-8 h-14 shadow-lifted">
                  <Link href="/login">
                    Get Started Free
                  </Link>
                </Button>
              </motion.div>
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button asChild variant="outline" size="lg" className="text-lg px-8 h-14">
                  <Link href="/login">
                    Sign In
                  </Link>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Feature Cards */}
          <motion.div 
            className="mt-24 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
            variants={staggerContainer}
          >
            {[
              {
                icon: '🎂',
                title: 'Remember Everything',
                description: 'Track birthdays, anniversaries, and custom events. Never forget who matters most.',
              },
              {
                icon: '⏰',
                title: 'Perfect Timing',
                description: 'Timezone-aware reminders delivered at just the right moment, wherever you are.',
              },
              {
                icon: '👥',
                title: 'Celebrate Together',
                description: 'Organize groups, share wishes, and coordinate celebrations effortlessly.',
              },
              {
                icon: '💌',
                title: 'Beautiful Messages',
                description: 'Thoughtfully designed emails and SMS with story prompts to inspire meaningful messages.',
              },
              {
                icon: '🎁',
                title: 'One-Tap Gifting',
                description: 'Send coffee, treats, or group gifts in seconds. Simple, thoughtful, delightful.',
              },
              {
                icon: '🔒',
                title: 'Private & Secure',
                description: 'Your celebrations, your data. Enterprise-grade security with magic link authentication.',
              },
            ].map((feature, index) => (
              <motion.div key={index} variants={staggerItem}>
                <motion.div
                  whileHover="hover"
                  variants={{
                    hover: { y: -8, boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                >
                  <Card className="p-6 h-full border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/20 transition-colors">
                    <motion.div 
                      className="text-4xl mb-4"
                      whileHover={{ scale: 1.2, rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.3 }}
                    >
                      {feature.icon}
                    </motion.div>
                    <h3 className="text-xl font-semibold mb-2 text-foreground">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Decorative gradient orbs */}
        <div className="absolute top-0 left-1/4 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 -z-10 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
      </motion.section>

      {/* How it Works Section */}
      <motion.section 
        className="px-6 py-20 sm:px-8 lg:px-12 bg-muted/30"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.3 }}
        variants={staggerContainer}
      >
        <div className="mx-auto max-w-6xl">
          <motion.div className="text-center mb-16" variants={slideUp}>
            <h2 className="font-display text-4xl font-bold mb-4">
              How CircleDay Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to never miss a celebration
            </p>
          </motion.div>

          <div className="grid gap-12 lg:grid-cols-3">
            {[
              {
                step: '1',
                title: 'Add Your Circle',
                description: 'Create groups for family, friends, or teams. Add important dates in seconds.',
                emoji: '👨‍👩‍👧‍👦',
              },
              {
                step: '2',
                title: 'Get Reminded',
                description: 'Receive beautiful, timely reminders via email and SMS. Always at the perfect moment.',
                emoji: '📬',
              },
              {
                step: '3',
                title: 'Celebrate Together',
                description: 'Send wishes, share memories, or gift with one tap. Make every moment special.',
                emoji: '🎊',
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                className="relative"
                variants={staggerItem}
              >
                <motion.div
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl" />
                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground text-3xl font-bold mx-auto shadow-lifted">
                      {step.step}
                    </div>
                  </div>
                  <div className="text-5xl mb-4">{step.emoji}</div>
                  <h3 className="text-2xl font-semibold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        className="px-6 py-20 sm:px-8 lg:px-12"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={fadeIn}
      >
        <div className="mx-auto max-w-4xl">
          <motion.div 
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-accent to-primary p-12 text-center shadow-floating"
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
            <div className="relative">
              <h2 className="font-display text-4xl font-bold text-white mb-4">
                Start Celebrating Today
              </h2>
              <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
                Join CircleDay and never miss another special moment. Free to start, delightful to use.
              </p>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button asChild size="lg" variant="secondary" className="text-lg px-8 h-14 shadow-xl">
                  <Link href="/login">
                    Create Your Free Account →
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-border/50 px-6 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎉</span>
              <span className="font-semibold text-lg">CircleDay</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built with ❤️ using Next.js 16 + React 19
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
