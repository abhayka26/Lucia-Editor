const { spawn } = require("node:child_process");
const os = require("node:os");
const profile = require("./hardware-profile.cjs");

function run(command, args, timeoutMs = 8000) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "", stderr = "", settled = false;
    const finish = (result) => { if (!settled) { settled = true; resolve(result); } };
    const timer = setTimeout(() => { child.kill(); finish({ ok: false, stdout, stderr, error: "timeout" }); }, timeoutMs);
    child.stdout.on("data", chunk => { stdout += chunk.toString(); });
    child.stderr.on("data", chunk => { stderr += chunk.toString(); });
    child.on("error", error => { clearTimeout(timer); finish({ ok: false, stdout, stderr, error: error.message }); });
    child.on("close", code => { clearTimeout(timer); finish({ ok: code === 0, code, stdout, stderr }); });
  });
}

async function detectMediaCapabilities() {
  const [version, encoders, decoders, hwaccels, nvidia, cpu] = await Promise.all([
    run("ffmpeg", ["-hide_banner", "-version"]),
    run("ffmpeg", ["-hide_banner", "-encoders"]),
    run("ffmpeg", ["-hide_banner", "-decoders"]),
    run("ffmpeg", ["-hide_banner", "-hwaccels"]),
    run("nvidia-smi", ["--query-gpu=name,memory.total,driver_version", "--format=csv,noheader"]),
    run("powershell.exe", ["-NoProfile", "-NonInteractive", "-Command", "(Get-CimInstance Win32_Processor | Select-Object -First 1 -ExpandProperty Name)"])
  ]);

  const enc = encoders.stdout || "";
  const dec = decoders.stdout || "";
  const hw = hwaccels.stdout || "";
  const gpuLine = nvidia.stdout.trim().split(/\r?\n/)[0] || "";
  const gpuParts = gpuLine.split(",").map(x => x.trim());
  const has = (text, name) => new RegExp("\\b" + name.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&") + "\\b").test(text);

  return {
    detectedAt: new Date().toISOString(),
    platform: process.platform,
    cpuModel: cpu.stdout.trim() || null,
    systemRamGB: Math.round(os.totalmem() / (1024 ** 3)),
    ffmpegAvailable: version.ok,
    ffmpegVersion: version.stdout.split(/\r?\n/)[0] || null,
    nvidia: {
      detected: nvidia.ok && Boolean(gpuParts[0]),
      model: gpuParts[0] || null,
      vram: gpuParts[1] || null,
      driver: gpuParts[2] || null,
      nvenc: {
        h264: has(enc, "h264_nvenc"),
        hevc: has(enc, "hevc_nvenc"),
        av1: has(enc, "av1_nvenc")
      },
      nvdec: {
        cudaHwaccelListed: has(hw, "cuda"),
        h264CuvidListed: has(dec, "h264_cuvid"),
        hevcCuvidListed: has(dec, "hevc_cuvid"),
        av1CuvidListed: has(dec, "av1_cuvid")
      }
    },
    intelQuickSync: {
      cpuExpected: /i7-14700hx/i.test(cpu.stdout),
      qsvHwaccelListed: has(hw, "qsv"),
      encoders: {
        h264: has(enc, "h264_qsv"),
        hevc: has(enc, "hevc_qsv"),
        av1: has(enc, "av1_qsv")
      },
      note: "FFmpeg listing is not proof that the Intel iGPU is enabled or that QSV device initialization succeeds. Perform a runtime device-init probe before use."
    },
    softwareFallback: {
      h264: has(enc, "libx264"),
      hevc: has(enc, "libx265"),
      av1: has(enc, "libsvtav1")
    },
    memoryProfile: profile.memoryMB
  };
}

module.exports = { detectMediaCapabilities };
