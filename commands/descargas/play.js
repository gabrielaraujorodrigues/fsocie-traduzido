import yts from "yt-search";
import { sanitizeProviderMessage } from "./_erroMessages.js";

const MAX_RESULTS = 5;
const PICK_TOKEN_PATTERN = /^--pick=(\d{1,2})$/i;
const PLAY_SOURCE_URL = "https://dv-yer-api.online";

function getPrefix(settings) {
  if (Array.isArray(settings?.prefix)) {
    return settings.prefix.find((value) => String(value || "").trim()) || ".";
  }

  return String(settings?.prefix || ".").trim() || ".";
}

function cleanText(value = "") {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function clipText(value = "", max = 72) {
  const text = cleanText(value);
  return text.length <= max ? text : `${text.slice(0, Math.max(1, max - 3))}...`;
}

function buildCommand(prefix, command, value) {
  return `${prefix}${command} ${value}`.trim();
}

function parsePlayArgs(args = []) {
  const rawArgs = Array.isArray(args) ? args : [];
  let pickIndex = 0;
  const queryParts = [];

  for (const token of rawArgs) {
    const text = String(token || "").trim();
    const pickMatch = text.match(PICK_TOKEN_PATTERN);

    if (pickMatch) {
      pickIndex = Math.max(0, Math.min(MAX_RESULTS - 1, Number(pickMatch[1] || 0)));
      continue;
    }

    if (text) {
      queryParts.push(text);
    }
  }

  return {
    pickIndex,
    query: queryParts.join(" ").trim(),
  };
}

function buildPlayButtons(prefix, query, vídeos, currentIndex) {
  const current = vídeos[currentIndex];
  const currentUrl = cleanText(current?.url || "");
  const buttons = [
    {
      buttonId: buildCommand(prefix, "ytmp3", currentUrl),
      buttonText: { displayText: "🎵 YTMP3" },
      type: 1,
    },
    {
      buttonId: buildCommand(prefix, "ytmp4", currentUrl),
      buttonText: { displayText: "🎬 YTMP4" },
      type: 1,
    },
  ];

  if (currentIndex < vídeos.length - 1 && currentIndex < MAX_RESULTS - 1) {
    buttons.push({
      buttonId: buildCommand(prefix, "play", `--pick=${currentIndex + 1} ${query}`),
      buttonText: { displayText: "➡️ Próximo" },
      type: 1,
    });
  }

  return buttons;
}

async function react(sock, msg, emoji) {
  try {
    if (!msg?.key) return;
    await sock.sendMessage(msg.key.remoteJid, {
      react: {
        text: emoji,
        key: msg.key,
      },
    });
  } catch {}
}

function buildUsageMessage(prefix) {
  return [
  "╭━━━〔 ✦ 🎧 *ＦＳＯＣＩＥＴＹ ＰＬＡＹ* 🎧 ✦ 〕━━━⬣",
  "┃",
  "┃ ✨ *Búsqueda instantánea de YouTube*",
  "┃ ⚡ Música • Vídeos • Downloads rápidas",
  "┃",
  "┣━━━〔 🔎 USO DEL COMANDO 🔎 〕━━━⬣",
  `┃ ➤ ${prefix}play ozuna odisea`,
  `┃ ➤ ${prefix}play bad bunny`,
  `┃ ➤ ${prefix}play link o nome`,
  "┃",
  "┣━━━〔 📥 OPCIONES DISPONIBLES 📥 〕━━━⬣",
  "┃ 🎧 Downloadr en *MP3*",
  "┃ 🎬 Downloadr en *MP4*",
  "┃ 🖼️ Portada automática incluida",
  "┃ ⚡ Resultados rápidos y directos",
  "┃",
  "┣━━━━━━━━━━━━━━━━━━━━━━⬣",
  "┃ 🌙 Powered By *DVYER API*",
  "╰━━━〔 ⚡ ✦ ⚡ ✦ ⚡ 〕━━━⬣"
].join("\n");
}

function buildResultCaption(query, vídeo, currentIndex, total) {
  const title = clipText(vídeo?.title || "Sin título", 58);
  const duration = cleanText(vídeo?.timestamp || "??:??");
  const author = clipText(vídeo?.author?.name || vídeo?.author || "Desconocido", 30);
  const views = cleanText(vídeo?.views || vídeo?.viewsText || "");
  const published = clipText(vídeo?.ago || vídeo?.publishedAt || "No definido", 24);

  return [
  "╭═━━〔 🜲 🎶 ༺ＰＬＡＹ༻ 🎶 🜲 〕━━═⬣",
  "┃",
  `┃ ⪩🧿⪨ *Búsqueda:* ${clipText(query, 48)}`,
  `┃ ⪩📑⪨ *Resultado:* ${currentIndex + 1}/${total}`,
  "┃",
  `┃ ⪩🎵⪨ *Título:* ${title}`,
  `┃ ⪩👤⪨ *Canal:* ${author}`,
  `┃ ⪩⏳⪨ *Duración:* ${duration}`,
  `┃ ⪩👁️⪨ *Views:* ${views || "No definido"}`,
  `┃ ⪩📆⪨ *Publicado:* ${published}`,
  `┃ ⪩🌐⪨ *API:* ${PLAY_SOURCE_URL}`,
  "┃",
  "┣━━━〔 ✦ 🎧 𝐃𝐄𝐒𝐂𝐀𝐑𝐆𝐀𝐒 🎧 ✦ 〕━━━⬣",
  "┃ ✧ ➜ *MP3* ▸ Áudio",
  "┃ ✧ ➜ *MP4* ▸ Vídeo",
  currentIndex < total - 1
    ? "┃ ✧ ➜ *Próximo* ▸ Ver más resultados"
    : "┃ ✧ ➜ ✅ Último resultado disponível",
  "┃",
  "┣━━━━━━━━━━━━━━━━━━━━━━⬣",
  "┃ ⚡ 𝐅𝐒𝐎𝐂𝐈𝐄𝐓𝐘 - 𝐌𝐔𝐒𝐈𝐂 𝐄𝐍𝐆𝐈𝐍𝐄 ⚡",
  "╰═━━〔 ☯ ✦ ☯ ✦ ☯ 〕━━═⬣"
]. join("\n");
}

function buildButtonPainel(query, vídeo, currentIndex, total) {
  const title = clipText(vídeo?.title || "Sin título", 54);
  const duration = cleanText(vídeo?.timestamp || "??:??");

  return [
    "╭━━━〔 ⚡ *FSOCIETY PLAY* ⚡ 〕━━━⬣",
    `┃ 🎵 *${title}*`,
    `┃ ⏱️ ${duration} | Resultado ${currentIndex + 1}/${total}`,
    "┃",
    "┃ • MP3 = áudio",
    "┃ • MP4 = vídeo",
    currentIndex < total - 1 ? "┃ • Próximo = próximo resultado" : "┃ • Último resultado disponível",
    "┃",
    `┃ 🔎 ${clipText(query, 44)}`,
    `┃ 🌐 ${PLAY_SOURCE_URL}`,
    "╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━⬣",
  ].join("\n");
}

async function sendPlayCard(sock, from, quoted, query, vídeo, currentIndex, vídeos, prefix) {
  const caption = buildResultCaption(query, vídeo, currentIndex, vídeos.length);
  const buttons = buildPlayButtons(prefix, query, vídeos, currentIndex);

  if (vídeo?.thumbnail) {
    try {
      await sock.sendMessage(
        from,
        {
          image: { url: vídeo.thumbnail },
          caption,
          buttons,
          footer: "FSOCIETY BOT • YouTube • dv-yer-api.online",
          headerType: 4,
          ...global.channelInfo,
        },
        quoted
      );
      return true;
    } catch {}
  }

  try {
    await sock.sendMessage(
      from,
      {
        text: buildButtonPainel(query, vídeo, currentIndex, vídeos.length),
        buttons,
        footer: "FSOCIETY BOT • YouTube • dv-yer-api.online",
        headerType: 1,
        ...global.channelInfo,
      },
      quoted
    );
    return true;
  } catch {
    try {
      await sock.sendMessage(
        from,
        {
          text: caption,
          ...global.channelInfo,
        },
        quoted
      );
    } catch {}

    const currentUrl = cleanText(vídeo?.url || "");
    const fallbackLines = [
      buildButtonPainel(query, vídeo, currentIndex, vídeos.length),
      "",
      `MP3: ${buildCommand(prefix, "ytmp3", currentUrl)}`,
      `MP4: ${buildCommand(prefix, "ytmp4", currentUrl)}`,
    ];

    if (currentIndex < vídeos.length - 1 && currentIndex < MAX_RESULTS - 1) {
      fallbackLines.push(
        `Próximo: ${buildCommand(prefix, "play", `--pick=${currentIndex + 1} ${query}`)}`
      );
    }

    await sock.sendMessage(
      from,
      {
        text: fallbackLines.join("\n"),
        ...global.channelInfo,
      },
      quoted
    );
    return false;
  }
}

export default {
  name: "play",
  command: ["play"],
  categoria: "download",
  category: "download",
  description: "Busca en YouTube y mostra hasta 5 resultados con botones MP3/MP4",

  async run(ctx) {
    const { sock, m, from, args, settings } = ctx;
    const prefix = getPrefix(settings);

    try {
      await react(sock, m, "🔎");

      const parsed = parsePlayArgs(args);
      const query = parsed.query;

      if (!query) {
        await react(sock, m, "❌");
        return await sock.sendMessage(
          from,
          {
            text: buildUsageMessage(prefix),
            ...global.channelInfo,
          },
          { quoted: m }
        );
      }

      const res = await yts(query);
      const vídeos = Array.isArray(res?.vídeos)
        ? res.vídeos.filter((vídeo) => cleanText(vídeo?.url)).slice(0, MAX_RESULTS)
        : [];

      if (!vídeos.length) {
        await react(sock, m, "❌");
        return await sock.sendMessage(
          from,
          {
            text: "No encontré resultados en YouTube.",
            ...global.channelInfo,
          },
          { quoted: m }
        );
      }

      const currentIndex = Math.max(0, Math.min(parsed.pickIndex, vídeos.length - 1));
      const currentVídeo = vídeos[currentIndex];
      await sendPlayCard(
        sock,
        from,
        { quoted: m },
        query,
        currentVídeo,
        currentIndex,
        vídeos,
        prefix
      );
      await react(sock, m, "✅");
    } catch (erro) {
      console.erro("Erro en play:", erro);
      await react(sock, m, "❌");

      return await sock.sendMessage(
        from,
        {
          text: `Erro en play:\n${sanitizeProviderMessage(erro, { kind: "search", fallback: "No se pudo completar la busca." })}`,
          ...global.channelInfo,
        },
        { quoted: m }
      );
    }
  },
};
