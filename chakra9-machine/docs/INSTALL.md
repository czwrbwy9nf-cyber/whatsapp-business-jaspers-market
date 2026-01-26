# Chakra9 Machine - Installation Guide

## Prerequisites

- n8n (self-hosted recommended for full auto)
- Docker & Docker Compose (for self-hosted)
- API Keys:
  - OpenAI API Key
  - Anthropic (Claude) API Key
  - Google Drive API credentials
- Database: Airtable OR Google Sheets

---

## Quick Start (Self-Hosted with Docker)

### 1. Clone and Configure

```bash
cd chakra9-machine

# Copy environment template
cp .env.example .env

# Edit with your values
nano .env
```

### 2. Start the Stack

```bash
# Start n8n with FFmpeg + PostgreSQL + Redis
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f n8n
```

### 3. Access n8n

Open http://localhost:5678 (or your configured host)
Default credentials: admin / changeme (change these!)

### 4. Import Workflows

Follow Step 3 below to import workflows.

---

## Step 1: Database Setup

### Option A: Airtable

1. Create a new Airtable base named "Chakra9 Content OS"
2. Create 4 tables with these fields:

#### Table: YACHTS
| Field | Type |
|-------|------|
| yacht_id | Single line text (Primary) |
| title | Single line text |
| name | Single line text |
| length_ft | Number |
| year | Number |
| manufacturer | Single line text |
| model | Single line text |
| location | Single line text |
| prices | Long text (JSON) |
| capacity | Long text (JSON) |
| crew | Single line text |
| amenities | Long text (JSON array) |
| experiences | Long text (JSON array) |
| highlights | Long text (JSON array) |
| calendar_url | URL |
| media_url | URL |
| drive_folder_id | Single line text |
| drive_folder_url | URL |
| status | Single select: active, maintenance, inactive, pending |
| synced_at | Date |
| last_content_generated_at | Date |

#### Table: ASSETS
| Field | Type |
|-------|------|
| asset_id | Single line text (Primary) |
| yacht_id | Link to YACHTS |
| type | Single select: video, photo |
| filename | Single line text |
| tag | Single select: drone, exterior, interior, amenity, lifestyle, crew, sunset, ocean, toys, untagged |
| mime_type | Single line text |
| size_bytes | Number |
| url | URL |
| thumbnail_url | URL |
| indexed_at | Date |

#### Table: CONTENT_PACKS
| Field | Type |
|-------|------|
| pack_id | Auto number (Primary) |
| yacht_id | Link to YACHTS |
| content_pack | Long text (JSON) |
| qa_status | Single select: approved, needs_revision, rejected, auto_fixed |
| brand_score | Number (1-10) |
| compliance_score | Number (1-10) |
| status | Single select: draft, ready, published |
| created_at | Date |

#### Table: LEADS
| Field | Type |
|-------|------|
| lead_id | Single line text (Primary) |
| source | Single select: ig_dm, tiktok_dm, facebook, whatsapp, form, phone, email, referral |
| yacht_id | Link to YACHTS |
| name | Single line text |
| contact | Long text (JSON) |
| party_details | Long text (JSON) |
| budget | Long text (JSON) |
| qualification_score | Number (1-10) |
| status | Single select: new, contacted, qualified, proposal_sent, negotiating, booked, lost, no_response |
| notes | Long text |
| raw_message | Long text |
| created_at | Date |

### Option B: Google Sheets

Create a Google Sheet with 4 tabs matching the table structures above.

---

## Step 2: n8n Credentials Setup

### 1. Anthropic (Claude) API

1. Go to Settings → Credentials → Add Credential
2. Select "Header Auth"
3. Name: `Anthropic API Key`
4. Header Name: `x-api-key`
5. Header Value: Your Anthropic API key

### 2. OpenAI API

1. Add Credential → Select "Header Auth"
2. Name: `OpenAI API Key`
3. Header Name: `Authorization`
4. Header Value: `Bearer YOUR_OPENAI_API_KEY`

### 3. Google Drive

1. Add Credential → Select "Google Drive OAuth2 API"
2. Follow OAuth flow with your Google account
3. Ensure access to Drive files

### 4. Airtable (if using)

1. Add Credential → Select "Airtable Token API"
2. Enter your Airtable personal access token
3. Ensure token has access to your base

### 5. Slack (optional, for notifications)

1. Add Credential → Select "Slack OAuth2 API" or "Slack API"
2. Create a Slack app and add OAuth token

---

## Step 3: Import Workflows

### Import Order (important!)

1. **01_fleet_sync_ycn.json** - Fleet Sync
2. **02_media_resolver.json** - Media Resolver
3. **05_asset_indexer.json** - Asset Indexer
4. **03_chakra_engine.json** - Content Pack Generator
5. **04_lead_intake.json** - Lead Intake
6. **00_master_orchestrator.json** - Master (import last)

### For each workflow:

