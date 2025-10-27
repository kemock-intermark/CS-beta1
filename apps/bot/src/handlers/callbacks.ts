import { Context } from 'grammy';
import { apiClient } from '../services/api-client.js';
import { logger } from '../utils/logger.js';
import { bookMenu, eventsMenu, myMenu, mainMenu } from '../keyboards/index.js';

export function setupCallbacks(bot: any) {
  // Main menu
  bot.callbackQuery('main_menu', async (ctx: Context) => {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(
      '📋 Главное меню',
      { reply_markup: mainMenu }
    );
  });

  // Book menu
  bot.callbackQuery('book', async (ctx: Context) => {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(
      '📅 Бронирование\n\nВыберите действие:',
      { reply_markup: bookMenu }
    );
  });

  // Events menu
  bot.callbackQuery('events', async (ctx: Context) => {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(
      '📅 Мероприятия\n\nВыберите действие:',
      { reply_markup: eventsMenu }
    );
  });

  // My menu
  bot.callbackQuery('my_menu', async (ctx: Context) => {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(
      '👤 Мои бронирования\n\nВыберите категорию:',
      { reply_markup: myMenu }
    );
  });

  // My reservations
  bot.callbackQuery('my_reservations', async (ctx: Context) => {
    try {
      await ctx.answerCallbackQuery('Загрузка...');
      
      const userId = ctx.from?.id.toString();
      const reservations = await apiClient.getReservations(userId || '');
      
      if (!reservations || reservations.length === 0) {
        await ctx.editMessageText(
          '📅 У вас нет активных бронирований.\n\nЗабронируйте стол прямо сейчас!',
          { reply_markup: bookMenu }
        );
        return;
      }

      const reservation = reservations[0];
      const date = new Date(reservation.reservationDate).toLocaleString('ru-RU');
      
      await ctx.editMessageText(
        `📅 *Бронирование #${reservation.id.slice(0, 8)}*\n\n` +
        `📅 Дата: ${date}\n` +
        `👥 Гостей: ${reservation.guestCount}\n` +
        `📊 Статус: ${reservation.status}\n\n` +
        `${reservation.event?.name ? `🎉 ${reservation.event.name}` : ''}`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '📱 Подробности', web_app: { url: `${process.env.WEBAPP_BASE_URL}/app?reservation=${reservation.id}` } }
              ],
              [
                { text: '◀️ Назад', callback_data: 'my_menu' }
              ]
            ]
          }
        }
      );
    } catch (error) {
      logger.error('Error fetching reservations:', error);
      await ctx.answerCallbackQuery('❌ Ошибка загрузки');
    }
  });

  // My tickets
  bot.callbackQuery('my_tickets', async (ctx: Context) => {
    try {
      await ctx.answerCallbackQuery('Загрузка...');
      
      const userId = ctx.from?.id.toString();
      const tickets = await apiClient.getTickets(userId || '');
      
      if (!tickets || tickets.length === 0) {
        await ctx.editMessageText(
          '🎫 У вас нет билетов.\n\nКупите билет на ближайшее мероприятие!',
          { reply_markup: eventsMenu }
        );
        return;
      }

      const ticket = tickets[0];
      const eventDate = new Date(ticket.event.date).toLocaleDateString('ru-RU');
      
      await ctx.editMessageText(
        `🎫 *Ваш билет*\n\n` +
        `🎉 Событие: ${ticket.event.name}\n` +
        `📅 Дата: ${eventDate}\n` +
        `💰 Тип: ${ticket.type}\n` +
        `📊 Статус: ${ticket.isScanned ? 'Использован' : 'Активен'}\n\n` +
        `${ticket.isScanned ? '✅ Билет уже использован' : '📱 Покажите QR-код на входе'}`,
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                { text: '📱 Посмотреть QR', web_app: { url: `${process.env.WEBAPP_BASE_URL}/app?ticket=${ticket.id}` } }
              ],
              [
                { text: '◀️ Назад', callback_data: 'my_menu' }
              ]
            ]
          }
        }
      );
    } catch (error) {
      logger.error('Error fetching tickets:', error);
      await ctx.answerCallbackQuery('❌ Ошибка загрузки');
    }
  });

  // Payment for reservation
  bot.callbackQuery(/^pay_reservation_(.+)$/, async (ctx: Context) => {
    const reservationId = Array.isArray((ctx as any).match)
      ? (ctx as any).match[1]
      : String((ctx as any).match ?? '');
    await ctx.answerCallbackQuery('Обработка платежа...');
    
    // Here you would create an invoice
    // This is handled in payments handler
    logger.info(`Payment requested for reservation: ${reservationId}`);
    
    await ctx.reply(
      '💳 Платеж оформляется...\n\nСкоро вы получите инвойс для оплаты.',
      { reply_markup: mainMenu }
    );
  });

  // Help
  bot.callbackQuery('help', async (ctx: Context) => {
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(
      '📚 *Справка*\n\n' +
      'Выберите вопрос:\n\n' +
      '👆 Используйте кнопки для навигации',
      { 
        parse_mode: 'Markdown',
        reply_markup: mainMenu
      }
    );
  });
}
