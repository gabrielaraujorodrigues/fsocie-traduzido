import {
  claimWorkReward,
  formatCoins,
} from "./_shared.js";
import { formatDuration } from "../../lib/json-store.js";

export default {
  name: "work",
  command: ["work", "trabajar", "job"],
  category: "economia",
  description: "Trabaja para ganar dolares con cooldown",

  run: async ({ sock, msg, from, sender }) => {
    const result = claimWorkReward(sender);

    if (!result.ok) {
      return sock.sendMessage(
        from,
        {
          text: `Todavia no puedes trabajar.\nAguarde: *${formatDuration(result.remainingMs)}*`,
          ...global.channelInfo,
        },
        { quoted: msg }
      );
    }

    return sock.sendMessage(
      from,
      {
        text: `Trabajo concluído.\nGanaste *${formatCoins(result.amount)}*`,
        ...global.channelInfo,
      },
      { quoted: msg }
    );
  },
};
