import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && key
  ? createClient(url, key)
  : { from: () => ({ select: () => {}, insert: () => {}, upsert: () => {}, update: () => {}, eq: () => {} }), auth: { onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }), getSession: async () => ({ data: { session: null } }), signInWithPassword: async () => ({}), signUp: async () => ({}), signOut: async () => ({}), resetPasswordForEmail: async () => ({}) } };
