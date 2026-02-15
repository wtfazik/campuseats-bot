import { Telegraf, Markup } from "telegraf";

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

/* ================== STORAGE (временно) ================== */
const users = {};

/* ================== TRANSLATIONS ================== */

const t = {
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

    aboutText: `ℹ️ О CampusEats

CampusEats — сервис доставки еды.
Мы делаем заказ быстрым и удобным.`,

    helpText: `🆘 Помощь

1️⃣ Нажмите Order
2️⃣ Выберите ресторан
3️⃣ Оформите заказ

Support: @CampusEats`,

    chooseLang: "🌍 Выберите язык:",
    phoneAsk: "Введите номер телефона (+998XXXXXXXXX)",
    cityAsk: "🏙 Выберите ваш город:"
  },

  uz: {
    welcome: `👋 Assalomu alaykum!

CampusEats'ga xush kelibsiz 🍽

Biz — zamonaviy ovqat yetkazib berish xizmati.

🎓 Talabalar uchun bonuslar mavjud.

Quyidagilardan birini tanlang 👇`,

    order: "📦 Buyurtma",
    orders: "📦 Buyurtmalarim",
    balance: "💰 Balans",
    review: "⭐ Fikr qoldirish",
    about: "ℹ️ Biz haqimizda",
    settings: "⚙️ Sozlamalar",
    help: "🆘 Yordam",
    back: "⬅️ Orqaga",

    aboutText: `ℹ️ CampusEats haqida

CampusEats — ovqat yetkazib berish xizmati.
Buyurtma berish jarayonini osonlashtiramiz.`,

    helpText: `🆘 Yordam

1️⃣ Buyurtma tugmasini bosing
2️⃣ Restoran tanlang
3️⃣ Buyurtmani tasdiqlang

Support: @CampusEats`,

    chooseLang: "🌍 Tilni tanlang:",
    phoneAsk: "+998 formatida telefon kiriting",
    cityAsk: "🏙 Shaharni tanlang:"
  },

  en: {
    welcome: `👋 Hello!

Welcome to CampusEats 🍽

We are a modern food delivery service.

🎓 Students receive bonuses.

Choose an option below 👇`,

    order: "📦 Order",
    orders: "📦 My Orders",
    balance: "💰 Balance",
    review: "⭐ Leave Review",
    about: "ℹ️ About",
    settings: "⚙️ Settings",
    help: "🆘 Help",
    back: "⬅️ Back",

    aboutText: `ℹ️ About CampusEats

CampusEats is a food delivery service.
We make ordering simple and fast.`,

    helpText: `🆘 Help

1️⃣ Click Order
2️⃣ Choose restaurant
3️⃣ Confirm order

Support: @CampusEats`,

    chooseLang: "🌍 Choose language:",
    phoneAsk: "Enter phone number (+998XXXXXXXXX)",
    cityAsk: "🏙 Choose your city:"
  }
};

/* ================== HELPER ================== */

function getLang(id) {
  return users[id]?.lang || "ru";
}

function mainMenu(lang) {
  return Markup.inlineKeyboard([
    [Markup.button.webApp(t[lang].order, "https://test-version-omega.vercel.app/")],
    [Markup.button.callback(t[lang].orders, "ORDERS")],
    [Markup.button.callback(t[lang].balance, "BALANCE")],
    [Markup.button.callback(t[lang].review, "REVIEW")],
    [Markup.button.callback(t[lang].about, "ABOUT")],
    [Markup.button.callback(t[lang].settings, "SETTINGS")],
    [Markup.button.callback(t[lang].help, "HELP")]
  ]);
}

/* ================== START ================== */

bot.start(async (ctx) => {
  const lang = getLang(ctx.from.id);
  await ctx.reply(t[lang].welcome, mainMenu(lang));
});

/* ================== LANGUAGE ================== */

bot.action("SETTINGS", async (ctx) => {
  const lang = getLang(ctx.from.id);
  await ctx.answerCbQuery();
  await ctx.reply(
    t[lang].chooseLang,
    Markup.inlineKeyboard([
      [Markup.button.callback("Русский 🇷🇺", "LANG_ru")],
      [Markup.button.callback("O‘zbek 🇺🇿", "LANG_uz")],
      [Markup.button.callback("English 🇬🇧", "LANG_en")],
      [Markup.button.callback(t[lang].back, "BACK")]
    ])
  );
});

bot.action(/LANG_(.+)/, async (ctx) => {
  const newLang = ctx.match[1];
  users[ctx.from.id] = { ...users[ctx.from.id], lang: newLang };
  await ctx.answerCbQuery("Language updated");
  await ctx.reply(t[newLang].welcome, mainMenu(newLang));
});

/* ================== OTHER BUTTONS ================== */

bot.action("ABOUT", async (ctx) => {
  const lang = getLang(ctx.from.id);
  await ctx.answerCbQuery();
  await ctx.reply(t[lang].aboutText);
});

bot.action("HELP", async (ctx) => {
  const lang = getLang(ctx.from.id);
  await ctx.answerCbQuery();
  await ctx.reply(t[lang].helpText);
});

bot.action("ORDERS", async (ctx) => {
  const lang = getLang(ctx.from.id);
  await ctx.answerCbQuery();
  await ctx.reply("🚀 This feature will be available soon.");
});

bot.action("BALANCE", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply("💰 0 UZS");
});

bot.action("REVIEW", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply("⭐ Please send your review as a message.");
});

bot.action("BACK", async (ctx) => {
  const lang = getLang(ctx.from.id);
  await ctx.answerCbQuery();
  await ctx.reply(t[lang].welcome, mainMenu(lang));
});

/* ================== WEBHOOK ================== */

export default async function handler(req, res) {
  try {
    await bot.handleUpdate(req.body);
    res.status(200).send("OK");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error");
  }
}
