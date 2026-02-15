const { Telegraf, Markup } = require("telegraf");

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN);

const WEBAPP_URL = "https://test-version-omega.vercel.app/";
const SUPPORT_CHAT_ID = "-1003714441392";

// Хранилище данных (в памяти)
const userState = {};
const userData = {};

// ===== СПИСОК ГОРОДОВ (Конфигурация) =====
const CITIES = [
  { code: "tashkent", label: "Toshkent / Ташкент" },
  { code: "samarkand", label: "Samarqand / Самарканд" },
  { code: "bukhara", label: "Buxoro / Бухара" },
  { code: "andijan", label: "Andijon / Андижан" },
  { code: "namangan", label: "Namangan / Наманган" },
  { code: "fergana", label: "Farg'ona / Фергана" },
  { code: "navoi", label: "Navoiy / Навои" },
  { code: "jizzakh", label: "Jizzax / Джизак" },
  { code: "urgench", label: "Urganch / Ургенч" },
  { code: "qarshi", label: "Qarshi / Карши" },
  { code: "termez", label: "Termiz / Термез" },
  { code: "guliston", label: "Guliston / Гулистан" },
  { code: "nukus", label: "Nukus / Нукус" },
  { code: "kokand", label: "Qo'qon / Коканд" },
];

// ===== СЛОВАРЬ (TEXTS) =====
const textStore = {
  ru: {
    btn_order: "🍽 Заказать еду",
    btn_my_orders: "📦 Мои заказы",
    btn_balance: "💰 Баланс",
    btn_review: "⭐ Оставить отзыв",
    btn_about: "ℹ️ О нас",
    btn_settings: "⚙️ Настройки",
    btn_help: "🆘 Помощь",
    
    settings_title: "⚙️ *Настройки профиля*\n\nЗдесь вы можете изменить свои данные и параметры бота.",
    btn_change_lang: "🌐 Сменить язык",
    btn_change_phone: "📞 Сменить номер",
    btn_change_city: "🏙 Сменить город",
    btn_back: "🔙 Назад",

    start_text: "👋 *Добро пожаловать в CampusEats!* 🍽\n\nМы доставляем вкусную еду прямо к вам.\n🎓 Студентам — специальные бонусы.\n\nВыберите действие в меню ниже 👇",
    my_orders_text: "📦 *История заказов*\n\nВаш список пуст или раздел находится в разработке.",
    balance_text: "💰 *Ваш баланс*: 0 UZS\n\nБонусная программа скоро запустится.",
    about_text: "ℹ️ *О сервисе*\n\nCampusEats — это быстро, вкусно и выгодно.\nПо вопросам: @CampusEats",
    help_text: "🆘 *Помощь*\n\nВозникли проблемы?\nСвяжитесь с нами: @CampusEats",
    
    choose_city: "🏙 *Выберите ваш город*:\nЭто нужно для точного расчета доставки.",
    city_saved: "✅ Город успешно изменен на:",
    
    enter_phone: "📞 *Отправьте номер телефона*\n\nВведите в формате: `+998901234567`",
    phone_saved: "✅ Номер телефона сохранен!",
    
    enter_review: "✍️ *Напишите ваш отзыв*\n\nМы внимательно читаем все сообщения.",
    review_thanks: "Спасибо! Ваш отзыв отправлен команде. 🙌",
    wrong_phone: "⚠️ Ошибка. Номер должен начинаться с +998",
    lang_select: "🇷🇺 Выберите язык интерфейса\n🇺🇿 Ilova tilini tanlang\n🇬🇧 Choose interface language"
  },
  uz: {
    btn_order: "🍽 Buyurtma berish",
    btn_my_orders: "📦 Buyurtmalarim",
    btn_balance: "💰 Balans",
    btn_review: "⭐ Fikr qoldirish",
    btn_about: "ℹ️ Biz haqimizda",
    btn_settings: "⚙️ Sozlamalar",
    btn_help: "🆘 Yordam",
    
    settings_title: "⚙️ *Profil sozlamalari*\n\nBu yerda ma'lumotlaringizni o'zgartirishingiz mumkin.",
    btn_change_lang: "🌐 Tilni o'zgartirish",
    btn_change_phone: "📞 Raqamni o'zgartirish",
    btn_change_city: "🏙 Shaharni o'zgartirish",
    btn_back: "🔙 Ortga",

    start_text: "👋 *CampusEats ga xush kelibsiz!* 🍽\n\nBiz mazali taomlarni yetkazib beramiz.\n🎓 Talabalar uchun maxsus bonuslar.\n\nQuyidagi menyudan tanlang 👇",
    my_orders_text: "📦 *Buyurtmalar tarixi*\n\nSizda buyurtmalar yo'q yoki bo'lim ishlanmoqda.",
    balance_text: "💰 *Sizning balansingiz*: 0 UZS\n\nBonus tizimi tez orada ishga tushadi.",
    about_text: "ℹ️ *Biz haqimizda*\n\nCampusEats — tez, mazali va hamyonbop.\nAloqa: @CampusEats",
    help_text: "🆘 *Yordam*\n\nMuammo bormi?\nBiz bilan bog'laning: @CampusEats",
    
    choose_city: "🏙 *Shaharni tanlang*:\nBu yetkazib berish narxini hisoblash uchun kerak.",
    city_saved: "✅ Shahar muvaffaqiyatli o'zgartirildi:",
    
    enter_phone: "📞 *Telefon raqamingizni yuboring*\n\nFormat: `+998901234567`",
    phone_saved: "✅ Telefon raqam saqlandi!",
    
    enter_review: "✍️ *Fikringizni yozib qoldiring*\n\nBiz har bir fikrni o'qiymiz.",
    review_thanks: "Rahmat! Fikringiz jamoaga yuborildi. 🙌",
    wrong_phone: "⚠️ Xato. Raqam +998 bilan boshlanishi kerak",
    lang_select: "🇷🇺 Выберите язык интерфейса\n🇺🇿 Ilova tilini tanlang\n🇬🇧 Choose interface language"
  },
  en: {
    btn_order: "🍽 Order Food",
    btn_my_orders: "📦 My Orders",
    btn_balance: "💰 Balance",
    btn_review: "⭐ Leave Review",
    btn_about: "ℹ️ About Us",
    btn_settings: "⚙️ Settings",
    btn_help: "🆘 Help",
    
    settings_title: "⚙️ *Profile Settings*\n\nHere you can change your preferences.",
    btn_change_lang: "🌐 Change Language",
    btn_change_phone: "📞 Change Phone",
    btn_change_city: "🏙 Change City",
    btn_back: "🔙 Back",

    start_text: "👋 *Welcome to CampusEats!* 🍽\n\nWe deliver delicious food right to you.\n🎓 Special bonuses for students.\n\nChoose an action below 👇",
    my_orders_text: "📦 *Order History*\n\nList is empty or feature is under development.",
    balance_text: "💰 *Your Balance*: 0 UZS\n\nBonus program coming soon.",
    about_text: "ℹ️ *About Us*\n\nCampusEats — fast, delicious, affordable.\nSupport: @CampusEats",
    help_text: "🆘 *Help*\n\nHaving trouble?\nContact us: @CampusEats",
    
    choose_city: "🏙 *Choose your city*:\nRequired for delivery calculation.",
    city_saved: "✅ City successfully changed to:",
    
    enter_phone: "📞 *Send your phone number*\n\nFormat: `+998901234567`",
    phone_saved: "✅ Phone number saved!",
    
    enter_review: "✍️ *Write your review*\n\nWe read every message.",
    review_thanks: "Thanks! Your feedback has been sent. 🙌",
    wrong_phone: "⚠️ Error. Number must start with +998",
    lang_select: "🇷🇺 Выберите язык интерфейса\n🇺🇿 Ilova tilini tanlang\n🇬🇧 Choose interface language"
  }
};

