'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Subtle Background Pattern */}
      <div className="fixed inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.5) 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      {/* Hero Section */}
      <motion.section 
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="relative overflow-hidden px-6 py-32 sm:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-6xl">
          <motion.div variants={fadeIn} className="text-center max-w-3xl mx-auto">
            <div className="mb-8 inline-block px-4 py-1.5 bg-primary/5 rounded-full border border-primary/10">
              <span className="text-sm font-medium text-primary">
                Never miss what matters
              </span>
            </div>
            
            <h1 className="font-display text-6xl font-bold tracking-tight text-foreground mb-6 leading-tight">
              Celebrate every
              <span className="block text-primary mt-2">special moment</span>
            </h1>
            
            <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
              Elegant reminder system for birthdays, anniversaries, and 
              meaningful occasions. Never forget who matters most.
            </p>
            
            <div className="flex gap-4 justify-center">
              <Button asChild size="lg" className="px-8">
                <Link href="/login">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8">
                <Link href="/login">Sign In</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Grid */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={stagger}
        className="px-6 py-24 sm:px-8 lg:px-12 bg-muted/30"
      >
        <div className="mx-auto max-w-6xl">
          <motion.div variants={fadeIn} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Designed for what matters
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Thoughtfully crafted to help you maintain meaningful connections
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Smart Reminders',
                description: 'Timezone-aware notifications delivered at the perfect moment, wherever you are in the world.'
              },
              {
                title: 'Group Coordination',
                description: 'Organize celebrations with family and friends. Share wishes and coordinate seamlessly.'
              },
              {
                title: 'Secure & Private',
                description: 'Your data stays yours. Enterprise-grade security with magic link authentication.'
              }
            ].map((feature, i) => (
              <motion.div key={i} variants={fadeIn}>
                <Card className="p-8 h-full border-border/50 bg-card/50 hover:border-primary/20 transition-all duration-300 hover:shadow-lifted">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 mb-6 flex items-center justify-center">
                    <div className="w-6 h-6 rounded bg-primary/20" />
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

      {/* Process Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={stagger}
        className="px-6 py-24 sm:px-8 lg:px-12"
      >
        <div className="mx-auto max-w-5xl">
          <motion.div variants={fadeIn} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Simple, elegant workflow
            </h2>
          </motion.div>

          <div className="space-y-12">
            {[
              { number: '01', title: 'Add your circle', description: 'Import or add birthdays, anniversaries, and special dates' },
              { number: '02', title: 'Set preferences', description: 'Customize timing, message templates, and notification channels' },
              { number: '03', title: 'Stay connected', description: 'Receive timely reminders and never miss a special moment' }
            ].map((step, i) => (
              <motion.div key={i} variants={fadeIn} className="flex items-start gap-8">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">{step.number}</span>
                  </div>
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-2xl font-semibold mb-2 text-foreground">{step.title}</h3>
                  <p className="text-lg text-muted-foreground">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeIn}
        className="px-6 py-24 sm:px-8 lg:px-12 bg-primary/5"
      >
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Ready to get started?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join CircleDay today and never miss another meaningful moment.
          </p>
          <Button asChild size="lg" className="px-8">
            <Link href="/login">
              Create your account
            </Link>
          </Button>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="border-t border-border/50 px-6 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="font-semibold text-lg">CircleDay</div>
            <p className="text-sm text-muted-foreground">
              © 2024 CircleDay. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
