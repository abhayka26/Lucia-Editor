# Premiere Studio — Architecture and Implementation Plan

## Product scope

Build an original, professional non-linear video editor for both desktop and web, with an AI editing assistant. This is a new product, separate from Lucia Editor. Do not copy Adobe proprietary source code, assets, trademarks, or protected implementation details.

## REA investigation boundary

Use https://github.com/morluto/rea only for authorized investigation of user-owned or explicitly authorized reference targets. REA is an analysis tool, not an editing engine. Verify the local installation, MCP registration, live tool inventory, and schemas before use. Start with static inspection; runtime inspection requires explicit target authorization and lifecycle approval. Do not bypass DRM, licensing, authentication, access controls, or extract proprietary assets/source. Record evidence IDs, observations, inferences, limitations, and confidence in docs/rea-investigation/.

If REA tools are not exposed, document that fact and proceed using original engineering and official documentation; do not claim REA analysis occurred.

## Architecture

Use a monorepo with shared business logic and platform adapters:

- apps/web: React + TypeScript + Vite browser application
- apps/desktop: Electron main, preload, renderer and native-service adapters
- packages/editor-core: project model, command bus, undo/redo, validation
- packages/timeline-engine: frame-accurate timeline model, tracks, clips, transitions, keyframes
- packages/media-engine: import, FFprobe metadata, thumbnails, waveforms, proxies, relinking
- packages/playback-engine: common playback API with browser and desktop adapters
- packages/effects-engine: effect registry and shared serializable effect graph
- packages/audio-engine: mixing and automation model
- packages/color-engine: color parameters, LUT handling and scopes
- packages/rendering-engine: render graph and FFmpeg job orchestration
- packages/project-schema: versioned project schema and migrations
- packages/ai-engine: provider gateway, structured edit plans, approval workflow
- packages/ui-components: reusable components
- services/api: Fastify API, auth, project and media endpoints
- services/render-workers: isolated server-side FFmpeg workers
- services/ai-gateway: local Ollama and configurable remote providers
- services/transcription: speech-to-text adapters
- infrastructure: Docker, database migrations, deployment
- tests: unit, integration, render verification and E2E

Recommended tooling: pnpm workspaces, TypeScript, Tailwind CSS, shadcn/ui, Electron with context isolation and sandboxing, SQLite desktop persistence, PostgreSQL cloud persistence, S3-compatible storage, Vitest and Playwright.

## Key engineering decisions

1. Use integer frame indices or rational time values internally; never rely on floating-point seconds for edit boundaries.
2. Use a command-based editor with deterministic undo/redo and serialized operations.
3. Keep preview and export effect semantics aligned through a shared effect graph.
4. Do not use FFmpeg.wasm as the main professional 4K export engine. Use native FFmpeg locally and isolated server-side workers for web exports.
5. WebCodecs is capability-dependent; provide a tested fallback path and report unsupported codecs honestly.
6. Keep desktop Node APIs out of the renderer. Expose narrow, validated IPC methods through preload.
7. AI emits validated, reviewable edit plans; all destructive actions require explicit user approval.
8. Imported projects and media are untrusted input. Enforce path validation, upload limits, resource budgets and safe process argument handling.
9. Desktop and web share project format, timeline semantics, commands and effect definitions; platform adapters handle filesystem, playback and rendering differences.
10. No feature is complete until its acceptance tests pass.

## Product capabilities

### Workspace
- Original graphite professional interface
- Resizable/collapsible panels and saved workspace presets
- Project/media browser, source and program monitor, timeline, inspector, effects and AI panels

### Media and projects
- Create/open/save/save-as, versioned project schema, autosave, backups, recovery
- Import video/audio/images, metadata, thumbnails, waveforms, bins, search, proxy creation and relinking

### Timeline
- Multiple video/audio tracks, drag/drop, split, trim, ripple, roll, slip, slide, snapping, markers, track lock/mute/solo/visibility, frame-accurate timecode
- Keyframes, transitions, undo/redo, efficient rendering and virtualization

### Playback
- Play/pause, seek, frame step, speed, loop, fullscreen, source/program monitors, proxy playback, sync and resource cleanup

### Effects and graphics
- Transform, crop, opacity, blur, sharpen, glow, brightness, contrast, saturation, hue, vignette, chroma key, masks, speed controls
- Effect registry with parameter validation, defaults, serialization, preview and render adapters
- Linear/eased/Bezier keyframes
- Text, titles, lower thirds and subtitle tracks

### Color
- Exposure, temperature, tint, contrast, highlights, shadows, whites, blacks, lift/gamma/gain, RGB curves, HSL and LUTs
- Histogram, waveform, vectorscope and RGB parade where supported
- Explicit documented color-space pipeline

### Audio
- Multitrack mixing, gain, pan, fades, crossfades, EQ, compressor, limiter, noise reduction, normalization, ducking, meters and automation

### Rendering
- Real FFmpeg render graph, native desktop jobs and web render workers
- Queue, progress, cancellation, retries, error reporting and temporary file cleanup
- MP4/MOV/WebM; H.264/H.265/AV1 subject to installed encoder availability; AAC/PCM audio
- Presets for 720p, 1080p, 1440p, 4K and 8K only where hardware and codec pipeline support them
- Verify actual output file, codec, dimensions, duration and audio

### AI Studio
- Natural-language editing, subtitles, transcription, silence detection, scene detection, highlights, reframing, audio cleanup, title suggestions and semantic media search
- Provider gateway with local Ollama and optional remote providers
- Structured JSON tool contracts, schema validation, context limits, streaming, cancellation and conversation history
- No arbitrary shell command execution; no direct source-media overwrite; explicit approval before destructive edits
- Editor must operate when AI is unavailable

## Delivery milestones

0. Audit repository and environment; document assumptions and decisions.
1. Create monorepo, build system, shared schemas and tests.
2. Build responsive web shell and secure Electron shell.
3. Implement editor UI and project/media browser.
4. Implement timeline model, commands, frame timing and undo/redo.
5. Implement import, metadata, thumbnails, waveforms, proxy and relink.
6. Implement preview adapters and synchronization.
7. Implement effects, keyframes, titles, color and audio.
8. Implement real FFmpeg rendering and queue.
9. Implement AI gateway, transcription and approval-based edit plans.
10. Implement cloud auth/storage/rendering and web/desktop parity.
11. Run security review, test suite, packaging, deployment and performance verification.

## Acceptance criteria

- Import real media and add it to multiple timeline tracks.
- Split, trim, move, ripple-delete, undo and redo correctly.
- Save, close, reopen and recover a project.
- Preview the actual edited sequence with audio synchronization.
- Apply effects and titles, then export a real MP4 using the render graph.
- Verify export codec, resolution, duration and audio by probing the output.
- Cancel render jobs and clean up resources.
- AI generates schema-valid edit plans and cannot apply destructive edits without approval.
- Web and desktop reopen compatible project files and preserve the edit decision.
- Automated tests cover core editing, persistence, media, rendering, AI validation and platform shells.

## Initial repository status

This document establishes the architecture only. No implementation, local REA analysis, tool installation, or test execution is claimed. The next implementation step is to create the workspace scaffold and a vertical-slice editor: import a video, place it on a timeline, preview, save/reopen, and render a verified MP4.
