import {
  buildActiveSessionMessage,
  clearActiveSession,
  ensureSessionAvailable,
  getActiveSession,
  getPrefix,
  isCommandText,
  randomItem,
  recordGameResult,
  setActiveSession,
  updateActiveSession,
} from "./_shared.js";
import { EMOJI_QUIZZES } from "./_data.js";

const MAX_ATTEMPTS = 3;

function normalizeAnswer(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function matchesAnswer(input, answer) {
  const normalizedInput = normalizeAnswer(input);
  const normalizedAnswer = normalizeAnswer(answer);
  if (!normalizedInput || !normalizedAnswer) return false;
  return (
    normalizedInput === normalizedAnswer ||
    normalizedInput.replace(/\s+/g, "") === normalizedAnswer.replace(/\s+/g, "")
  );
}

export default {
  name: "emojiquiz",
  command: ["emojiquiz", "emojijogo", "emojiadivinhe"],
  category: "jogos",
  description: "Adivinhe la frase o serie usando emojis",

  run: async ({ sock, msg, from, sender, settings }) => {
    const prefix = getPrefix(settings);
    const active = getActiveSession(from);

    if (!ensureSessionAvailable(from)) {
      return sock.sendMessage(
        from,
        {
          text: buildActiveSessionMessage(prefix, active),
          ...global.channelInfo,
        },
        { quoted: msg }
      );
    }

    const item = randomItem(EMOJI_QUIZZES);
    setActiveSession(from, {
      game: "emojiquiz",
      userId: sender,
      emojis: item.emojis,
      answer: item.answer,
      attempts: 0,
      maxAttempts: MAX_ATTEMPTS,
    });

    return sock.sendMessage(
      from,
      {
        text:
          `*EMOJI QUIZ*\n\n` +
          `Adivinhe que significa esto:\n${item.emojis}\n\n` +
          `Tentativas: *0/${MAX_ATTEMPTS}*\n` +
          `Responda con el nome o frase.\n` +
          `Use *${prefix}salirjogo* si quieres cancelar.`,
        ...global.channelInfo,
      },
      { quoted: msg }
    );
  },

  onMessage: async ({ sock, msg, from, sender, text, settings }) => {
    const session = getActiveSession(from);
    if (!session || session.game !== "emojiquiz") return false;
    if (session.userId !== sender) return false;
    if (isCommandText(text, settings)) return false;

    const answer = String(text || "").trim();
    if (!answer) return false;

    const attempts = Number(session.attempts || 0) + 1;

    if (matchesAnswer(answer, session.answer)) {
      clearActiveSession(from);
      const points = Math.max(4, 8 - attempts);
      recordGameResult({
        userId: sender,
        chatId: from,
        game: "emojiquiz",
        points,
        outcome: "win",
      });

      await sock.sendMessage(
        from,
        {
          text:
            `*GANASTE EN EMOJI QUIZ*\n\n` +
            `${session.emojis}\n` +
            `Respuesta: *${session.answer.toUpperCase()}*\n` +
            `Pontos: *+${points}*`,
          ...global.channelInfo,
        },
        { quoted: msg }
      );
      return true;
    }

    if (attempts >= Number(session.maxAttempts || MAX_ATTEMPTS)) {
      clearActiveSession(from);
      recordGameResult({
        userId: sender,
        chatId: from,
        game: "emojiquiz",
        points: 0,
        outcome: "loss",
      });

      await sock.sendMessage(
        from,
        {
          text:
            `*PERDISTE EN EMOJI QUIZ*\n\n` +
            `${session.emojis}\n` +
            `Resposta correta: *${session.answer.toUpperCase()}*`,
          ...global.channelInfo,
        },
        { quoted: msg }
      );
      return true;
    }

    updateActiveSession(from, { attempts });
    await sock.sendMessage(
      from,
      {
        text:
          `No era esa respuesta.\n` +
          `${session.emojis}\n` +
          `Tentativas: *${attempts}/${session.maxAttempts}*`,
        ...global.channelInfo,
      },
      { quoted: msg }
    );
    return true;
  },
};
