const { Telegraf, Markup } = require("telegraf");

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

// ====== CONFIG ======
const WEBAPP_URL = "https://test-version-omega.vercel.app/";
const SUPPORT_CHAT_ID = "-1003714441392"; // ваша группа
// =====================

const userState = {};

// ====== ГЛАВНОЕ МЕНЮ ======
function mainMenu() {
  return Markup.inlineKeyboard([
    [Markup.button.webApp("🍽 Меню ресторанов", WEBAPP_URL)],
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

// ====== /start ======
bot.start(async (ctx) => {
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

// ====== Мои заказы ======
bot.action("orders", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageText(
`📦 Мои заказы

Здесь будет отображаться ваша история заказов.

Раздел станет доступен после полной интеграции.`,
    mainMenu()
  );
});

// ====== Баланс ======
bot.action("balance", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageText(
`💰 Ваш баланс: 0 UZS

Бонусная система находится в разработке.`,
    mainMenu()
  );
});

// ====== О НАС ======
bot.action("about", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageText(
`ℹ️ О нас

CampusEats — сервис доставки еды.

Мы делаем заказ еды быстрым и удобным.

Поддержка: @CampusEats`,
    mainMenu()
  );
});

// ====== ПОМОЩЬ ======
bot.action("help", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageText(
`🆘 Помощь

1️⃣ Нажмите «Меню ресторанов»
2️⃣ Выберите ресторан
3️⃣ Оформите заказ

Если возникнут вопросы:
@CampusEats`,
    mainMenu()
  );
});

// ====== НАСТРОЙКИ ======
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
  await ctx.editMessageText(
`Главное меню 👇`,
    mainMenu()
  );
});

// ====== ГОРОДА ======
bot.action("set_city", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageText(
`🏙 Выберите город:`,
    Markup.inlineKeyboard([
      [Markup.button.callback("Ташкент", "city_tashkent")],
      [Markup.button.callback("Самарканд", "city_samarkand")],
      [Markup.button.callback("Бухара", "city_bukhara")],
      [Markup.button.callback("Андижан", "city_andijan")],
      [Markup.button.callback("🔙 Назад", "settings")]
    ])
  );
});

bot.action(/city_(.+)/, async (ctx) => {
  const city = ctx.match[1];
  await ctx.answerCbQuery();
  await ctx.editMessageText(
`✅ Город выбран: ${city}`,
    mainMenu()
  );
});

// ====== ТЕЛЕФОН ======
bot.action("set_phone", async (ctx) => {
  userState[ctx.from.id] = "waiting_phone";
  await ctx.answerCbQuery();
  await ctx.reply("Введите номер телефона (формат: +998XXXXXXXXX)");
});

bot.on("text", async (ctx) => {
  if (userState[ctx.from.id] === "waiting_phone") {
    const phone = ctx.message.text;

    if (!phone.startsWith("+998")) {
      return ctx.reply("Номер должен начинаться с +998");
    }

    userState[ctx.from.id] = null;
    await ctx.reply("✅ Телефон сохранён");
  }
});

// ====== ОТЗЫВ ======
bot.action("review", async (ctx) => {
  userState[ctx.from.id] = "waiting_review";
  await ctx.answerCbQuery();
  await ctx.reply("✍️ Напишите ваш отзыв:");
});

bot.on("text", async (ctx) => {
  if (userState[ctx.from.id] === "waiting_review") {

    const reviewText = ctx.message.text;

    const username = ctx.from.username
      ? `@${ctx.from.username}`
      : "Нет username";

    const phone = "Не указан";

    await ctx.telegram.sendMessage(
      SUPPORT_CHAT_ID,
`📝 Новый отзыв

👤 Пользователь: ${username}
📞 Телефон: ${phone}

💬 Сообщение:
${reviewText}`
    );

    userState[ctx.from.id] = null;

    await ctx.reply("Спасибо за ваш отзыв! Это помогает нам становиться лучше 🙌", mainMenu());
  }
});

// ====== WEBHOOK ======
module.exports = async (req, res) => {
  try {
    await bot.handleUpdate(req.body);
    res.status(200).end();
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
};
