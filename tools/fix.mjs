#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, copyFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';
import { TelegramUtils } from './tg-utils.mjs';
import { waitForPort } from './http.js';
import crypto from 'crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = resolve(__dirname, '..');

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise(resolve => {
    rl.question(prompt, answer => {
      resolve(answer);
    });
  });
}

function log(message, color = '') {
  const colors = {
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    blue: '\x1b[36m',
    reset: '\x1b[0m',
  };
  console.log(`${color}${message}${colors.reset || ''}`);
}

function section(title) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${'='.repeat(60)}\n`);
}

// Generate .env from .env.example
async function fixEnv() {
  section('Environment Configuration');
  
  const envPath = resolve(rootDir, '.env');
  const examplePath = resolve(rootDir, '.env.example');
  
  if (existsSync(envPath)) {
    const answer = await question('⚠️  .env already exists. Overwrite? (y/N): ');
    if (answer.toLowerCase() !== 'y') {
      log('✅ Keeping existing .env', '\x1b[32m');
      return;
    }
  }
  
  if (!existsSync(examplePath)) {
    log('❌ .env.example not found!', '\x1b[31m');
    return;
  }
  
  log('🔧 Generating .env from .env.example...', '\x1b[36m');
  
  const example = readFileSync(examplePath, 'utf-8');
  let env = example;
  
  // Generate JWT_SECRET
  const jwtSecret = crypto.randomBytes(32).toString('hex');
  env = env.replace(/JWT_SECRET=.*/, `JWT_SECRET=${jwtSecret}`);
  
  // Set reasonable defaults for development
  env = env.replace(/DATABASE_URL=.*/, 'DATABASE_URL=postgresql://postgres:postgres@localhost:5432/clubsuite_dev');
  env = env.replace(/REDIS_URL=.*/, 'REDIS_URL=redis://localhost:6379');
  env = env.replace(/API_BASE_URL=.*/, 'API_BASE_URL=http://localhost:3001');
  env = env.replace(/WEBAPP_BASE_URL=.*/, 'WEBAPP_BASE_URL=http://localhost:3000');
  
  // Prompt for Telegram Bot Token
  const botToken = await question('Enter TELEGRAM_BOT_TOKEN (from @BotFather): ');
  if (botToken.trim()) {
    env = env.replace(/TELEGRAM_BOT_TOKEN=.*/, `TELEGRAM_BOT_TOKEN=${botToken.trim()}`);
  }
  
  const botPublicUrl = await question('Enter BOT_PUBLIC_URL (or press Enter to skip for dev): ');
  if (botPublicUrl.trim()) {
    env = env.replace(/BOT_PUBLIC_URL=.*/, `BOT_PUBLIC_URL=${botPublicUrl.trim()}`);
  } else {
    env = env.replace(/BOT_PUBLIC_URL=.*/, 'BOT_PUBLIC_URL=http://localhost:3001/bot/webhook');
  }
  
  writeFileSync(envPath, env);
  log('✅ .env file created successfully!', '\x1b[32m');
}

// Start Docker containers
async function fixDocker() {
  section('Docker Containers');
  
  try {
    execSync('docker --version', { stdio: 'pipe' });
  } catch {
    log('❌ Docker not installed. Please install Docker first.', '\x1b[31m');
    return false;
  }
  
  const answer = await question('Start PostgreSQL and Redis containers? (Y/n): ');
  if (answer.toLowerCase() === 'n') {
    log('⏭️  Skipping Docker setup', '\x1b[33m');
    return false;
  }
  
  log('🐳 Starting Docker containers...', '\x1b[36m');
  
  try {
    execSync('docker-compose up -d', { cwd: rootDir, stdio: 'inherit' });
    log('✅ Containers started', '\x1b[32m');
    
    log('⏳ Waiting for PostgreSQL to be ready...', '\x1b[36m');
    const pgReady = await waitForPort('localhost', 5432, 30);
    if (pgReady) {
      log('✅ PostgreSQL is ready', '\x1b[32m');
    } else {
      log('⚠️  PostgreSQL might not be ready yet', '\x1b[33m');
    }
    
    log('⏳ Waiting for Redis to be ready...', '\x1b[36m');
    const redisReady = await waitForPort('localhost', 6379, 30);
    if (redisReady) {
      log('✅ Redis is ready', '\x1b[32m');
    } else {
      log('⚠️  Redis might not be ready yet', '\x1b[33m');
    }
    
    return true;
  } catch (error) {
    log(`❌ Failed to start containers: ${error.message}`, '\x1b[31m');
    return false;
  }
}

// Apply migrations and seed
async function fixDatabase() {
  section('Database Setup');
  
  const answer = await question('Apply migrations and seed data? (Y/n): ');
  if (answer.toLowerCase() === 'n') {
    log('⏭️  Skipping database setup', '\x1b[33m');
    return;
  }
  
  try {
    log('📦 Generating Prisma Client...', '\x1b[36m');
    execSync('pnpm --filter @clubsuite/api run db:generate', { cwd: rootDir, stdio: 'inherit' });
    log('✅ Prisma Client generated', '\x1b[32m');
    
    log('🔄 Running migrations...', '\x1b[36m');
    execSync('pnpm --filter @clubsuite/api run db:migrate', { cwd: rootDir, stdio: 'inherit' });
    log('✅ Migrations applied', '\x1b[32m');
    
    log('🌱 Seeding database...', '\x1b[36m');
    execSync('pnpm --filter @clubsuite/api run db:seed', { cwd: rootDir, stdio: 'inherit' });
    log('✅ Database seeded', '\x1b[32m');
  } catch (error) {
    log(`❌ Database setup failed: ${error.message}`, '\x1b[31m');
  }
}

// Setup webhook
async function fixWebhook() {
  section('Telegram Webhook');
  
  const envPath = resolve(rootDir, '.env');
  if (!existsSync(envPath)) {
    log('❌ .env not found. Run environment setup first.', '\x1b[31m');
    return;
  }
  
  const env = {};
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, '');
    }
  });
  
  if (!env.TELEGRAM_BOT_TOKEN) {
    log('❌ TELEGRAM_BOT_TOKEN not set in .env', '\x1b[31m');
    return;
  }
  
  const answer = await question('Setup Telegram webhook? (Y/n): ');
  if (answer.toLowerCase() === 'n') {
    log('⏭️  Skipping webhook setup', '\x1b[33m');
    return;
  }
  
  const webhookUrl = await question(`Enter webhook URL [${env.BOT_PUBLIC_URL || ''}]: `);
  const url = webhookUrl.trim() || env.BOT_PUBLIC_URL;
  
  if (!url) {
    log('❌ No webhook URL provided', '\x1b[31m');
    return;
  }
  
  const tg = new TelegramUtils(env.TELEGRAM_BOT_TOKEN);
  
  log('🔧 Setting webhook...', '\x1b[36m');
  const result = await tg.setWebhook(url);
  
  if (result.ok) {
    log(`✅ Webhook set to: ${url}`, '\x1b[32m');
  } else {
    log(`❌ Failed to set webhook: ${result.error || result.description}`, '\x1b[31m');
  }
}

// Install dependencies
async function fixDependencies() {
  section('Dependencies');
  
  const answer = await question('Install/update dependencies? (Y/n): ');
  if (answer.toLowerCase() === 'n') {
    log('⏭️  Skipping dependency installation', '\x1b[33m');
    return;
  }
  
  try {
    log('📦 Installing dependencies...', '\x1b[36m');
    execSync('pnpm install', { cwd: rootDir, stdio: 'inherit' });
    log('✅ Dependencies installed', '\x1b[32m');
  } catch (error) {
    log(`❌ Failed to install dependencies: ${error.message}`, '\x1b[31m');
  }
}

// Main
async function main() {
  console.log('\n🔧 ClubSuite Interactive Fix Tool\n');
  console.log('This tool will help you fix common setup issues.\n');
  
  await fixEnv();
  await fixDependencies();
  await fixDocker();
  await fixDatabase();
  await fixWebhook();
  
  section('Complete');
  console.log('✅ Setup complete! Run `make verify` to check everything.\n');
  
  rl.close();
}

main().catch(error => {
  console.error('Fatal error:', error);
  rl.close();
  process.exit(1);
});

