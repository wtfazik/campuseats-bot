import { Telegraf, Markup } from "telegraf";

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);
const SUPPORT_CHAT_ID = -1003714441392;

const users = {};
const awaitingReview = new Set();
const awaitingPhone = new Set();

/* ================= TEXTS ================= */

const texts = {
  ru: {
    welcome:
      "👋 Здравствуйте!\n\nДобро пожаловать в *CampusEats* 🍽\n\nМы — современный сервис доставки еды.\n\n🎓 Студенты получают бонусы.\n\nВыберите действие ниже 👇",
    balance: "💰 Ваш баланс: 0 UZS",
    orders: "📦 История заказов будет доступна позже.",
    about:
      "ℹ *О нас*\n\nCampusEats — сервис доставки еды.\n\nНаша цель — быстро и удобно доставлять еду.",
    help:
      "🆘 *Помощь*\n\n1️⃣ Нажмите Order\n2️⃣ Выберите ресторан\n3️⃣ Оформите заказ\n\nSupport: @CampusEats",
    reviewAsk: "✍ Напишите ваш отзыв одним сообщением:",
    reviewThanks:
      "✅ Спасибо за отзыв!\n\nВаше мнение помогает нам становиться лучше 🚀",
    settings: "⚙ Настройки",
    chooseLang: "🌍 Выберите язык:",
    chooseCity: "🏙 Выберите город:",
    enterPhone: "📱 Введите номер телефона (+998...)",
    back: "⬅ Назад"
  },

  uz: {
    welcome:
      "👋 Salom!\n\n*CampusEats* ga xush kelibsiz 🍽\n\nBiz — zamonaviy ovqat yetkazib berish xizmati.\n\n🎓 Talabalar bonus oladi.\n\nQuyidan tanlang 👇",
    balance: "💰 Balansingiz: 0 UZS",
    orders: "📦 Buyurtmalar tarixi keyinroq mavjud bo‘ladi.",
    about:
      "ℹ *Biz haqimizda*\n\nCampusEats — ovqat yetkazib berish xizmati.",
    help:
      "🆘 *Yordam*\n\n1️⃣ Order ni bosing\n2️⃣ Restoranni tanlang\n3️⃣ Buyurtma bering\n\nSupport: @CampusEats",
    reviewAsk: "✍ Fikringizni bitta xabarda yozing:",
    reviewThanks:
      "✅ Fikringiz uchun rahmat!\n\nBu bizni yaxshiroq qiladi 🚀",
    settings: "⚙ Sozlamalar",
    chooseLang: "🌍 Tilni tanlang:",
    chooseCity: "🏙 Shaharni tanlang:",
    enterPhone: "📱 Telefon raqam kiriting (+998...)",
    back: "⬅ Orqaga"
  },

  en: {
    welcome:
      "👋 Hello!\n\nWelcome to *CampusEats* 🍽\n\nWe are a modern food delivery service.\n\n🎓 Students receive bonuses.\n\nChoose below 👇",
    balance: "💰 Your balance: 0 UZS",
    orders: "📦 Order history will be available soon.",
    about:
      "ℹ *About us*\n\nCampusEats — food delivery service.",
    help:
      "🆘 *Help*\n\n1️⃣ Press Order\n2️⃣ Choose restaurant\n3️⃣ Place order\n\nSupport: @CampusEats",
    reviewAsk: "✍ Send your review in one message:",
    reviewThanks:
      "✅ Thank you for your feedback!\n\nIt helps us improve 🚀",
    settings: "⚙ Settings",
    chooseLang: "🌍 Choose language:",
    chooseCity: "🏙 Choose city:",
    enterPhone: "📱 Enter phone (+998...)",
    back: "⬅ Back"
  }
};

function t(userId) {
  const lang = users[userId]?.lang || "ru";
  return texts[lang];
}

/* ================= MENU ================= */

function mainMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("📦 Мои заказы", "orders")],
    [Markup.button.callback("💰 Balance", "balance")],
    [Markup.button.callback("⭐ Оставить отзыв", "review")],
    [Markup.button.callback("ℹ О нас", "about")],
    [Markup.button.callback("⚙ Настройки", "settings")],
    [Markup.button.callback("🆘 Помощь", "help")]
  ]);
}

/* ================= UTIL ================= */

