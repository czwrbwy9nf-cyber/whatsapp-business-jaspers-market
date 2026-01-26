# Performance Marketer Prompt (OpenAI)

## Purpose
Generate high-converting hooks, captions, CTAs, and hashtags optimized for each platform.

## System Prompt

```
You are a performance copywriter specializing in luxury yacht charter marketing.

Your outputs drive:
- Scroll-stopping hooks
- High engagement captions
- Clear CTAs with keyword triggers
- Platform-optimized formatting

RULES:
- Output MUST be valid JSON matching the provided schema
- Never use generic marketing phrases
- Every hook must create curiosity or FOMO
- CTAs must include a clear action (DM keyword preferred)
- Hashtags: mix of high-volume (#miami) and niche (#yachtcharter)

PLATFORM NUANCES:
- TikTok: Aggressive hooks, fast pace, Gen-Z speak allowed, trending sounds reference
- IG Reels: Luxury tone, aspirational, lifestyle focus, polished
- Facebook: Longer form, trust-building, link focus, older demo

PROHIBITED:
- False claims about pricing or availability
- Aggressive sales language
- Emojis overload (max 3-5 per caption)
- Hashtag spam (quality over quantity)
```

## User Prompt Template

```
YACHT DATA:
{{yacht_data_json}}

CREATIVE ANGLES FROM CLAUDE:
{{creative_angles_json}}

TASK:
Generate a complete performance pack:

1. hooks (20): Platform-specific hooks
   - Max 8 words each
   - Varied styles: curiosity, flex, FOMO, question, statement, controversy
   - Tag each with best_platform

2. captions (9): 3 per platform (TikTok, IG Reels, Facebook)
   - TikTok: 100-150 chars, punchy, emoji light
   - IG Reels: 150-300 chars, lifestyle storytelling
   - Facebook: 200-400 chars, trust + conversion focus

3. cta_variations (12): Call-to-action variations
   - Types: dm_keyword, link_bio, comment, share
   - Each must have a clear trigger keyword
   - Examples: "DM 'YACHT' for availability", "Link in bio for dates"

4. hashtag_sets (3): One per platform
   - 15-25 hashtags each
   - Mix: branded, location, niche, trending
   - Order by relevance (most relevant first)

OUTPUT MUST MATCH THIS SCHEMA EXACTLY.
```

## OpenAI Structured Output Configuration

```json
{
  "model": "gpt-4o-2024-08-06",
  "input": [
    {
      "role": "system",
      "content": "You are a performance copywriter..."
    },
    {
      "role": "user",
      "content": "{{prompt}}"
    }
  ],
  "text": {
    "format": {
      "type": "json_schema",
      "name": "performance_pack",
      "strict": true,
      "schema": {
        "type": "object",
        "additionalProperties": false,
        "properties": {
          "yacht_id": { "type": "string" },
          "hooks": {
            "type": "array",
            "minItems": 15,
            "items": {
              "type": "object",
              "additionalProperties": false,
              "properties": {
                "hook": { "type": "string" },
                "style": { "type": "string" },
                "best_platform": { "type": "string" }
              },
              "required": ["hook", "style", "best_platform"]
            }
          },
          "captions": {
            "type": "array",
            "items": {
              "type": "object",
              "additionalProperties": false,
              "properties": {
                "platform": { "type": "string" },
                "caption": { "type": "string" },
                "angle": { "type": "string" }
              },
              "required": ["platform", "caption", "angle"]
            }
          },
          "cta_variations": {
            "type": "array",
            "items": {
              "type": "object",
              "additionalProperties": false,
              "properties": {
                "cta": { "type": "string" },
                "type": { "type": "string" },
                "keyword": { "type": "string" }
              },
              "required": ["cta", "type", "keyword"]
            }
          },
          "hashtag_sets": {
            "type": "array",
            "items": {
              "type": "object",
              "additionalProperties": false,
              "properties": {
                "platform": { "type": "string" },
                "hashtags": { "type": "array", "items": { "type": "string" } }
              },
              "required": ["platform", "hashtags"]
            }
          }
        },
        "required": ["yacht_id", "hooks", "captions", "cta_variations", "hashtag_sets"]
      }
    }
  }
}
```

## n8n HTTP Request Node

```json
{
  "method": "POST",
  "url": "https://api.openai.com/v1/responses",
  "headers": {
    "Authorization": "Bearer ={{$credentials.openAiApi.apiKey}}",
    "Content-Type": "application/json"
  },
  "body": "={{JSON.stringify($json.openai_request)}}"
}
```

## Hook Style Guidelines

| Style | Example | Best For |
|-------|---------|----------|
| Curiosity | "What $15K gets you in Miami..." | TikTok |
| Flex | "POV: You rented the whole yacht" | IG Reels |
| FOMO | "Only 3 dates left this summer" | All |
| Question | "Can you afford NOT to do this?" | Facebook |
| Statement | "This is how Miami does birthdays" | TikTok |
| Controversy | "Yachts aren't just for billionaires" | TikTok |
