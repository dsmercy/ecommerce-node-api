import NodeCache from 'node-cache';
import { env } from '../config/env.js';

const cache = new NodeCache({ stdTTL: env.cacheTtl });

export function getCache(key) {
  return cache.get(key);
}

export function setCache(key, value, ttl) {
  if (ttl !== undefined) {
    cache.set(key, value, ttl);
  } else {
    cache.set(key, value);
  }
}

export function deleteCache(key) {
  cache.del(key);
}

export default cache;
