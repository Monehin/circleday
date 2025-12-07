# Production Deployment Guide

Complete guide for deploying CircleDay to production.

## Architecture Overview

```
┌──────────┐     ┌──────────────┐     ┌─────────┐
│  Vercel  │────►│ Temporal     │◄────│   VPS   │
│(Next.js) │     │   Cloud      │     │(Worker) │
└────┬─────┘     └──────────────┘     └─────────┘
     │
     │
┌────▼─────┐
│   Neon   │
│(Database)│
└──────────┘
```

- **Vercel**: Hosts the Next.js application
- **Temporal Cloud**: Orchestrates durable workflows
- **VPS Worker**: Executes workflows (sends emails/SMS)
- **Neon**: PostgreSQL database

---

## Prerequisites

- GitHub account (code hosting)
- Vercel account (Next.js hosting)
- VPS server (any provider: Hetzner, DigitalOcean, Linode, etc.)
- Temporal Cloud account (90-day free trial)
- Neon account (PostgreSQL)
- Resend account (email)
- Twilio account (SMS, optional)

---

## Step 1: Database Setup (Neon)

1. Sign up at https://neon.tech
2. Create a new project: `circleday-prod`
3. Copy the connection string
4. Run migrations:

```bash
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

---

## Step 2: Temporal Cloud Setup

### Enable API Key Authentication

1. Go to https://cloud.temporal.io
2. Create a namespace: `circleday-prod`
3. Go to Settings → API Keys
4. Click "Enable API Key authentication"
5. Click "Generate API Key"
6. Copy the key (starts with `tmprl-`)

**Save this key securely!** You'll need it for both Vercel and VPS.

---

## Step 3: Deploy Next.js to Vercel

### Option A: Vercel CLI

```bash
npm i -g vercel
cd /path/to/circleday
vercel --prod
```

### Option B: Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Click "Deploy"

### Add Environment Variables

In Vercel → Settings → Environment Variables:

```bash
# Database
DATABASE_URL=postgresql://user:pass@host/db

# Temporal Cloud
TEMPORAL_CLOUD_ENABLED=true
TEMPORAL_ADDRESS=circleday-prod.abc123.tmprl.cloud:7233
TEMPORAL_NAMESPACE=circleday-prod
TEMPORAL_API_KEY=tmprl-your-api-key-here

# Email
RESEND_API_KEY=re_your_key
RESEND_FROM_EMAIL=CircleDay <hello@yourdomain.com>

# SMS (optional)
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

# Auth
BETTER_AUTH_SECRET=generate-32-char-secret
BETTER_AUTH_URL=https://your-app.vercel.app

# App
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
USE_TEMPORAL=true
```

**Redeploy** after adding environment variables.

---

## Step 4: VPS Worker Setup

### 4.1 Create VPS

**Recommended providers:**
- Hetzner (~$5/month, EU-based)
- DigitalOcean (~$6/month)
- Linode (~$5/month)
- Vultr (~$5/month)

**Minimum specs:** 2GB RAM, 1 CPU, 20GB storage

**OS:** Ubuntu 22.04 LTS

### 4.2 Install Docker

SSH into your VPS:

```bash
ssh root@your-vps-ip
```

Install Docker:

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose -y

# Verify
docker --version
docker-compose --version
```

### 4.3 Clone Repository

```bash
mkdir -p /opt/circleday-worker
cd /opt/circleday-worker
git clone https://github.com/your-username/circleday.git .
```

### 4.4 Configure Environment

Create `.env.production`:

```bash
nano .env.production
```

Add configuration:

```bash
# Environment
NODE_ENV=production

# Temporal Cloud
TEMPORAL_CLOUD_ENABLED=true
TEMPORAL_ADDRESS=your-namespace.account.tmprl.cloud:7233
TEMPORAL_NAMESPACE=name-prod
TEMPORAL_API_KEY=tmprl-your-api-key-here

# Database
DATABASE_URL=postgresql://user:pass@host:5432/circleday

# Email
RESEND_API_KEY=re_your_production_key
RESEND_FROM_EMAIL=CircleDay <hello@yourdomain.com>

# SMS (optional)
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890

# App
USE_TEMPORAL=true
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

Secure the file:

```bash
chmod 600 .env.production
```

### 4.5 Start Worker

```bash
docker-compose up -d worker
```

Check logs:

```bash
docker-compose logs -f worker
```

You should see:
```
✓ Connected to Temporal server
✓ Worker created successfully
🎯 Listening on task queue: circleday-tasks
🔄 Worker is polling for tasks...
```

---

## Step 5: Setup GitHub Actions (Auto-Deploy)

### 5.1 Generate SSH Key on VPS

```bash
ssh-keygen -t ed25519 -C "github-deploy" -f ~/.ssh/github_deploy
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys
cat ~/.ssh/github_deploy  # Copy this private key
```

### 5.2 Add GitHub Secrets

In your GitHub repo:

1. Go to Settings → Secrets and variables → Actions
2. Click "New repository secret"

Add these secrets:

**WORKER_HOST:**
```
your-vps-ip-address
```

**WORKER_SSH_KEY:**
```
-----BEGIN OPENSSH PRIVATE KEY-----
[paste entire private key from above]
-----END OPENSSH PRIVATE KEY-----
```

### 5.3 Test Deployment

Push to `main` branch - GitHub Actions will:
1. Build Docker image
2. Push to GitHub Container Registry
3. SSH into VPS
4. Pull new image
5. Restart worker

Check workflow: GitHub → Actions tab

---

## Verification

### 1. Check Vercel App

Visit `https://your-app.vercel.app`

