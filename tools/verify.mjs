#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
// Lazy/dynamic imports to avoid failures when tools deps aren't installed globally
let postgres;
let Redis;
import { TelegramUtils, validateBotToken } from './tg-utils.mjs';
import { fetchWithTimeout, isPortOpen } from './http.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

// Parse CLI args
const args = process.argv.slice(2);
const CI_MODE = args.includes('--ci');
const NO_TELEGRAM = args.includes('--no-telegram');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[36m',
};

const symbols = {
  success: '✅',
  warning: '⚠️',
  error: '❌',
  info: 'ℹ️',
};

let checksPass = 0;
let checksWarn = 0;
let checksFail = 0;

function log(symbol, message, color = '') {
  console.log(`${color}${symbol} ${message}${colors.reset}`);
}

function logSuccess(message) {
  checksPass++;
  log(symbols.success, message, colors.green);
}

function logWarning(message) {
  checksWarn++;
  log(symbols.warning, message, colors.yellow);
}

function logError(message, fix = '') {
  checksFail++;
  log(symbols.error, message, colors.red);
  if (fix) {
    console.log(`   💡 Fix: ${fix}\n`);
  }
}

function logInfo(message) {
  log(symbols.info, message, colors.blue);
}

function section(title) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${'='.repeat(60)}\n`);
}

// Load .env
function loadEnv() {
  const envPath = resolve(rootDir, '.env');
  if (!existsSync(envPath)) {
    return {};
  }
  
  const envContent = readFileSync(envPath, 'utf-8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim().replace(/^["']|["']$/g, '');
      env[key] = value;
    }
  });
  
  return env;
}

// Check Node version
async function checkNode() {
  section('Node.js & Package Manager');
  
  try {
    const nodeVersion = process.version;
    const major = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (major >= 18) {
      logSuccess(`Node.js ${nodeVersion} (>= 18.18)`);
    } else {
      logError(
        `Node.js ${nodeVersion} is too old`,
        'Install Node.js >= 18.18 from https://nodejs.org'
      );
    }
  } catch (error) {
    logError('Failed to check Node.js version', error.message);
  }
  
  try {
    const pnpmVersion = execSync('pnpm --version', { encoding: 'utf-8' }).trim();
    const major = parseInt(pnpmVersion.split('.')[0]);
    
    if (major >= 8) {
      logSuccess(`pnpm ${pnpmVersion} (>= 8)`);
    } else {
      logError(
        `pnpm ${pnpmVersion} is too old`,
        'Run: npm install -g pnpm@latest'
      );
    }
  } catch (error) {
    logError('pnpm not found', 'Run: npm install -g pnpm');
  }
}

// Check Docker
async function checkDocker() {
  section('Docker & Containers');
  
  try {
    execSync('docker --version', { encoding: 'utf-8', stdio: 'pipe' });
    logSuccess('Docker is installed');
  } catch (error) {
    logError('Docker not found', 'Install Docker from https://docker.com');
    return false;
  }
  
  try {
    const containers = execSync('docker ps --format "{{.Names}}"', { encoding: 'utf-8' });
    
    if (containers.includes('clubsuite-postgres')) {
      logSuccess('PostgreSQL container is running');
    } else {
      logWarning('PostgreSQL container not running');
      console.log('   💡 Fix: Run `make setup` or `docker-compose up -d`\n');
    }
    
    if (containers.includes('clubsuite-redis')) {
      logSuccess('Redis container is running');
    } else {
      logWarning('Redis container not running');
      console.log('   💡 Fix: Run `make setup` or `docker-compose up -d`\n');
    }
  } catch (error) {
    logWarning('Could not check container status');
  }
  
  return true;
}

// Check .env
async function checkEnv(env) {
  section('Environment Variables');
  
  const required = [
    'DATABASE_URL',
    'REDIS_URL',
    'TELEGRAM_BOT_TOKEN',
    'JWT_SECRET',
    'BOT_PUBLIC_URL',
    'API_BASE_URL',
    'WEBAPP_BASE_URL',
  ];
  
  for (const key of required) {
    if (env[key]) {
      if (key === 'JWT_SECRET' && env[key].length < 24) {
        logWarning(`${key} is too short (< 24 chars)`);
        console.log('   💡 Fix: Generate a longer secret: openssl rand -hex 32\n');
      } else if (key === 'TELEGRAM_BOT_TOKEN' && !validateBotToken(env[key])) {
        logError(`${key} format is invalid`, 'Get valid token from @BotFather');
      } else {
        logSuccess(`${key} is set`);
      }
    } else {
      logError(`${key} is missing`, 'Copy .env.example to .env and fill values');
    }
  }
  
  // Optional but recommended
  if (!env.TELEGRAM_PAYMENT_PROVIDER_TOKEN) {
    logWarning('TELEGRAM_PAYMENT_PROVIDER_TOKEN not set (DEV mock will be used)');
  }
}

// Check Postgres
async function checkPostgres(env) {
  section('PostgreSQL Database');
  
  if (!env.DATABASE_URL) {
    logError('DATABASE_URL not set', 'Check .env file');
    return false;
  }
  
  let sql;
  try {
    if (!postgres) {
      ({ default: postgres } = await import('postgres'));
    }
    sql = postgres(env.DATABASE_URL, { max: 1 });
    await sql`SELECT 1`;
    logSuccess('PostgreSQL connection successful');
  } catch (error) {
    logError(`PostgreSQL connection failed: ${error.message}`, 'Run: docker-compose up -d');
    return false;
  }
  
  try {
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    
    if (tables.length > 0) {
      logSuccess(`Found ${tables.length} tables in database`);
    } else {
      logWarning('No tables found');
      console.log('   💡 Fix: Run `pnpm db:migrate`\n');
    }
    
    // Check for seed data
    const venues = await sql`SELECT COUNT(*) as count FROM "Venue"`.catch(() => [{ count: 0 }]);
    if (parseInt(venues[0].count) > 0) {
      logSuccess('Seed data exists');
    } else {
      logWarning('No seed data found');
      console.log('   💡 Fix: Run `pnpm db:seed`\n');
    }
  } catch (error) {
    logWarning(`Could not check schema: ${error.message}`);
  } finally {
    await sql.end();
  }
  
  return true;
}

// Check Redis
async function checkRedis(env) {
  section('Redis Cache');
  
  if (!env.REDIS_URL) {
    logError('REDIS_URL not set', 'Check .env file');
    return false;
  }
  
  let redis;
  try {
    if (!Redis) {
      ({ default: Redis } = await import('ioredis'));
    }
    redis = new Redis(env.REDIS_URL);
    await redis.ping();
    logSuccess('Redis connection successful');
    await redis.disconnect();
    return true;
  } catch (error) {
    logError(`Redis connection failed: ${error.message}`, 'Run: docker-compose up -d');
    return false;
  }
}

// Check API
async function checkAPI(env) {
  section('Backend API');
  
  if (!env.API_BASE_URL) {
    logWarning('API_BASE_URL not set');
    return false;
  }
  
  try {
    const response = await fetchWithTimeout(`${env.API_BASE_URL}/health`, {}, 5000);
    const data = await response.json();
    
    if (data.status === 'ok') {
      logSuccess(`API is healthy (${env.API_BASE_URL})`);
      if (data.version) {
        logInfo(`API version: ${data.version}`);
      }
    } else {
      logWarning('API health check returned non-ok status');
    }
    return true;
  } catch (error) {
    logWarning(`API not reachable: ${error.message}`);
    console.log('   💡 Fix: Run `pnpm dev:api`\n');
    return false;
  }
}

// Check Bot
async function checkBot(env) {
  section('Telegram Bot');
  
  if (NO_TELEGRAM) {
    logInfo('Skipping Telegram checks (--no-telegram)');
    return true;
  }
  
  if (!env.TELEGRAM_BOT_TOKEN) {
    logError('TELEGRAM_BOT_TOKEN not set', 'Get token from @BotFather');
    return false;
  }
  
  const tg = new TelegramUtils(env.TELEGRAM_BOT_TOKEN);
  
  const me = await tg.getMe();
  if (me.ok) {
    logSuccess(`Bot connected: @${me.result.username}`);
    
    if (env.TELEGRAM_BOT_USERNAME && env.TELEGRAM_BOT_USERNAME !== me.result.username) {
      logWarning(`TELEGRAM_BOT_USERNAME mismatch: expected ${env.TELEGRAM_BOT_USERNAME}, got ${me.result.username}`);
    }
  } else {
    logError('Bot authentication failed', 'Check TELEGRAM_BOT_TOKEN');
    return false;
  }
  
  const webhookInfo = await tg.getWebhookInfo();
  if (webhookInfo.ok) {
    const webhook = webhookInfo.result;
    if (webhook.url) {
      logSuccess(`Webhook is set: ${webhook.url}`);
      
      if (env.BOT_PUBLIC_URL && !webhook.url.includes(env.BOT_PUBLIC_URL)) {
        logWarning(`Webhook URL doesn't match BOT_PUBLIC_URL`);
        console.log(`   💡 Fix: Run \`make webhook:set\`\n`);
      }
      
      if (webhook.last_error_message) {
        logWarning(`Webhook last error: ${webhook.last_error_message}`);
      }
    } else {
      logWarning('Webhook not set');
      console.log('   💡 Fix: Run `make webhook:set` or use long polling for dev\n');
    }
  }
  
  return true;
}

