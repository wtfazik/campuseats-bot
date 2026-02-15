const { Telegraf, Markup } = require("telegraf");

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

const WEBAPP_URL = "https://test-version-omega.vercel.app/";
const SUPPORT_CHAT_ID = "-1003714441392";

const userState = {};
const userData = {};

// ===== ГЛАВНОЕ МЕНЮ =====
function mainMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.webApp("🍽 Order", WEBAPP_URL)],
    [
      Markup.button.callback("📦 Мои заказы", "orders"),
      Markup.button.callback("💰 Баланс", "balance"),
    ],
    [Markup.button.callback("⭐ Оставить отзыв", "review")],
    [Markup.button.callback("ℹ️ О нас", "about")],
    [Markup.button.callback("⚙️ Настройки", "settings")],
    [Markup.button.callback("🆘 Помощь", "help")],
  ]);
}

// ===== /start =====
bot.start(async (ctx) => {
  userState[ctx.from.id] = null;

  await ctx.reply(
`👋 Здравствуйте!

Добро пожаловать в CampusEats 🍽

Мы — современный сервис доставки еды.

🎓 Студенты получают бонусы.
Вы можете заказывать еду быстро и удобно.

Выберите действие ниже 👇`,
    mainMenu()
  );
});

// ===== CALLBACK ОБРАБОТКА =====
bot.action("orders", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageText(
`📦 Мои заказы

Здесь будет отображаться ваша история заказов.

Раздел станет доступен немного позже.`,
    mainMenu()
  );
});

bot.action("balance", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageText(
`💰 Баланс: 0 UZS

Бонусная система находится в разработке.`,
    mainMenu()
  );
});

bot.action("about", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageText(
`ℹ️ О нас

CampusEats — сервис доставки еды.

Поддержка: @CampusEats`,
    mainMenu()
  );
});

bot.action("help", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageText(
`🆘 Помощь

1️⃣ Нажмите Order
2️⃣ Выберите ресторан
3️⃣ Оформите заказ

Поддержка: @CampusEats`,
    mainMenu()
  );
});

bot.action("settings", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageText(
`⚙️ Настройки

Выберите действие:`,
    Markup.inlineKeyboard([
      [Markup.button.callback("📞 Указать телефон", "set_phone")],
      [Markup.button.callback("🏙 Указать город", "set_city")],
      [Markup.button.callback("🔙 Назад", "back")]
    ])
  );
});

bot.action("back", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageText("Главное меню 👇", mainMenu());
});

// ===== ГОРОДА =====
bot.action("set_city", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageText(
`🏙 Выберите город:`,
    Markup.inlineKeyboard([
      [Markup.button.callback("Ташкент", "city_Ташкент")],
      [Markup.button.callback("Самарканд", "city_Самарканд")],
      [Markup.button.callback("Бухара", "city_Бухара")],
      [Markup.button.callback("Андижан", "city_Андижан")],
      [Markup.button.callback("🔙 Назад", "settings")]
    ])
  );
});

bot.action(/city_(.+)/, async (ctx) => {
  const city = ctx.match[1];

  if (!userData[ctx.from.id]) userData[ctx.from.id] = {};
  userData[ctx.from.id].city = city;

  await ctx.answerCbQuery();
  await ctx.editMessageText(
`✅ Город сохранён: ${city}`,
    mainMenu()
  );
});

// ===== ТЕЛЕФОН =====
bot.action("set_phone", async (ctx) => {
  userState[ctx.from.id] = "waiting_phone";
  await ctx.answerCbQuery();
  await ctx.reply("Введите номер телефона (формат: +998XXXXXXXXX)");
});

// ===== ОТЗЫВ =====
bot.action("review", async (ctx) => {
  userState[ctx.from.id] = "waiting_review";
  await ctx.answerCbQuery();
  await ctx.reply("✍️ Напишите ваш отзыв:");
});

// ===== ЕДИНЫЙ ОБРАБОТЧИК TEXT =====
bot.on("text", async (ctx) => {
  const state = userState[ctx.from.id];

  if (state === "waiting_phone") {
    const phone = ctx.message.text.trim();

    if (!phone.startsWith("+998")) {
      return ctx.reply("Номер должен начинаться с +998");
    }

    if (!userData[ctx.from.id]) userData[ctx.from.id] = {};
    userData[ctx.from.id].phone = phone;

    userState[ctx.from.id] = null;

    return ctx.reply("✅ Телефон сохранён", mainMenu());
  }

  if (state === "waiting_review") {
    const reviewText = ctx.message.text.trim();

    const username = ctx.from.username
      ? `@${ctx.from.username}`
      : "Без username";

    const phone = userData[ctx.from.id]?.phone || "Не указан";

    await ctx.telegram.sendMessage(
      SUPPORT_CHAT_ID,
`📝 Новый отзыв

👤 Username: ${username}
📞 Телефон: ${phone}

💬 Текст:
${reviewText}`
    );

    userState[ctx.from.id] = null;

    return ctx.reply(
"Спасибо за ваш отзыв! Это помогает нам становиться лучше 🙌",
      mainMenu()
    );
  }
});

// ===== WEBHOOK =====
module.exports = async (req, res) => {
  try {
    await bot.handleUpdate(req.body);
    res.status(200).end();
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
};
