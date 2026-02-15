import { Telegraf, Markup } from "telegraf";

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// 👉 ID вашей группы (бот админ)
const SUPPORT_GROUP_ID = -1003714441392;

// Простое хранилище (для Vercel достаточно)
const users = {};

/* ===========================
   🌍 Тексты
=========================== */

const texts = {
  ru: {
    welcome: `👋 Здравствуйте!

Добро пожаловать в CampusEats 🍽

Мы — современный сервис доставки еды.

🎓 Студенты получают бонусы.
🍔 Любой пользователь может заказать еду быстро и удобно.

Выберите действие ниже 👇`,

    help: `🆘 Помощь

1️⃣ Нажмите Order  
2️⃣ Выберите ресторан  
3️⃣ Оформите заказ  

Если возникнут вопросы — напишите в поддержку:
📩 @CampusEats`,

    about: `ℹ️ О нас

CampusEats — современная платформа доставки еды.

Наша цель — сделать заказ быстрым,
удобным и понятным для каждого пользователя.`,

    balance: `💰 Ваш баланс: 0 UZS`,
    orders: `📦 История заказов появится после запуска полной версии сервиса.`,
    reviewAsk: `✍️ Напишите ваш отзыв одним сообщением.`,
    reviewThanks: `🙏 Спасибо за ваш отзыв!

Ваше мнение помогает нам становиться лучше.
Мы ценим каждого пользователя 💛`,

    settings: `⚙️ Настройки`,
    chooseLang: `🌍 Выберите язык:`,
  },

  en: {
    welcome: `👋 Hello!

Welcome to CampusEats 🍽

We are a modern food delivery service.

🎓 Students receive bonuses.
🍔 Anyone can order food quickly and easily.

Choose an option below 👇`,

    help: `🆘 Help

1️⃣ Click Order  
2️⃣ Choose a restaurant  
3️⃣ Place your order  

Need support?
📩 @CampusEats`,

    about: `ℹ️ About Us

CampusEats is a modern food delivery platform.

Our mission is to make ordering food
simple and convenient.`,

    balance: `💰 Your balance: 0 UZS`,
    orders: `📦 Order history will be available soon.`,
    reviewAsk: `✍️ Please send your review in one message.`,
    reviewThanks: `🙏 Thank you for your review!

Your feedback helps us improve 💛`,

    settings: `⚙️ Settings`,
    chooseLang: `🌍 Choose language:`,
  }
};

/* ===========================
   📌 Главное меню
=========================== */

function mainMenu(lang = "ru") {
  return Markup.inlineKeyboard([
    [Markup.button.callback("📦 Order", "order")],
    [Markup.button.callback("📦 Мои заказы", "orders")],
    [Markup.button.callback("💰 Balance", "balance")],
    [Markup.button.callback("⭐ Оставить отзыв", "review")],
    [Markup.button.callback("ℹ️ О нас", "about")],
    [Markup.button.callback("⚙️ Настройки", "settings")],
    [Markup.button.callback("🆘 Помощь", "help")]
  ]);
}

/* ===========================
   🚀 START
=========================== */

bot.start(async (ctx) => {
  const id = ctx.from.id;

  if (!users[id]) {
    users[id] = {
      lang: "ru",
      username: ctx.from.username || "не указан",
      name: ctx.from.first_name || "",
      phone: null,
      reviewMode: false
    };
  }

  const lang = users[id].lang;

  await ctx.reply(texts[lang].welcome, mainMenu(lang));
});

/* ===========================
   📦 Order
=========================== */

bot.action("order", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply("🚀 Раздел заказов скоро будет доступен.");
});

/* ===========================
   📦 Orders
=========================== */

bot.action("orders", async (ctx) => {
  await ctx.answerCbQuery();
  const lang = users[ctx.from.id]?.lang || "ru";
  await ctx.reply(texts[lang].orders);
});

/* ===========================
   💰 Balance
=========================== */

bot.action("balance", async (ctx) => {
  await ctx.answerCbQuery();
  const lang = users[ctx.from.id]?.lang || "ru";
  await ctx.reply(texts[lang].balance);
});

/* ===========================
   ℹ️ About
=========================== */

bot.action("about", async (ctx) => {
  await ctx.answerCbQuery();
  const lang = users[ctx.from.id]?.lang || "ru";
  await ctx.reply(texts[lang].about);
});

/* ===========================
   🆘 Help
=========================== */

bot.action("help", async (ctx) => {
  await ctx.answerCbQuery();
  const lang = users[ctx.from.id]?.lang || "ru";
  await ctx.reply(texts[lang].help);
});

/* ===========================
   ⭐ Review
=========================== */

bot.action("review", async (ctx) => {
  await ctx.answerCbQuery();
  const id = ctx.from.id;
  const lang = users[id]?.lang || "ru";

  users[id].reviewMode = true;

  await ctx.reply(texts[lang].reviewAsk);
});

bot.on("text", async (ctx) => {
  const id = ctx.from.id;
  const user = users[id];

  if (!user || !user.reviewMode) return;

  const reviewText = ctx.message.text;

  user.reviewMode = false;

  const username = user.username ? `@${user.username}` : "не указан";
  const phone = user.phone || "не указан";

  await bot.telegram.sendMessage(
    SUPPORT_GROUP_ID,
    `📩 Новый отзыв

👤 Имя: ${user.name}
🔗 Username: ${username}
📞 Телефон: ${phone}

📝 Отзыв:
${reviewText}`
  );

  const lang = user.lang || "ru";

  await ctx.reply(texts[lang].reviewThanks);
});

/* ===========================
   ⚙️ Settings
=========================== */

bot.action("settings", async (ctx) => {
  await ctx.answerCbQuery();

  const lang = users[ctx.from.id]?.lang || "ru";

  await ctx.reply(
    texts[lang].chooseLang,
    Markup.inlineKeyboard([
      [
        Markup.button.callback("🇷🇺 Русский", "lang_ru"),
        Markup.button.callback("🇬🇧 English", "lang_en")
      ]
    ])
  );
});

/* ===========================
   🌍 Language
=========================== */

bot.action("lang_ru", async (ctx) => {
  users[ctx.from.id].lang = "ru";
  await ctx.answerCbQuery("Язык изменен");
  await ctx.reply(texts.ru.welcome, mainMenu("ru"));
});

bot.action("lang_en", async (ctx) => {
  users[ctx.from.id].lang = "en";
  await ctx.answerCbQuery("Language updated");
  await ctx.reply(texts.en.welcome, mainMenu("en"));
});

/* ===========================
   🌐 Webhook
=========================== */

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      await bot.handleUpdate(req.body);
      res.status(200).end();
    } catch (error) {
      console.error(error);
      res.status(500).end();
    }
  } else {
    res.status(200).send("Bot is running");
  }
}
