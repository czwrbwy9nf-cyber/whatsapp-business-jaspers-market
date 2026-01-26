# Chakra9 - n8n Cloud Deployment Guide

## Overview

When using **n8n Cloud** (like zenivatravel.app.n8n.cloud), you cannot use Execute Command nodes for FFmpeg. Instead:

1. **Semi-Auto Route**: n8n generates Content Packs → you edit in CapCut
2. **Full Auto Route**: Deploy Video Factory to Railway/Render → n8n calls it via HTTP

---

## Route A: Semi-Auto (Recommended)

### What Works in n8n Cloud

| Workflow | Status | Notes |
|----------|--------|-------|
| 00 Master Orchestrator | ✅ | Full support |
| 01 Fleet Sync YCN | ✅ | Full support |
| 02 Media Resolver | ✅ | Full support |
| 03 Chakra Engine | ✅ | Full support (AI generation) |
| 04 Lead Intake | ✅ | Full support |
| 05 Asset Indexer | ✅ | Full support |
| 06 Video Processor | ⚠️ | Use `06_video_processor_cloud.json` |
| 07 Subtitle Generator | ⚠️ | Needs external worker |

### Workflow

```
1. n8n Cloud runs Chakra Engine
2. Generates: hooks, scripts, captions, overlays, timecodes
3. Output saved to CONTENT_PACKS table
4. You open CapCut with the brief
5. Cut video in 10-15 minutes using the pack
```

### Setup Steps

1. Import workflows 00-05 (all work natively)
2. Configure credentials (OpenAI, Anthropic, Drive, Airtable)
3. Skip 06-07 for now (or deploy worker)
4. Use Content Packs in CapCut

---

## Route B: Full Auto with External Worker

### Deploy Video Factory to Railway

#### 1. Create Railway Account
- Go to [railway.app](https://railway.app)
- Sign up with GitHub

#### 2. Deploy from GitHub

```bash
# In your repo, the worker/ folder contains everything needed
```

Railway will auto-detect the Dockerfile.

#### 3. Set Environment Variables in Railway

```
PORT=3000
NODE_ENV=production
```

#### 4. Get Your Railway URL

After deployment, Railway gives you a URL like:
```
https://chakra9-video-factory-production.up.railway.app
```

#### 5. Configure n8n Cloud

In n8n Cloud:

1. **Variables** → Add `VIDEO_FACTORY_URL`:
   ```
   https://chakra9-video-factory-production.up.railway.app
   ```

2. **Credentials** → Create "Video Factory API Key":
   - Type: Header Auth
   - Name: `Authorization`
   - Value: `Bearer your-secret-key`

3. **Import** `06_video_processor_cloud.json`

### Deploy to Render (Alternative)

#### 1. Create render.yaml

```yaml
services:
  - type: web
    name: chakra9-video-factory
    env: docker
    dockerfilePath: ./worker/Dockerfile
    dockerContext: ./worker
    healthCheckPath: /health
    envVars:
      - key: PORT
        value: 3000
      - key: NODE_ENV
        value: production
```

#### 2. Connect GitHub repo to Render

Render auto-deploys on push.

---

## n8n Cloud Configuration

### Required Credentials

| Credential | Type | Purpose |
|------------|------|---------|
| Anthropic API Key | Header Auth | Claude AI |
| OpenAI API Key | Header Auth | GPT-4o + Whisper |
| Google Drive | OAuth2 | Asset access |
| Airtable | Token API | Database |
| Video Factory API Key | Header Auth | External worker |
| Slack | OAuth2/Webhook | Notifications (optional) |

### Required Variables

In n8n Cloud → Settings → Variables:

| Variable | Value |
|----------|-------|
| `VIDEO_FACTORY_URL` | `https://your-worker.railway.app` |
| `AIRTABLE_BASE_ID` | `appXXXXXXXXXXXXXX` |

---

## Workflow Import Order (n8n Cloud)

```
1. 01_fleet_sync_ycn.json
2. 02_media_resolver.json
3. 05_asset_indexer.json
4. 03_chakra_engine.json
5. 04_lead_intake.json
6. 06_video_processor_cloud.json  ← Use this version!
7. 00_master_orchestrator.json
```

---

## Testing

### Test Content Generation

```bash
curl -X POST https://zenivatravel.app.n8n.cloud/webhook/generate-content \
  -H "Content-Type: application/json" \
  -d '{"yacht_id": "spysea"}'
```

### Test Video Processing (if worker deployed)

```bash
curl -X POST https://zenivatravel.app.n8n.cloud/webhook/process-video \
  -H "Content-Type: application/json" \
  -d '{
    "yacht_id": "spysea",
    "source_url": "https://drive.google.com/uc?id=FILE_ID",
    "clips": [
      {"clip_id": "hook", "start_sec": 0, "end_sec": 3}
    ],
    "vertical": true
  }'
```

---

## Cost Comparison

| Route | n8n Cloud | External | Total/month |
|-------|-----------|----------|-------------|
| Semi-Auto | $20+ | $0 | ~$20 |
| Full Auto | $20+ | Railway $5-20 | ~$25-40 |

Semi-auto = best ROI for starting out.

---

## Recommended Workflow

1. **Start with Semi-Auto**
   - Import workflows 01-05
   - Generate Content Packs
   - Cut in CapCut (builds skills)

2. **Scale to Full Auto when needed**
   - Deploy Video Factory to Railway
   - Import workflow 06 (cloud version)
   - Automate high-volume production

---

## Troubleshooting

### "Webhook not found"
- Ensure workflow is **Active** (toggle ON)
- Check webhook path matches

### "Video Factory timeout"
- Railway free tier has cold starts
- Increase timeout in HTTP Request node
- Consider paid tier for production

### "Google Drive access denied"
- Re-authenticate Drive credentials
- Ensure files are accessible to service account

---

## Support

- n8n Cloud docs: https://docs.n8n.io/hosting/n8n-cloud/
- Railway docs: https://docs.railway.app/
- This repo issues: [GitHub Issues]
