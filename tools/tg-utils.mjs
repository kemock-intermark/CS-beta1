import { fetchWithTimeout } from './http.js';

const TELEGRAM_API = 'https://api.telegram.org';

export class TelegramUtils {
  constructor(botToken) {
    this.botToken = botToken;
    this.baseUrl = `${TELEGRAM_API}/bot${botToken}`;
  }

  async getMe() {
    try {
      const response = await fetchWithTimeout(`${this.baseUrl}/getMe`);
      const data = await response.json();
      return data;
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  async getWebhookInfo() {
    try {
      const response = await fetchWithTimeout(`${this.baseUrl}/getWebhookInfo`);
      const data = await response.json();
      return data;
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  async setWebhook(url, secretToken = null) {
    try {
      const params = new URLSearchParams({ url });
      if (secretToken) {
        params.append('secret_token', secretToken);
      }
      
      const response = await fetchWithTimeout(
        `${this.baseUrl}/setWebhook?${params.toString()}`,
        { method: 'POST' }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  async deleteWebhook() {
    try {
      const response = await fetchWithTimeout(
        `${this.baseUrl}/deleteWebhook`,
        { method: 'POST' }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  async sendMessage(chatId, text) {
    try {
      const response = await fetchWithTimeout(
        `${this.baseUrl}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat_id: chatId, text }),
        }
      );
      const data = await response.json();
      return data;
    } catch (error) {
      return { ok: false, error: error.message };
    }
  }

  generateMockInitData(userId = 123456, firstName = 'Test', username = 'testuser') {
    const user = { id: userId, first_name: firstName, username };
    const authDate = Math.floor(Date.now() / 1000);
    const userData = JSON.stringify(user);
    
    // Mock hash (in dev mode, backend should accept this)
    const hash = 'dev_mock_hash_' + Buffer.from(userData).toString('base64').substring(0, 32);
    
    return `user=${encodeURIComponent(userData)}&auth_date=${authDate}&hash=${hash}`;
  }
}

export function validateBotToken(token) {
  if (!token || typeof token !== 'string') return false;
  // Format: 123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
  const pattern = /^\d+:[A-Za-z0-9_-]{35,}$/;
  return pattern.test(token);
}

