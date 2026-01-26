# Chakra9 Content Machine

> Automated yacht content generation system for n8n with AI-powered creative strategy.

## Overview

Chakra9 is a modular n8n workflow system that:

1. **Syncs** yacht data from YCN (Yacht Charter Network)
2. **Resolves** media URLs to Google Drive folders
3. **Indexes** and tags video/photo assets
4. **Generates** complete Content Packs using Claude + OpenAI
5. **Produces** platform-specific content (TikTok, IG Reels, Facebook)
6. **Captures** and qualifies leads automatically

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MASTER ORCHESTRATOR                       │
└─────────────────────────────────────────────────────────────┘
                              │
    ┌─────────────┬───────────┼───────────┬─────────────┐
    ▼             ▼           ▼           ▼             ▼
┌────────┐  ┌──────────┐  ┌────────┐  ┌────────┐  ┌────────┐
│ Fleet  │  │  Media   │  │ Asset  │  │ Chakra │  │  Lead  │
│  Sync  │  │ Resolver │  │Indexer │  │ Engine │  │ Intake │
└────────┘  └──────────┘  └────────┘  └────────┘  └────────┘
                                           │
                          ┌────────────────┼────────────────┐
                          ▼                ▼                ▼
                    ┌──────────┐    ┌──────────┐    ┌──────────┐
                    │  Claude  │    │  OpenAI  │    │    QA    │
                    │ Creative │    │ Perform. │    │  Review  │
                    └──────────┘    └──────────┘    └──────────┘
```

## 9 Chakras (Modules)

| # | Name | Purpose |
|---|------|---------|
| 0 | Master Orchestrator | Daily pipeline coordination |
| 1 | Fleet Sync | Import yachts from YCN |
| 2 | Media Resolver | Get Google Drive folder IDs |
| 3 | Chakra Engine | Generate Content Packs (AI) |
| 4 | Asset Indexer | Catalog and tag media files |
| 5 | Clip Planner | (Future) AI-suggested clip timecodes |
| 6 | Video Factory | (Worker) FFmpeg processing |
| 7 | Publishing Pack | (Future) Multi-platform publishing |
| 8 | Lead Intake | Capture and qualify leads |
| 9 | Analytics | (Future) Performance tracking |

## Directory Structure

```
chakra9-machine/
├── n8n/
│   └── workflows/
│       ├── 00_master_orchestrator.json
│       ├── 01_fleet_sync_ycn.json
│       ├── 02_media_resolver.json
│       ├── 03_chakra_engine.json
│       ├── 04_lead_intake.json
│       └── 05_asset_indexer.json
├── schemas/
│   ├── yacht.schema.json
│   ├── asset.schema.json
│   ├── content_piece.schema.json
│   ├── lead.schema.json
│   └── clip_pack.schema.json
├── prompts/
│   ├── creative_director_claude.md
│   ├── performance_marketer_openai.md
│   ├── qa_guardrails.md
│   └── clip_planner.md
├── worker/
│   ├── index.js
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
├── docs/
│   ├── INSTALL.md
│   └── SOP_editor_capcut.md
├── examples/
│   ├── sample_yacht.json
│   └── sample_content_pack.json
└── README.md
```

## Quick Start

### Choose Your Deployment

| Option | Best For | Video Processing |
|--------|----------|------------------|
| **n8n Cloud** | Quick start, managed | Semi-auto (CapCut) or external worker |
| **Self-Hosted** | Full control, FFmpeg direct | Full auto built-in |

### n8n Cloud (e.g., zenivatravel.app.n8n.cloud)

```bash
# 1. Import workflows 01-05 (all work natively)
# 2. Configure credentials in n8n UI
# 3. For video processing: deploy worker to Railway (optional)
```

See [docs/DEPLOY_CLOUD.md](docs/DEPLOY_CLOUD.md)

### Self-Hosted (Docker)

```bash
cd chakra9-machine
cp .env.example .env
docker-compose up -d
```

See [docs/INSTALL.md](docs/INSTALL.md)

### Import Order

```
1. 01_fleet_sync_ycn.json
2. 02_media_resolver.json
3. 05_asset_indexer.json
4. 03_chakra_engine.json
5. 04_lead_intake.json
6. 06_video_processor_cloud.json  ← n8n Cloud
   06_video_processor_ffmpeg.json ← Self-hosted
7. 00_master_orchestrator.json (last)
```

### Test

```bash
# Generate content for a yacht
curl -X POST https://your-n8n/webhook/generate-content \
  -H "Content-Type: application/json" \
  -d '{"yacht_id": "spysea"}'
```

## AI Architecture

### "Two Brains + One Conductor"

| Role | Model | Purpose |
|------|-------|---------|
| Creative Director | Claude | Style, emotion, storytelling, luxury tone |
| Performance Marketer | OpenAI GPT-4o | Hooks, CTAs, conversions, platform optimization |
| QA Reviewer | Claude | Fact-checking, brand compliance, guardrails |

### Why This Split?

- **Claude** excels at nuanced, on-brand creative writing
- **OpenAI** with Structured Outputs guarantees valid JSON
- **QA pass** ensures no hallucinated features or specs

## Content Pack Output

Each generation produces:

```json
{
  "creative_angles": [...],      // 10 content angles
  "scripts": [...],              // 5 voiceover scripts
  "on_screen_text_sets": [...],  // Text overlays with timing
  "hooks": [...],                // 20 platform-specific hooks
  "captions": [...],             // 9 captions (3 per platform)
  "cta_variations": [...],       // 12 call-to-action variants
  "hashtag_sets": [...],         // Platform-optimized hashtags
  "clip_plan": {...}             // Suggested clip structure
}
```

## Video Factory (Optional)

For automated video processing:

```bash
cd worker
npm install
npm run dev
```

Endpoints:
- `POST /cut-clips` - Cut segments from long video
- `POST /burn-subtitles` - Add SRT to video
- `POST /generate-thumbnails` - Extract frames
- `POST /process-clip-pack` - Full pipeline

## Two Routes

### Route A: Semi-Auto (Recommended)
- n8n generates Content Packs
- Human edits in CapCut using the pack
- 10-15 minutes per yacht
- Best quality + control

### Route B: Full Auto
- n8n triggers Video Factory worker
- FFmpeg cuts clips automatically
- Burns subtitles/overlays
- Best for high volume

## Database Schema

See [schemas/](schemas/) for full JSON Schema definitions.

### Tables Required

1. **YACHTS** - Fleet inventory
2. **ASSETS** - Media files
3. **CONTENT_PACKS** - Generated content
4. **LEADS** - Customer inquiries

## Security Notes

- API keys stored in n8n credentials (never in workflows)
- No secrets in JSON workflow files
- Environment variables for sensitive config
- QA guardrails prevent hallucinated content

## Contributing

1. Fork the repo
2. Create feature branch
3. Test workflows locally
4. Submit PR with documentation

## License

MIT

---

Built for Zeniva Travel | Miami Yacht Charters
