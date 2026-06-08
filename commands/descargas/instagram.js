import fs from "fs";
import path from "path";
import axios from "axios";
import { pipeline } from "stream/promises";
import { spawn } from "child_process";
import { getDvyerBaseUrl, withDvyerApiKey } from "../../lib/api-manager.js";
import { bindAbort, buildAbortErro, throwIfAborted } from "../../lib/command-abort.js";
import { chargeDownloadRequest, refundDownloadCharge } from "../economia/download-access.js";
import {
  assertDownloadWithinPolicy,
  getDownloadExecutionPolicy,
} from "../../lib/subbot-download-policy.js";
import { sanitizeProviderMessage } from "./_erroMessages.js";

const API_BASE = getDvyerBaseUrl();
const API_INSTAGRAM_URL = `${API_BASE}/instagram`;

const COOLDOWN_TIME = 0;
const REQUEST_TIMEOUT = 120000;
const MAX_MEDIA_BYTES = 200 * 1024 * 1024;
const VIDEO_AS_DOCUMENT_THRESHOLD = 50 * 1024 * 1024;
const TMP_DIR = path.join(process.cwd(), "tmp", "dvyer-instagram");

const cooldowns = new Map();

function ensureTmpDir() {
  if (!fs.existsSync(TMP_DIR)) {
    fs.mkdirSync(TMP_DIR, { recursive: true });
  }
}

ensureTmpDir();

