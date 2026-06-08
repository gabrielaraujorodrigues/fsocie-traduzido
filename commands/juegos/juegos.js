import fs from "fs";
import path from "path";
import { getPrefix } from "./_shared.js";

function buildJogosMessage(caption) {
  const imagePath = path.join(process.cwd(), "imagens", "jogos.png");

  if (fs.existsSync(imagePath)) {
    return {
      image: fs.readFileSync(imagePath),
      caption,
      ...global.channelInfo,
    };
  }

  return {
    text: caption,
    ...global.channelInfo,
  };
}

export default {
  name: "jogos",
  command: ["jogos", "games", "menujogos"],
  category: "jogos",
  description: "Mostra el menu de jogos del bot",

  run: async ({ sock, msg, from, settings }) => {
    const prefix = getPrefix(settings);

    return sock.sendMessage(
      from,
      buildJogosMessage(
        `╔════════════════════════════╗\n` +
        `║   FSOCIETY-V1 GAME ARENA   ║\n` +
        `╚════════════════════════════╝\n\n` +
        `*JOGOS DISPONIBLES*\n\n` +
          `Disponíveis:\n` +
          `- ${prefix}ppt piedra\n` +
          `- ${prefix}adivinhe\n` +
          `- ${prefix}ahorcado\n` +
          `- ${prefix}mezclapalabra\n` +
        `- ${prefix}mate\n` +
        `- ${prefix}trivia\n` +
        `- ${prefix}verdaderoofalso\n` +
        `- ${prefix}quizanime\n` +
        `- ${prefix}emojiquiz\n` +
        `- ${prefix}banderas\n` +
        `- ${prefix}tictactoe\n` +
        `- ${prefix}ruleta rojo\n\n` +
          `Rankings:\n` +
          `- ${prefix}topjogos\n` +
          `- ${prefix}topjogos grupo\n` +
          `- ${prefix}topjogos trivia\n` +
          `- ${prefix}topjogos quizanime\n` +
          `- ${prefix}topjogos verdaderoofalso\n` +
          `- ${prefix}topjogos grupo trivia\n` +
          `- ${prefix}perfilgame\n\n` +
          `Control:\n` +
          `- ${prefix}salirjogo`
      ),
      { quoted: msg }
    );
  },
};
