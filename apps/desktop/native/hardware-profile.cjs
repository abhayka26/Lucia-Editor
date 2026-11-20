/**
 * Conservative starting profile for an RTX 4060 + Intel Core i7-14700HX
 * Windows 11 laptop with 16 GB system RAM.
 *
 * GPU model/VRAM and enabled Intel iGPU must still be detected at runtime.
 */
module.exports = Object.freeze({
  platform: "win32",
  expected: {
    nvidiaGpuFamily: "Ada Lovelace",
    nvidiaNvencGeneration: "8th",
    cpu: "Intel Core i7-14700HX",
    intelQuickSyncExpected: true,
    systemRamGB: 16,
    typicalLaptopVramGB: 8
  },
  memoryMB: {
    // Application working-set target; not a hard OS-level memory limit.
    appWorkingSetTarget: 4096,
    mediaEngineBudget: 2048,
    frameCache: 384,
    decodedFramePool: 512,
    thumbnailCache: 192,
    waveformCache: 96,
    audioBuffers: 128,
    metadataAndIndexes: 128,
    transientRenderReserve: 608,
    maxConcurrentHeavyDecoders: 2,
    maxConcurrentRenderJobs: 1
  },
  playback: {
    defaultQuality: "half",
    qualityBySource: {
      "1080p": "full",
      "1440p": "half",
      "4k": "quarter",
      "5k": "quarter",
      "6k": "eighth",
      "8k": "eighth"
    },
    prefetchFrames: 3,
    useProxyAbovePixels: 8294400,
    useProxyForHighBitrate4k: true
  },
  proxies: {
    width: 1280,
    height: 720,
    videoCodec: "h264",
    encoderPreference: ["h264_nvenc", "h264_qsv", "libx264"],
    preset: "p5",
    cq: 25,
    audioCodec: "aac",
    audioBitrate: "128k",
    preserveSourceFrameRate: true,
    preserveOriginals: true
  },
  export: {
    concurrentJobs: 1,
    defaultPreset: "h264-4k-quality",
    profiles: {
      "h264-1080p": { codec: "h264", encoder: "h264_nvenc", preset: "p5", cq: 19, pixelFormat: "yuv420p" },
      "h264-4k-quality": { codec: "h264", encoder: "h264_nvenc", preset: "p5", cq: 20, pixelFormat: "yuv420p" },
      "hevc-4k-10bit": { codec: "hevc", encoder: "hevc_nvenc", preset: "p5", cq: 22, pixelFormat: "p010le" },
      "av1-4k-10bit": { codec: "av1", encoder: "av1_nvenc", preset: "p5", cq: 28, pixelFormat: "p010le" },
      "hevc-8k-10bit": { codec: "hevc", encoder: "hevc_nvenc", preset: "p5", cq: 24, pixelFormat: "p010le" }
    },
    softwareFallback: {
      h264: "libx264",
      hevc: "libx265",
      av1: "libsvtav1"
    }
  }
});
