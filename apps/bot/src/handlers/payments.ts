import { Context } from 'grammy';
import { logger } from '../utils/logger';
import { apiClient } from '../services/api-client';

export function setupPayments(bot: any) {
  // Handle pre-checkout query
  bot.on('pre_checkout_query', async (ctx: any) => {
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

  // Handle successful payment
  bot.on('successful_payment', async (ctx: any) => {
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
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const PAYMENT_TOKEN = process.env.TELEGRAM_PAYMENT_PROVIDER_TOKEN;
    
    if (!PAYMENT_TOKEN) {
      throw new Error('Payment provider token not configured');
    }
    
    // Create invoice via API
    await ctx.api.sendInvoice(
      parseInt(userId),
      {
        title: 'ClubSuite - Бронирование',
        description: description,
        payload: `reservation_${reservationId}`,
        provider_token: PAYMENT_TOKEN,
        currency: 'USD',
        prices: [{ label: 'Total', amount: Math.round(amount * 100) }],
        max_tip_amount: 1000,
        suggested_tip_amounts: [100, 200, 500],
      }
    );
    
    logger.info(`Invoice sent for reservation: ${reservationId}`);
  } catch (error) {
    logger.error('Error sending invoice:', error);
    throw error;
  }
}