// Хелпер для получения текста
const getTxt = (ctx, key) => {
  const lang = userData[ctx.from.id]?.lang || "ru"; 
  return textStore[lang][key] || textStore["ru"][key];
};

// ===== ГЛАВНОЕ МЕНЮ (Функция) =====
function mainMenu(ctx) {
  const t = (k) => getTxt(ctx, k);
  
  return Markup.inlineKeyboard([
    [Markup.button.webApp(t("btn_order"), WEBAPP_URL)],
    [
      Markup.button.callback(t("btn_my_orders"), "orders"),
      Markup.button.callback(t("btn_balance"), "balance"),
    ],
    [Markup.button.callback(t("btn_review"), "review")],
    [
      Markup.button.callback(t("btn_settings"), "settings"),
      Markup.button.callback(t("btn_about"), "about"),
    ],
    [Markup.button.callback(t("btn_help"), "help")],
  ]);
}

// ===== КЛАВИАТУРА ВЫБОРА ЯЗЫКА =====
const languageKeyboard = Markup.inlineKeyboard([
  [Markup.button.callback("🇷🇺 Русский", "lang_ru")],
  [Markup.button.callback("🇺🇿 O'zbekcha", "lang_uz")],
  [Markup.button.callback("🇬🇧 English", "lang_en")],
]);