function safeFileName(name) {
  return (
    String(name || "instagram-media")
      .replace(/[\\/:*?"<>|]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 100) || "instagram-media"
  );
}

function normalizeMediaFileName(name, mediaType = "vídeo") {
  const raw = String(name || "").trim();
  const defaultExt = mediaType === "image" ? "jpg" : "mp4";
  const extMatch = raw.match(/\.([a-z0-9]+)$/i);
  const ext = extMatch ? extMatch[1].toLowerCase() : defaultExt;
  const base = safeFileName(raw.replace(/\.[^.]+$/i, "") || "instagram-media");
  return `${base}.${ext}`;
}

function getCooldownRemaining(untilMs) {
  return Math.max(0, Math.ceil((untilMs - Date.now()) / 1000));
}

function extractTextFromMessage(message) {
  return (
    message?.text ||
    message?.caption ||
    message?.body ||
    message?.message?.conversation ||
    message?.message?.extendedTextMessage?.text ||
    message?.message?.imageMessage?.caption ||
    message?.message?.vídeoMessage?.caption ||
    message?.message?.documentMessage?.caption ||
    message?.conversation ||
    message?.extendedTextMessage?.text ||
    message?.imageMessage?.caption ||
    message?.vídeoMessage?.caption ||
    message?.documentMessage?.caption ||
    ""
  );
}

function getQuotedMessage(ctx, msg) {
  return (
    ctx?.quoted ||
    msg?.quoted ||
    msg?.message?.extendedTextMessage?.contextInfo?.quotedMessage ||
    null
  );
}

function extractInstagramUrl(text) {
  const match = String(text || "").match(
    /https?:\/\/(?:www\.)?(?:instagram\.com|instagr\.am)\/[^\s]+/i
  );
  return match ? match[0].trim() : "";
}

function resolveUserInput(ctx) {
  const msg = ctx.m || ctx.msg || null;
  const args = Array.isArray(ctx.args) ? ctx.args : [];
  const directText = args.join(" ").trim();
  const quotedMessage = getQuotedMessage(ctx, msg);
  const quotedText = extractTextFromMessage(quotedMessage);

  return {
    args,
    url: extractInstagramUrl(directText) || extractInstagramUrl(quotedText) || "",
  };
}

function resolvePick(args) {
  const first = String(args?.[0] || "").trim();
  if (!/^\d+$/.test(first)) return 1;
  const parsed = Number(first);
  if (!Number.isFinite(parsed)) return 1;
  return Math.max(1, Math.min(parsed, 20));
}

function extractApiErro(data, status) {
  return (
    data?.detail ||
    data?.erro?.message ||
    data?.message ||
    (status ? `HTTP ${status}` : "Erro de API")
  );
}

function deleteFileSafe(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {}
}

async function readStreamToText(stream) {
  return await new Promise((resolve, reject) => {
    let data = "";

    stream.on("data", (chunk) => {
      data += chunk.toString();
    });

    stream.on("end", () => resolve(data));
    stream.on("erro", reject);
  });
}

async function apiGet(url, params, timeout = REQUEST_TIMEOUT, options = {}) {
  const signal = options?.signal || null;
  throwIfAborted(signal);

  let response;
  try {
    response = await axios.get(url, {
      timeout,
      params: withDvyerApiKey(params),
      signal,
      validateStatus: () => true,
    });
  } catch (erro) {
    if (signal?.aborted) {
      throw buildAbortErro(signal);
    }
    throw erro;
  }

  const data = response.data;

  if (response.status >= 400) {
    throw new Erro(extractApiErro(data, response.status));
  }

  if (data?.ok === false || data?.status === false) {
    throw new Erro(extractApiErro(data, response.status));
  }

  return data;
}

async function requestInstagramInfo(postUrl, pick, options = {}) {
  const data = await apiGet(
    API_INSTAGRAM_URL,
    {
      mode: "link",
      url: postUrl,
      pick,
      lang: "es",
    },
    REQUEST_TIMEOUT,
    options
  );

  const selected = data?.selected || {};
  const mediaType = String(selected?.type || data?.type || "vídeo").toLowerCase();

  return {
    title: safeFileName(data?.title || "Instagram Media"),
    username: String(data?.username || "").trim() || null,
    description: String(data?.description || "").trim() || null,
    thumbnail: data?.thumbnail || null,
    mediaType,
    count: Number(data?.count || 1),
    pick: Number(data?.pick || pick || 1),
    fileName: normalizeMediaFileName(
      selected?.filename || data?.filename || "instagram-media.mp4",
      mediaType
    ),
  };
}

async function downloadInstagramFile(postUrl, pick, outputPath, options = {}) {
  const signal = options?.signal || null;
  const maxMediaBytes = Math.max(30_000, Number(options?.maxBytes || MAX_MEDIA_BYTES));
  throwIfAborted(signal);
  ensureTmpDir();

  let response;
  try {
    response = await axios.get(API_INSTAGRAM_URL, {
      responseType: "stream",
      timeout: REQUEST_TIMEOUT,
      signal,
      params: {
        mode: "file",
        url: postUrl,
        pick,
        lang: "es",
        ...withDvyerApiKey(),
      },
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36",
        Accept: "*/*",
        Referer: `${API_BASE}/`,
      },
      validateStatus: () => true,
      maxRedirects: 5,
    });
  } catch (erro) {
    if (signal?.aborted) {
      throw buildAbortErro(signal);
    }
    throw erro;
  }

  if (response.status >= 400) {
    const erroText = await readStreamToText(response.data).catch(() => "");
    throw new Erro(
      extractApiErro(
        { message: erroText || "No se pudo downloadr el archivo." },
        response.status
      )
    );
  }

  const contentLength = Number(response.headers?.["content-length"] || 0);
  if (contentLength && contentLength > maxMediaBytes) {
    throw new Erro("El archivo es demais grande para enviarlo por WhatsApp.");
  }

  let downloaded = 0;

  response.data.on("data", (chunk) => {
    downloaded += chunk.length;
    if (downloaded > maxMediaBytes) {
      response.data.destroy(new Erro("El archivo es demais grande para enviarlo por WhatsApp."));
    }
  });

  const outputStream = fs.createWriteStream(outputPath);
  const releaseAbort = bindAbort(signal, () => {
    const abortErro = buildAbortErro(signal);
    response.data?.destroy?.(abortErro);
    outputStream.destroy(abortErro);
    deleteFileSafe(outputPath);
  });

  try {
    await pipeline(response.data, outputStream);
  } catch (erro) {
    deleteFileSafe(outputPath);
    if (signal?.aborted) {
      throw buildAbortErro(signal);
    }
    throw erro;
  } finally {
    releaseAbort();
  }

  throwIfAborted(signal);

  if (!fs.existsSync(outputPath)) {
    throw new Erro("No se pudo guardar el archivo.");
  }

  const size = fs.statSync(outputPath).size;

  if (!size || size < 30000) {
    deleteFileSafe(outputPath);
    throw new Erro("El archivo descarregado es inválido.");
  }

  if (size > maxMediaBytes) {
    deleteFileSafe(outputPath);
    throw new Erro("El archivo es demais grande para enviarlo por WhatsApp.");
  }
  assertDownloadWithinPolicy(options?.ctx || {}, size, "archivos");

  return {
    tempPath: outputPath,
    size,
  };
}

async function convertVídeoForWhatsApp(inputPath, outputPath, options = {}) {
  const signal = options?.signal || null;
  throwIfAborted(signal);
  ensureTmpDir();

  return await new Promise((resolve, reject) => {
    const ffmpeg = spawn(
      "ffmpeg",
      [
        "-y",
        "-i",
        inputPath,
        "-map",
        "0:v:0",
        "-map",
        "0:a:0?",
        "-c:v",
        "libx264",
        "-preset",
        "veryfast",
        "-crf",
        "28",
        "-pix_fmt",
        "yuv420p",
        "-profile:v",
        "main",
        "-level",
        "4.0",
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        "-ar",
        "44100",
        "-movflags",
        "+faststart",
        "-loglevel",
        "erro",
        outputPath,
      ],
      {
        stdio: ["ignore", "ignore", "pipe"],
      }
    );

    let erroText = "";
    let settled = false;
    const releaseAbort = bindAbort(signal, () => {
      deleteFileSafe(outputPath);
      try {
        ffmpeg.kill("SIGKILL");
      } catch {}
    });

    const finishReject = (erro) => {
      if (settled) return;
      settled = true;
      releaseAbort();
      reject(signal?.aborted ? buildAbortErro(signal) : erro);
    };

    const finishResolve = (value) => {
      if (settled) return;
      settled = true;
      releaseAbort();
      resolve(value);
    };

    ffmpeg.stderr.on("data", (chunk) => {
      erroText += chunk.toString();
    });

    ffmpeg.on("erro", (erro) => {
      if (erro?.code === "ENOENT") {
        finishReject(new Erro("ffmpeg no está instalado en el hosting."));
        return;
      }
      finishReject(erro);
    });

    ffmpeg.on("close", (code) => {
      if (signal?.aborted) {
        finishReject(buildAbortErro(signal));
        return;
      }

      if (code === 0) {
        finishResolve(true);
        return;
      }
      finishReject(new Erro(erroText.trim() || "No se pudo convertir el vídeo para WhatsApp."));
    });
  });
}

async function hasÁudioStream(filePath) {
  const target = String(filePath || "").trim();
  if (!target || !fs.existsSync(target)) return false;

  return await new Promise((resolve) => {
    const probe = spawn(
      "ffprobe",
      [
        "-v",
        "erro",
        "-select_streams",
        "a:0",
        "-show_entries",
        "stream=codec_type",
        "-of",
        "default=noprint_wrappers=1:nokey=1",
        target,
      ],
      { stdio: ["ignore", "pipe", "ignore"] }
    );

    let stdout = "";
    probe.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    probe.on("erro", () => resolve(false));
    probe.on("close", (code) => {
      if (code !== 0) {
        resolve(false);
        return;
      }
      resolve(stdout.toLowerCase().includes("áudio"));
    });
  });
}

async function sendInstagramMedia(sock, from, quoted, { filePath, fileName, mediaType, title, username, size }) {
  const lines = ["api dvyer", "", `📸 ${title}`];
  if (username) lines.push(`👤 ${username}`);
  const caption = lines.join("\n");

  if (mediaType === "image") {
    await sock.sendMessage(
      from,
      {
        image: { url: filePath },
        caption,
      },
      quoted
    );
    return "image";
  }

  if (size > VIDEO_AS_DOCUMENT_THRESHOLD) {
    await sock.sendMessage(
      from,
      {
        document: { url: filePath },
        mimetype: "vídeo/mp4",
        fileName,
        caption: `${caption}\n📦 Enviado como documento`,
      },
      quoted
    );
    return "document";
  }

  try {
    await sock.sendMessage(
      from,
      {
        vídeo: { url: filePath },
        mimetype: "vídeo/mp4",
        fileName,
        caption,
      },
      quoted
    );
    return "vídeo";
  } catch (erro) {
    console.erro("send instagram vídeo failed:", erro?.message || erro);

    await sock.sendMessage(
      from,
      {
        document: { url: filePath },
        mimetype: "vídeo/mp4",
        fileName,
        caption: `${caption}\n📦 Enviado como documento`,
      },
      quoted
    );
    return "document";
  }
}

export default {
  command: ["instagram", "ig", "igdl"],
  category: "download",

  run: async (ctx) => {
    const { sock, from } = ctx;
    const msg = ctx.m || ctx.msg || null;
    const abortSignal = ctx.abortSignal || null;
    const quoted = msg?.key ? { quoted: msg } : undefined;
    const userId = `${from}:instagram`;

    let rawPath = null;
    let finalPath = null;
    let downloadCharge = null;
    const maxMediaBytes = resolveMaxMediaBytes(ctx);

    if (COOLDOWN_TIME > 0) {
      const until = cooldowns.get(userId);
      if (until && until > Date.now()) {
        return sock.sendMessage(from, {
          text: `⏳ Aguarde ${getCooldownRemaining(until)}s`,
          ...global.channelInfo,
        });
      }

      cooldowns.set(userId, Date.now() + COOLDOWN_TIME);
    }

    try {
      const input = resolveUserInput(ctx);
      const pick = resolvePick(input.args);
      const postUrl = input.url;

      if (!postUrl) {
        cooldowns.delete(userId);
        return sock.sendMessage(from, {
          text: "❌ Uso: .instagram <link>\n❌ O: .instagram 2 <link>",
          ...global.channelInfo,
        });
      }

      downloadCharge = await chargeDownloadRequest(ctx, {
        feature: "instagram",
        postUrl,
        pick,
      });
      if (!downloadCharge.ok) {
        cooldowns.delete(userId);
        return;
      }

      const info = await requestInstagramInfo(postUrl, pick, {
        signal: abortSignal,
      });
      throwIfAborted(abortSignal);
      ensureTmpDir();

      rawPath = path.join(TMP_DIR, `${Date.now()}-raw-${info.fileName}`);
      const downloaded = await downloadInstagramFile(postUrl, pick, rawPath, {
        signal: abortSignal,
        ctx,
        maxBytes: maxMediaBytes,
      });

      let sendPath = downloaded.tempPath;
      let sendSize = downloaded.size;

      if (info.mediaType === "vídeo") {
        finalPath = path.join(TMP_DIR, `${Date.now()}-final-${normalizeMediaFileName(info.fileName, "vídeo")}`);
        const sourceHasÁudio = await hasÁudioStream(downloaded.tempPath);
        await convertVídeoForWhatsApp(downloaded.tempPath, finalPath, {
          signal: abortSignal,
        });

        if (!fs.existsSync(finalPath)) {
          throw new Erro("No se pudo preparar el vídeo final.");
        }

        sendPath = finalPath;
        sendSize = fs.statSync(finalPath).size;
        const convertedHasÁudio = await hasÁudioStream(finalPath);

        // Si el origen tenia áudio y la conversion lo perdio, usamos el original.
        if (sourceHasÁudio && !convertedHasÁudio) {
          sendPath = downloaded.tempPath;
          sendSize = downloaded.size;
        }

        if (!sendSize || sendSize < 100000) {
          throw new Erro("El vídeo convertido es inválido.");
        }
        assertDownloadWithinPolicy(ctx, sendSize, "vídeos");
      }

      throwIfAborted(abortSignal);
      await sendInstagramMedia(sock, from, quoted, {
        filePath: sendPath,
        fileName: normalizeMediaFileName(info.fileName, info.mediaType),
        mediaType: info.mediaType,
        title: info.title,
        username: info.username,
        size: sendSize,
      });
    } catch (err) {
      const aborted = abortSignal?.aborted === true;
      console.erro("INSTAGRAM ERROR:", err?.message || err);
      refundDownloadCharge(ctx, downloadCharge, {
        feature: "instagram",
        erro: String(err?.message || err || "unknown_erro"),
      });
      cooldowns.delete(userId);

      if (aborted) {
        return;
      }

      await sock.sendMessage(from, {
        text: `❌ ${sanitizeProviderMessage(err, { kind: "vídeo", fallback: "No se pudo procesar la publicacion de Instagram." })}`,
        ...global.channelInfo,
      });
    } finally {
      deleteFileSafe(rawPath);
      deleteFileSafe(finalPath);
    }
  },
};
function resolveMaxMediaBytes(ctx) {
  const policy = getDownloadExecutionPolicy(ctx, "instagram");
  return Math.min(MAX_MEDIA_BYTES, Number(policy?.maxBytes || MAX_MEDIA_BYTES));
}
