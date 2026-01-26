# SOP: CapCut Editing with Chakra9 Content Packs

## Overview

This SOP guides you through creating short-form video content using Chakra9-generated Content Packs in CapCut.

**Target time per video: 10-15 minutes**

---

## Before You Start

### Prerequisites
- CapCut desktop or mobile app
- Access to yacht video assets (Google Drive)
- Content Pack JSON or formatted brief

### Content Pack Contains
- `hooks` - Opening lines (pick 1)
- `overlays` - On-screen text with timing
- `captions` - Platform-specific descriptions
- `hashtags` - Ready to copy
- `cta` - Call-to-action text
- `clip_plan` - Suggested segments (optional)

---

## Step 1: Import Assets (2 min)

1. Download yacht video(s) from Google Drive
2. Open CapCut → New Project
3. Set aspect ratio: **9:16** (TikTok/Reels)
4. Import video files

---

## Step 2: Rough Cut (3-5 min)

### Use the Clip Plan (if provided)
```json
"segments": [
  { "start_sec": 0, "end_sec": 3, "purpose": "hook" },
  { "start_sec": 45, "end_sec": 52, "purpose": "drone_reveal" },
  { "start_sec": 120, "end_sec": 128, "purpose": "interior" },
  ...
]
```

### Without Clip Plan
Follow this structure:
1. **0-2s**: Hook shot (drone or dramatic reveal)
2. **3-10s**: Exterior beauty shots
3. **11-18s**: Interior highlights
4. **19-25s**: Lifestyle/amenities
5. **26-30s**: CTA + logo

### Pro Tips
- Cut on the beat if using music
- Keep each shot 1.5-3 seconds max
- Use speed ramps for transitions
- Start with the WOW moment

---

## Step 3: Add Text Overlays (3-4 min)

### From Content Pack
```json
"overlays": [
  { "text": "70ft of pure luxury", "timing": "0-2s", "style": "bold" },
  { "text": "9 guests • Full crew", "timing": "8-11s", "style": "minimal" },
  { "text": "Starting $3,500/4hrs", "timing": "20-23s", "style": "price_tag" }
]
```

### CapCut Text Settings
| Style | Font | Size | Position |
|-------|------|------|----------|
| bold | Montserrat Bold | 80-100 | Center |
| minimal | Inter Light | 50-60 | Bottom third |
| price_tag | Bebas Neue | 70 | Center with box |

### Animation
- Entrance: Fade Up or Pop
- Exit: Fade Out
- Duration: Match overlay timing

---

## Step 4: Add Hook Text (1 min)

Pick from `hooks` array:
```json
"hooks": [
  { "hook": "POV: You rented the whole yacht", "style": "flex" },
  { "hook": "This is what $4K gets you in Miami", "style": "curiosity" },
  { "hook": "Birthday in Miami? Say less.", "style": "statement" }
]
```

- Place at 0-2 seconds
- Use bold, attention-grabbing font
- Add subtle animation

---

## Step 5: Music & Audio (2 min)

### Recommended Moods
| Content Type | Music Style |
|--------------|-------------|
| Luxury tour | Deep house, lo-fi |
| Party vibe | Hip-hop beats |
| Sunset cruise | Chill electronic |
| Corporate | Ambient, minimal |

### CapCut Tips
- Use "Beats" feature to auto-sync cuts
- Lower music to 60-70% when voice present
- Add bass boost for impact moments

---

## Step 6: Final Touches (2 min)

### Color Grading
- Apply "Film" or "Clean" filter
- Bump saturation +10-15%
- Increase contrast slightly
- Slight vignette for focus

### Transitions
- Preferred: Cut, Zoom, Swipe
- Avoid: Cheesy effects, long transitions
- Keep transitions under 0.3s

### End Card
- Add Zeniva logo (last 2s)
- Include CTA text from pack
- Add "Link in bio" if applicable

---

## Step 7: Export & Publish

### Export Settings
- Resolution: 1080x1920
- Frame rate: 30fps
- Quality: High

### Caption from Content Pack
```json
"captions": {
  "tiktok": "This 70ft Azimut just hit different 🛥️\n\nBook your Miami yacht day...",
  "ig_reels": "Luxury yacht charter experience in Miami...",
  "facebook": "Looking for the ultimate Miami experience?..."
}
```

### Hashtags
Copy directly from Content Pack:
```
#MiamiYacht #YachtCharter #LuxuryMiami #BoatRental...
```

---

## Quality Checklist

Before posting, verify:

- [ ] Hook grabs attention in first 1 second
- [ ] Text is readable (not too small, good contrast)
- [ ] Audio levels balanced
- [ ] No copyright music issues
- [ ] CTA is clear and visible
- [ ] Correct hashtags for platform
- [ ] Video length: 15-45s optimal

---

## Template Library

Save these CapCut templates for quick editing:

1. **Luxury Tour** - Slow reveals, minimal text
2. **Party Promo** - Fast cuts, bold text, energetic
3. **Sunset Cruise** - Warm tones, relaxed pace
4. **Quick Feature** - Focus on single amenity

---

## Batch Editing Workflow

When processing multiple yachts:

1. Download all assets first
2. Open Content Packs in split screen
3. Use CapCut templates
4. Process hooks/overlays in batches
5. Export all → Schedule in batches

**Target: 5-8 videos per hour after practice**
