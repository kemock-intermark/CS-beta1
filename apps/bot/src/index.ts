import { Bot, Context, webhookCallback } from 'grammy';
import { run } from '@grammyjs/runner';
import * as http from 'http';
import { setupCommands } from './handlers/commands';
import { setupCallbacks } from './handlers/callbacks';
import { setupPayments } from './handlers/payments';
import { logger } from './utils/logger';
import { setupHealthEndpoint } from './health';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const BOT_PUBLIC_URL = process.env.BOT_PUBLIC_URL;

if (!BOT_TOKEN) {
  throw new Error('TELEGRAM_BOT_TOKEN is not set');
}

// Create bot instance
const bot = new Bot(BOT_TOKEN);

// Middleware for logging
bot.use(async (ctx: Context, next) => {
  logger.info(`Update ${ctx.update.update_id} received`);
  await next();
});

// Setup all handlers
setupCommands(bot);
setupCallbacks(bot);
setupPayments(bot);

// Setup menu button
bot.command('setmenu', async (ctx) => {
  try {
    await bot.api.setMyCommands([
      { command: 'start', description: 'Начать работу' },
      { command: 'menu', description: 'Главное меню' },
      { command: 'book', description: 'Забронировать стол' },
      { command: 'events', description: 'Мероприятия' },
      { command: 'my', description: 'Мои бронирования' },
      { command: 'help', description: 'Справка' },
    ]);
    
    await ctx.reply('Menu configured');
  } catch (error) {
    logger.error('Error setting menu:', error);
  }
});

// Setup Menu Button
bot.api.setMyCommands([
  { command: 'start', description: 'Начать работу' },
  { command: 'menu', description: 'Главное меню' },
  { command: 'book', description: 'Забронировать стол' },
  { command: 'events', description: 'Мероприятия' },
  { command: 'my', description: 'Мои бронирования' },
  { command: 'help', description: 'Справка' },
]);

// Setup Menu Button
try {
  const webappUrl = (process.env.WEBAPP_BASE_URL || '') + '/app';
  if (webappUrl) {
    bot.api.setChatMenuButton({
      menu_button: {
        type: 'web_app',
        text: '🎯 Открыть ClubSuite',
        web_app: { url: webappUrl },
      },
    });
    logger.info('Menu button configured');
  }
} catch (error) {
  logger.error('Error setting menu button:', error);
}

// Error handling
bot.catch((err) => {
  logger.error('Bot error:', err);
});

// Server/webhook or long polling based on environment
const isRender = process.env.RENDER === 'true' || !!process.env.PORT;
const PORT = Number(process.env.PORT || 3002);

if (isRender) {
  const handleUpdate = webhookCallback(bot, 'http');

  const server = http.createServer(async (req, res) => {
    try {
      if (req.method === 'GET' && req.url && req.url.startsWith('/bot/health')) {
        const me = await bot.api.getMe();
        const webhookInfo = await bot.api.getWebhookInfo();
        const health = {
          status: 'ok',
          timestamp: new Date().toISOString(),
          username: me.username,
          webhook: !!webhookInfo.url,
          webhookUrl: webhookInfo.url || null,
        };
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(health));
        return;
      }

      if (req.method === 'POST' && req.url && req.url.startsWith('/bot/webhook')) {
        return handleUpdate(req as any, res as any);
      }

      res.statusCode = 404;
      res.end();
    } catch (e: any) {
      logger.error('Bot HTTP server error:', e);
      res.statusCode = 500;
      res.end('Internal Server Error');
    }
  });

  server.listen(PORT, () => {
    logger.info(`🏥 Bot HTTP server listening on :${PORT}`);
  });
} else if (process.env.NODE_ENV === 'development') {
  logger.info('🤖 Bot started in development mode (long polling)');
  run(bot);
}

export default bot;