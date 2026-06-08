import fs from "fs";
import path from "path";

function normalizeNumber(value = "") {
  return String(value || "").replace(/[^\d]/g, "").trim();
}

function unique(items = []) {
  return Array.from(new Set(items.filter(Boolean)));
}

function resolveDonoNumbers(settings = {}) {
  const ownerNumber = normalizeNumber(settings?.ownerNumber || "");
  const ownerNumbers = Array.isArray(settings?.ownerNumbers)
    ? settings.ownerNumbers.map((item) => normalizeNumber(item))
    : [];
  return unique([ownerNumber, ...ownerNumbers]);
}

function pickPrimaryDono(numbers = []) {
  const preferred = numbers.find((num) => String(num).endsWith("960"));
  return preferred || numbers[0] || "";
}

function resolveStaffImagePath() {
  const imageDir = path.join(process.cwd(), "imagens");
  const candidates = [
    path.join(imageDir, "staff-suporte.jpg"),
    path.join(imageDir, "staff-suporte.jpeg"),
    path.join(imageDir, "staff-suporte.png"),
    path.join(imageDir, "staff-suporte.webp"),
    path.join(imageDir, "menu-sistema.png"),
  ];
  return candidates.find((filePath) => fs.existsSync(filePath)) || "";
}

function getStaffImageBuffer() {
  const imagePath = resolveStaffImagePath();
  if (!imagePath) return null;
  try {
    return fs.readFileSync(imagePath);
  } catch {
    return null;
  }
}

function buildStaffCaption({
  ownerName = "DVYER",
  primaryDono = "",
  adminNumbers = [],
}) {
  const supportList = adminNumbers.length
    ? adminNumbers.map((num, index) => `║ ${String(index + 1).padStart(2, "0")}. wa.me/${num}`)
    : ["║ 01. No hay admins extra configurados."];

  return [
    "╔════════════════════════════════════════════╗",
    "║            ☠️ FSOCIETY EQUIPE BOT           ║",
    "╠════════════════════════════════════════════╣",
    `║ 👑 Dono principal: *${ownerName}*`,
    primaryDono
      ? `║ 📞 Contacto owner: wa.me/${primaryDono}`
      : "║ 📞 Contacto owner: no configurado",
    "║ ⚡ Suporte: respuesta rapida y directa",
    "║ 🛡️ Asistencia: reporte de fallas y ajuda bot",
    "╠════════════════════════════════════════════╣",
    "║ 👥 STAFF / ADMIN CONTACTS",
    ...supportList,
    "╠════════════════════════════════════════════╣",
    "║ ✅ Si el bot falla, envía captura + comando usado.",
    "║ ✅ Te ajudamos a solucionarlo lo mas rapidamente posible.",
    "╚════════════════════════════════════════════╝",
  ].join("\n");
}

export default {
  command: ["administradores", "admins", "staff", "equipo"],
  category: "sistema",
  description: "Mostra owner y administradores del bot.",

  run: async ({ sock, msg, from, settings }) => {
    const ownerName = String(settings?.ownerName || "DVYER").trim();
    const allDonos = resolveDonoNumbers(settings);
    const ownerMain = pickPrimaryDono(allDonos);
    const admins = allDonos.filter((num) => num && num !== ownerMain);
    const caption = buildStaffCaption({
      ownerName,
      primaryDono: ownerMain,
      adminNumbers: admins,
    });
    const imageBuffer = getStaffImageBuffer();

    if (imageBuffer) {
      return sock.sendMessage(
        from,
        { image: imageBuffer, caption, ...global.channelInfo },
        { quoted: msg }
      );
    }

    return sock.sendMessage(from, { text: caption, ...global.channelInfo }, { quoted: msg });
  },
};
