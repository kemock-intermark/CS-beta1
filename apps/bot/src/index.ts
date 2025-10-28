import { Bot, Context, webhookCallback } from 'grammy';
import { run } from '@grammyjs/runner';
import * as http from 'http';
import { setupCommands } from './handlers/commands.js';
import { setupCallbacks } from './handlers/callbacks.js';
import { setupPayments } from './handlers/payments.js';
import { setupPromoterCommands } from './handlers/promoter.js';
import { logger } from './utils/logger.js';
// import { setupHealthEndpoint } from './health'; // unused in current setup

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
// const BOT_PUBLIC_URL = process.env.BOT_PUBLIC_URL; // unused

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
setupPromoterCommands(bot);

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
  { command: 'promoter', description: 'Промоутер панель' },
  { command: 'help', description: 'Справка' },
]);

// Setup Menu Button
try {
  const webappUrl = (process.env.WEBAPP_BASE_URL || '') + '/app';
  if (webappUrl) {
    bot.api.setChatMenuButton({
      menu_button: {
        type: 'web_app',
        text: 'ClubSuite',
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
const isRender = process.env.RENDER === 'true';

if (isRender) {
  logger.info('Running in Render environment, starting webhook server...');
  const secretPath = process.env.TELEGRAM_BOT_SECRET || 'secret';
  const port = process.env.PORT || 3000;

  const server = http.createServer(async (req, res) => {
    try {
      if (req.url === `/bot/${secretPath}` && req.method === 'POST') {
        const webhookFn = webhookCallback(bot, 'http');
        await webhookFn(req, res);
      } else if (req.url === '/health' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
      } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
      }
    } catch (err) {
      logger.error('HTTP Server Error:', err);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
    }
  });

  server.listen(port, () => {
    logger.info(`Webhook server started on port ${port}. Listening at /bot/${secretPath}`);
  });

  const webhookUrl = `https://clubsuite-bot.onrender.com/bot/${secretPath}`;
  bot.api
    .setWebhook(webhookUrl, {
      allowed_updates: ['message', 'callback_query', 'chat_member', 'chat_join_request', 'pre_checkout_query'],
    })
    .then(() => {
      logger.info(`Webhook configured successfully: ${webhookUrl}`);
    })
    .catch((err) => {
      logger.error('Error setting webhook:', err);
    });
} else if (process.env.NODE_ENV === 'development') {
  logger.info('🤖 Bot started in development mode (long polling)');
  run(bot);
}

export default bot;