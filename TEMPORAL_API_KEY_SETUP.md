# 🔑 Temporal Cloud API Key Setup (Recommended)

**Quick setup guide for the simpler authentication method!**

---

## 🎯 Why API Keys?

✅ **Simple** - Just one string to copy  
✅ **No encoding** - No base64, no certificates  
✅ **Easy rotation** - Generate new keys anytime  
✅ **Same security** - Just as secure as mTLS  

---

## 📋 Step-by-Step

### 1. **Go to Temporal Cloud**

1. Login to https://cloud.temporal.io
2. Select your namespace (e.g., `circleday-prod`)
3. Go to **Settings** → **API Keys**

### 2. **Enable API Key Authentication**

1. Click **"Enable API Key authentication"**
2. Confirm the prompt

### 3. **Generate an API Key**

1. Click **"Generate API Key"**
2. Give it a name (e.g., `circleday-vercel` or `circleday-worker`)
3. Click **"Generate"**
4. **Copy the key immediately** (you can't see it again!)

The key looks like: `tmprl-abc123xyz...` (long string)

### 4. **Add to Vercel**

In your terminal:

```bash
vercel env add TEMPORAL_API_KEY
```

When prompted, paste your API key.

Or via Vercel dashboard:
1. Go to your project → Settings → Environment Variables
2. Add `TEMPORAL_API_KEY` with your key
3. Select all environments (Production, Preview, Development)

### 5. **Add to Worker (VPS)**

Update your `.env.production` file:

```bash
TEMPORAL_API_KEY=tmprl-your-key-here
```

If using `git-secret`:

```bash
# Edit the encrypted file
git secret reveal
nano .env.production

# Add:
TEMPORAL_API_KEY=tmprl-your-key-here

# Re-encrypt
git secret hide
```

---

## 🧪 Test Locally

Add to your `.env.local`:

```bash
TEMPORAL_CLOUD_ENABLED=true
TEMPORAL_ADDRESS=your-namespace.account.tmprl.cloud:7233
TEMPORAL_NAMESPACE=name-prod
TEMPORAL_API_KEY=tmprl-your-key-here
```

Then test:

```bash
npm run temporal:test-reminder
```

---

## ✅ Environment Variables Summary

```bash
# Required
TEMPORAL_CLOUD_ENABLED=true
TEMPORAL_ADDRESS=your-namespace.account.tmprl.cloud:7233
TEMPORAL_NAMESPACE=your-namespace
TEMPORAL_API_KEY=tmprl-your-key-here

# Optional (already set)
USE_TEMPORAL=true
```

---

## 🔒 Security Best Practices

1. **Never commit API keys** to Git
2. **Use different keys** for different environments (Vercel, Worker)
3. **Rotate keys** every 90 days
4. **Revoke old keys** when rotating
5. **Use git-secret** for worker `.env.production`

---

## 🔄 Rotating Keys

To rotate (recommended every 90 days):

1. Generate a new API key in Temporal Cloud
2. Add the new key to Vercel/VPS
3. Deploy/restart services
4. Verify everything works
5. Delete the old key in Temporal Cloud

---

## 🆘 Troubleshooting

### **Connection Error**

```
Error: invalid api key
```

**Fix:** Check that:
- `TEMPORAL_CLOUD_ENABLED=true`
- `TEMPORAL_API_KEY` is set correctly
- Key hasn't been revoked
- Key was copied completely (no extra spaces)

### **Still using certificates?**

Remove these if you switched to API keys:
```bash
# Delete or comment out:
# TEMPORAL_CLIENT_CERT=...
# TEMPORAL_CLIENT_KEY=...
```

The code will automatically use API key if it's present!

---

## 📚 Related Docs

- Full production guide: `TEMPORAL_PRODUCTION.md`
- Certificate setup (alternative): `scripts/encode-temporal-certs.sh`
- Local testing: `README.md#temporal-workflows`

---

**That's it! Much simpler than certificates! 🎉**

