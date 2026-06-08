function getPrefix(settings) {
  if (Array.isArray(settings?.prefix)) {
    return settings.prefix.find((value) => String(value || "").trim()) || ".";
  }
  return String(settings?.prefix || ".").trim() || ".";
}

function buildFallbackText(prefix) {
  return (
    `╔════════════════════════════╗\n` +
    `║   FSOCIETY-V1 TOOLKIT HUB  ║\n` +
    `╚════════════════════════════╝\n\n` +
    `Monitoreo:\n` +
    `- ${prefix}status\n` +
    `- ${prefix}ping\n` +
    `- ${prefix}runtime\n` +
    `- ${prefix}sysinfo\n` +
    `- ${prefix}procinfo\n` +
    `- ${prefix}speedtest\n\n` +
    `Utilitários:\n` +
    `- ${prefix}canalinfo yo\n` +
    `- ${prefix}canalinfo <link-canal>\n` +
    `- ${prefix}traducir en Hola\n` +
    `- ${prefix}resumo (responda a un áudio)\n` +
    `- ${prefix}idioma es\n\n` +
    `Gestão:\n` +
    `- ${prefix}report texto\n` +
    `- ${prefix}ticket texto\n` +
    `- ${prefix}logs\n` +
    `- ${prefix}clearlogs (owner)\n` +
    `- ${prefix}botinfo\n` +
    `- ${prefix}owner`
  );
}

export default {
  name: "ferramentas",
  command: ["ferramentas", "tools", "utilitários", "menuferramentas", "toolkit"],
  category: "ferramentas",
  description: "Catalogo ordenado de ferramentas del bot",

  run: async ({ sock, msg, from, settings }) => {
    const prefix = getPrefix(settings);

    const sections = [
      {
        title: "Monitoreo",
        rows: [
          { header: "Estado", title: "Painel status", description: "Resumo del bot", id: `${prefix}status` },
          { header: "Ping", title: "Medir ping", description: "Latencia actual", id: `${prefix}ping` },
          { header: "Runtime", title: "Ver uptime", description: "Tempo encendido", id: `${prefix}runtime` },
          { header: "Sistema", title: "Sysinfo", description: "CPU / RAM / host", id: `${prefix}sysinfo` },
          { header: "Proceso", title: "Procinfo", description: "Info del proceso Node", id: `${prefix}procinfo` },
          { header: "Red", title: "Speedtest", description: "Test de red del host", id: `${prefix}speedtest` },
        ],
      },
      {
        title: "Utilitários",
        rows: [
          { header: "LID", title: "Tu JID/LID", description: "Convierte tu número", id: `${prefix}canalinfo yo` },
          { header: "Canal", title: "Info de canal", description: "Por link de canal", id: `${prefix}canalinfo https://whatsapp.com/channel/` },
          { header: "Traduccion", title: "Traducir", description: "Traduce texto rapidamente", id: `${prefix}traducir en Olá mundo` },
          { header: "Áudio IA", title: "Resumo áudio", description: "Responda a áudio", id: `${prefix}resumo` },
          { header: "Idioma", title: "Cambiar idioma", description: "Idioma por chat", id: `${prefix}idioma es` },
        ],
      },
      {
        title: "Gestão",
        rows: [
          { header: "Suporte", title: "Enviar reporte", description: "Reporta falhas", id: `${prefix}report Hay un erro en...` },
          { header: "Ticket", title: "Crear ticket", description: "Suporte interno", id: `${prefix}ticket Necesito ajuda` },
          { header: "Logs", title: "Ver logs", description: "Últimos erroes/logs", id: `${prefix}logs` },
          { header: "Limpiar", title: "Clear logs", description: "Solo owner", id: `${prefix}clearlogs` },
          { header: "Bot", title: "Infobbot", description: "Resumo completo", id: `${prefix}botinfo` },
        ],
      },
    ];

    try {
      return await sock.sendMessage(
        from,
        {
          text:
            "╭━━〔 🧰 TOOLKIT FSOCIETY-V1 〕━━⬣\n" +
            "┃ Monitoreo, utilitários y gestão en un solo painel.\n" +
            "╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━⬣",
          title: "FSOCIETY-V1",
          subtitle: "Toolkit operativo",
          footer: "Selecione la ferramenta",
          interactiveButtons: [
            {
              name: "single_select",
              buttonParamsJson: JSON.stringify({
                title: "Abrir toolkit",
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
