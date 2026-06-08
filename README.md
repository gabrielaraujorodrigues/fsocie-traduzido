<p align="center">
  <a href="https://www.whatsapp.com/channel/0029VatMd2cGk1FmWw8au11u" target="_blank">
    <img src="https://img.shields.io/badge/Canal%20Oficial%20WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" alt="Canal Oficial" />
  </a>
  <a href="https://chat.whatsapp.com/GuLWXlFUdy3BJA9OXcc1Hj" target="_blank">
    <img src="https://img.shields.io/badge/Comunidade-128C7E?style=for-the-badge&logo=whatsapp&logoColor=white" alt="Comunidade" />
  </a>
  <a href="https://chat.whatsapp.com/FsrlWXVdG3RCLYbZ5LazBO" target="_blank">
    <img src="https://img.shields.io/badge/Suporte-1EBEA5?style=for-the-badge&logo=whatsapp&logoColor=white" alt="Suporte" />
  </a>
</p>

<p align="center">
  <img src="imagens/menu.png" alt="Fsociety-V1 Menu" width="560" />
</p>

<h1 align="center">Fsociety-V1</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18%2B-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Baileys-MultiBot-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" alt="Baileys" />
  <img src="https://img.shields.io/badge/PM2-Ready-2B037A?style=for-the-badge&logo=pm2&logoColor=white" alt="PM2" />
  <img src="https://img.shields.io/badge/Status-Ativo-success?style=for-the-badge" alt="Status" />
</p>

<p align="center">
Bot de WhatsApp multi-instância com suporte para <b>bot principal + subbots</b>, ideal para VPS, Termux e Windows.
</p>

## Índice

- [Características](#características)
- [Requisitos](#requisitos)
- [Instalação rápida](#instalação-rápida-linuxvps)
- [Instalação no Termux](#instalação-no-termux-android)
- [Instalação no Linux (Ubuntu/Debian)](#instalação-no-linux-ubuntudebian)
- [Instalação no Windows](#instalação-no-windows)
- [Execução com PM2](#execução-com-pm2-vps-recomendado)
- [Configuração principal](#configuração-principal)
- [Canal direto pelo bot](#canal-direto-pelo-bot)
- [Scripts disponíveis](#scripts-disponíveis)
- [Recomendações](#recomendações)
- [Solução de problemas](#solução-de-problemas)

## Características

- Multi-bot por slots (`main` + subbots).
- Pareamento por código para vincular rapidamente.
- Módulos de comandos: admin, grupos, jogos, downloads, economia, sistema.
- Integração de canal/newsletter para suporte.
- Persistência de sessões para não perder a vinculação.
- Compatível com PM2 para produção.

## Requisitos

- `Node.js` 18 ou superior (ideal: Node 20 LTS)
- `npm`
- `git`
- `ffmpeg`

## Instalação rápida (Linux/VPS)

```bash
git clone https://github.com/DevYerZx/fsociety-bot.git
cd fsociety-bot
npm install
npm start
```

## Instalação no Termux (Android)

<p>
  <img src="https://cdn.simpleicons.org/android/3DDC84" alt="Android" width="16" />
  <b>Recomendado:</b> Termux do F-Droid.
</p>

```bash
pkg update -y
pkg upgrade -y
pkg install -y git nodejs-lts npm ffmpeg
termux-setup-storage

git clone https://github.com/DevYerZx/fsociety-bot.git
cd fsociety-bot
npm install
npm start

SE NPM START FALHAR:

node index.js
```

Se `npm install` falhar por rede:

```bash
npm install --fetch-retries=5
```

## Instalação no Linux (Ubuntu/Debian)

<p>
  <img src="https://cdn.simpleicons.org/linux/FCC624" alt="Linux" width="16" />
  <b>Servidor ou VPS</b>
</p>

```bash
sudo apt update
sudo apt install -y git ffmpeg curl
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

git clone https://github.com/DevYerZx/fsociety-bot.git
cd fsociety-bot
npm install
npm start
```

## Instalação no Windows

<p>
  <img src="https://cdn.simpleicons.org/windows/0078D6" alt="Windows" width="16" />
  <b>PowerShell</b>
</p>

1. Instale `Node.js LTS`, `Git`, `FFmpeg` (adicionado ao `PATH`).
2. Execute:

```powershell
git clone https://github.com/DevYerZx/fsociety-bot.git
cd fsociety-bot
npm install
npm start
```

## Execução com PM2 (VPS recomendado)

<p>
  <img src="https://cdn.simpleicons.org/pm2/2B037A" alt="PM2" width="16" />
  <b>Produção estável</b>
</p>

```bash
npm install -g pm2
npm run pm2:start
pm2 save
pm2 logs
```

## Configuração principal

Arquivo: `settings/settings.json`

- `botName`: nome do bot.
- `ownerNumber` / `ownerNumbers`: donos.
- `prefix`: prefixos de comandos.
- `subbots`: slots e estado dos subbots.
- `newsletter.enabled`: ativa funções de canal.
- `newsletter.jid`: JID do canal.
- `newsletter.name`: nome do canal.
- `newsletter.url`: URL direta do canal (botão de suporte).

Exemplo:

```json
{
  "newsletter": {
    "enabled": true,
    "jid": "120363354701957370@newsletter",
    "name": "Fsociety-V1",
    "url": "https://www.whatsapp.com/channel/0029VatMd2cGk1FmWw8au11u"
  }
}
```

## Canal direto pelo bot

Use este comando:

```text
.gruposoficiais
```

Se `newsletter.url` estiver configurado, o bot envia botão direto para abrir o canal.

## Scripts disponíveis

```bash
npm start
npm run check
npm run smoke
npm run pm2:start
npm run pm2:restart
```

## Recomendações

- Execute `npm run smoke` após cada mudança grande.
- Não exclua as pastas `dvyer-session/` nem `dvyer-session-subbot*/`.
- Faça backup de `settings/` e `database/`.
- Use PM2 em VPS para reinício automático.
- Mantenha-se no Node LTS para evitar incompatibilidades.

## Solução de problemas

- Bot não responde: `npm run smoke`.
- Erro de sintaxe: `npm run check`.
- Canal não abre: verifique `settings.newsletter.url`.
- Sessão perdida: valide as pastas de sessão.

## Dono e colaborador

<p align="center">
  <a href="https://github.com/DevYerZx" target="_blank">
    <img src="https://github.com/DevYerZx.png" width="96" height="96" alt="DevYerZx" />
  </a>
  <a href="https://github.com/crxsmods" target="_blank">
    <img src="https://github.com/crxsmods.png" width="96" height="96" alt="crxsmods" />
  </a>
</p>

<p align="center">
  <b>Dono:</b> <a href="https://github.com/DevYerZx">DevYerZx</a><br/>
  <b>Colaborador:</b> <a href="https://github.com/crxsmods">crxsmods</a>
</p>

## Nota

Este projeto usa Baileys (não é a API oficial do WhatsApp Business). Algumas mudanças do WhatsApp podem afetar funcionalidades sem aviso prévio.

---

> **Tradução para Português Brasil** por solicitação do usuário. Base original: [fsociety-bot](https://github.com/gabrielaraujorodrigues/fsociety-bot)
