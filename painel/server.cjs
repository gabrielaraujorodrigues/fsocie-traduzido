'use strict';

const express = require('express');
const session = require('express-session');
const path = require('path');
const pm2 = require('pm2');
const { execSync } = require('child_process');

const app = express();
const PORT = process.env.PORT || 3000;
const PANEL_PASSWORD = process.env.PANEL_PASSWORD || 'admin123';
const SESSION_SECRET = process.env.SESSION_SECRET || 'fsociety-painel-chave-secreta';

let pm2Conectado = false;

function conectarPm2() {
  return new Promise((resolve) => {
    pm2.connect(false, (err) => {
      if (err) {
        console.error('[Painel] Erro ao conectar ao pm2:', err.message);
        pm2Conectado = false;
      } else {
        pm2Conectado = true;
        console.log('[Painel] Conectado ao pm2 daemon');
      }
      resolve();
    });
  });
}

conectarPm2();
setInterval(conectarPm2, 30000);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000, secure: false }
}));
app.use('/static', express.static(path.join(__dirname, 'public')));

const requireAuth = (req, res, next) => {
  if (req.session?.autenticado) return next();
  return res.status(401).json({ erro: 'Não autenticado' });
};

app.get('/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: Date.now() });
});

app.get('/', (req, res) => {
  if (req.session?.autenticado) {
    return res.sendFile(path.join(__dirname, 'public', 'painel.html'));
  }
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.post('/api/login', (req, res) => {
  const { senha } = req.body;
  if (senha === PANEL_PASSWORD) {
    req.session.autenticado = true;
    return res.json({ ok: true });
  }
  res.status(401).json({ erro: 'Senha incorreta' });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/status', requireAuth, (req, res) => {
  if (!pm2Conectado) {
    return res.json({ ok: true, processos: [], aviso: 'pm2 não conectado ainda' });
  }
  pm2.list((err, lista) => {
    if (err) return res.status(500).json({ erro: err.message });
    const processos = lista.map(p => ({
      nome: p.name,
      pid: p.pid,
      status: p.pm2_env?.status || 'desconhecido',
      uptime: p.pm2_env?.pm_uptime || null,
      reinicializacoes: p.pm2_env?.restart_time || 0,
      memoria: p.monit?.memory || 0,
      cpu: p.monit?.cpu || 0,
    }));
    res.json({ ok: true, processos, timestamp: Date.now() });
  });
});

app.post('/api/processo/:nome/reiniciar', requireAuth, (req, res) => {
  pm2.restart(req.params.nome, (err) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ ok: true, mensagem: `"${req.params.nome}" reiniciado com sucesso` });
  });
});

app.post('/api/processo/:nome/parar', requireAuth, (req, res) => {
  pm2.stop(req.params.nome, (err) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ ok: true, mensagem: `"${req.params.nome}" parado` });
  });
});

app.post('/api/processo/:nome/iniciar', requireAuth, (req, res) => {
  pm2.restart(req.params.nome, (err) => {
    if (err) return res.status(500).json({ erro: err.message });
    res.json({ ok: true, mensagem: `"${req.params.nome}" iniciado` });
  });
});

app.get('/api/logs/:nome', requireAuth, (req, res) => {
  const linhas = Math.min(parseInt(req.query.linhas || '80'), 200);
  try {
    const saida = execSync(`pm2 logs ${req.params.nome} --lines ${linhas} --nostream 2>&1`, {
      timeout: 8000
    }).toString();
    res.json({ ok: true, logs: saida });
  } catch (err) {
    const saida = (err.stdout || err.stderr || '').toString() || err.message;
    res.json({ ok: true, logs: saida });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[Painel] Fsociety Painel rodando na porta ${PORT}`);
  console.log(`[Painel] Senha padrão: ${PANEL_PASSWORD === 'admin123' ? 'admin123 (TROQUE via PANEL_PASSWORD)' : '***'}`);
});
