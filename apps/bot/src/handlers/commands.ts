import { Bot, Context } from 'grammy';
import { bookMenu, mainMenu } from '../keyboards';
import { logger } from '../utils/logger';
import { apiClient } from '../services/api-client';

export function setupCommands(bot: Bot) {
  // /start command
  bot.command('start', async (ctx: Context) => {
    const startParam = ctx.match as string;
    
    if (startParam) {
      // Deep-link with promoter code
      const promoterCode = startParam.startsWith('promoter_') 
        ? startParam.replace('promoter_', '')
        : startParam;
      
      await ctx.reply(
        `🎉 Добро пожаловать в ClubSuite!\n\n` +
        `Ваш промоутер: *${promoterCode}*\n\n` +
        `Выберите действие из меню 👇`,
        { 
          parse_mode: 'Markdown',
          reply_markup: mainMenu
        }
      );
      
      logger.info(`New user joined with promoter code: ${promoterCode}`);
    } else {
      await ctx.reply(
        `🎉 Добро пожаловать в ClubSuite!\n\n` +
        `Ваш персональный помощник для бронирования столов и мероприятий в премиум клубах.\n\n` +
        `Выберите действие из меню 👇`,
        { reply_markup: mainMenu }
      );
    }
  });

  // /menu command
  bot.command('menu', async (ctx: Context) => {
    await ctx.reply(
      '📋 Главное меню',
      { reply_markup: mainMenu }
    );
  });

  // /book command
  bot.command('book', async (ctx: Context) => {
    await ctx.reply(
      '📅 Бронирование\n\nВыберите действие:',
      { reply_markup: bookMenu }
    );
  });

  // /events command
  bot.command('events', async (ctx: Context) => {
    try {
      // Get events from API
      // const userId = ctx.from?.id.toString();
      // const telegramId = ctx.from?.id.toString();
      
      const events = await apiClient.getEvents();
      
      if (!events || events.length === 0) {
        await ctx.reply(
          '📅 На данный момент нет доступных событий.\n\nСледите за обновлениями!',
          { reply_markup: mainMenu }
        );
        return;
      }

      // Send first event
      const event = events[0];
      const eventDate = new Date(event.date).toLocaleDateString('ru-RU');
      
      await ctx.reply(
        `🎉 *${event.name}*\n\n` +
        `📅 Дата: ${eventDate}\n` +
        `🕐 Время: ${event.startTime ? new Date(event.startTime).toLocaleTimeString('ru-RU') : 'TBD'}\n` +
        `📍 ${event.venue?.name || 'TBD'}\n\n` +
        `💰 Вход: $${event.coverCharge || 0}\n\n` +
        `${event.description || ''}`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '🎫 Купить билет', web_app: { url: `${process.env.WEBAPP_BASE_URL}/app?event=${event.id}` } }
              ],
              [
                { text: '📝 Забронировать стол', web_app: { url: `${process.env.WEBAPP_BASE_URL}/app?action=book&event=${event.id}` } }
              ],
              [
                { text: '◀️ Назад', callback_data: 'main_menu' }
              ]
            ]
          }
        }
      );
    } catch (error) {
      logger.error('Error fetching events:', error);
      await ctx.reply(
        '❌ Произошла ошибка при загрузке событий. Попробуйте позже.',
        { reply_markup: mainMenu }
      );
    }
  });

  // /my command
  bot.command('my', async (ctx: Context) => {
    await ctx.reply(
      '👤 Мои бронирования и билеты\n\n' +
      'Выберите категорию:',
      {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '📅 Мои бронирования', callback_data: 'my_reservations' },
              { text: '🎫 Мои билеты', callback_data: 'my_tickets' }
            ],
            [
              { text: '💳 История оплат', callback_data: 'my_payments' }
            ],
            [
              { text: '◀️ Главное меню', callback_data: 'main_menu' }
            ]
          ]
        }
      }
    );
  });

  // /help command
  bot.command('help', async (ctx: Context) => {
    await ctx.reply(
      '📚 *Справка по ClubSuite*\n\n' +
      '*Доступные команды:*\n' +
      '/start - Начать работу\n' +
      '/menu - Главное меню\n' +
      '/book - Бронирование стола\n' +
      '/events - События\n' +
      '/my - Мои бронирования\n' +
      '/help - Справка\n\n' +
      '*Как это работает:*\n' +
      '1️⃣ Выберите событие\n' +
      '2️⃣ Забронируйте стол или купите билет\n' +
      '3️⃣ Оплатите через Telegram Payments\n' +
      '4️⃣ Получите QR-код для входа\n\n' +
      '💡 Для бронирования стола нажмите кнопку "Открыть Mini App"',
      { 
        parse_mode: 'Markdown',
        reply_markup: mainMenu
      }
    );
  });
}