// Check WebApp
async function checkWebApp(env) {
  section('Telegram WebApp');
  
  if (!env.WEBAPP_BASE_URL) {
    logWarning('WEBAPP_BASE_URL not set');
    return false;
  }
  
  try {
    const response = await fetchWithTimeout(`${env.WEBAPP_BASE_URL}/health`, {}, 5000);
    const data = await response.json();
    
    if (data.status === 'ok') {
      logSuccess(`WebApp is healthy (${env.WEBAPP_BASE_URL})`);
    } else {
      logWarning('WebApp health check returned non-ok status');
    }
    
    // Check security headers in production
    if (env.NODE_ENV === 'production') {
      const headers = response.headers;
      if (headers.get('strict-transport-security')) {
        logSuccess('HSTS header present');
      } else {
        logWarning('HSTS header missing (recommended for production)');
      }
    }
    
    return true;
  } catch (error) {
    logWarning(`WebApp not reachable: ${error.message}`);
    console.log('   💡 Fix: Run `pnpm dev:webapp`\n');
    return false;
  }
}

// Smoke E2E Test
async function smokeTest(env) {
  section('Smoke E2E Test');
  
  if (!env.API_BASE_URL) {
    logWarning('Skipping E2E (API_BASE_URL not set)');
    return;
  }
  
  const tg = new TelegramUtils(env.TELEGRAM_BOT_TOKEN);
  const initData = tg.generateMockInitData();
  
  try {
    // 1. Auth
    logInfo('Testing auth...');
    const authRes = await fetchWithTimeout(
      `${env.API_BASE_URL}/auth/tg/webapp/validate`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initData }),
      }
    );
    
    if (!authRes.ok) {
      logWarning('Auth test failed (might need DEV mode with mock validation)');
      return;
    }
    
    const authData = await authRes.json();
    const token = authData.accessToken;
    logSuccess('Auth: JWT token obtained');
    
    // 2. Catalog
    logInfo('Testing catalog...');
    const eventsRes = await fetchWithTimeout(
      `${env.API_BASE_URL}/catalog/events`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const events = await eventsRes.json();
    
    if (events.length > 0) {
      logSuccess(`Catalog: Found ${events.length} events`);
    } else {
      logWarning('No events found in catalog');
    }
    
    logSuccess('Smoke E2E test passed (basic checks)');
  } catch (error) {
    logWarning(`E2E test failed: ${error.message}`);
  }
}

// Main
async function main() {
  console.log('\n🔍 ClubSuite Verification Tool\n');
  
  const env = loadEnv();
  
  await checkNode();
  await checkDocker();
  await checkEnv(env);
  await checkPostgres(env);
  await checkRedis(env);
  await checkAPI(env);
  await checkBot(env);
  await checkWebApp(env);
  await smokeTest(env);
  
  // Summary
  section('Summary');
  console.log(`✅ Passed: ${checksPass}`);
  console.log(`⚠️  Warnings: ${checksWarn}`);
  console.log(`❌ Failed: ${checksFail}\n`);
  
  if (checksFail > 0) {
    console.log('💡 Run `make fix` to interactively fix common issues.\n');
    process.exit(1);
  } else if (checksWarn > 0) {
    console.log('⚠️  Some warnings detected. Review recommendations above.\n');
    process.exit(0);
  } else {
    console.log('🎉 All checks passed! System is ready.\n');
    process.exit(0);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

