// src/lib/counter.ts

const USAGE_KEY = 'ai_sales_kit_usage';
const DAILY_LIMIT = 50;

type UsageData = {
  count: number;
  lastReset: string; // ISO date string (YYYY-MM-DD)
};

export const getUsageData = (): UsageData => {
  const stored = localStorage.getItem(USAGE_KEY);
  const today = new Date().toISOString().split('T')[0];
  
  if (!stored) {
    const initial = { count: 0, lastReset: today };
    localStorage.setItem(USAGE_KEY, JSON.stringify(initial));
    return initial;
  }

  try {
    const data: UsageData = JSON.parse(stored);
    
    // Check if it's a new day
    if (data.lastReset !== today) {
      const reset = { count: 0, lastReset: today };
      localStorage.setItem(USAGE_KEY, JSON.stringify(reset));
      return reset;
    }
    
    return data;
  } catch (e) {
    const fresh = { count: 0, lastReset: today };
    localStorage.setItem(USAGE_KEY, JSON.stringify(fresh));
    return fresh;
  }
};

export const incrementUsage = (): UsageData => {
  const data = getUsageData();
  data.count += 1;
  localStorage.setItem(USAGE_KEY, JSON.stringify(data));
  return data;
};

export const getDailyLimit = () => DAILY_LIMIT;
