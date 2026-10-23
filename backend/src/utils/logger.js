/**
 * Structured Logger Utility
 * Logs formatted JSON entries to console without exposing passwords or secret keys.
 */

function sanitize(data) {
  if (!data || typeof data !== 'object') return data;
  const sanitized = Array.isArray(data) ? [...data] : { ...data };
  
  const sensitiveKeys = ['password', 'passwordHash', 'currentPassword', 'newPassword', 'token', 'jwt', 'apiKey', 'secret'];
  
  for (const key in sanitized) {
    if (sensitiveKeys.some(s => key.toLowerCase().includes(s.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitize(sanitized[key]);
    }
  }
  
  return sanitized;
}

export const logger = {
  info: (message, meta = {}) => {
    console.log(JSON.stringify({
      level: 'INFO',
      timestamp: new Date().toISOString(),
      message,
      meta: sanitize(meta)
    }));
  },
  warn: (message, meta = {}) => {
    console.warn(JSON.stringify({
      level: 'WARN',
      timestamp: new Date().toISOString(),
      message,
      meta: sanitize(meta)
    }));
  },
  error: (message, meta = {}) => {
    console.error(JSON.stringify({
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      message,
      meta: meta.stack ? { ...sanitize(meta), stack: meta.stack } : sanitize(meta)
    }));
  },
  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(JSON.stringify({
        level: 'DEBUG',
        timestamp: new Date().toISOString(),
        message,
        meta: sanitize(meta)
      }));
    }
  }
};

export default logger;
