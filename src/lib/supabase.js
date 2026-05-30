import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

class NoopChain {
  then(resolve) { return Promise.resolve({ data: null, error: null }).then(resolve); }
  catch(fn)     { return Promise.resolve({ data: null, error: null }).catch(fn); }
  select()  { return this; }
  insert()  { return this; }
  upsert()  { return this; }
  update()  { return this; }
  delete()  { return this; }
  eq()      { return this; }
  neq()     { return this; }
  single()  { return this; }
  limit()   { return this; }
  order()   { return this; }
}

const noopClient = {
  from: () => new NoopChain(),
  auth: {
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    getSession:            async () => ({ data: { session: null } }),
    signInWithPassword:    async () => ({ data: null, error: null }),
    signUp:                async () => ({ data: null, error: null }),
    signOut:               async () => ({}),
    resetPasswordForEmail: async () => ({ error: null }),
  },
};

export const supabase = url && key ? createClient(url, key) : noopClient;
