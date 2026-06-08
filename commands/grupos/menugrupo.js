function getPrefix(settings) {
  if (Array.isArray(settings?.prefix)) {
    return settings.prefix.find((value) => String(value || "").trim()) || ".";
  }
  return String(settings?.prefix || ".").trim() || ".";
}

function buildFallbackText(prefix) {
  return (
    `╔════════════════════════════╗\n` +
    `║   FSOCIETY-V1 MENU DO GRUPO   ║\n` +
    `╚════════════════════════════╝\n\n` +
    `Admin:\n` +
    `- ${prefix}painelgrupo\n` +
    `- ${prefix}marcar todos Mensagem\n` +
    `- ${prefix}modoadmin on|off\n` +
    `- ${prefix}antilink on|off\n` +
    `- ${prefix}antispam on|off\n\n` +
    `Dinâmica:\n` +
    `- ${prefix}sorteio crear 10m | Prêmio\n` +
    `- ${prefix}sorteio unirme\n` +
    `- ${prefix}votação crear 10m | Pergunta | Opção 1 | Opção 2\n` +
    `- ${prefix}votar 1\n\n` +
    `IA Util:\n` +
    `- ${prefix}resumirchat\n` +
    `- ${prefix}explicarcomando ytmp4\n` +
    `- ${prefix}traducirvoz en (respondiendo áudio)\n`
  );
}

export default {
  name: "menugrupo",
  command: ["menugrupo", "grupomenu", "menuadmin", "menugp"],
  category: "grupo",
  description: "Painel visual para administração y dinâmicas de grupo",
  groupOnly: true,
  adminOnly: true,

  run: async ({ sock, msg, from, settings }) => {
    const prefix = getPrefix(settings);
    const sections = [
      {
        title: "Administração",
        rows: [
          {
            header: "PANEL",
            title: "Abrir painel do grupo",
            description: "Configura segurança y control del bot",
            id: `${prefix}painelgrupo`,
          },
          {
            header: "INVOCAR",
            title: "Marcar todos",
            description: "Marque membros del grupo",
            id: `${prefix}marcar todos Aviso importante`,
          },
          {
            header: "MODO ADMIN",
            title: "Ativar modo admin",
            description: "Somente admin/dono usam comandos",
            id: `${prefix}modoadmin on`,
          },
        ],
      },
      {
        title: "Sorteios",
        rows: [
          {
            header: "CREAR",
            title: "Crear sorteio rapidamente",
            description: "Exemplo com datamento automático",
            id: `${prefix}sorteio crear 10m | Nitro Discord`,
          },
          {
            header: "UNIRME",
            title: "Entrar al sorteio",
            description: "Inscripcion de membros",
            id: `${prefix}sorteio unirme`,
          },
          {
            header: "ESTADO",
            title: "Ver estado del sorteio",
            description: "Tempo restante e participantes",
            id: `${prefix}sorteio estado`,
          },
        ],
      },
      {
        title: "Votações",
        rows: [
          {
            header: "CREAR",
            title: "Crear votação",
            description: "Com datamento automático",
            id: `${prefix}votação crear 10m | Elegimos hora | 8PM | 9PM`,
          },
          {
            header: "VOTAR",
            title: "Emitir voto",
            description: "Votar por índice",
            id: `${prefix}votar 1`,
          },
          {
            header: "ESTADO",
            title: "Ver resultados ao vivo",
            description: "Contagem e porcentagem atual",
            id: `${prefix}votação estado`,
          },
        ],
      },
      {
        title: "IA Útil no grupo",
        rows: [
          {
            header: "CHAT",
            title: "Resumir chat",
            description: "Resumo automático de mensagens recentes",
            id: `${prefix}resumirchat 40`,
          },
          {
            header: "COMANDO",
            title: "Explicar comando",
            description: "Como usar qualquer comando",
            id: `${prefix}explicarcomando ytmp4`,
          },
          {
            header: "VOZ",
            title: "Traduzir voz",
            description: "Responda uma nota de voz",
            id: `${prefix}traducirvoz en`,
          },
        ],
      },
    ];

    try {
      return await sock.sendMessage(
        from,
        {
          text:
            `╔════════════════════════════╗\n` +
            `║   FSOCIETY-V1 MENU DO GRUPO   ║\n` +
            `╚════════════════════════════╝\n` +
            `┃ 🛡️ Painel de moderação e dinâmicas.\n` +
            `┃ 📌 Use la lista para ejecutar rapidamente.\n` +
            `╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━⬣`,
          title: "FSOCIETY-V1",
          subtitle: "Painel do grupo",
          footer: "Escolha uma ação do grupo",
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
    } catch {
      return sock.sendMessage(
        from,
        { text: buildFallbackText(prefix), ...global.channelInfo },
        { quoted: msg }
      );
    }
  },
};
