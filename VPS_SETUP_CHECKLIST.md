# 🖥️ VPS Worker Setup Checklist

This guide shows you **exactly** what needs to be configured on your VPS for the Temporal worker.

---

## 📋 Two Types of Configuration

### 1. **GitHub Actions Secrets** (for deployment)
These are set in GitHub → Settings → Secrets:

- `WORKER_HOST` - Your VPS IP/hostname
- `WORKER_SSH_KEY` - SSH private key

**Purpose:** Allows GitHub Actions to SSH into your VPS and deploy.

---

### 2. **Worker Environment Variables** (on VPS)
These are set in `.env.production` **on your VPS server**.

**Purpose:** The worker needs these to connect to Temporal Cloud, Database, Email/SMS services.

---

## 🔧 VPS Setup Steps

### Step 1: Initial VPS Setup

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

---

### Step 2: Clone Repository

```bash
# Create directory
mkdir -p /opt/circleday-worker
cd /opt/circleday-worker

# Clone your repo
git clone git@github.com:your-username/circleday.git .

# Or if using HTTPS
git clone https://github.com/your-username/circleday.git .
```

---

### Step 3: Create `.env.production` File

This is the **critical step**! Create this file on your VPS:

```bash
cd /opt/circleday-worker
nano .env.production
```

**Copy this template and fill in your values:**

```bash
# ===========================================
# CircleDay Worker - Production Configuration
# ===========================================

# ----- Environment -----
NODE_ENV=production

# ----- Temporal Cloud -----
TEMPORAL_CLOUD_ENABLED=true
TEMPORAL_ADDRESS=your-namespace.account.tmprl.cloud:7233
TEMPORAL_NAMESPACE=circleday-prod

# Authentication (use API Key - simpler!)
TEMPORAL_API_KEY=tmprl-your-api-key-here

# Alternative: mTLS Certificates (if you prefer)
# TEMPORAL_CLIENT_CERT=base64_encoded_cert
# TEMPORAL_CLIENT_KEY=base64_encoded_key

# ----- Database -----
DATABASE_URL=postgresql://user:password@your-db-host:5432/circleday

# ----- Email (Resend) -----
RESEND_API_KEY=re_your_production_key
RESEND_FROM_EMAIL=CircleDay <hello@yourdomain.com>

# ----- SMS (Twilio - Optional) -----
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_production_token
TWILIO_PHONE_NUMBER=+1234567890

# ----- App Settings -----
USE_TEMPORAL=true
NEXT_PUBLIC_APP_URL=https://circleday.app
```

**Save and exit:** `Ctrl+X`, then `Y`, then `Enter`

---

### Step 4: Secure Your Secrets (Recommended)

**Option A: File Permissions**

```bash
# Restrict access to root only
chmod 600 .env.production
chown root:root .env.production
```

**Option B: git-secret (Advanced)**

```bash
# Install git-secret
apt install git-secret -y

# Initialize
cd /opt/circleday-worker
git secret init

# Import your GPG key (from your local machine)
# On local: gpg --export-secret-keys your@email.com > private.key
# Upload to VPS, then:
gpg --import private.key

# Tell git-secret who you are
git secret tell your@email.com

# Add the file
git secret add .env.production

# Encrypt it
git secret hide

# Now .env.production.secret is encrypted
# To decrypt when needed:
git secret reveal
```

---

### Step 5: Test Configuration

**Verify environment variables are loaded:**

```bash
# Check if Docker can read the file
docker run --rm --env-file .env.production alpine printenv | grep TEMPORAL

# You should see:
# TEMPORAL_CLOUD_ENABLED=true
# TEMPORAL_ADDRESS=...
# etc.
```

---

### Step 6: Start Worker

```bash
cd /opt/circleday-worker

# Pull/build image
docker-compose pull worker
# Or if building locally:
# docker-compose build worker

# Start worker
docker-compose up -d worker

# Check logs
docker-compose logs -f worker
```

**You should see:**

```
✓ Connected to Temporal server
✓ Worker created successfully
🎯 Listening on task queue: circleday-tasks
🔄 Worker is polling for tasks...
```

---

## ✅ Verification Checklist

After setup, verify everything works:

