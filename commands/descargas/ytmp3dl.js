import axios from "axios";

const API_BASE = "https://dv-yer-api.online/ytmp3";
const API_KEY = "dvyer911840240197";

function isYouTubeUrl(url = "") {
  return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(url);
}

function pickÁudioUrl(data) {
  return (
    data?.result?.url ||
    data?.result?.link ||
    data?.result?.download ||
    data?.result?.áudio ||
    data?.url ||
    data?.link ||
    data?.download ||
    data?.áudio ||
    null
  );
}

function pickTitle(data) {
  return (
    data?.result?.title ||
    data?.title ||
    "áudio_youtube"
  );
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text) {
      return m.reply(
        `❌ Informe un link de YouTube.\n\n` +
        `Ejemplo:\n${usedPrefix + command} https://www.youtube.com/watch?v=dQw4w9WgXcQ`
      );
    }

    const url = text.trim();

    if (!isYouTubeUrl(url)) {
      return m.reply("❌ El link no parece ser de YouTube.");
    }

    await m.reply("⏳ Downloadndo áudio, aguarde un momento...");

    const apiUrl =
      `${API_BASE}?mode=link` +
      `&url=${encodeURIComponent(url)}` +
      `&apikey=${encodeURIComponent(API_KEY)}`;

    const { data } = await axios.get(apiUrl, {
      timeout: 30000,
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const áudioUrl = pickÁudioUrl(data);
    const title = pickTitle(data);

    if (!áudioUrl) {
      console.log("Respuesta API ytmp3:", data);
      return m.reply("❌ No se pudo obtener el link del áudio desde la API.");
    }

    const cleanTitle = String(title)
      .replace(/[\\/:*?"<>|]/g, "")
      .slice(0, 80);

    await conn.sendMessage(
      m.chat,
      {
        áudio: { url: áudioUrl },
        mimetype: "áudio/mpeg",
        fileName: `${cleanTitle}.mp3`,
        ptt: false,
      },
      { quoted: m }
    );

  } catch (erro) {
    console.erro("Erro ytmp3:", erro?.response?.data || erro);

    const msg =
      erro?.code === "ECONNABORTED"
        ? "❌ La API tardó demais en respondar."
        : "❌ Ocurrió un erro al downloadr el áudio.";

    await m.reply(msg);
  }
};

handler.help = ["ytmp3 <url>"];
handler.tags = ["downloads"];
handler.command = ["ytmp5"];

export default handler;