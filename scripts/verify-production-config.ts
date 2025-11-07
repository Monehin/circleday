/**
 * Verify Production Configuration
 * Run this to check if all production environment variables are set correctly
 */

interface ConfigCheck {
  name: string
  required: boolean
  present: boolean
  value?: string
}

function checkConfig(): ConfigCheck[] {
  const checks: ConfigCheck[] = [
    // Temporal Cloud
    {
      name: 'TEMPORAL_CLOUD_ENABLED',
      required: true,
      present: !!process.env.TEMPORAL_CLOUD_ENABLED,
      value: process.env.TEMPORAL_CLOUD_ENABLED,
    },
    {
      name: 'TEMPORAL_ADDRESS',
      required: true,
      present: !!process.env.TEMPORAL_ADDRESS,
      value: process.env.TEMPORAL_ADDRESS,
    },
    {
      name: 'TEMPORAL_NAMESPACE',
      required: true,
      present: !!process.env.TEMPORAL_NAMESPACE,
      value: process.env.TEMPORAL_NAMESPACE,
    },
    {
      name: 'TEMPORAL_CLIENT_CERT',
      required: true,
      present: !!process.env.TEMPORAL_CLIENT_CERT,
      value: process.env.TEMPORAL_CLIENT_CERT ? '✅ Present (base64)' : undefined,
    },
    {
      name: 'TEMPORAL_CLIENT_KEY',
      required: true,
      present: !!process.env.TEMPORAL_CLIENT_KEY,
      value: process.env.TEMPORAL_CLIENT_KEY ? '✅ Present (base64)' : undefined,
    },
    {
      name: 'USE_TEMPORAL',
      required: true,
      present: !!process.env.USE_TEMPORAL,
      value: process.env.USE_TEMPORAL,
    },
    
    // Email (should already be configured)
    {
      name: 'RESEND_API_KEY',
      required: true,
      present: !!process.env.RESEND_API_KEY,
      value: process.env.RESEND_API_KEY ? '✅ Present' : undefined,
    },
    {
      name: 'RESEND_FROM_EMAIL',
      required: true,
      present: !!process.env.RESEND_FROM_EMAIL,
      value: process.env.RESEND_FROM_EMAIL,
    },
    
    // SMS (optional)
    {
      name: 'TWILIO_ACCOUNT_SID',
      required: false,
      present: !!process.env.TWILIO_ACCOUNT_SID,
      value: process.env.TWILIO_ACCOUNT_SID ? '✅ Present' : undefined,
    },
    {
      name: 'TWILIO_AUTH_TOKEN',
      required: false,
      present: !!process.env.TWILIO_AUTH_TOKEN,
      value: process.env.TWILIO_AUTH_TOKEN ? '✅ Present' : undefined,
    },
    
    // Database (should already be configured)
    {
      name: 'DATABASE_URL',
      required: true,
      present: !!process.env.DATABASE_URL,
      value: process.env.DATABASE_URL ? '✅ Present' : undefined,
    },
  ]
  
  return checks
}

function displayResults(checks: ConfigCheck[]) {
  console.log('\n📋 Production Configuration Check\n')
  console.log('=' .repeat(60))
  
  const required = checks.filter(c => c.required)
  const optional = checks.filter(c => !c.required)
  
  console.log('\n✅ REQUIRED Variables:\n')
  required.forEach(check => {
    const status = check.present ? '✅' : '❌'
    const value = check.value ? ` = ${check.value}` : ' = NOT SET'
    console.log(`${status} ${check.name}${value}`)
  })
  
  console.log('\n🔧 OPTIONAL Variables:\n')
  optional.forEach(check => {
    const status = check.present ? '✅' : '⚠️ '
    const value = check.value ? ` = ${check.value}` : ' = NOT SET'
    console.log(`${status} ${check.name}${value}`)
  })
  
  console.log('\n' + '='.repeat(60))
  
  const missingRequired = required.filter(c => !c.present)
  
  if (missingRequired.length === 0) {
    console.log('\n🎉 All required variables are configured!')
    console.log('✅ Your production environment is ready!')
    console.log('\nNext steps:')
    console.log('  1. Commit your changes')
    console.log('  2. Push to GitHub')
    console.log('  3. Deploy to Vercel (auto-deploy)')
    console.log('  4. Setup VPS for worker (optional)\n')
  } else {
    console.log('\n❌ Missing required variables:')
    missingRequired.forEach(check => {
      console.log(`   - ${check.name}`)
    })
    console.log('\nPlease set these in:')
    console.log('  - Vercel: Settings → Environment Variables')
    console.log('  - Or .env.production file\n')
  }
}

// Run the check
const checks = checkConfig()
displayResults(checks)