// ===== /start =====
bot.start(async (ctx) => {
  userState[ctx.from.id] = null;
  
  // 1. Чистим старые кнопки
  const loadingMsg = await ctx.reply("...", Markup.removeKeyboard());
  try { await ctx.deleteMessage(loadingMsg.message_id); } catch(e){}

  // 2. Если новый юзер — выбор языка
  if (!userData[ctx.from.id]?.lang) {
    return ctx.reply("🇷🇺 Выберите язык / 🇺🇿 Tilni tanlang / 🇬🇧 Choose language", languageKeyboard);
  }

  // 3. Иначе — меню
  await ctx.replyWithMarkdown(getTxt(ctx, "start_text"), mainMenu(ctx));
});

// ===== ЯЗЫК (Обработка) =====
bot.action(/lang_(.+)/, async (ctx) => {
  const newLang = ctx.match[1];
  
  if (!userData[ctx.from.id]) userData[ctx.from.id] = {};
  userData[ctx.from.id].lang = newLang;

  await ctx.answerCbQuery();
  // Показываем меню на новом языке
  await ctx.editMessageText(
    textStore[newLang].start_text, 
    { parse_mode: "Markdown", ...mainMenu(ctx) }
  );
});

// ===== НАВИГАЦИЯ =====
bot.action("back", async (ctx) => {
  await ctx.answerCbQuery();
  try {
    await ctx.editMessageText(getTxt(ctx, "start_text"), {
      parse_mode: "Markdown",
      ...mainMenu(ctx)
    });
  } catch (e) {}
});

// Простые разделы
bot.action("orders", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageText(getTxt(ctx, "my_orders_text"), { parse_mode: "Markdown", ...mainMenu(ctx) });
});

bot.action("balance", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageText(getTxt(ctx, "balance_text"), { parse_mode: "Markdown", ...mainMenu(ctx) });
});

bot.action("about", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageText(getTxt(ctx, "about_text"), { parse_mode: "Markdown", ...mainMenu(ctx) });
});

bot.action("help", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageText(getTxt(ctx, "help_text"), { parse_mode: "Markdown", ...mainMenu(ctx) });
});

// ===== НАСТРОЙКИ (КРАСИВО) =====
bot.action("settings", async (ctx) => {
  await ctx.answerCbQuery();
  const t = (k) => getTxt(ctx, k);

  await ctx.editMessageText(
    t("settings_title"),
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard([
        [Markup.button.callback(t("btn_change_lang"), "change_lang_menu")],
        [Markup.button.callback(t("btn_change_city"), "set_city")],
        [Markup.button.callback(t("btn_change_phone"), "set_phone")],
        [Markup.button.callback(t("btn_back"), "back")]
      ])
    }
  );
});

