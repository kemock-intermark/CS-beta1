export const config = {
  api: {
    baseUrl: process.env.API_BASE_URL || 'http://localhost:3001',
    port: parseInt(process.env.API_PORT || '3001', 10),
  },
  webapp: {
    baseUrl: process.env.WEBAPP_BASE_URL || 'http://localhost:3000',
  },
  bot: {
    token: process.env.TELEGRAM_BOT_TOKEN,
    paymentToken: process.env.TELEGRAM_PAYMENT_PROVIDER_TOKEN,
    publicUrl: process.env.BOT_PUBLIC_URL,
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
};
