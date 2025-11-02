

// 🤖 BOT DISCORD - ATERNOS STATUS
// ================================

// Importation des modules modernes (ESM)
import { Client, GatewayIntentBits } from 'discord.js';
import fetch from 'node-fetch';

// === ⚙️ CONFIGURATION ===
const TOKEN = process.env.TOKEN;
const SERVER_ADDRESS = 'Minecraftsurviee.aternos.me';

// ================================
// === 🔧 INITIALISATION DU CLIENT DISCORD ===
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// === 🚀 Quand le bot est connecté ===
client.once('ready', () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);
  updateStatus(); // Mise à jour immédiate au démarrage
});

// === 📢 Commande !status dans le chat ===
client.on('messageCreate', async (message) => {
  if (message.author.bot) return; // ignore les bots
  if (message.content === '!status') {
    await sendServerStatus(message);
  }
});

// === 🌐 Fonction : Vérifie l'état du serveur ===
async function getServerData() {
  try {
    const response = await fetch(`https://api.mcsrvstat.us/2/${SERVER_ADDRESS}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur de connexion à l’API :', error);
    return null;
  }
}

// === 💬 Envoie la réponse dans Discord ===
async function sendServerStatus(message) {
  const data = await getServerData();

  if (!data || !data.online || !data.players || data.players.max === 0) {
    message.reply('🟥 Le serveur est **hors ligne**.');
  } else {
    message.reply(
      `🟩 Le serveur est **en ligne** !\n👥 Joueurs : ${data.players.online}/${data.players.max}\n🌍 IP : \`${SERVER_ADDRESS}\``
    );
  }
}

// === 🔄 Met à jour le statut du bot toutes les 60 secondes ===
async function updateStatus() {
  const data = await getServerData();

  if (data && data.online && data.players && data.players.max > 0) {
    client.user.setPresence({
      activities: [{ name: `🟢 En ligne (${data.players.online} joueurs)` }],
      status: 'online',
    });
  } else {
    client.user.setPresence({
      activities: [{ name: '🔴 Hors ligne' }],
      status: 'idle',
    });
  }

  setTimeout(updateStatus, 60000);
}


// === 🔑 Connexion du bot ===
client.login(TOKEN);
