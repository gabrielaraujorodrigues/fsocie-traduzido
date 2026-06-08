export default {
  name: "grupo",
  command: ["grupo"],
  groupOnly: true,
  adminOnly: true,
  category: "grupo",

  async run({ sock, from, args, m, msg }) {
    const quoted = (m?.key || msg?.key) ? { quoted: (m || msg) } : undefined;

    if (!args[0]) {
      return await sock.sendMessage(
        from,
        {
          text: "⚙️ Uso correto:\n\n• .grupo cerrar\n• .grupo abrir",
          ...global.channelInfo
        },
        quoted
      );
    }

    const opção = args[0].toLowerCase();

    try {
      if (opção === "cerrar") {
        await sock.groupSettingUpdate(from, "announcement");

        return await sock.sendMessage(
          from,
          {
            text: "🔒 El grupo ha sido cerrado.\nSolo los administradores pueden enviar mensagems.",
            ...global.channelInfo
          },
          quoted
        );
      }

      if (opção === "abrir") {
        await sock.groupSettingUpdate(from, "not_announcement");

        return await sock.sendMessage(
          from,
          {
            text: "🔓 El grupo ha sido abierto.\nAhora todos pueden enviar mensagems.",
            ...global.channelInfo
          },
          quoted
        );
      }

      return await sock.sendMessage(
        from,
        {
          text: "❌ Opção inválida.\nUsa: cerrar o abrir",
          ...global.channelInfo
        },
        quoted
      );

    } catch (e) {
      return await sock.sendMessage(
        from,
        {
          text: "❌ No pude cambiar la configuração.\nVerifica que el bot sea administrador.",
          ...global.channelInfo
        },
        quoted
      );
    }
  }
};
