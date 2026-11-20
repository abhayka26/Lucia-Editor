# Premiere Studio

An original cross-platform non-linear video editor foundation for web and desktop. This product is independent and is not affiliated with Adobe.

## Status

The foundation branch contains a monorepo, frame-based shared editing model, a React/Vite editor shell, and a secure Electron shell. It is not yet a complete professional editor: robust media ingest, synchronized timeline playback, full effect and audio pipelines, AI integration, cloud rendering and verified FFmpeg export remain planned milestones.

See [the architecture plan](docs/PREMIERE_STUDIO_ARCHITECTURE.md).

## Requirements

- Node.js 22.19+ or a supported current LTS release
- npm
- Git
- FFmpeg and FFprobe for forthcoming native rendering work

## Install

```bash
npm install
```

## Run web

```bash
npm run dev:web
```

## Run desktop

```bash
npm run desktop
```

## Build and verify

```bash
npm run build
npm run typecheck
npm test
```

## Principles

- One shared project model and editing semantics across platforms.
- Integer-frame or rational time representation for edit boundaries.
- Shared effect definitions for preview and export.
- AI produces validated edit plans; users approve changes.
- Treat imported media and project files as untrusted input.
- Never copy proprietary Adobe source, assets, or protected implementation details.

No license has been selected. Do not assume reuse rights until a license is added.
