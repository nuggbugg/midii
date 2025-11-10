# Railway Deployment Guide

## Quick Setup

Railway will automatically detect and deploy your Next.js + Python app.

### Step 1: Sign up for Railway
Go to https://railway.app and sign up (free plan available)

### Step 2: Deploy via GitHub (Recommended)

1. **Push your code to GitHub** (if not already there):
   ```bash
   git add .
   git commit -m "Prepare for Railway deployment"
   git push origin main
   ```

2. **Connect to Railway**:
   - Go to https://railway.app/new
   - Click "Deploy from GitHub repo"
   - Select your repository
   - Click "Deploy Now"

3. **Add Environment Variable**:
   - Go to your project in Railway dashboard
   - Click on "Variables" tab
   - Add: `ELEVENLABS_API_KEY` with value: `sk_af95ca89cc7ec4780a08a6933149d45fb5da4ae4a4a6dc66`
   - Click "Add"

4. **Done!** Railway will:
   - Install Node.js dependencies
   - Install Python dependencies from requirements.txt
   - Build your Next.js app
   - Deploy with both working together

### Step 3: Get your Railway URL

Once deployed, Railway will give you a URL like:
`https://your-app.up.railway.app`

---

## Alternative: Deploy via Railway CLI

If you want to use CLI:

```bash
# Install Railway CLI (on your local machine with admin access)
npm install -g railway

# Login
railway login

# Link to project
railway link

# Deploy
railway up
```

---

## What Railway Does Automatically

✅ Detects Next.js (via package.json)
✅ Detects Python (via requirements.txt)
✅ Installs both Node and Python dependencies
✅ Runs build command
✅ Serves the app on port 3000 (or Railway's PORT env variable)

---

## Environment Variables to Set in Railway

```
ELEVENLABS_API_KEY=sk_af95ca89cc7ec4780a08a6933149d45fb5da4ae4a4a6dc66
```

---

## Advantages Over Vercel

✅ No 50MB size limit
✅ Native Python support
✅ Can run background tasks
✅ Better for hybrid Node.js + Python apps
✅ More generous free tier for compute

---

## Your API Endpoints (after deployment)

Replace `your-app.up.railway.app` with your actual Railway URL:

```bash
# Upload Audio
curl -X POST https://your-app.up.railway.app/api/upload-audio \
  -F "file=@audio.mp3"

# AI Music Generation
curl -X POST https://your-app.up.railway.app/api/convert-song \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "upbeat rock song",
    "musicLengthMs": 30000,
    "forceInstrumental": true
  }'
```

---

## Monitoring

Railway Dashboard shows:
- Deployment logs
- Build status
- Runtime logs
- Metrics (CPU, memory, network)

---

## Need Help?

Railway Docs: https://docs.railway.app
Railway Discord: https://discord.gg/railway
