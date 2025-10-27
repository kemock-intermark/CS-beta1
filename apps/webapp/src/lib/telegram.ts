export const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;

export interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  sendData: (data: string) => void;
  version: string;
  platform: string;
  initData: string;
  initDataUnsafe: {
    user?: {
      id: number;
      first_name: string;
      last_name?: string;
      username?: string;
      language_code?: string;
      is_premium?: boolean;
    };
    auth_date: number;
    hash: string;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export const getTelegramUser = () => {
  return tg?.initDataUnsafe?.user;
};

export const getUserAuthData = () => {
  if (!tg) return null;
  
  return {
    initData: tg.initData,
    user: tg.initDataUnsafe.user,
    authDate: tg.initDataUnsafe.auth_date,
    hash: tg.initDataUnsafe.hash,
  };
};
