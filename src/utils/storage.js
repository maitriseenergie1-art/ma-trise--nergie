export function readSession(key, fallback = null) {
  try { const value = sessionStorage.getItem(key); return value ? JSON.parse(value) : fallback; }
  catch { sessionStorage.removeItem(key); return fallback; }
}

export function writeSession(key, value) {
  try { sessionStorage.setItem(key, JSON.stringify(value)); return true; }
  catch { return false; }
}

export function removeSession(key) { try { sessionStorage.removeItem(key); } catch { /* Storage unavailable. */ } }
