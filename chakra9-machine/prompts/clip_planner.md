# Clip Planner Prompt

## Purpose
Analyze long-form video content and generate intelligent clip plans with timestamps.

## System Prompt

```
You are a video editor AI specialized in creating viral short-form clips from yacht footage.

YOUR EXPERTISE:
- Identifying "wow moments" in footage
- Pacing for different platforms
- Matching visuals to hooks
- Creating emotional arcs in 15-60 seconds

CLIP STRUCTURE RULES:
1. HOOK (0-2s): Must be visually arresting
2. BUILD (3-15s): Show the experience
3. PAYOFF (16-25s): The "money shot"
4. CTA (26-30s): Clean exit with action

SHOT SELECTION PRIORITY:
1. Drone reveals (always strong openers)
2. Lifestyle moments (people enjoying)
3. Unique features (jacuzzi, toys, sunset)
4. Interior luxury shots
5. Ocean/sunset ambiance

PLATFORM TIMING:
- TikTok: 15-30s optimal, fast cuts (1-2s per shot)
- IG Reels: 20-45s, slightly slower, more polish
- YouTube Shorts: 30-60s, can breathe more
```

## User Prompt Template

```
YACHT: {{yacht_id}}

VIDEO TRANSCRIPT WITH TIMESTAMPS:
{{transcript_with_timestamps}}

AVAILABLE ASSETS (with tags and durations):
{{assets_json}}

CREATIVE ANGLES TO COVER:
{{angles_json}}

TASK:
Generate clip plans for 12 short-form videos:
- 4 TikTok clips (15-30s)
- 4 IG Reels (20-45s)
- 4 YouTube Shorts (30-60s)

For each clip, provide:
1. clip_id
2. platform
3. angle (from provided angles)
4. total_duration_sec
5. segments: [
   {
     source: "asset_id or timestamp range",
     start_sec: number,
     end_sec: number,
     purpose: "hook|build|feature|payoff|cta",
     overlay_text: "optional on-screen text"
   }
]
6. hook (text overlay for first 2s)
7. music_mood
8. editing_notes

OUTPUT: Valid JSON array of clip plans.
```

## Transcription Integration

### OpenAI Whisper API Call

```json
{
  "method": "POST",
  "url": "https://api.openai.com/v1/audio/transcriptions",
  "headers": {
    "Authorization": "Bearer {{apiKey}}"
  },
  "formData": {
    "file": "={{$binary.audio}}",
    "model": "whisper-1",
    "response_format": "verbose_json",
    "timestamp_granularities": ["segment"]
  }
}
```

### Transcript Processing Code

```javascript
// Parse Whisper response into usable format
const transcript = $json.segments.map(seg => ({
  start: seg.start,
  end: seg.end,
  text: seg.text,
  duration: seg.end - seg.start
}));

// Identify key moments
const keyMoments = transcript.filter(seg => {
  const keywords = ['wow', 'look', 'amazing', 'beautiful', 'feature', 'jacuzzi', 'sunset'];
  return keywords.some(kw => seg.text.toLowerCase().includes(kw));
});

return [{ transcript, keyMoments }];
```

## Output Schema

```json
{
  "type": "array",
  "items": {
    "type": "object",
    "properties": {
      "clip_id": { "type": "string" },
      "platform": { "type": "string", "enum": ["tiktok", "ig_reels", "youtube_shorts"] },
      "angle": { "type": "string" },
      "total_duration_sec": { "type": "integer" },
      "segments": {
        "type": "array",
        "items": {
          "type": "object",
          "properties": {
            "source": { "type": "string" },
            "start_sec": { "type": "number" },
            "end_sec": { "type": "number" },
            "purpose": { "type": "string" },
            "overlay_text": { "type": "string" }
          }
        }
      },
      "hook": { "type": "string" },
      "music_mood": { "type": "string" },
      "editing_notes": { "type": "string" }
    }
  }
}
```
