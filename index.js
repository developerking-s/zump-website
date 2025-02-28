const express = require('express');
const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const session = require('express-session');
const path = require('path');
require('dotenv').config(); // Carrega variáveis de ambiente do arquivo .env

// Configurações do aplicativo Discord
const DISCORD_CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const DISCORD_CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;

// Inicializa o Express
const app = express();

// Configura a pasta de arquivos estáticos (CSS)
app.use(express.static(path.join(__dirname, 'public')));

// Configura a sessão
app.use(session({
  secret: process.env.SESSION_SECRET, // Use uma variável de ambiente para o segredo
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production' } // Use cookies seguros em produção
}));

// Inicializa o Passport
app.use(passport.initialize());
app.use(passport.session());

// Configura a estratégia do Discord
passport.use(new DiscordStrategy({
  clientID: DISCORD_CLIENT_ID,
  clientSecret: DISCORD_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/auth/discord/callback',
  scope: ['identify', 'email'], // Escopos de permissão
  state: true // Adiciona proteção CSRF
}, (accessToken, refreshToken, profile, done) => {
  // Aqui você pode salvar o perfil do usuário no banco de dados, se necessário
  return done(null, profile);
}));

// Serializa o usuário na sessão
passport.serializeUser((user, done) => {
  done(null, user);
});

// Desserializa o usuário da sessão
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Rota de login
app.get('/auth/discord', passport.authenticate('discord'));

// Rota de callback após o login
app.get('/auth/discord/callback', passport.authenticate('discord', {
  failureRedirect: '/',
}), (req, res) => {
  res.redirect('/dashboard'); // Redireciona para a dashboard após o login
});

// Rota da dashboard
app.get('/dashboard', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/'); // Redireciona para a página inicial se não estiver autenticado
  }
  // Renderiza o arquivo HTML da dashboard
  res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
});

// Rota de logout
app.get('/logout', (req, res) => {
  req.logout(() => {
    res.redirect('/');
  });
});

// Rota inicial
app.get('/', (req, res) => {
  res.send('<a href="/auth/discord">Login com Discord</a>');
});

// Inicia o servidor
app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});