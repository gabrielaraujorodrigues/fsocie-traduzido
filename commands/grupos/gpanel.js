import fs from "fs";
import path from "path";

const DB_DIR = path.join(process.cwd(), "database");

const FILES = {
  antilink: path.join(DB_DIR, "antilink.json"),
  antispam: path.join(DB_DIR, "antispam.json"),
  botoff: path.join(DB_DIR, "botoff_groups.json"),
  welcome: path.join(DB_DIR, "welcome.json"),
  modoadmin: path.join(DB_DIR, "modoadmin.json"),
  antiflood: path.join(DB_DIR, "antiflood.json"),
};

function safeParse(raw, fallback) {
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "string" ? JSON.parse(parsed) : parsed;
  } catch {
    return fallback;
  }
}

function loadAny(filePath, fallback) {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return safeParse(fs.readFileSync(filePath, "utf-8"), fallback);
  } catch {
    return fallback;
  }
}

function getPrefix(settings) {
  if (Array.isArray(settings?.prefix)) {
    return settings.prefix.find((value) => String(value || "").trim()) || ".";
  }
  return String(settings?.prefix || ".").trim() || ".";
}

function readSetFlag(filePath, groupId) {
  const data = loadAny(filePath, []);
  if (Array.isArray(data)) return data.includes(groupId);
  if (data && typeof data === "object") {
    const entry = data[groupId];
    if (typeof entry === "boolean") return entry;
    if (entry && typeof entry === "object") return entry.enabled === true;
  }
  return false;
}

function readWelcomeFlags(groupId) {
  const data = loadAny(FILES.welcome, {});
  const entry = data && typeof data === "object" ? data[groupId] : null;
  if (!entry) {
    return { welcomeOn: false, byeOn: false };
  }
  if (typeof entry === "boolean") {
    return { welcomeOn: entry, byeOn: false };
  }
  return {
    welcomeOn: entry.enabled === true || entry.welcomeEnabled === true,
    byeOn: entry.byeEnabled === true || entry.goodbyeEnabled === true,
  };
}

function readAntifloodFlag(groupId) {
  const data = loadAny(FILES.antiflood, {});
  if (!data || typeof data !== "object") return false;
  const group = data.groups && typeof data.groups === "object" ? data.groups[groupId] : null;
  return Boolean(group?.enabled);
}

function readAntiLinkFlag(groupId) {
  const data = loadAny(FILES.antilink, {});
  if (Array.isArray(data)) return data.includes(groupId);
  if (!data || typeof data !== "object") return false;
  const entry = data[groupId];
  if (typeof entry === "boolean") return entry;
  if (!entry || typeof entry !== "object") return false;
  return entry.enabled === true;
}

function badge(value) {
  return value ? "ON ✅" : "OFF ❌";
}

export default {
  name: "painelgrupo",
  command: ["painelgrupo", "paineladmin", "gpainel", "adminpainel"],
  category: "grupo",
  description: "Painel admin unico del grupo con botones de control.",
  groupOnly: true,
  adminOnly: true,

  run: async ({ sock, msg, from, settings }) => {
    const prefix = getPrefix(settings);

    const antilinkOn = readAntiLinkFlag(from);
    const antispamOn = readSetFlag(FILES.antispam, from);
    const botOffOn = readSetFlag(FILES.botoff, from);
    const modeAdmiOn = readSetFlag(FILES.modoadmin, from);
    const antifloodOn = readAntifloodFlag(from);
    const welcome = readWelcomeFlags(from);

    const painelText =
      `╭──〔 🛠️ *PAINEL ADMIN* 〕──⬣\n` +
      `│ AntiLink: *${badge(antilinkOn)}*\n` +
      `│ AntiSpam: *${badge(antispamOn)}*\n` +
      `│ BotGrupo: *${botOffOn ? "OFF 🔴" : "ON 🟢"}*\n` +
      `│ Welcome: *${badge(welcome.welcomeOn)}*\n` +
      `│ Bye: *${badge(welcome.byeOn)}*\n` +
      `│ ModoAdmin: *${badge(modeAdmiOn)}*\n` +
      `│ AntiFlood: *${badge(antifloodOn)}*\n` +
      `╰────────────⬣\n\n` +
      `Toca una opção del painel para cambiar estado rapidamente.`;

    const sections = [
      {
        title: "Segurança",
        rows: [
          {
            header: "ANTILINK",
            title: antilinkOn ? "Desligar AntiLink" : "Ligar AntiLink",
            description: `Estado atual: ${badge(antilinkOn)}`,
            id: `${prefix}antilink ${antilinkOn ? "off" : "on"}`,
          },
          {
            header: "ANTISPAM",
            title: antispamOn ? "Desligar AntiSpam" : "Ligar AntiSpam",
            description: `Estado atual: ${badge(antispamOn)}`,
            id: `${prefix}antispam ${antispamOn ? "off" : "on"}`,
          },
          {
            header: "ANTIFLOOD",
            title: antifloodOn ? "Desligar AntiFlood" : "Ligar AntiFlood",
            description: `Estado atual: ${badge(antifloodOn)}`,
            id: `${prefix}antiflood ${antifloodOn ? "off" : "on"}`,
          },
        ],
      },
      {
        title: "Controle do bot",
        rows: [
          {
            header: "BOTGRUPO",
            title: botOffOn ? "Ligar bot no grupo" : "Desligar bot no grupo",
            description: `Estado atual: ${botOffOn ? "OFF 🔴" : "ON 🟢"}`,
            id: `${prefix}botgrupo ${botOffOn ? "on" : "off"}`,
          },
          {
            header: "MODOADMIN",
            title: modeAdmiOn ? "Desligar modo admin" : "Ligar modo admin",
            description: `Estado atual: ${badge(modeAdmiOn)}`,
            id: `${prefix}modoadmin ${modeAdmiOn ? "off" : "on"}`,
          },
          {
            header: "STATUS",
            title: "Ver estado completo do grupo",
            description: "Abre painel de configuração del grupo.",
            id: `${prefix}estadogrupo`,
          },
        ],
      },
      {
        title: "Boas-vindas e saída",
        rows: [
          {
            header: "WELCOME",
            title: welcome.welcomeOn ? "Desligar boas-vindas" : "Ligar boas-vindas",
            description: `Estado atual: ${badge(welcome.welcomeOn)}`,
            id: `${prefix}welcome ${welcome.welcomeOn ? "off" : "on"}`,
          },
          {
            header: "SAÍDA",
            title: welcome.byeOn ? "Desligar mensagem de saída" : "Ligar mensagem de saída",
            description: `Estado atual: ${badge(welcome.byeOn)}`,
            id: `${prefix}welcome bye ${welcome.byeOn ? "off" : "on"}`,
          },
          {
            header: "PANEL WELCOME",
            title: "Abrir configurações boas-vindas/despedida",
            description: "Edita textos, regras e imagem.",
            id: `${prefix}welcome`,
          },
        ],
      },
    ];

    return sock.sendMessage(
      from,
      {
        text: painelText,
        title: "FSOCIETY BOT",
        subtitle: "Painel de administração do grupo",
        footer: "Selecione uma ação",
        interactiveButtons: [
          {
            name: "single_select",
            buttonParamsJson: JSON.stringify({
              title: "Abrir painel do grupo",
              sections,
            }),
          },
        ],
        ...global.channelInfo,
      },
      { quoted: msg }
    );
  },
};
