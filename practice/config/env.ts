export const ENV = {
  // Video constraints
  MAX_VIDEO_DURATION_SECONDS: parseInt(process.env.EXPO_PUBLIC_MAX_VIDEO_DURATION_SECONDS || '60', 10),
  MAX_VIDEO_FILE_SIZE_MB: parseInt(process.env.EXPO_PUBLIC_MAX_VIDEO_FILE_SIZE_MB || '150', 10),

  // AI Service
  AI_ANALYSIS_TIMEOUT_MS: parseInt(process.env.EXPO_PUBLIC_AI_ANALYSIS_TIMEOUT_MS || '60000', 10),
  AI_PROCESSING_NOTIFICATION_MS: parseInt(process.env.EXPO_PUBLIC_AI_PROCESSING_NOTIFICATION_MS || '15000', 10),

  // Video recording
  VIDEO_QUALITY: '720p',
  VIDEO_FPS: 30,

  // Convex
  CONVEX_URL: process.env.EXPO_PUBLIC_CONVEX_URL || '',
  CONVEX_SITE_URL: (process.env.EXPO_PUBLIC_CONVEX_SITE_URL || '').replace(/\/+$/, ''),

  // Dev Bypass
  DEV_BYPASS_AUTH: process.env.EXPO_PUBLIC_DEV_BYPASS_AUTH === 'true',
};