- [ ] App loads successfully
- [ ] Can create account
- [ ] Dashboard accessible

### 2. Check Worker Status

```bash
ssh root@your-vps-ip
cd /opt/circleday-worker
docker-compose ps
```

Should show:
```
NAME                 STATUS
circleday-worker     Up (healthy)
```

### 3. Check Logs

```bash
docker-compose logs --tail=50 worker
```

Look for:
- ✅ "Connected to Temporal server"
- ✅ No errors

### 4. Test End-to-End

In your app:
1. Click "Test Reminder" button
2. Wait 5-10 seconds
3. Check your email 📧

**Success!** 🎉

---

## Monitoring

### Worker Status

```bash
# Quick status
ssh root@your-vps-ip "docker ps"

# View logs
ssh root@your-vps-ip "docker-compose -f /opt/circleday-worker/docker-compose.yml logs --tail=100 worker"
```

### Temporal Cloud Dashboard

1. Go to https://cloud.temporal.io
2. Select your namespace
3. View workflows, metrics, and execution history

### Vercel Logs

1. Vercel Dashboard → Your Project
2. Deployments → Latest
3. View Function Logs

---

## Troubleshooting

### Worker Not Connecting

**Check environment variables:**
```bash
ssh root@your-vps-ip
cd /opt/circleday-worker
cat .env.production | grep TEMPORAL
```

**Restart worker:**
```bash
docker-compose restart worker
docker-compose logs -f worker
```

### Database Connection Failed

**Verify DATABASE_URL format:**
```
postgresql://username:password@host:5432/database
```

**Test connection:**
```bash
docker run --rm --env-file .env.production postgres:15-alpine \
  psql $DATABASE_URL -c "SELECT 1"
```

### Emails Not Sending

1. Check Resend API key is valid
2. Verify sender email is verified in Resend dashboard
3. Check Resend logs for delivery status

### GitHub Actions Failing

**SSH Permission Denied:**
- Verify `WORKER_SSH_KEY` contains full private key
- Check public key is in `~/.ssh/authorized_keys` on VPS
- Test manually: `ssh -i ~/.ssh/github_deploy root@your-vps-ip`

**Docker Login Failed:**
- Ensure workflow has `packages: write` permission
- Check repo visibility settings

---

## Maintenance

### Update Worker

Automatic (via GitHub Actions):
```bash
git push origin main  # Auto-deploys
```

Manual:
```bash
ssh root@your-vps-ip
cd /opt/circleday-worker
git pull origin main
docker-compose pull worker
docker-compose up -d worker
```

### View Logs

```bash
docker-compose logs -f worker
```

### Restart Worker

```bash
docker-compose restart worker
```

### Stop Worker

```bash
docker-compose down
```

---

## Security Best Practices

1. **Firewall**: Enable UFW and allow only SSH
   ```bash
   ufw allow 22/tcp
   ufw enable
   ```

2. **SSH Keys**: Disable password authentication
   ```bash
   nano /etc/ssh/sshd_config
   # Set: PasswordAuthentication no
   systemctl restart sshd
   ```

3. **Automatic Updates**: Enable unattended-upgrades
   ```bash
   apt install unattended-upgrades
   dpkg-reconfigure -plow unattended-upgrades
   ```

4. **Rotate Secrets**: Every 90 days
   - Temporal API keys
   - Database passwords
   - Email API keys

5. **File Permissions**: Restrict .env files
   ```bash
   chmod 600 .env.production
   ```

---

## Backup Strategy

### Database (Neon)
- Automatic daily backups (built-in)
- Point-in-time recovery available
- Manual backups: Neon Dashboard → Backups

### Configuration
- Store `.env.production` securely
- Use git-secret for encrypted config storage
- Document all environment variables

---

## Scaling

### VPS Scaling

**Vertical scaling (increase resources):**
- Upgrade to 4GB RAM for higher loads
- Add CPU cores if workflow execution slows

**Horizontal scaling (multiple workers):**
- Deploy workers to multiple VPS instances
- All point to same Temporal namespace
- Temporal handles load balancing automatically

### Database Scaling

Neon offers:
- Auto-scaling compute
- Connection pooling
- Read replicas (on paid plans)

---

## Next Steps

After successful deployment:

1. **Custom Domain**: Configure in Vercel settings
2. **Monitoring**: Setup uptime monitoring (UptimeRobot, Better Stack)
3. **Error Tracking**: Add Sentry integration
4. **Analytics**: Enable Vercel Analytics
5. **Backups**: Document recovery procedures

---

## Support

- **Issues**: https://github.com/your-username/circleday/issues
- **Temporal Docs**: https://docs.temporal.io
- **Vercel Docs**: https://vercel.com/docs

---

**Deployment complete!** Your CircleDay instance is now running in production. 🚀

