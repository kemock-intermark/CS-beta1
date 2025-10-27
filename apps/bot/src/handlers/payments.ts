import { Context } from 'grammy';
import { logger } from '../utils/logger.js';
import { apiClient } from '../services/api-client.js';
import { Bot } from 'grammy';

export function setupPayments(bot: Bot<Context>): void {
  // Pre-checkout query handler
  bot.on('pre_checkout_query', async (ctx) => {
    try {
      const invoicePayload = ctx.preCheckoutQuery.invoice_payload;
      logger.info(`Pre-checkout query: ${invoicePayload}`);
      
      // Here you should validate the payment with your backend
      // For now, we'll approve all queries
      
      await ctx.answerPreCheckoutQuery(true);
      logger.info('Payment approved');
    } catch (error) {
      logger.error('Error in pre-checkout query:', error);
      await ctx.answerPreCheckoutQuery(false, {
        error_message: 'Ошибка обработки платежа. Попробуйте позже.',
      });
    }
  });

  // Successful payment handler
  bot.on('message:successful_payment', async (ctx) => {
    logger.info('Successful payment received', {
      telegramId: ctx.from.id,
      payload: ctx.message.successful_payment.invoice_payload,
    });
    try {
      const payment = ctx.message.successful_payment;
      logger.info(`Successful payment: ${payment.invoice_payload}`);
      
      // Notify backend about successful payment
      await apiClient.processPaymentCallback({
        transaction_id: payment.telegram_payment_charge_id,
        status: 'success',
        amount: payment.total_amount,
        currency: payment.currency,
      });
      
      // Send confirmation to user
      await ctx.reply(
        '✅ *Платеж успешно обработан!*\n\n' +
        `💰 Сумма: ${(payment.total_amount / 100).toFixed(2)} ${payment.currency}\n` +
        `📝 ID транзакции: ${payment.telegram_payment_charge_id}\n\n` +
        'Ваша бронь подтверждена. Спасибо!',
        { parse_mode: 'Markdown' }
      );
      
      logger.info('Payment processed successfully');
    } catch (error) {
      logger.error('Error processing payment:', error);
      await ctx.reply(
        '⚠️ Платеж получен, но произошла ошибка при обработке. ' +
        'Пожалуйста, свяжитесь с поддержкой.',
      );
    }
  });
}

export async function sendInvoice(
  ctx: Context,
  userId: string,
  reservationId: string,
  amount: number,
  description: string
) {
  try {
    const PAYMENT_TOKEN = process.env.TELEGRAM_PAYMENT_PROVIDER_TOKEN as string | undefined;
    
    if (!PAYMENT_TOKEN) {
      throw new Error('Payment provider token not configured');
    }
    
    // Create invoice via API  
    await ctx.api.sendInvoice(
      parseInt(userId),
      'ClubSuite - Бронирование',
      description,
      `reservation_${reservationId}`,
      PAYMENT_TOKEN,
      [{ label: 'Total', amount: Math.round(amount * 100) }]
    );
    
    logger.info(`Invoice sent for reservation: ${reservationId}`);
  } catch (error) {
    logger.error('Error sending invoice:', error);
    throw error as any;
  }
}
