import crypto from 'crypto';

/**
 * Computes a deterministic SHA-256 hash of a canonical object.
 * Used for caching ML predictions and Gemini insights.
 * @param {object} obj - Data object to hash
 * @returns {string} 64-character SHA-256 hex string
 */
export function computeCanonicalHash(obj) {
  const jsonString = JSON.stringify(obj, Object.keys(obj).sort());
  return crypto.createHash('sha256').update(jsonString).digest('hex');
}
