import {
  clearActiveSession,
  formatUserLabel,
  getActiveSession,
} from "./_shared.js";

export default {
  name: "salirjogo",
  command: ["salirjogo", "cancelargame", "rendirse"],
  category: "jogos",
  description: "Cancela el jogo ativo del chat",

  run: async ({ sock, msg, from, sender, esDono }) => {
    const session = getActiveSession(from);

    if (!session) {
      return sock.sendMessage(
        from,
        {
          text: "No hay ningun jogo ativo en este chat.",
          ...global.channelInfo,
        },
        { quoted: msg }
      );
    }

    if (!esDono && session.userId !== sender) {
      return sock.sendMessage(
        from,
        {
          text:
            `Solo el jogador ativo puede cancelar este jogo.\n` +
            `Jogador: *${formatUserLabel(session.userId)}*`,
          ...global.channelInfo,
        },
        { quoted: msg }
      );
    }

    clearActiveSession(from);

    return sock.sendMessage(
      from,
      {
        text: `Jogo *${String(session.game || "").toUpperCase()}* cancelado.`,
        ...global.channelInfo,
      },
      { quoted: msg }
    );
  },
};
