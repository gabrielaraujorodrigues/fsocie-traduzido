import fs from "fs";
import path from "path";

const COMMUNITY_MAIN_LINK = "https://chat.whatsapp.com/GuLWXlFUdy3BJA9OXcc1Hj";

function resolveCommunityImagePath() {
  const imageDir = path.join(process.cwd(), "imagens");
  const candidates = [
    path.join(imageDir, "comunidade.jpg"),
    path.join(imageDir, "comunidade.jpeg"),
    path.join(imageDir, "comunidade.png"),
    path.join(imageDir, "comunidade.webp"),
  ];
  return candidates.find((filePath) => fs.existsSync(filePath)) || "";
}

function getCommunityImageBuffer() {
  const imagePath = resolveCommunityImagePath();
  if (!imagePath) return null;
  try {
    return fs.readFileSync(imagePath);
  } catch {
    return null;
  }
}

export default {
  command: ["gruposoficiales", "grupooficial", "comunidade", "suportebot"],
  category: "sistema",
  description: "Mostra los grupos oficiales del bot.",

  run: async ({ sock, msg, from, settings }) => {
    const newsletter = settings?.newsletter && typeof settings.newsletter === "object"
      ? settings.newsletter
      : {};
    const newsletterJid = String(newsletter.jid || "").trim();
    const inferredChannelUrl = newsletterJid.includes("@newsletter")
      ? `https://whatsapp.com/channel/${newsletterJid.replace("@newsletter", "")}`
      : "";
    const supportChannelUrl = String(newsletter.url || inferredChannelUrl || "").trim();
    const communityImage = getCommunityImageBuffer();

    const lines = [
      "╭━━〔 🌐 *GRUPOS OFICIALES FSOCIETY-V1* 〕━━⬣",
      "┃ *Comunidade (DVYER):*",
      `┃ ${COMMUNITY_MAIN_LINK}`,
      "┃",
      "┃ *Grupo oficial del bot:*",
      "┃ https://chat.whatsapp.com/ItdJRKVJGCsIXZjviN3MZO",
      "┃",
      "┃ *Grupo de suporte del bot:*",
      "┃ https://chat.whatsapp.com/FsrlWXVdG3RCLYbZ5LazBO",
      ...(supportChannelUrl
        ? [
            "┃",
            `┃ *Canal de suporte:*`,
            `┃ ${supportChannelUrl}`,
          ]
        : []),
      "┃",
      "┃ *Si algun link falla:*",
      "┃ *UNETE DIRECTO A LA COMUNIDADE desde el boton de abajo.*",
      "╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⬣",
    ];
    const communityText = lines.join("\n");

    if (supportChannelUrl) {
      if (communityImage) {
        await sock.sendMessage(
          from,
          { image: communityImage, caption: communityText, ...global.channelInfo },
          { quoted: msg }
        );

        return sock.sendMessage(
          from,
          {
            text: "⚡ Si no abre algun grupo, entra directo a la comunidade oficial desde aqui:",
            title: "FSOCIETY-V1",
            subtitle: "Suporte y comunidade",
            footer: "Boton directo de comunidade",
            interactiveButtons: [
              {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                  display_text: "Unete a la comunidade",
                  url: COMMUNITY_MAIN_LINK,
                  merchant_url: COMMUNITY_MAIN_LINK,
                }),
              },
            ],
            ...global.channelInfo,
          },
          { quoted: msg }
        );
      }

      try {
        return await sock.sendMessage(
          from,
          {
            text: communityText,
            title: "FSOCIETY-V1",
            subtitle: "Suporte y comunidade",
            footer: "Use el boton para abrir la comunidade directo",
            interactiveButtons: [
              {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                  display_text: "Unete a la comunidade",
                  url: COMMUNITY_MAIN_LINK,
                  merchant_url: COMMUNITY_MAIN_LINK,
                }),
              },
            ],
            ...global.channelInfo,
          },
          { quoted: msg }
        );
      } catch {}
    }

    if (communityImage) {
      return sock.sendMessage(
        from,
        { image: communityImage, caption: communityText, ...global.channelInfo },
        { quoted: msg }
      );
    }

    return sock.sendMessage(from, { text: communityText, ...global.channelInfo }, { quoted: msg });
  },
};