bot.action("change_lang_menu", async (ctx) => {
  await ctx.answerCbQuery();
  await ctx.editMessageText(textStore.ru.lang_select, languageKeyboard);
});

// ===== ГОРОДА (12+ штук, 2 колонки) =====
bot.action("set_city", async (ctx) => {
  await ctx.answerCbQuery();
  const t = (k) => getTxt(ctx, k);
  
  // Генерируем кнопки из массива CITIES (по 2 в ряд)
  const cityButtons = [];
  for (let i = 0; i < CITIES.length; i += 2) {
    const row = [];
    row.push(Markup.button.callback(CITIES[i].label, `city_${CITIES[i].code}`));
    if (CITIES[i + 1]) {
      row.push(Markup.button.callback(CITIES[i + 1].label, `city_${CITIES[i + 1].code}`));
    }
    cityButtons.push(row);
  }
  
  // Добавляем кнопку "Назад" в конец
  cityButtons.push([Markup.button.callback(t("btn_back"), "settings")]);

  await ctx.editMessageText(
    t("choose_city"),
    {
      parse_mode: "Markdown",
      ...Markup.inlineKeyboard(cityButtons)
    }
  );
});

// Обработка выбора города
bot.action(/city_(.+)/, async (ctx) => {
  const cityCode = ctx.match[1];
  // Находим красивое название по коду
  const cityObj = CITIES.find(c => c.code === cityCode);
  const cityLabel = cityObj ? cityObj.label : cityCode;

  if (!userData[ctx.from.id]) userData[ctx.from.id] = {};
  userData[ctx.from.id].city = cityCode;

  await ctx.answerCbQuery();
  await ctx.editMessageText(
    `${getTxt(ctx, "city_saved")} *${cityLabel}*`,
    {
      parse_mode: "Markdown",
      ...mainMenu(ctx)
    }
  );
});

// ===== ТЕЛЕФОН =====
bot.action("set_phone", async (ctx) => {
  userState[ctx.from.id] = "waiting_phone";
  await ctx.answerCbQuery();
  // Отправляем новое сообщение, так как пользователю нужно ввести текст
  await ctx.replyWithMarkdown(getTxt(ctx, "enter_phone"));
});

// ===== ОТЗЫВ =====
bot.action("review", async (ctx) => {
  userState[ctx.from.id] = "waiting_review";
  await ctx.answerCbQuery();
  await ctx.replyWithMarkdown(getTxt(ctx, "enter_review"));
});

// ===== ЕДИНЫЙ ОБРАБОТЧИК ТЕКСТА (UPDATED) =====
bot.on("text", async (ctx) => {
  const state = userState[ctx.from.id];

  // 1. Ввод телефона
  if (state === "waiting_phone") {
    const phone = ctx.message.text.trim();

    if (!phone.startsWith("+998") || phone.length < 13) {
      return ctx.reply(getTxt(ctx, "wrong_phone"));
    }

    if (!userData[ctx.from.id]) userData[ctx.from.id] = {};
    userData[ctx.from.id].phone = phone;
    userState[ctx.from.id] = null;

    return ctx.reply(getTxt(ctx, "phone_saved"), mainMenu(ctx));
  }

  // 2. Ввод отзыва (ТОЧНО ПО ШАБЛОНУ)
  if (state === "waiting_review") {
    const reviewText = ctx.message.text.trim();
    
    // Получаем Username
    const username = ctx.from.username ? `@${ctx.from.username}` : "Не указан";
    
    // Получаем Телефон
    const phone = userData[ctx.from.id]?.phone || "Не указан";

    // Формируем сообщение для админа
    const adminMsg = 
`Новый отзыв
Username: ${username}
Телефон: ${phone}
Текст:
${reviewText}`;

    // Отправляем в группу
    await ctx.telegram.sendMessage(SUPPORT_CHAT_ID, adminMsg);

    // Сбрасываем состояние
    userState[ctx.from.id] = null;
    
    // Говорим спасибо юзеру
    return ctx.reply(getTxt(ctx, "review_thanks"), mainMenu(ctx));
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