1. Go to Workflows → Import from File
2. Select the JSON file
3. Click nodes with ⚠️ warnings and configure:
   - Set credential references
   - Set Airtable Base ID / Google Sheet ID
   - Set table names

### Configure Master Orchestrator

After importing all workflows:

1. Open `00_master_orchestrator.json`
2. Find each "Execute Workflow" node
3. Set the correct workflow ID for each sub-workflow

---

## Step 4: Video Processing (Self-Hosted)

### Option A: FFmpeg Direct in n8n (Recommended)

Since you're self-hosted, use the Execute Command nodes with FFmpeg:

1. Import `06_video_processor_ffmpeg.json`
2. Import `07_subtitle_generator.json`
3. These workflows use FFmpeg directly - no external worker needed!

**Test FFmpeg in your n8n container:**

```bash
docker exec -it chakra9-machine-n8n-1 ffmpeg -version
docker exec -it chakra9-machine-n8n-1 ffprobe -version
```

### Workflow Endpoints (Self-Hosted):

| Endpoint | Purpose |
|----------|---------|
| POST `/webhook/process-video` | Cut clips from source video |
| POST `/webhook/generate-subtitles` | Whisper transcription → SRT |

### Example: Cut Clips

```bash
curl -X POST http://localhost:5678/webhook/process-video \
  -H "Content-Type: application/json" \
  -d '{
    "yacht_id": "spysea",
    "source_file_id": "GOOGLE_DRIVE_FILE_ID",
    "vertical": true,
    "clips": [
      { "clip_id": "hook", "start_sec": 0, "end_sec": 3 },
      { "clip_id": "main", "start_sec": 10, "end_sec": 45 }
    ],
    "overlays": [
      { "text": "Starting at $3,500", "style": "bold", "position": "bottom" }
    ]
  }'
```

### Option B: Standalone Video Factory Worker

For heavy workloads, run the worker separately:

```bash
# Include video-factory service
docker-compose --profile with-api up -d

# Or run standalone
cd worker
npm install
npm run dev
```

---

## Step 5: Environment Variables (n8n)

Set these in your n8n environment:

```env
# API Keys (use credentials instead, but these are fallbacks)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Database
AIRTABLE_BASE_ID=app...
AIRTABLE_BASE_URL=https://airtable.com/app.../...

# Video Factory (if using)
VIDEO_FACTORY_URL=http://localhost:3000

# Slack (optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
```

---

## Step 6: Test the Setup

### 1. Test Fleet Sync
- Manually trigger `01_fleet_sync_ycn`
- Check YACHTS table for new entries

### 2. Test Media Resolver
- Add a yacht with `media_url` but no `drive_folder_id`
- Trigger `02_media_resolver`
- Verify `drive_folder_id` is populated

### 3. Test Content Generation
- POST to webhook: `/webhook/generate-content`
- Body: `{ "yacht_id": "your-yacht-id" }`
- Check CONTENT_PACKS table

### 4. Test Full Pipeline
- POST to `/webhook/run-chakra9`
- Monitor execution in n8n
- Check Slack for summary (if configured)

---

## Troubleshooting

### Common Issues

1. **"No redirect Location header"**
   - The media.ycn.miami URL may not be configured for this yacht
   - Check that the yacht has content in YCN

2. **"Failed to parse Claude/OpenAI response"**
   - Check API key validity
   - Review token limits
   - Check for rate limiting

3. **"Airtable permission denied"**
   - Verify PAT has access to the base
   - Check table names match exactly

4. **FFmpeg errors in Video Factory**
   - Ensure FFmpeg is installed: `ffmpeg -version`
   - Check input file exists and is accessible
   - Verify file format is supported

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    MASTER ORCHESTRATOR                       │
│                   (00_master_orchestrator)                   │
└─────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Fleet Sync    │  │ Media Resolver  │  │ Asset Indexer   │
│  (01_fleet_*)   │  │  (02_media_*)   │  │  (05_asset_*)   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
                              │
                              ▼
               ┌─────────────────────────────┐
               │      CHAKRA ENGINE          │
               │   (03_chakra_engine)        │
               │                             │
               │  ┌─────────┐ ┌───────────┐  │
               │  │ Claude  │ │  OpenAI   │  │
               │  │Creative │ │Performance│  │
               │  └────┬────┘ └─────┬─────┘  │
               │       └─────┬──────┘        │
               │             ▼               │
               │      ┌───────────┐          │
               │      │ QA Review │          │
               │      └───────────┘          │
               └─────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Video Factory  │  │  Lead Intake    │  │   Publishing    │
│    (Worker)     │  │ (04_lead_*)     │  │    (Future)     │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

---

## Next Steps

1. Configure your first yacht manually in the database
2. Run the full pipeline
3. Review generated content in CONTENT_PACKS
4. Use the content in CapCut (semi-auto route)
5. Set up lead capture webhooks from your social platforms
