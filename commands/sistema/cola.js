import { formatDuration } from "./_shared.js";

function getQuoted(msg) {
  return msg?.key ? { quoted: msg } : undefined;
}

export default {
  name: "cola",
  command: ["cola", "queue"],
  category: "sistema",
  description: "Mostra downloads activas por bot",

  run: async ({ sock, msg, from, esDono }) => {
    if (!esDono) {
      return sock.sendMessage(
        from,
        { text: "Solo el owner puede usar este comando.", ...global.channelInfo },
        getQuoted(msg)
      );
    }

    const runtime = global.botRuntime;
    const bots = (runtime?.listBots?.({ includeMain: true }) || []).filter(
      (bot) => bot.downloadQueueActive || Number(bot.activeDownloadCount || 0) > 0
    );

    await sock.sendMessage(
      from,
      {
        text:
          `*COLA / DOWNLOADS ACTIVAS*\n\n` +
          `${
            bots.length
              ? bots
                  .map(
                    (bot) =>
                      `*${bot.label}*\n` +
                      `Activas: ${Number(bot.activeDownloadCount || 0)}\n` +
                      `Processando: ${bot.currentDownloadCommand || "Sin detalhe"}\n` +
                      `Tempo: ${formatDuration(bot.currentDownloadRunningForMs || 0)}`
                  )
                  .join("\n\n")
              : "No hay downloads activas ahora mismo."
          }`,
        ...global.channelInfo,
      },
      getQuoted(msg)
    );
  },
};
