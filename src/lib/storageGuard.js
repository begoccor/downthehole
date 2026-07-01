// In-app browsers (Instagram / Facebook WebView) and private / low-quota engines
// break DOM storage in two ways:
//   1. Accessing window.localStorage can throw outright (SecurityError) — that
//      crashes render-time reads (theme, language) and blanks the whole app.
//   2. setItem can throw QuotaExceededError. Sometimes only for larger writes,
//      so the page loads fine but a later action blows up mid-way. That's the
//      reported bug: the page loads, but running a search silently fails —
//      searchTopic() succeeds, then a storage write in the same try/… block
//      (startSession, trophies, quests, carrots) throws and the catch bounces
//      the user back to the input with a "not found" error.
//
// The app reads storage in render initializers and writes it as a side effect of
// almost every action, so either failure mode is fatal. We wrap localStorage and
// sessionStorage with a shim backed by an in-memory overlay (source of truth for
// this session, so reads/writes never throw) that still writes through to the
// native store best-effort for cross-reload persistence.

function createMemoryStorage() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(String(key)) ? store.get(String(key)) : null;
    },
    setItem(key, value) {
      store.set(String(key), String(value));
    },
    removeItem(key) {
      store.delete(String(key));
    },
    clear() {
      store.clear();
    },
    key(index) {
      return Array.from(store.keys())[index] ?? null;
    },
    get length() {
      return store.size;
    },
  };
}

function wrap(name) {
  let native = null;
  try {
    native = window[name];
  } catch {
    native = null; // access itself threw — fall back to memory only
  }

  const mem = createMemoryStorage();

  const safe = {
    getItem(key) {
      const k = String(key);
      const local = mem.getItem(k);
      if (local !== null) return local;
      try {
        return native ? native.getItem(k) : null;
      } catch {
        return null;
      }
    },
    setItem(key, value) {
      mem.setItem(key, value); // always succeeds — search etc. never throw
      try {
        if (native) native.setItem(String(key), String(value));
      } catch {
        /* quota exceeded / blocked — persistence is best-effort */
      }
    },
    removeItem(key) {
      mem.removeItem(key);
      try {
        if (native) native.removeItem(String(key));
      } catch {
        /* ignore */
      }
    },
    clear() {
      mem.clear();
      try {
        if (native) native.clear();
      } catch {
        /* ignore */
      }
    },
    key(index) {
      return mem.key(index);
    },
    get length() {
      return mem.length;
    },
  };

  try {
    // localStorage/sessionStorage are read-only accessors on window, but they
    // are configurable in every engine we target, so defineProperty wins.
    Object.defineProperty(window, name, { value: safe, configurable: true });
  } catch {
    try {
      window[name] = safe;
    } catch {
      /* nothing more we can do */
    }
  }
}

wrap('localStorage');
wrap('sessionStorage');
