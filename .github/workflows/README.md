# GitHub Actions Workflows

This directory contains automated CI/CD workflows for CircleDay.

## 📋 Active Workflows

### 1. **Build & Deploy Worker** (`build-and-deploy-worker.yml`)

**Triggers:**
- Push to `main` branch (when worker files change)
- Manual trigger via GitHub Actions UI

**What it does:**
1. Builds Docker image for Temporal worker
2. Pushes to GitHub Container Registry (ghcr.io)
3. SSH into VPS server
4. Pulls new image
5. Restarts worker with zero downtime

**Required Secrets:**
- `WORKER_HOST` - Your VPS IP address or hostname
- `WORKER_SSH_KEY` - Private SSH key for VPS access

**Setup Guide:** See `../SETUP_GITHUB_REGISTRY.md`

---

### 2. **Test Temporal Workflows** (`test-temporal.yml`)

**Triggers:**
- Push to `main` (when workflow code changes)
- Pull requests (when workflow code changes)
- Manual trigger

**What it does:**
- Runs Temporal workflow unit tests
- Ensures workflows are working correctly

---

## 🔐 Setting Up Secrets

### 1. **Get Your VPS Host**

Your VPS IP address or hostname:
```bash
# Example:
WORKER_HOST=123.45.67.89

# Or with domain:
WORKER_HOST=worker.circleday.app
```

### 2. **Generate SSH Key**

On your VPS server:

```bash
# Generate a deployment key
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy

# Add to authorized_keys
cat ~/.ssh/github_deploy.pub >> ~/.ssh/authorized_keys

# Copy private key (this goes to GitHub Secrets)
cat ~/.ssh/github_deploy
```

### 3. **Add Secrets to GitHub**

1. Go to your repo → **Settings** → **Secrets and variables** → **Actions**
2. Click **"New repository secret"**
3. Add these secrets:

**WORKER_HOST:**
```
123.45.67.89
```

**WORKER_SSH_KEY:**
```
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAACmFlczI1Ni1jdHIAAAAGYmNyeXB0AAAAGAAAABDUYj...
[full private key content]
-----END OPENSSH PRIVATE KEY-----
```

---

## 🚀 Manual Deployment

To trigger a deployment manually:

1. Go to **Actions** tab in GitHub
2. Select **"Build & Deploy Worker to VPS"**
3. Click **"Run workflow"**
4. Select branch (usually `main`)
5. Click **"Run workflow"**

---

## 🔧 Workflow Configuration

### Environment Variables Used

The workflows use these environment variables:

**From Repository:**
- `GITHUB_TOKEN` - Automatically provided by GitHub
- `GITHUB_ACTOR` - Your GitHub username
- `GITHUB_REPOSITORY` - Your repo path (e.g., `username/circleday`)

**From Secrets:**
- `WORKER_HOST` - VPS server address
- `WORKER_SSH_KEY` - SSH private key

**On VPS (in `.env.production`):**
- All Temporal Cloud settings
- Database credentials
- Email/SMS API keys

---

## 📊 Monitoring

### Check Workflow Status

**In GitHub:**
1. Go to **Actions** tab
2. See recent workflow runs
3. Click any run for detailed logs

**On VPS:**
```bash
# SSH into your server
ssh root@your-vps-ip

# Check worker status
cd /opt/circleday-worker
docker compose ps
docker compose logs --tail=50 worker
```

---

## 🆘 Troubleshooting

### **Deployment Fails: SSH Permission Denied**

**Fix:**
1. Verify `WORKER_SSH_KEY` is correct (full private key)
2. Check that public key is in `~/.ssh/authorized_keys` on VPS
3. Test SSH manually: `ssh -i ~/.ssh/github_deploy root@your-vps-ip`

### **Deployment Fails: Docker Login**

**Fix:**
1. Ensure GitHub Container Registry is enabled
2. Check that workflow has `packages: write` permission
3. Verify repo visibility settings

### **Worker Not Starting After Deploy**

**Fix:**
```bash
# SSH into VPS
ssh root@your-vps-ip
cd /opt/circleday-worker

# Check logs
docker compose logs worker

# Manually restart
docker compose restart worker
```

### **Image Not Found**

**Fix:**
1. Check that build step completed successfully
2. Verify image name in `docker-compose.yml` matches GitHub repo
3. Make package public or ensure login credentials are correct

---

## 📚 Related Documentation

- **VPS Setup:** `../TEMPORAL_PRODUCTION.md`
- **Quick Deploy Guide:** `../SETUP_GITHUB_REGISTRY.md`
- **Temporal Configuration:** `../TEMPORAL_API_KEY_SETUP.md`
- **Local Development:** `../README.md`

---

## 🔄 Workflow Updates

To modify workflows:

1. Edit `.yml` files in this directory
2. Commit and push to `main`
3. Workflows will use the new configuration on next trigger

**Best Practice:** Test workflow changes in a feature branch first!

---

**Need Help?** Check the [GitHub Actions docs](https://docs.github.com/en/actions) or open an issue.
