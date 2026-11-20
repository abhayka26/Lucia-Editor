# Premiere Studio hardware profile: RTX 4060 + Intel Core i7-14700HX

Target environment: Windows 11, 16 GB system RAM.

## Confirmed platform capabilities

Intel's official specification for i7-14700HX lists 20 cores (8P+12E), 28 threads, Intel UHD Graphics for 14th Gen, 32 execution units, two multi-format codec engines and Intel Quick Sync Video. QSV still depends on the integrated GPU being enabled, the correct driver being installed and FFmpeg having a compatible QSV build/device path.

The RTX 4060 is Ada Lovelace. The expected NVENC generation is eighth generation. This GPU family supports hardware H.264, HEVC and AV1 encoding; supported decode formats include H.264, HEVC, VP9 and AV1, subject to codec profile, chroma format, bit depth, driver and FFmpeg build. The precise matrix must be checked against NVIDIA's official GPU support matrix.

A laptop RTX 4060 commonly has 8 GB VRAM, but Premiere Studio must detect rather than assume it. The 14700HX strongly suggests a laptop configuration, but the GPU could be configured differently by the OEM.

## Acceleration priority

1. NVDEC/CUDA for supported decode paths.
2. NVENC for H.264, HEVC and AV1 delivery encodes.
3. Intel QSV as a separately initialized fallback/alternate path.
4. Software decoders/encoders for unsupported profiles and formats.

Do not combine NVDEC and QSV within one stream unless a tested pipeline explicitly supports the transfer. Do not switch encoder in the middle of a render; restart the job with a compatible profile.

For NVENC, keep CUDA frames resident through compatible filters. Any CPU-only filter may require a GPU-to-CPU transfer and should be visible in performance diagnostics.

## Starting export presets

These are quality-oriented starting points, not universal optimal values:

| Output | Encoder | Preset | Rate control | CQ | Pixel format |
|---|---|---|---|---:|---|
| 1080p H.264 | h264_nvenc | p5 | VBR, CQ | 19 | yuv420p |
| 4K H.264 | h264_nvenc | p5 | VBR, CQ | 20 | yuv420p |
| 4K HEVC 10-bit | hevc_nvenc | p5 | VBR, CQ | 22 | p010le |
| 4K AV1 10-bit | av1_nvenc | p5 | VBR, CQ | 28 | p010le |
| 8K HEVC 10-bit | hevc_nvenc | p5 | VBR, CQ | 24 | p010le |

Use only if the installed FFmpeg build lists the encoder and the runtime device initialization succeeds. For high-motion content, increase quality by lowering CQ. For smaller files, increase CQ and verify visually. Export dimensions, FPS, pixel format and color metadata must be explicit.

NVENC does not provide ProRes encoding. Use a compatible software ProRes encoder or another validated intermediate codec for those workflows.

## Memory policy for 16 GB RAM

Initial target budget (not a hard OS reservation):

- OS and drivers: 4.5–5.5 GB
- Premiere Studio app + renderer: target 3–4 GB
- Other applications: 2–3 GB
- Filesystem/standby cache: 1–2 GB
- Safety headroom: 1.5–2 GB

Within the media engine's ~2 GB target:
- Decoded frame pool: 512 MB
- Frame cache: 384 MB
- Thumbnail cache: 192 MB
- Waveform cache: 96 MB
- Audio buffers: 128 MB
- Metadata/index cache: 128 MB
- Transient render reserve: 608 MB

These are application-managed ceilings/targets, not separate OS allocations. Dynamically shrink caches under memory pressure. Limit to one export job and two heavy decoders initially. 8K editing should default to 720p proxies and 1/8 preview; 4K60 should default to 1/4 preview and proxies when source bitrate or effects cause dropped frames.

## Validation commands (PowerShell)

```powershell
nvidia-smi
ffmpeg -hide_banner -version
ffmpeg -hide_banner -hwaccels
ffmpeg -hide_banner -encoders | findstr /i "nvenc qsv libx264 libx265 libsvtav1"
ffmpeg -hide_banner -decoders | findstr /i "cuvid qsv"
ffmpeg -hide_banner -h encoder=h264_nvenc
ffmpeg -hide_banner -h encoder=hevc_nvenc
ffmpeg -hide_banner -h encoder=av1_nvenc
```

Check Intel iGPU visibility in Device Manager and Windows Task Manager. A listed QSV encoder does not guarantee runtime initialization.

## Implementation files

- `apps/desktop/native/hardware-profile.cjs`: conservative profile and resource budgets.
- `apps/desktop/native/media-capabilities.cjs`: FFmpeg/NVIDIA/Intel capability inventory.
- `apps/desktop/native/render-profiles.cjs`: argument-array export profile builder.
- These modules are an initial adapter layer. Production integration still requires secure Electron IPC, path validation, runtime QSV/CUDA device-init tests, FFprobe output validation, cancellation, progress reporting and actual project render-graph integration.
