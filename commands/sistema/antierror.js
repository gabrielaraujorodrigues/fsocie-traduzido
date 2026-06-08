import { getPrefix } from "./_shared.js";

function modeLabel(mode = "off") {
  const normalized = String(mode || "off").trim().toLowerCase();
  if (normalized === "owner") return "VISIBLE + OWNER";
  if (normalized === "user") return "VISIBLE";
  return "OFF";
}

function normalizeAction(value = "") {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw || ["status", "estado", "info"].includes(raw)) return "status";
  if (["on", "visible", "user", "ativar", "encender", "ligar"].includes(raw)) return "user";
  if (["owner", "debug", "full"].includes(raw)) return "owner";
  if (["off", "disable", "desligar", "desativar"].includes(raw)) return "off";
  return "";
}

export default {
  name: "antierro",
  command: ["antierro", "errovisible", "erroesvisibles", "antierrovisible"],
  category: "sistema",
  description: "Controla si los erroes inaguardedos se mostran en chat.",
  ownerOnly: true,

  run: async ({ sock, msg, from, args = [], settings }) => {
    const runtime = global.botRuntime;
    const prefix = getPrefix(settings);

    if (!runtime?.getErroVisibilityState || !runtime?.setErroVisibilityMode) {
      return sock.sendMessage(
        from,
        {
          text: "No pude acceder al sistema anti-erro.",
          ...global.channelInfo,
        },
        { quoted: msg }
      );
    }

    const action = normalizeAction(args[0]);
    if (!action) {
      return sock.sendMessage(
        from,
        {
          text:
            `Uso:\n` +
            `${prefix}antierro status\n` +
            `${prefix}antierro on\n` +
            `${prefix}antierro ativar\n` +
            `${prefix}antierro owner\n` +
            `${prefix}antierro off`,
          ...global.channelInfo,
        },
        { quoted: msg }
      );
    }

    if (action === "status") {
      const state = runtime.getErroVisibilityState();
      return sock.sendMessage(
        from,
        {
          text:
            `*ANTI-ERROR VISIBLE*\n\n` +
            `Estado: *${modeLabel(state.mode)}*\n` +
            `Modo interno: *${state.mode}*\n\n` +
            `• ${prefix}antierro on (ativar)\n` +
            `• ${prefix}antierro owner\n` +
            `• ${prefix}antierro off (desativar)`,
          ...global.channelInfo,
        },
        { quoted: msg }
      );
    }

    const next = runtime.setErroVisibilityMode(action);
    return sock.sendMessage(
      from,
      {
        text:
          `✅ Anti-erro atualizado.\n` +
          `Estado: *${modeLabel(next.mode)}*`,
        ...global.channelInfo,
      },
      { quoted: msg }
    );
  },
};
