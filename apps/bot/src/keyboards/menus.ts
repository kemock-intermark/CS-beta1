import { InlineKeyboard } from 'grammy';

export const mainMenu = new InlineKeyboard()
  .webApp('🎯 ClubSuite', process.env.WEBAPP_BASE_URL + '/app')
  .row()
  .text('📅 Мероприятия', 'events')
  .text('📝 Забронировать', 'book')
  .row()
  .text('👤 Мои бронирования', 'my_menu')
  .text('❓ Помощь', 'help');

export const commandsMenu = new InlineKeyboard()
  .text('📅 Мероприятия', 'events')
  .text('📝 Забронировать', 'book')
  .row()
  .text('👤 Мои бронирования', 'my_menu')
  .text('❓ Помощь', 'help');

export const bookMenu = new InlineKeyboard()
  .webApp('🎯 Выбрать стол', process.env.WEBAPP_BASE_URL + '/app?action=book')
  .row()
  .text('💳 Оплатить депозит', 'pay_deposit')
  .row()
  .text('◀️ Назад', 'main_menu');

export const eventsMenu = new InlineKeyboard()
  .webApp('📅 Все мероприятия', process.env.WEBAPP_BASE_URL + '/app?action=events')
  .row()
  .text('🔔 Уведомления', 'event_notifications')
  .row()
  .text('◀️ Назад', 'main_menu');

export const myMenu = new InlineKeyboard()
  .text('📅 Бронирования', 'my_reservations')
  .text('🎫 Билеты', 'my_tickets')
  .row()
  .text('💳 Платежи', 'my_payments')
  .text('📊 История', 'my_history')
  .row()
  .text('◀️ Главное меню', 'main_menu');

export const qrViewButton = (qrCode: string) => 
  new InlineKeyboard()
    .webApp('📱 Посмотреть QR', process.env.WEBAPP_BASE_URL + `/app?qr=${qrCode}`)
    .row()
    .text('◀️ Назад', 'my_tickets');

export const paymentButton = (reservationId: string) =>
  new InlineKeyboard()
    .text('💳 Оплатить', `pay_reservation_${reservationId}`)
    .text('◀️ Назад', 'my_reservations');

export const confirmButton = (action: string, data: string) =>
  new InlineKeyboard()
    .text('✅ Подтвердить', `confirm_${action}_${data}`)
    .text('❌ Отмена', 'cancel');

export const backButton = new InlineKeyboard()
  .text('◀️ Назад', 'main_menu');
