import { claimDaily, formatCoins, getPrefix } from "./_shared.js";
import { formatDuration } from "../sistema/_shared.js";

export default {
  name: "daily",
  command: ["daily", "dailydolares", "reclamardolares", "reclamarcoins", "diario"],
  category: "economia",
  description: "Reclama tu recompensa diaria en dolares",

  run: async ({ sock, msg, from, sender, settings }) => {
    const result = claimDaily(sender);
    const prefix = getPrefix(settings);

    if (!result.ok) {
      return sock.sendMessage(
        from,
      {
        text:
          `*DAILY EN COOLDOWN*\n\n` +
          `Podras reclamar de novo en *${formatDuration(result.remainingMs)}*.\n` +
          `Mientras tanto revisa tu saldo con *${prefix}dolares*.`,
        ...global.channelInfo,
      },
        { quoted: msg }
      );
    }

    await sock.sendMessage(
      from,
      {
        text:
          `*DAILY RECLAMADO*\n\n` +
          `Ganaste *${formatCoins(result.amount)}*.\n` +
          `Use *${prefix}shop* para ver la loja.`,
        ...global.channelInfo,
      },
      { quoted: msg }
    );
  },
};
