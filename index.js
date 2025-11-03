// 🤖 BOT DISCORD - ATERNOS STATUS
// ================================

// Importation des modules modernes (ESM)
import { Client, GatewayIntentBits } from "discord.js";
import fetch from "node-fetch";

// === ⚙️ CONFIGURATION ===
const TOKEN = process.env.TOKEN;
const SERVER_ADDRESS = "minecraftsurviie.aternos.me";

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
client.once("clientReady", () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);
  updateStatus(); // Mise à jour immédiate au démarrage
});

// === 📢 Commande !status dans le chat ===
client.on("messageCreate", async (message) => {
  if (message.author.bot) return; // ignore les bots
  if (message.content === "!status") {
    await sendServerStatus(message);
  }
});
fetch("https://api.mcsrvstat.us/2/minecraftsurviie.aternos.me")
  .then((res) => res.json())
  .then((data) => {
    console.log(data); // 👈 Regarde tout l’objet reçu
    console.log("Players:", data.players);
    console.log("Online:", data.online);

    if (data.players) {
      console.log("Max players:", data.players.max);
    } else {
      console.log("⚠️ Aucune propriété 'players' trouvée !");
    }
  });

// === 🌐 Fonction : Vérifie l'état du serveur ===
async function getServerData() {
  try {
    const response = await fetch(
      `https://api.mcsrvstat.us/2/${SERVER_ADDRESS}`,
    );
    const data = await response.json();
    console.log(JSON.stringify(data, null, 2));
    console.log(!data);
    console.log(data.players.max);
    console.log(!data.players);
    console.log(!data.online);
    return data;
  } catch (error) {
    console.error("Erreur de connexion à l’API :", error);
    return null;
  }
}

// === 💬 Envoie la réponse dans Discord ===
async function sendServerStatus(message) {
  const data = await getServerData();

  if (!data?.online) {
    message.reply("🟥 Le serveur est **hors ligne** ou injoignable.");
    return;
  }

  const online = data.players?.online ?? 0;
  const max = data.players?.max ?? "?";

  message.reply(
    `🟩 Le serveur est **en ligne** !\n👥 Joueurs : ${online}/${max}\n🌍 IP : \`${SERVER_ADDRESS}\``,
  );
}

// === 🔄 Met à jour le statut du bot toutes les 60 secondes ===
async function updateStatus() {
  const data = await getServerData();

  if (data?.online) {
    client.user.setPresence({
      activities: [
        { name: `🟢 ${data.players?.online ?? 0} joueurs en ligne` },
      ],
      status: "online",
    });
  } else {
    client.user.setPresence({
      activities: [{ name: "🔴 Hors ligne" }],
      status: "idle",
    });
  }

  setTimeout(updateStatus, 60000);
}

// === 🔑 Connexion du bot ===
client.login(TOKEN);
