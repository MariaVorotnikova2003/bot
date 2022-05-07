import { Telegraf, Markup } from "telegraf";
import dotenv from "dotenv";
import my_const from "./const.js";
import { GoogleSpreadsheetService } from "./GoogleSpreadsheetService.js";
dotenv.config();

// Инициализация бота с помощью Telegraf
const bot = new Telegraf(process.env.BOT_TOKEN);
const googleSpreadService = new GoogleSpreadsheetService();

start();

async function start() {
  await googleSpreadService.Auth();
  const meals = await googleSpreadService.LoadMeals();

  bot.start((ctx) =>
    ctx.reply(
      `Привет ${
        ctx.message.from.first_name ? ctx.message.from.first_name : "незнакомец"
      }`,
      Markup.keyboard([
        ["🦦 Об авторе"],
        ["🍩 Рецепты"],
        ["🤎 Обратная связь"],
      ]).resize()
    )
  );


  // Обработка команды /help
  bot.help((ctx) => ctx.reply(my_const.commands));
  // Обработка команды /recipes
  bot.command("recipes", async (ctx) => {
    try {
      await ctx.replyWithHTML(
        "<b>Рецепты</b>",
        Markup.inlineKeyboard([
          Object.keys(meals).map((meal) =>
            Markup.button.callback(meal, meal)
          ),
        ])
      );
    } catch (e) {
      console.error(e);
    }
  });
  /**
   * Функция для отправки сообщения ботом
   * @param {String} id_btn Идентификатор кнопки для обработки
   * @param {String} src_img Путь к изображению, или false чтобы отправить только текст
   * @param {String} text Текстовое сообщение для отправки
   * @param {Boolean} preview Блокировать превью у ссылок или нет, true - блокировать, false - нет
   */
  function addActionBot(id_btn, recipes, preview = true) {
    bot.action(id_btn, async (ctx) => {
      try {
        const randomRecipe =
          recipes[Math.floor(Math.random() * recipes.length)];

        await ctx.answerCbQuery();
        if (randomRecipe.photo) {
          await ctx.replyWithPhoto({
            source: randomRecipe.photo,
          });
        }

        await ctx.replyWithHTML(
          `<b>${randomRecipe.dish}</b>\n${randomRecipe.resipe}`,
          {
            disable_web_page_preview: preview,
          }
        );
      } catch (e) {
        console.error(e);
      }
    });
  }
  Object.keys(meals).forEach((meal) => {
    addActionBot(meal, meals[meal]);
  });

  // Кнопка "Об авторе"
  bot.hears("🦦 Об авторе", async (ctx) => {
    try {
      await ctx.replyWithPhoto(
        {
          source: "./img/start.jpg",
        },
        {
          caption: my_const.AUTHOR,
          parse_mode: "HTML",
          reply_markup: JSON.stringify({
            inline_keyboard: [
              [
                Markup.button.url(
                  "YouTube",
                  "https://www.youtube.com/channel/UC2Oq3qGBO69c3YGgyt65Mdw"
                ),
              ],
              [
                Markup.button.url(
                  "Instagram",
                  "https://www.instagram.com/_v_masha_/"
                ),
              ],
              [
                Markup.button.url(
                  "Facebook",
                  "https://www.facebook.com/profile.php?id=100025272532482"
                ),
              ],
            ],
          }),
        },
        {
          disable_web_page_preview: true,
        }
      );
    } catch (e) {
      console.error(e);
    }
  });

  // Кнопка "Рецепты"
  bot.hears("🍩 Рецепты", async (ctx) => {
    try {
      await ctx.replyWithHTML(
        "<b>Рецепты</b>",
        Markup.inlineKeyboard([
          Object.keys(meals).map((meal) =>
            Markup.button.callback(meal, meal)
          ),
        ])
      );
    } catch (e) {
      console.error(e);
    }
  });
  // Кнопка "Обратная связь"
  bot.hears("🤎 Обратная связь", async (ctx) => {
    try {
      await ctx.reply(
        "🤔 Чтобы связаться с моим создателем нажми на кнопку ниже.",
        Markup.inlineKeyboard([
          Markup.button.url("Написать sms 📱", "https://t.me/vr_masha///"),
        ])
      );
    } catch (e) {
      console.error(e);
    }
  });

  // Обработчик кнопок с помощью функции


  // Запустить бота
  bot.launch();

  // Включить плавную остановку
  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
}
