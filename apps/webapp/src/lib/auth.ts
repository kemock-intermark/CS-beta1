'use client';

import { decode } from 'jsonwebtoken';
import { getTelegramUser } from './telegram';

export interface JWTPayload {
  userId: string;
  telegramId: string;
  username?: string;
}

export const getJWTToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
};

export const setJWTToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
};

export const removeJWTToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
};

export const getUserFromToken = (): JWTPayload | null => {
  const token = getJWTToken();
  if (!token) return null;

  try {
    const decoded = decode(token) as JWTPayload;
    return decoded;
  } catch {
    return null;
  }
};

export const getUserRole = (): 'guest' | 'promoter' | 'door' | 'admin' => {
  const user = getUserFromToken();
  if (!user) return 'guest';

  // In a real app, this would come from the token payload
  // For now, we'll use a simple mapping
  const role = localStorage.getItem('user_role') || 'guest';
  return role as 'guest' | 'promoter' | 'door' | 'admin';
};

export const setUserRole = (role: string): void => {
  localStorage.setItem('user_role', role);
};

export const isAuthenticated = (): boolean => {
  return getJWTToken() !== null;
};
