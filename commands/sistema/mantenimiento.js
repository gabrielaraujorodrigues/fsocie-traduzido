import { getPrefix } from "./_shared.js";

function buildStateLabel(state) {
  if (!state?.enabled) return "APAGADO";
  if (state.mode === "owner_only") return "SOLO OWNER";
  if (state.mode === "downloads_off") return "DOWNLOADS EN PAUSA";
  return "ACTIVO";
}

export default {
  name: "mantenimiento",
  command: ["mantenimiento", "maintenance", "maint"],
  category: "sistema",
  description: "Activa o apaga el modo mantenimiento del bot",

  run: async ({ sock, msg, from, args = [], esDono, settings }) => {
    const prefix = getPrefix(settings);
    const runtime = global.botRuntime;

    if (!runtime?.getMaintenanceState || !runtime?.setMaintenanceState) {
      return sock.sendMessage(
        from,
        {
          text: "No pude acceder al modo mantenimiento.",
          ...global.channelInfo,
        },
        { quoted: msg }
      );
    }

    const action = String(args[0] || "status").trim().toLowerCase();
    const state = runtime.getMaintenanceState();

    if (!esDono && action !== "status") {
      return sock.sendMessage(
        from,
        {
          text: "Solo el owner puede cambiar el mantenimiento del bot.",
          ...global.channelInfo,
        },
        { quoted: msg }
      );
    }

    if (!args.length || action === "status" || action === "estado") {
      return sock.sendMessage(
        from,
        {
          text:
            `*MODO MANTENIMIENTO*\n\n` +
            `Estado: *${buildStateLabel(state)}*\n` +
            `Modo: *${state.mode}*\n` +
            `Mensagem: ${state.message || "Sin mensagem"}\n\n` +
            `Uso:\n` +
            `${prefix}mantenimiento off\n` +
            `${prefix}mantenimiento owner Mensagem opçãoal\n` +
            `${prefix}mantenimiento downloads Mensagem opçãoal`,
          ...global.channelInfo,
        },
        { quoted: msg }
      );
    }

    let mode = "off";

    if (["on", "owner", "solo", "soloowner"].includes(action)) {
      mode = "owner_only";
    } else if (["downloads", "downloads", "download", "media"].includes(action)) {
      mode = "downloads_off";
    } else if (!["off", "desligar"].includes(action)) {
      return sock.sendMessage(
        from,
        {
          text:
            `Opção inválida.\n\n` +
            `Usa:\n` +
            `${prefix}mantenimiento off\n` +
            `${prefix}mantenimiento owner Mensagem\n` +
            `${prefix}mantenimiento downloads Mensagem`,
          ...global.channelInfo,
        },
        { quoted: msg }
      );
    }

    const next = runtime.setMaintenanceState(mode, args.slice(1).join(" "));

    return sock.sendMessage(
      from,
      {
        text:
          `*MANTENIMIENTO ACTUALIZADO*\n\n` +
          `Estado: *${buildStateLabel(next)}*\n` +
          `Modo: *${next.mode}*\n` +
          `Mensagem: ${next.message || "Sin mensagem"}`,
        ...global.channelInfo,
      },
      { quoted: msg }
    );
  },
};
