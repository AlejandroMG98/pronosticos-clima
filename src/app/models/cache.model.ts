export interface CacheConfig {
  ttl: number;            // Tiempo de vida en milisegundos
}

// Item almacenado en caché
export interface CacheItem<T> {
  data: T;                
  timestamp: number;      
  expiresAt: number;      
  key: string;
}
