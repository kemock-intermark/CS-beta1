import { Bot } from 'grammy';
import * as http from 'http';

export function setupHealthEndpoint(bot: Bot, port: number = 3002) {
  // Simple HTTP server for health checks
  
  const server = http.createServer(async (req: any, res: any) => {
    if (req.url === '/bot/health' && req.method === 'GET') {
      try {
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
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'error', error: error.message }));
      }
    } else {
      res.writeHead(404);
      res.end();
    }
  });
  
  server.listen(port, () => {
    console.log(`🏥 Bot health endpoint running on http://localhost:${port}/bot/health`);
  });
  
  return server;
}

