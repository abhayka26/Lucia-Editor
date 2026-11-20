const profile = require("./hardware-profile.cjs");

const dimensions = {
  "1080p": [1920, 1080], "1440p": [2560, 1440],
  "4k-uhd": [3840, 2160], "4k-dci": [4096, 2160],
  "5k": [5120, 2880], "6k": [6144, 3160], "8k": [7680, 4320]
};

function buildExportArgs({ inputPath, outputPath, resolution = "4k-uhd", fps = 30, codec = "h264", hardware = "auto", quality }) {
  if (!inputPath || !outputPath) throw new Error("Input and output paths are required.");
  if (!dimensions[resolution]) throw new Error("Unsupported resolution preset.");
  if (![23.976, 24, 25, 29.97, 30, 50, 59.94, 60, 100, 120].includes(Number(fps))) throw new Error("Unsupported frame rate.");
  if (!["h264", "hevc", "av1"].includes(codec)) throw new Error("Unsupported delivery codec.");
  const [width, height] = dimensions[resolution];
  const key = codec === "h264" ? "h264-4k-quality" : codec === "hevc" ? "hevc-4k-10bit" : "av1-4k-10bit";
  const preset = profile.export.profiles[key];
  const encoder = hardware === "software" ? profile.export.softwareFallback[codec] : preset.encoder;
  const cq = Number.isInteger(quality) ? Math.max(0, Math.min(51, quality)) : preset.cq;
  const args = ["-hide_banner", "-y", "-i", inputPath, "-map", "0:v:0", "-map", "0:a?", "-vf", `scale=${width}:${height}:flags=lanczos,fps=${fps}`];

  if (hardware !== "software" && encoder.endsWith("_nvenc")) {
    args.push("-c:v", encoder, "-preset", "p5", "-rc", "vbr", "-cq", String(cq), "-b:v", "0", "-pix_fmt", codec === "h264" ? "yuv420p" : "p010le");
  } else if (encoder === "libx264") {
    args.push("-c:v", encoder, "-preset", "medium", "-crf", String(Math.min(30, Math.max(16, cq))), "-pix_fmt", "yuv420p");
  } else if (encoder === "libx265") {
    args.push("-c:v", encoder, "-preset", "medium", "-crf", String(Math.min(32, Math.max(18, cq))), "-pix_fmt", "yuv420p10le");
  } else {
    args.push("-c:v", encoder, "-preset", "6", "-crf", String(Math.min(40, Math.max(20, cq))), "-pix_fmt", "yuv420p10le");
  }
  args.push("-c:a", "aac", "-b:a", "320k", "-movflags", "+faststart", outputPath);
  return args;
}

module.exports = { buildExportArgs, dimensions };
