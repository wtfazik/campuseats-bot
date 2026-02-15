import { Telegraf } from "telegraf";

const bot = new Telegraf(process.env.BOT_TOKEN);

// Команда /start
bot.start((ctx) => {
  return ctx.reply("Welcome to CampusEats 🍔", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Open App",
            web_app: { url: process.env.WEBAPP_URL }
          }
        ]
      ]
    }
  });
});

// Экспортируем serverless handler
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).send("Bot is running");
  }

  try {
    await bot.handleUpdate(req.body);
    return res.status(200).send("OK");
  } catch (error) {
    console.error(error);
    return res.status(500).send("Error");
  }
}