async function safeEdit(ctx, text, extra = {}) {
  try {
    await ctx.editMessageText(text, {
      parse_mode: "Markdown",
      ...extra
    });
  } catch {
    await ctx.reply(text, { parse_mode: "Markdown", ...extra });
  }
}

/* ================= COMMANDS ================= */

bot.start(async (ctx) => {
  const id = ctx.from.id;
  if (!users[id]) users[id] = { lang: "ru" };

  await ctx.reply(t(id).welcome, {
    parse_mode: "Markdown",
    ...mainMenu()
  });
});

bot.command("menu", async (ctx) => {
  const id = ctx.from.id;
  await ctx.reply(t(id).welcome, {
    parse_mode: "Markdown",
    ...mainMenu()
  });
});

/* ================= CALLBACKS ================= */

bot.action("balance", async (ctx) => {
  await ctx.answerCbQuery();
  await safeEdit(ctx, t(ctx.from.id).balance, mainMenu());
});

bot.action("orders", async (ctx) => {
  await ctx.answerCbQuery();
  await safeEdit(ctx, t(ctx.from.id).orders, mainMenu());
});

bot.action("about", async (ctx) => {
  await ctx.answerCbQuery();
  await safeEdit(ctx, t(ctx.from.id).about, mainMenu());
});

bot.action("help", async (ctx) => {
  await ctx.answerCbQuery();
  await safeEdit(ctx, t(ctx.from.id).help, mainMenu());
});

bot.action("review", async (ctx) => {
  awaitingReview.add(ctx.from.id);
  await ctx.answerCbQuery();
  await safeEdit(ctx, t(ctx.from.id).reviewAsk);
});

/* ================= SETTINGS ================= */

bot.action("settings", async (ctx) => {
  await ctx.answerCbQuery();
  await safeEdit(ctx, t(ctx.from.id).settings, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "🌍 Язык", callback_data: "lang" }],
        [{ text: "📱 Телефон", callback_data: "phone" }],
        [{ text: "⬅ Назад", callback_data: "back" }]
      ]
    }
  });
});

bot.action("lang", async (ctx) => {
  await ctx.answerCbQuery();
  await safeEdit(ctx, t(ctx.from.id).chooseLang, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Русский 🇷🇺", callback_data: "set_ru" }],
        [{ text: "O'zbek 🇺🇿", callback_data: "set_uz" }],
        [{ text: "English 🇬🇧", callback_data: "set_en" }],
        [{ text: t(ctx.from.id).back, callback_data: "back" }]
      ]
    }
  });
});

bot.action(/set_(.+)/, async (ctx) => {
  const lang = ctx.match[1];
  users[ctx.from.id].lang = lang;
  await ctx.answerCbQuery("Language updated");
  await ctx.reply(t(ctx.from.id).welcome, {
    parse_mode: "Markdown",
    ...mainMenu()
  });
});

bot.action("phone", async (ctx) => {
  awaitingPhone.add(ctx.from.id);
  await ctx.answerCbQuery();
  await ctx.reply(t(ctx.from.id).enterPhone);
});

bot.action("back", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.reply(t(ctx.from.id).welcome, {
    parse_mode: "Markdown",
    ...mainMenu()
  });
});

/* ================= TEXT HANDLER ================= */

bot.on("text", async (ctx) => {
  const id = ctx.from.id;

  /* Review */
  if (awaitingReview.has(id)) {
    awaitingReview.delete(id);

    const reviewText = ctx.message.text;

    await bot.telegram.sendMessage(
      SUPPORT_CHAT_ID,
      `📝 Новый отзыв\n\n👤 ${ctx.from.first_name}\n🆔 ${id}\n\n${reviewText}`
    );

    await ctx.reply(t(id).reviewThanks);
    return;
  }

  /* Phone */
  if (awaitingPhone.has(id)) {
    if (!ctx.message.text.startsWith("+998")) {
      await ctx.reply("Введите номер в формате +998...");
      return;
    }
    awaitingPhone.delete(id);
    users[id].phone = ctx.message.text;
    await ctx.reply("✅ Номер сохранён");
  }
});

/* ================= VERCEL HANDLER ================= */

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      await bot.handleUpdate(req.body);
      res.status(200).json({ ok: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Bot error" });
    }
  } else {
    res.status(200).send("Bot running");
  }
}
