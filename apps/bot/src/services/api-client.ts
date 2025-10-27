import axios from 'axios';
import { logger } from '../utils/logger.js';

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001';

class ApiClient {
  private baseURL: string;
  private userTokens: Map<string, string> = new Map();

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  private async getHeaders(userId?: string): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Get or create token for user
    if (userId && !this.userTokens.has(userId)) {
      // In production, you would get this from authentication
      const token = await this.authenticateTelegramUser(userId);
      this.userTokens.set(userId, token);
    }

    const token = this.userTokens.get(userId || '');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async authenticateTelegramUser(userId: string): Promise<string> {
    try {
      // Create mock initData for backend validation
      const response = await axios.post(`${this.baseURL}/auth/tg/webapp/validate`, {
        initData: `user={"id":${userId},"first_name":"User"}&auth_date=${Math.floor(Date.now() / 1000)}&hash=test`,
      });
      
      return response.data.accessToken;
    } catch (error) {
      logger.error('Error authenticating user:', error);
      return '';
    }
  }

  async getEvents(status?: string) {
    try {
      const response = await axios.get(`${this.baseURL}/catalog/events`, {
        params: { status },
      });
      return response.data;
    } catch (error) {
      logger.error('Error fetching events:', error);
      throw error;
    }
  }

  async getPackages(eventId?: string) {
    try {
      const response = await axios.get(`${this.baseURL}/catalog/packages`, {
        params: { eventId },
      });
      return response.data;
    } catch (error) {
      logger.error('Error fetching packages:', error);
      throw error;
    }
  }

  async getReservations(userId: string) {
    try {
      const headers = await this.getHeaders(userId);
      const response = await axios.get(`${this.baseURL}/reservations`, {
        headers,
      });
      return response.data;
    } catch (error) {
      logger.error('Error fetching reservations:', error);
      return [];
    }
  }

  async getTickets(userId: string) {
    try {
      const headers = await this.getHeaders(userId);
      const response = await axios.get(`${this.baseURL}/tickets`, {
        headers,
      });
      return response.data;
    } catch (error) {
      logger.error('Error fetching tickets:', error);
      return [];
    }
  }

  async processPaymentCallback(payload: any) {
    try {
      await axios.post(`${this.baseURL}/payments/telegram/callback`, payload);
      logger.info('Payment callback processed');
    } catch (error) {
      logger.error('Error processing payment callback:', error);
      throw error;
    }
  }
}

export const apiClient = new ApiClient();
