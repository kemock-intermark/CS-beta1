import axios from 'axios';
import { getJWTToken } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
apiClient.interceptors.request.use((config) => {
  const token = getJWTToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getEvents = () => apiClient.get('/catalog/events');
export const getPackages = (eventId?: string) => apiClient.get('/catalog/packages', { params: { eventId } });
export const getReservations = () => apiClient.get('/reservations');
export const getTickets = () => apiClient.get('/tickets');
export const createReservation = (data: any) => apiClient.post('/reservations', data);
export const purchaseTicket = (data: any) => apiClient.post('/tickets', data);
export const createPayment = (data: any) => apiClient.post('/payments/telegram/invoice', data);
export const getPromoterKPI = () => apiClient.get('/promoters/me/kpi');
export const createLead = (data: any) => apiClient.post('/promoters/leads', data);
export const scanTicket = (qrCode: string) => apiClient.post('/checkin/scan', { qrCode });
export const getReports = (startDate?: string, endDate?: string) => 
  apiClient.get('/reports/overview', { params: { startDate, endDate } });

export default apiClient;
