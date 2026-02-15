import { Telegraf, Markup } from "telegraf";

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

/* ================= STORAGE ================= */

const users = {};

/* ================= CITIES ================= */

const cities = [
  "Tashkent",
  "Samarkand",
  "Bukhara",
  "Andijan",
  "Namangan",
  "Fergana",
  "Nukus",
  "Khiva",
  "Termez",
  "Karshi",
  "Jizzakh",
  "Navoi",
  "Gulistan"
];

/* ================= HELPERS ================= */

function getUser(id) {
  if (!users[id]) {
    users[id] = {
      lang: "ru",
      city: "Tashkent",
      lastMessageId: null
    };
  }
  return users[id];
}

async function sendClean(ctx, text, keyboard = null) {
  const user = getUser(ctx.from.id);

  if (user.lastMessageId) {
    try {
      await ctx.telegram.deleteMessage(ctx.chat.id, user.lastMessageId);
    } catch {}
  }

  const msg = await ctx.reply(text, keyboard);
  user.lastMessageId = msg.message_id;
}

/* ================= TRANSLATIONS ================= */

const text = {
  ru: {
    welcome: `👋 Здравствуйте!

Добро пожаловать в CampusEats 🍽

Мы — современный сервис доставки еды.

🎓 Студенты получают бонусы.

Выберите действие ниже 👇`,

    order: "📦 Order",
    orders: "📦 Мои заказы",
    balance: "💰 Balance",
    review: "⭐ Оставить отзыв",
    about: "ℹ️ О нас",
    settings: "⚙️ Настройки",
    help: "🆘 Помощь",
    back: "⬅️ Назад",
    chooseLang: "🌍 Выберите язык:",
    chooseCity: "🏙 Выберите город:",
    currentCity: (city) => `🏙 Ваш город: ${city}`,
    helpText: `🆘 Помощь

1️⃣ Нажмите Order
2️⃣ Выберите ресторан
3️⃣ Оформите заказ

Support: @CampusEats`,
    aboutText: `ℹ️ О CampusEats

CampusEats — сервис доставки еды.
Мы делаем заказ быстрым и удобным.`,
    comingSoon: "🚀 Функция скоро будет доступна."
  }
};

/* ================= MAIN MENU ================= */

function mainMenu(lang) {
  return Markup.inlineKeyboard([
    [Markup.button.webApp(text[lang].order, "https://test-version-omega.vercel.app/")],
    [Markup.button.callback(text[lang].orders, "ORDERS")],
    [Markup.button.callback(text[lang].balance, "BALANCE")],
    [Markup.button.callback(text[lang].review, "REVIEW")],
    [Markup.button.callback(text[lang].about, "ABOUT")],
    [Markup.button.callback(text[lang].settings, "SETTINGS")],
    [Markup.button.callback(text[lang].help, "HELP")]
  ]);
}

/* ================= START ================= */

bot.start(async (ctx) => {
  const user = getUser(ctx.from.id);
  await sendClean(ctx, text[user.lang].welcome, mainMenu(user.lang));
});

/* ================= /ALL COMMAND ================= */

bot.command("all", async (ctx) => {
  const user = getUser(ctx.from.id);
  await sendClean(ctx, text[user.lang].welcome, mainMenu(user.lang));
});

/* ================= SETTINGS ================= */

bot.action("SETTINGS", async (ctx) => {
  const user = getUser(ctx.from.id);
  await ctx.answerCbQuery();

  await sendClean(
    ctx,
    `${text[user.lang].currentCity(user.city)}

${text[user.lang].chooseLang}`,
    Markup.inlineKeyboard([
      [Markup.button.callback("Русский 🇷🇺", "LANG_ru")],
      [Markup.button.callback("O‘zbek 🇺🇿", "LANG_uz")],
      [Markup.button.callback("English 🇬🇧", "LANG_en")],
      [Markup.button.callback("🏙 Сменить город", "CITY")],
      [Markup.button.callback(text[user.lang].back, "BACK")]
    ])
  );
});

/* ================= CITY ================= */

bot.action("CITY", async (ctx) => {
  await ctx.answerCbQuery();

  await sendClean(
    ctx,
    text.ru.chooseCity,
    Markup.inlineKeyboard([
      ...cities.map((c) => [Markup.button.callback(c, `CITY_${c}`)]),
      [Markup.button.callback(text.ru.back, "SETTINGS")]
    ])
  );
});

bot.action(/CITY_(.+)/, async (ctx) => {
  const city = ctx.match[1];
  const user = getUser(ctx.from.id);
  user.city = city;

  await ctx.answerCbQuery("Город обновлён");
  await sendClean(ctx, `✅ Город изменён на ${city}`, mainMenu(user.lang));
});

/* ================= LANGUAGE ================= */

bot.action(/LANG_(.+)/, async (ctx) => {
  const newLang = ctx.match[1];
  const user = getUser(ctx.from.id);
  user.lang = newLang;

  await ctx.answerCbQuery("Language updated");
  await sendClean(ctx, text[newLang].welcome, mainMenu(newLang));
});

/* ================= OTHER ================= */

bot.action("ABOUT", async (ctx) => {
  const user = getUser(ctx.from.id);
  await ctx.answerCbQuery();
  await sendClean(ctx, text[user.lang].aboutText);
});

bot.action("HELP", async (ctx) => {
  const user = getUser(ctx.from.id);
  await ctx.answerCbQuery();
  await sendClean(ctx, text[user.lang].helpText);
});

bot.action("ORDERS", async (ctx) => {
  await ctx.answerCbQuery();
  await sendClean(ctx, text.ru.comingSoon);
});

bot.action("BALANCE", async (ctx) => {
  await ctx.answerCbQuery();
  await sendClean(ctx, "💰 0 UZS");
});

bot.action("REVIEW", async (ctx) => {
  await ctx.answerCbQuery();
  await sendClean(ctx, "⭐ Отправьте отзыв следующим сообщением.");
});

bot.action("BACK", async (ctx) => {
  const user = getUser(ctx.from.id);
  await ctx.answerCbQuery();
  await sendClean(ctx, text[user.lang].welcome, mainMenu(user.lang));
});

/* ================= WEBHOOK ================= */

export default async function handler(req, res) {
  try {
    await bot.handleUpdate(req.body);
    res.status(200).send("OK");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error");
  }
}
