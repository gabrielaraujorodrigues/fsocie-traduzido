function getPrefix(settings) {
  if (Array.isArray(settings?.prefix)) {
    return settings.prefix.find((value) => String(value || "").trim()) || ".";
  }
  return String(settings?.prefix || ".").trim() || ".";
}

function buildFallbackText(prefix) {
  return (
    `*MENU BUSCA*\n\n` +
    `YouTube:\n` +
    `- ${prefix}ytsearch believer imagine dragons\n\n` +
    `TikTok:\n` +
    `- ${prefix}ttsearch style tips\n` +
    `- ${prefix}tiktokusuário @username\n\n` +
    `Imagemes:\n` +
    `- ${prefix}pinterest goku`
  );
}

export default {
  name: "busca",
  command: ["busca", "search", "menubusca", "buscar"],
  category: "busca",
  description: "Menu de buscas (YouTube, TikTok e imagens)",

  run: async ({ sock, msg, from, settings }) => {
    const prefix = getPrefix(settings);

    const sections = [
      {
        title: "YouTube",
        rows: [
          {
            header: "YT Search",
            title: "Buscar en YouTube",
            description: "Resultados para MP3/MP4",
            id: `${prefix}ytsearch believer imagine dragons`,
          },
        ],
      },
      {
        title: "TikTok",
        rows: [
          {
            header: "TT Search",
            title: "Buscar vídeos TikTok",
            description: "Busca general por texto",
            id: `${prefix}ttsearch style tips`,
          },
          {
            header: "TT Usuário",
            title: "Buscar por usuário",
            description: "Vídeos por username",
            id: `${prefix}tiktokusuário @username`,
          },
        ],
      },
      {
        title: "Imagemes",
        rows: [
          {
            header: "Pinterest",
            title: "Buscar imagens",
            description: "Busca por keyword",
            id: `${prefix}pinterest goku`,
          },
        ],
      },
    ];

    try {
      return await sock.sendMessage(
        from,
        {
          text: "Busca del bot",
          title: "FSOCIETY BOT",
          subtitle: "Menu Busca",
          footer: "Incluye ytsearch",
          interactiveButtons: [
            {
              name: "single_select",
              buttonParamsJson: JSON.stringify({
                title: "Abrir buscas",
                sections,
              }),
            },
          ],
          ...global.channelInfo,
        },
        { quoted: msg }
      );
    } catch {
      return sock.sendMessage(
        from,
        { text: buildFallbackText(prefix), ...global.channelInfo },
        { quoted: msg }
      );
    }
  },
};
