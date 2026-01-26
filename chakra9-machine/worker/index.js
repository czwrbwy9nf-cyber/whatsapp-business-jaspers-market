/**
 * Chakra9 Video Factory Worker
 *
 * FFmpeg-based video processing service for:
 * - Extracting audio from videos
 * - Cutting vertical clips
 * - Burning subtitles (SRT)
 * - Generating thumbnails
 */

import express from 'express';
import multer from 'multer';
import ffmpeg from 'fluent-ffmpeg';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import winston from 'winston';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/video-factory.log' })
  ]
});

const app = express();
app.use(express.json());

// Multer for file uploads
const storage = multer.diskStorage({
  destination: './temp/uploads',
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// Ensure directories exist
async function ensureDirectories() {
  const dirs = ['./temp/uploads', './temp/outputs', './logs'];
  for (const dir of dirs) {
    await fs.mkdir(dir, { recursive: true });
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'chakra9-video-factory' });
});

/**
 * POST /extract-audio
 * Extract audio from video file
 *
 * Body: { video_url: string } or multipart with file
 * Returns: { audio_url: string, duration_sec: number }
 */
app.post('/extract-audio', upload.single('video'), async (req, res) => {
  const jobId = uuidv4();
  logger.info({ jobId, action: 'extract-audio', status: 'started' });

  try {
    const inputPath = req.file?.path || req.body.video_path;
    if (!inputPath) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const outputPath = `./temp/outputs/${jobId}.mp3`;

    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .output(outputPath)
        .audioCodec('libmp3lame')
        .audioBitrate('128k')
        .noVideo()
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    // Get duration
    const duration = await getVideoDuration(inputPath);

    logger.info({ jobId, action: 'extract-audio', status: 'completed' });

    res.json({
      job_id: jobId,
      audio_path: outputPath,
      duration_sec: duration,
      status: 'completed'
    });

  } catch (error) {
    logger.error({ jobId, action: 'extract-audio', error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /cut-clips
 * Cut multiple clips from a source video
 *
 * Body: {
 *   video_path: string,
 *   clips: [{ start_sec: number, end_sec: number, output_name: string }],
 *   vertical: boolean (default true)
 * }
 */
app.post('/cut-clips', async (req, res) => {
  const jobId = uuidv4();
  logger.info({ jobId, action: 'cut-clips', status: 'started' });

  try {
    const { video_path, clips, vertical = true } = req.body;

    if (!video_path || !clips?.length) {
      return res.status(400).json({ error: 'video_path and clips array required' });
    }

    const outputDir = `./temp/outputs/${jobId}`;
    await fs.mkdir(outputDir, { recursive: true });

    const results = [];

    for (const clip of clips) {
      const outputName = clip.output_name || `clip_${results.length + 1}.mp4`;
      const outputPath = path.join(outputDir, outputName);
      const duration = clip.end_sec - clip.start_sec;

      await new Promise((resolve, reject) => {
        let command = ffmpeg(video_path)
          .setStartTime(clip.start_sec)
          .setDuration(duration)
          .output(outputPath)
          .videoCodec('libx264')
          .audioCodec('aac');

        // Apply vertical crop (9:16) if requested
        if (vertical) {
          command = command.videoFilters([
            'scale=1080:1920:force_original_aspect_ratio=increase',
            'crop=1080:1920'
          ]);
        }

        command
          .on('end', resolve)
          .on('error', reject)
          .run();
      });

      results.push({
        clip_id: clip.output_name || `clip_${results.length}`,
        output_path: outputPath,
        start_sec: clip.start_sec,
        end_sec: clip.end_sec,
        duration_sec: duration
      });
    }

    logger.info({ jobId, action: 'cut-clips', clips_count: results.length, status: 'completed' });

    res.json({
      job_id: jobId,
      output_dir: outputDir,
      clips: results,
      status: 'completed'
    });

  } catch (error) {
    logger.error({ jobId, action: 'cut-clips', error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /burn-subtitles
 * Burn SRT subtitles into video
 *
 * Body: {
 *   video_path: string,
 *   srt_content: string (raw SRT) OR srt_path: string,
 *   style: { fontsize, fontcolor, outline, position }
 * }
 */
app.post('/burn-subtitles', async (req, res) => {
  const jobId = uuidv4();
  logger.info({ jobId, action: 'burn-subtitles', status: 'started' });

  try {
    const { video_path, srt_content, srt_path, style = {} } = req.body;

    if (!video_path) {
      return res.status(400).json({ error: 'video_path required' });
    }

    // Write SRT content to temp file if provided
    let subtitlePath = srt_path;
    if (srt_content && !srt_path) {
      subtitlePath = `./temp/outputs/${jobId}.srt`;
      await fs.writeFile(subtitlePath, srt_content);
    }

    if (!subtitlePath) {
      return res.status(400).json({ error: 'srt_content or srt_path required' });
    }

    const outputPath = `./temp/outputs/${jobId}_subtitled.mp4`;

    // Build subtitle filter with styling
    const fontsize = style.fontsize || 24;
    const fontcolor = style.fontcolor || 'white';
    const outline = style.outline || 2;
    const position = style.position || 'bottom'; // bottom, center, top

    // Escape path for FFmpeg
    const escapedPath = subtitlePath.replace(/([:\\])/g, '\\$1').replace(/'/g, "'\\''");

    const alignment = position === 'top' ? 6 : position === 'center' ? 5 : 2;

    await new Promise((resolve, reject) => {
      ffmpeg(video_path)
        .output(outputPath)
        .videoFilters(`subtitles='${escapedPath}':force_style='FontSize=${fontsize},PrimaryColour=&H${fontcolor}&,OutlineColour=&H000000&,Outline=${outline},Alignment=${alignment}'`)
        .videoCodec('libx264')
        .audioCodec('aac')
        .on('end', resolve)
        .on('error', reject)
        .run();
    });

    logger.info({ jobId, action: 'burn-subtitles', status: 'completed' });

    res.json({
      job_id: jobId,
      output_path: outputPath,
      status: 'completed'
    });

  } catch (error) {
    logger.error({ jobId, action: 'burn-subtitles', error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /generate-thumbnails
 * Generate thumbnail images from video
 *
 * Body: {
 *   video_path: string,
 *   timestamps: number[] (in seconds),
 *   count: number (auto-generate evenly spaced)
 * }
 */
app.post('/generate-thumbnails', async (req, res) => {
  const jobId = uuidv4();
  logger.info({ jobId, action: 'generate-thumbnails', status: 'started' });

  try {
    const { video_path, timestamps, count = 5 } = req.body;

    if (!video_path) {
      return res.status(400).json({ error: 'video_path required' });
    }

    const outputDir = `./temp/outputs/${jobId}_thumbs`;
    await fs.mkdir(outputDir, { recursive: true });

    const duration = await getVideoDuration(video_path);
    const times = timestamps || generateTimestamps(duration, count);

    const results = [];

    for (let i = 0; i < times.length; i++) {
      const outputPath = path.join(outputDir, `thumb_${i + 1}.jpg`);

      await new Promise((resolve, reject) => {
        ffmpeg(video_path)
          .screenshots({
            timestamps: [times[i]],
            filename: `thumb_${i + 1}.jpg`,
            folder: outputDir,
            size: '1080x1920'
          })
          .on('end', resolve)
          .on('error', reject);
      });

      results.push({
        index: i + 1,
        timestamp_sec: times[i],
        path: outputPath
      });
    }

    logger.info({ jobId, action: 'generate-thumbnails', count: results.length, status: 'completed' });

    res.json({
      job_id: jobId,
      output_dir: outputDir,
      thumbnails: results,
      status: 'completed'
    });

  } catch (error) {
    logger.error({ jobId, action: 'generate-thumbnails', error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /generate-srt
 * Generate SRT file from overlay texts with timing
 *
 * Body: {
 *   overlays: [{ text: string, start_sec: number, end_sec: number }]
 * }
 */
app.post('/generate-srt', async (req, res) => {
  const jobId = uuidv4();

  try {
    const { overlays } = req.body;

    if (!overlays?.length) {
      return res.status(400).json({ error: 'overlays array required' });
    }

    let srtContent = '';

    overlays.forEach((overlay, index) => {
      const startTime = secondsToSrtTime(overlay.start_sec);
      const endTime = secondsToSrtTime(overlay.end_sec);

      srtContent += `${index + 1}\n`;
      srtContent += `${startTime} --> ${endTime}\n`;
      srtContent += `${overlay.text}\n\n`;
    });

    const outputPath = `./temp/outputs/${jobId}.srt`;
    await fs.writeFile(outputPath, srtContent);

    res.json({
      job_id: jobId,
      srt_path: outputPath,
      srt_content: srtContent,
      overlay_count: overlays.length,
      status: 'completed'
    });

  } catch (error) {
    logger.error({ jobId, action: 'generate-srt', error: error.message });
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /process-clip-pack
 * Full pipeline: cut clips, burn subtitles, generate thumbnails
 *
 * Body: {
 *   video_path: string,
 *   clips: [{ start_sec, end_sec, overlays: [...] }],
 *   vertical: boolean
 * }
 */
app.post('/process-clip-pack', async (req, res) => {
  const jobId = uuidv4();
  logger.info({ jobId, action: 'process-clip-pack', status: 'started' });

  try {
    const { video_path, clips, vertical = true } = req.body;

    if (!video_path || !clips?.length) {
      return res.status(400).json({ error: 'video_path and clips required' });
    }

    const outputDir = `./temp/outputs/${jobId}_pack`;
    await fs.mkdir(outputDir, { recursive: true });

    const results = [];

    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i];
      const clipId = clip.clip_id || `clip_${i + 1}`;
      const clipDir = path.join(outputDir, clipId);
      await fs.mkdir(clipDir, { recursive: true });

      // 1. Cut clip
      const rawPath = path.join(clipDir, 'raw.mp4');
      const duration = clip.end_sec - clip.start_sec;

      await new Promise((resolve, reject) => {
        let command = ffmpeg(video_path)
          .setStartTime(clip.start_sec)
          .setDuration(duration)
          .output(rawPath)
          .videoCodec('libx264')
          .audioCodec('aac');

        if (vertical) {
          command = command.videoFilters([
            'scale=1080:1920:force_original_aspect_ratio=increase',
            'crop=1080:1920'
          ]);
        }

        command.on('end', resolve).on('error', reject).run();
      });

      let finalPath = rawPath;

      // 2. Burn subtitles if overlays provided
      if (clip.overlays?.length) {
        const srtPath = path.join(clipDir, 'subtitles.srt');
        let srtContent = '';

        clip.overlays.forEach((overlay, idx) => {
          const startTime = secondsToSrtTime(overlay.start_sec || 0);
          const endTime = secondsToSrtTime(overlay.end_sec || duration);
          srtContent += `${idx + 1}\n${startTime} --> ${endTime}\n${overlay.text}\n\n`;
        });

        await fs.writeFile(srtPath, srtContent);

        const subtitledPath = path.join(clipDir, 'final.mp4');
        const escapedSrt = srtPath.replace(/([:\\])/g, '\\$1').replace(/'/g, "'\\''");

        await new Promise((resolve, reject) => {
          ffmpeg(rawPath)
            .output(subtitledPath)
            .videoFilters(`subtitles='${escapedSrt}':force_style='FontSize=28,PrimaryColour=&Hffffff&,OutlineColour=&H000000&,Outline=2,Alignment=2'`)
            .videoCodec('libx264')
            .audioCodec('aac')
            .on('end', resolve)
            .on('error', reject)
            .run();
        });

        finalPath = subtitledPath;
      }

      // 3. Generate thumbnail
      const thumbPath = path.join(clipDir, 'thumbnail.jpg');
      await new Promise((resolve, reject) => {
        ffmpeg(finalPath)
          .screenshots({
            timestamps: [duration / 2],
            filename: 'thumbnail.jpg',
            folder: clipDir,
            size: '1080x1920'
          })
          .on('end', resolve)
          .on('error', reject);
      });

      results.push({
        clip_id: clipId,
        video_path: finalPath,
        thumbnail_path: thumbPath,
        duration_sec: duration,
        has_subtitles: !!clip.overlays?.length
      });
    }

    logger.info({ jobId, action: 'process-clip-pack', clips_count: results.length, status: 'completed' });

    res.json({
      job_id: jobId,
      output_dir: outputDir,
      clips: results,
      status: 'completed'
    });

  } catch (error) {
    logger.error({ jobId, action: 'process-clip-pack', error: error.message });
    res.status(500).json({ error: error.message });
  }
});

// Helper: Get video duration
async function getVideoDuration(videoPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) reject(err);
      else resolve(metadata.format.duration || 0);
    });
  });
}

// Helper: Generate evenly spaced timestamps
function generateTimestamps(duration, count) {
  const timestamps = [];
  const interval = duration / (count + 1);
  for (let i = 1; i <= count; i++) {
    timestamps.push(interval * i);
  }
  return timestamps;
}

// Helper: Convert seconds to SRT timestamp format
function secondsToSrtTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}

// Start server
const PORT = process.env.PORT || 3000;

ensureDirectories().then(() => {
  app.listen(PORT, () => {
    logger.info(`Chakra9 Video Factory running on port ${PORT}`);
    console.log(`🎬 Video Factory ready at http://localhost:${PORT}`);
  });
});