### 1. **Worker is Running**

```bash
docker-compose ps

# Should show:
# NAME                 STATUS
# circleday-worker     Up X minutes (healthy)
```

### 2. **Connected to Temporal Cloud**

```bash
docker-compose logs worker | grep "Connected to Temporal"

# Should show:
# ✓ Connected to Temporal server
```

### 3. **No Errors in Logs**

```bash
docker-compose logs --tail=50 worker

# Check for errors
```

### 4. **Test from Your App**

In your CircleDay app (Vercel), trigger a test reminder:
- Click "Test Reminder" button
- Check worker logs: `docker-compose logs -f worker`
- You should see the workflow being processed!

---

## 🔍 Where Each Variable is Used

| Variable | Used By | Purpose |
|----------|---------|---------|
| `TEMPORAL_ADDRESS` | Worker | Connect to Temporal Cloud |
| `TEMPORAL_NAMESPACE` | Worker | Which namespace to use |
| `TEMPORAL_API_KEY` | Worker | Authentication |
| `DATABASE_URL` | Worker (activities) | Log reminder sends |
| `RESEND_API_KEY` | Worker (activities) | Send emails |
| `TWILIO_*` | Worker (activities) | Send SMS |

---

## 📊 Quick Status Commands

**Check worker status:**
```bash
cd /opt/circleday-worker
docker-compose ps
```

**View live logs:**
```bash
docker-compose logs -f worker
```

**Restart worker:**
```bash
docker-compose restart worker
```

**Stop worker:**
```bash
docker-compose down
```

**Update worker (pull new code):**
```bash
git pull origin main
docker-compose pull worker
docker-compose up -d worker
```

---

## 🆘 Troubleshooting

### **Worker Fails to Start**

```bash
# Check logs for errors
docker-compose logs worker

# Common issues:
# 1. Missing environment variables
# 2. Wrong DATABASE_URL format
# 3. Invalid Temporal credentials
```

### **Can't Connect to Temporal Cloud**

```bash
# Verify API key
echo $TEMPORAL_API_KEY

# Test connection manually
docker run --rm --env-file .env.production \
  alpine printenv | grep TEMPORAL
```

### **Database Connection Failed**

```bash
# Verify DATABASE_URL format:
# postgresql://username:password@host:5432/database

# Test connection
docker run --rm --env-file .env.production \
  postgres:15-alpine \
  psql $DATABASE_URL -c "SELECT 1"
```

---

## 🔐 Security Best Practices

1. ✅ **Never commit `.env.production` to Git**
   ```bash
   # Add to .gitignore
   echo ".env.production" >> .gitignore
   ```

2. ✅ **Use different credentials per environment**
   - Development: `.env.local`
   - Production (Vercel): Vercel env vars
   - Production (Worker): `.env.production` on VPS

3. ✅ **Rotate secrets regularly**
   - Temporal API keys: Every 90 days
   - Database passwords: Every 6 months
   - API keys: When team members leave

4. ✅ **Restrict file permissions**
   ```bash
   chmod 600 .env.production
   ```

5. ✅ **Use firewall**
   ```bash
   # Only allow SSH and required ports
   ufw allow 22/tcp
   ufw enable
   ```

---

## 📚 Related Files

- **`.env.production`** (template in repo) - Copy and customize this
- **`docker-compose.yml`** - Docker configuration (uses `.env.production`)
- **`Dockerfile.worker`** - Worker image definition
- **`.github/workflows/build-and-deploy-worker.yml`** - Deployment automation

---

## 🎯 Summary

**GitHub Secrets (2):**
- `WORKER_HOST` - For SSH deployment
- `WORKER_SSH_KEY` - For SSH deployment

**VPS Environment Variables (~10):**
All in `.env.production` file on your VPS:
- Temporal Cloud settings (3-4 vars)
- Database URL (1 var)
- Email API key (2 vars)
- SMS credentials (3 vars, optional)
- App settings (2 vars)

**That's it!** Once configured, GitHub Actions handles the rest! 🚀

---

**Next:** Follow `TEMPORAL_API_KEY_SETUP.md` to get your Temporal credentials, then come back here to set up your VPS! ✅

