
import { createClient } from '@supabase/supabase-js';

function getOrCreateDeviceId() {
  try {
    const key = 'device_id';
    let id = localStorage.getItem(key);
    if (!id) {
      id = (crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`);
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return `${Date.now()}-fallback`;
  }
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: { 'x-client-id': getOrCreateDeviceId() },
  },
});
