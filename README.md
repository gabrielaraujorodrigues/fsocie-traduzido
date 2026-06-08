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

<h1 align="center">Fsociety-V1 — Traduzido PT-BR</h1>

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-20%20LTS-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Baileys-MultiBot-25D366?style=for-the-badge&logo=whatsapp&logoColor=white" alt="Baileys" />
  <img src="https://img.shields.io/badge/PM2-Ready-2B037A?style=for-the-badge&logo=pm2&logoColor=white" alt="PM2" />
  <img src="https://img.shields.io/badge/Painel%20Web-⚡-orange?style=for-the-badge" alt="Painel" />
  <img src="https://img.shields.io/badge/Status-Ativo-success?style=for-the-badge" alt="Status" />
</p>

<p align="center">
Bot de WhatsApp multi-instância com suporte para <b>bot principal + subbots</b>, ideal para VPS, Koyeb e Windows.<br/>
Inclui <b>painel web de controle</b> com login, status em tempo real, logs e botões start/stop/restart.
</p>

## Índice

- [Características](#características)
- [Requisitos](#requisitos)
- [Instalação no Linux (Ubuntu/Debian)](#instalação-no-linux-ubuntudebian)
- [Instalação no Windows](#instalação-no-windows)
- [Execução com PM2 (VPS recomendado)](#execução-com-pm2-vps-recomendado)
- [Hospedagem gratuita no Koyeb (sem cartão)](#hospedagem-gratuita-no-koyeb-sem-cartão)
- [Painel web de controle](#painel-web-de-controle)
- [Configuração principal](#configuração-principal)
- [Scripts disponíveis](#scripts-disponíveis)
- [Recomendações](#recomendações)
- [Solução de problemas](#solução-de-problemas)

## Características

- Multi-bot por slots (`main` + subbots).
- Pareamento por código para vincular rapidamente.
- Módulos de comandos: admin, grupos, jogos, downloads, economia, sistema.
- Integração de canal/newsletter para suporte.
- Persistência de sessões para não perder a vinculação.
- **Painel web** com login, status, logs e controle por pm2.
- Compatível com PM2 para produção e Koyeb para hospedagem gratuita.

## Requisitos

- `Node.js` 20 LTS (recomendado)
- `npm`
- `git`
- `ffmpeg`

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

git clone https://github.com/gabrielaraujorodrigues/fsocie-traduzido.git
cd fsocie-traduzido
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
git clone https://github.com/gabrielaraujorodrigues/fsocie-traduzido.git
cd fsocie-traduzido
npm install
npm start
```

## Execução com PM2 (VPS recomendado)

<p>
  <img src="https://cdn.simpleicons.org/pm2/2B037A" alt="PM2" width="16" />
  <b>Produção estável — bot não cai mesmo fechando o terminal</b>
</p>

```bash
git clone https://github.com/gabrielaraujorodrigues/fsocie-traduzido.git
cd fsocie-traduzido
npm install

npm install -g pm2
npm run pm2:start   # inicia bot + painel web
pm2 save            # salva para reiniciar no boot
pm2 startup         # registra no boot do servidor
pm2 logs            # acompanhar logs
```

Para não perder o bot no boot do servidor:
```bash
pm2 startup         # copie e execute o comando que ele mostrar
pm2 save
```

## Hospedagem gratuita no Koyeb (sem cartão)

> ✅ Grátis · ✅ Sem cartão de crédito · ✅ 24h por dia · ✅ Conecta pelo GitHub

**Koyeb** é a melhor opção gratuita para rodar o bot 24/7 sem VPS e sem cartão.

### Passo a passo

1. Acesse **[koyeb.com](https://koyeb.com)** e crie conta com seu e-mail (sem cartão)
2. Clique em **New App**
3. Selecione **GitHub** como fonte e autorize o acesso
4. Selecione o repositório **`fsocie-traduzido`**
5. Configure:
   - **Build command:** `npm install`
   - **Run command:** `npm run pm2:producao`
   - **Port:** `3000`
6. Em **Environment variables**, adicione:
   | Variável | Valor |
   |---|---|
   | `PANEL_PASSWORD` | sua senha do painel (ex: `minhasenha123`) |
   | `SESSION_SECRET` | qualquer frase longa (ex: `chave-super-secreta-2024`) |
   | `NODE_ENV` | `production` |
7. Clique em **Deploy**

Após o deploy, o bot inicia automaticamente e o painel fica acessível no link que o Koyeb fornecer.

### Manter o Koyeb sempre acordado (grátis)

Acesse **[uptimerobot.com](https://uptimerobot.com)** → New Monitor:
- Tipo: `HTTP(s)`
- URL: `https://seu-app.koyeb.app/health`
- Intervalo: `5 minutos`

Isso garante que o Koyeb nunca entre em modo de espera.

## Painel web de controle

Após iniciar com pm2 (local ou Koyeb), acesse o endereço do servidor na porta `3000`:

- **Local:** `http://localhost:3000`
- **Koyeb:** `https://seu-app.koyeb.app`

### Funcionalidades do painel

| Função | Descrição |
|---|---|
| 🔐 Login | Senha definida via `PANEL_PASSWORD` (padrão: `admin123`) |
| 🟢 Status | Mostra online/parado por processo |
| 📊 Métricas | Memória, CPU, uptime, reinicializações |
| ↺ Reiniciar | Reinicia um processo via pm2 |
| ■ Parar | Para um processo |
| 📋 Logs | Visualiza logs em tempo real |
| `/health` | Endpoint para UptimeRobot |

> **Importante:** Troque a senha padrão `admin123` definindo a variável `PANEL_PASSWORD`.

## Configuração principal

Arquivo: `settings/settings.json`

- `botName`: nome do bot.
- `ownerNumber` / `ownerNumbers`: donos.
- `prefix`: prefixos de comandos.
- `subbots`: slots e estado dos subbots.
- `newsletter.enabled`: ativa funções de canal.
- `newsletter.jid`: JID do canal.
- `newsletter.name`: nome do canal.
- `newsletter.url`: URL direta do canal.

## Scripts disponíveis

```bash
npm start               # inicia somente o bot
npm run painel          # inicia somente o painel
npm run pm2:start       # inicia bot + painel com pm2
npm run pm2:restart     # reinicia todos os processos
npm run pm2:stop        # para todos os processos
npm run pm2:logs        # acompanhar logs
npm run pm2:producao    # modo container (Koyeb/Docker)
npm run check           # verifica sintaxe do código
npm run smoke           # verificação completa de saúde
```

## Recomendações

- Use `PANEL_PASSWORD` para trocar a senha do painel.
- Não exclua as pastas `dvyer-session/` nem `dvyer-session-subbot*/`.
- Faça backup de `settings/` e `database/`.
- Use PM2 em VPS para reinício automático no boot.
- Mantenha-se no Node 20 LTS para evitar incompatibilidades.

## Solução de problemas

| Problema | Solução |
|---|---|
| Bot não responde | `npm run smoke` |
| Erro de sintaxe | `npm run check` |
| Painel inacessível | Verifique se a porta 3000 está liberada |
| Sessão perdida | Valide as pastas de sessão |
| Bot cai no Koyeb | Configure UptimeRobot no `/health` |

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
  <b>Dono original:</b> <a href="https://github.com/DevYerZx">DevYerZx</a><br/>
  <b>Colaborador original:</b> <a href="https://github.com/crxsmods">crxsmods</a><br/>
  <b>Tradução PT-BR:</b> <a href="https://github.com/gabrielaraujorodrigues">gabrielaraujorodrigues</a>
</p>

## Nota

Este projeto usa Baileys (não é a API oficial do WhatsApp Business). Algumas mudanças do WhatsApp podem afetar funcionalidades sem aviso prévio.

---

> **Repositório traduzido:** [gabrielaraujorodrigues/fsocie-traduzido](https://github.com/gabrielaraujorodrigues/fsocie-traduzido) &nbsp;·&nbsp; Base original: [DevYerZx/fsociety-bot](https://github.com/DevYerZx/fsociety-bot)
