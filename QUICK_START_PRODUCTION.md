# 🚀 Quick Start: Production Deployment

**Get CircleDay running in production in 30 minutes!**

---

## 📋 Prerequisites

- [ ] GitHub account (for code hosting)
- [ ] Vercel account (for Next.js app)
- [ ] VPS account (Hetzner, DigitalOcean, etc.)
- [ ] Temporal Cloud account (90-day free trial)
- [ ] Neon account (for PostgreSQL database)
- [ ] Resend account (for emails)

---

## 🎯 Step-by-Step (30 minutes)

### 1️⃣ **Deploy Next.js to Vercel** (5 minutes)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd /path/to/circleday
vercel

# Follow prompts, link to your GitHub repo
```

**Or use Vercel Dashboard:**
1. Go to https://vercel.com/new
2. Import your GitHub repo
3. Click "Deploy"

---

### 2️⃣ **Setup Temporal Cloud** (10 minutes)

**Follow:** `TEMPORAL_API_KEY_SETUP.md`

Quick version:
1. Sign up at https://cloud.temporal.io
2. Create namespace (e.g., `circleday-prod`)
3. Enable API Key authentication
4. Generate API key
5. Copy the key (starts with `tmprl-...`)

---

### 3️⃣ **Configure Vercel Environment** (5 minutes)

Add these in Vercel → Settings → Environment Variables:

```bash
# Database
DATABASE_URL=postgresql://...

# Temporal Cloud
TEMPORAL_CLOUD_ENABLED=true
TEMPORAL_ADDRESS=your-namespace.account.tmprl.cloud:7233
TEMPORAL_NAMESPACE=circleday-prod
TEMPORAL_API_KEY=tmprl-your-key-here

# Email
RESEND_API_KEY=re_your_key
RESEND_FROM_EMAIL=CircleDay <hello@yourdomain.com>

# Auth
BETTER_AUTH_SECRET=your-32-char-secret-here
BETTER_AUTH_URL=https://your-app.vercel.app

# App
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
USE_TEMPORAL=true
```

**Redeploy** after adding environment variables!

---

### 4️⃣ **Setup VPS Worker** (10 minutes)

**Follow:** `VPS_SETUP_CHECKLIST.md`

Quick version:

**A) Create VPS:**
- Provider: Hetzner, DigitalOcean, Linode, etc.
- Size: $5-10/month (2GB RAM minimum)
- OS: Ubuntu 22.04 LTS

**B) Install Docker:**
```bash
ssh root@your-vps-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y
```

**C) Clone and configure:**
```bash
# Clone repo
mkdir -p /opt/circleday-worker
cd /opt/circleday-worker
git clone https://github.com/your-username/circleday.git .

# Create .env.production (copy from template, fill in values)
nano .env.production

# Start worker
docker-compose up -d worker

# Check logs
docker-compose logs -f worker
```

**D) Setup GitHub Actions:**
1. Generate SSH key on VPS:
   ```bash
   ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/github_deploy
   cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys
   cat ~/.ssh/github_deploy  # Copy this
   ```

2. Add secrets to GitHub:
   - Repo → Settings → Secrets → Actions
   - Add `WORKER_HOST` (your VPS IP)
   - Add `WORKER_SSH_KEY` (private key from above)

---

## ✅ Verification

### **1. Check Vercel Deployment**

Visit your app: `https://your-app.vercel.app`

- [ ] App loads
- [ ] Can sign in
- [ ] Dashboard shows

### **2. Check Worker**

SSH into VPS:
```bash
ssh root@your-vps-ip
cd /opt/circleday-worker
docker-compose logs --tail=50 worker
```

Look for:
- [ ] "Connected to Temporal server" ✅
- [ ] "Worker is polling for tasks" ✅
- [ ] No errors ❌

### **3. Test End-to-End**

In your app:
1. Click "Test Reminder" button
2. Wait 5 seconds
3. Check your email! 📧

**If it works:** 🎉 **You're done!**

---

## 🎯 Architecture Overview

```
┌─────────────────────────────────────────────────┐
│                    Internet                      │
└─────────────────────────────────────────────────┘
                      │
        ┌─────────────┴──────────────┐
        │                            │
   ┌────▼─────┐              ┌──────▼──────┐
   │  Vercel  │              │ Temporal    │
   │ (Next.js)│◄────────────►│   Cloud     │
   └────┬─────┘              └──────▲──────┘
        │                           │
        │                    ┌──────┴──────┐
        │                    │     VPS     │
        │                    │   (Worker)  │
        │                    └─────────────┘
        │
   ┌────▼─────┐
   │   Neon   │
   │(Database)│
   └──────────┘
```

**Flow:**
1. User visits Vercel app
2. App schedules workflows → Temporal Cloud
3. Worker (VPS) polls Temporal Cloud
4. Worker executes activities (send email/SMS)
5. Worker logs to Database

---

## 📊 Monitoring

### **Check Worker Status**

```bash
# From local machine
ssh root@your-vps-ip "cd /opt/circleday-worker && docker-compose ps"
```

### **View Workflows in Temporal Cloud**

1. Go to https://cloud.temporal.io
2. Select your namespace
3. Click "Workflows"
4. See all scheduled reminders! 🎉

### **Check Vercel Logs**

1. Go to Vercel Dashboard
2. Your project → Deployments
3. Click latest deployment → View Function Logs

---

## 🆘 Common Issues

### **Worker Not Connecting to Temporal**

**Check:**
```bash
# On VPS
cd /opt/circleday-worker
cat .env.production | grep TEMPORAL

# Verify:
# - TEMPORAL_API_KEY is set
# - TEMPORAL_ADDRESS is correct
# - TEMPORAL_NAMESPACE matches Temporal Cloud
```

### **App Can't Connect to Database**

**Check:**
```bash
# In Vercel → Environment Variables
# Verify DATABASE_URL format:
postgresql://username:password@host:5432/database
```

### **Emails Not Sending**

**Check:**
1. Resend API key is valid
2. Sender email is verified in Resend
3. Check Resend dashboard for send logs

---

## 📚 Next Steps

Once everything is working:

1. **Setup Custom Domain**
   - Add domain to Vercel
   - Update `NEXT_PUBLIC_APP_URL`
   - Update `BETTER_AUTH_URL`

2. **Add Monitoring**
   - Setup uptime monitoring (UptimeRobot, Better Stack)
   - Add error tracking (Sentry)
   - Configure log aggregation

3. **Optimize Performance**
   - Enable Vercel Analytics
   - Setup CDN for assets
   - Configure caching

4. **Security Hardening**
   - Enable VPS firewall
   - Setup automatic security updates
   - Rotate secrets quarterly

5. **Backup Strategy**
   - Neon automatic backups (built-in)
   - Export user data weekly
   - Document recovery procedures

---

## 📖 Detailed Guides
 
- **Temporal Setup:** `TEMPORAL_API_KEY_SETUP.md`
- **VPS Configuration:** `VPS_SETUP_CHECKLIST.md`
- **Deployment Automation:** `.github/workflows/README.md`
- **Complete Production Guide:** `DEPLOYMENT.md`

---

## 🎉 Success!

Your CircleDay app is now running in production with:

- ✅ Scalable Next.js app on Vercel
- ✅ Durable workflows on Temporal Cloud
- ✅ Dedicated worker on your VPS
- ✅ Automatic deployments via GitHub Actions
- ✅ Production-grade database on Neon

**Time to celebrate! 🎈**

Need help? Open an issue or check the docs!

