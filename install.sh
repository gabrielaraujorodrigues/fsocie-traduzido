#!/bin/bash
# ============================================================
# Fsociety Bot - Script de Instalação Automática
# Repositório: github.com/gabrielaraujorodrigues/fsocie-traduzido
# Uso: curl -fsSL https://raw.githubusercontent.com/gabrielaraujorodrigues/fsocie-traduzido/main/install.sh | bash
# ============================================================

set -e

VERDE='\033[0;32m'
AMARELO='\033[1;33m'
VERMELHO='\033[0;31m'
NC='\033[0m'

ok()  { echo -e "${VERDE}✓ $1${NC}"; }
info(){ echo -e "${AMARELO}→ $1${NC}"; }
erro(){ echo -e "${VERMELHO}✗ $1${NC}"; exit 1; }

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║   ⚡ Fsociety Bot — Instalação PT-BR     ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# Verificar se é root
if [ "$EUID" -ne 0 ]; then
  erro "Execute como root: sudo bash install.sh"
fi

# --- 1. Atualizar sistema ---
info "Atualizando sistema..."
apt-get update -y -qq
apt-get upgrade -y -qq
ok "Sistema atualizado"

# --- 2. Instalar dependências do sistema ---
info "Instalando git, ffmpeg, curl..."
apt-get install -y -qq git ffmpeg curl wget unzip
ok "Dependências do sistema instaladas"

# --- 3. Instalar Node.js 20 LTS ---
info "Instalando Node.js 20 LTS..."
if ! command -v node &>/dev/null || [ "$(node -e 'console.log(parseInt(process.version.slice(1)))')" -lt 18 ]; then
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
  apt-get install -y -qq nodejs
else
  info "Node.js já instalado: $(node -v)"
fi
ok "Node.js $(node -v) pronto"

# --- 4. Instalar PM2 globalmente ---
info "Instalando PM2..."
npm install -g pm2 --quiet
ok "PM2 $(pm2 -v) instalado"

# --- 5. Clonar repositório ---
info "Clonando repositório..."
DESTINO="/root/fsocie-traduzido"

if [ -d "$DESTINO" ]; then
  info "Pasta já existe, atualizando..."
  cd "$DESTINO"
  git pull --quiet
else
  git clone https://github.com/gabrielaraujorodrigues/fsocie-traduzido.git "$DESTINO" --quiet
  cd "$DESTINO"
fi
ok "Repositório pronto em $DESTINO"

# --- 6. Instalar pacotes Node ---
info "Instalando pacotes do bot (pode demorar alguns minutos)..."
npm install --no-audit --no-fund --quiet
ok "Pacotes instalados"

# --- 7. Criar arquivo .env se não existir ---
if [ ! -f ".env" ]; then
  info "Criando arquivo .env..."
  cat > .env << EOF
NODE_ENV=production
PORT=3000
PANEL_PASSWORD=admin123
SESSION_SECRET=$(openssl rand -hex 32)
LOG_COMMAND_EXECUTIONS=true
STRUCTURED_LOG_ENABLED=true
CONSOLE_LIVE_TELEMETRY=false
PAIRING_MODE=code
EOF
  ok "Arquivo .env criado"
else
  info ".env já existe, mantendo configuração atual"
fi

# --- 8. Iniciar com PM2 ---
info "Iniciando bot + painel com PM2..."
pm2 delete all 2>/dev/null || true
pm2 start ecosystem.config.cjs --silent
pm2 save --silent
ok "Bot e painel iniciados com PM2"

# --- 9. Configurar PM2 no boot ---
info "Configurando PM2 para iniciar no boot..."
pm2 startup systemd -u root --hp /root --silent > /tmp/pm2_startup.sh 2>&1 || true
# Executar o comando de startup automaticamente
STARTUP_CMD=$(pm2 startup systemd -u root --hp /root 2>&1 | grep "sudo" | head -1)
if [ -n "$STARTUP_CMD" ]; then
  eval "$STARTUP_CMD" > /dev/null 2>&1 || true
fi
pm2 save --silent
ok "PM2 configurado no boot do servidor"

# --- 10. Configurar firewall ---
info "Abrindo porta 3000 no firewall..."
if command -v ufw &>/dev/null; then
  ufw allow 3000/tcp > /dev/null 2>&1 || true
  ok "Porta 3000 liberada no UFW"
fi
if command -v firewall-cmd &>/dev/null; then
  firewall-cmd --permanent --add-port=3000/tcp > /dev/null 2>&1 || true
  firewall-cmd --reload > /dev/null 2>&1 || true
  ok "Porta 3000 liberada no firewalld"
fi

# --- Resumo final ---
IP_PUBLICO=$(curl -s ifconfig.me 2>/dev/null || curl -s api.ipify.org 2>/dev/null || echo "SEU_IP")

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║           ✅  INSTALAÇÃO CONCLUÍDA!                  ║"
echo "╠══════════════════════════════════════════════════════╣"
echo "║                                                      ║"
echo "║  🌐 Painel web:  http://${IP_PUBLICO}:3000           "
echo "║  🔑 Senha:       admin123  (troque no .env)          ║"
echo "║  📁 Pasta:       /root/fsocie-traduzido              ║"
echo "║                                                      ║"
echo "║  Comandos úteis:                                     ║"
echo "║   pm2 list          → ver processos                  ║"
echo "║   pm2 logs          → ver logs ao vivo               ║"
echo "║   pm2 restart all   → reiniciar tudo                 ║"
echo "║                                                      ║"
echo "║  ⚠️  IMPORTANTE:                                     ║"
echo "║  Troque PANEL_PASSWORD no arquivo /root/             ║"
echo "║  fsocie-traduzido/.env                               ║"
echo "║                                                      ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""
echo "Processos PM2:"
pm2 list
