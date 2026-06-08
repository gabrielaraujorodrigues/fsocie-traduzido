export default {
  command: ["owner", "criador", "dono"],
  category: "sistema",
  description: "Mostra el owner",

  run: async ({ sock, msg, from, settings }) => {
    const owners = Array.isArray(settings.ownerNumbers)
      ? settings.ownerNumbers
      : (settings.ownerNumber ? [settings.ownerNumber] : []);

    const texto =
      `👑 *Dono:* ${settings.ownerName || "Dono"}\n` +
      `📞 *Números:*\n` +
      owners.map((n) => `• wa.me/${String(n).replace(/[^\d]/g, "")}`).join("\n");

    return sock.sendMessage(
      from,
      { text: texto, ...global.channelInfo },
      { quoted: msg }
    );
  }
};
