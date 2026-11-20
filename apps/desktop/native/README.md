# Desktop native media adapter

This folder contains the first hardware-aware media-engine adapter.

- `hardware-profile.cjs` provides conservative settings for RTX 4060 + i7-14700HX + 16 GB RAM.
- `media-capabilities.cjs` inventories installed FFmpeg encoders/decoders/hwaccels and queries NVIDIA/CPU information.
- `render-profiles.cjs` builds FFmpeg argument arrays for selected output profiles.

These files are not yet wired into the Electron IPC or editor UI. Do not expose Node or shell execution to the renderer. Integrate through narrow, validated IPC methods and verify output with FFprobe before marking a render successful.
