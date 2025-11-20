import { Injectable } from '@angular/core';
import { CacheItem, CacheConfig } from '../../models';

/**
 * Servicio genérico de caché usando localStorage
 * Permite almacenar cualquier tipo de dato con un TTL configurable
 * Por defecto: 2 horas de duración
 */
@Injectable({
    providedIn: 'root'
})
export class CacheService {
    private readonly CACHE_PREFIX = 'weather_cache_';
    private readonly CONFIG_KEY = 'cache_config';

    private config: CacheConfig = {
        ttl: 2 * 60 * 60 * 1000,
    };

    constructor() {
        this.loadConfig();
    }

    /**
     * Guardar un dato en caché
     * @param key Clave única para identificar el dato
     * @param data Dato a almacenar (puede ser cualquier tipo)
     */
    set<T>(key: string, data: T): void {

        const now = Date.now();
        const cacheItem: CacheItem<T> = {
            data,
            timestamp: now,
            expiresAt: now + this.config.ttl,
            key
        };

        try {
            localStorage.setItem(
                this.CACHE_PREFIX + key,
                JSON.stringify(cacheItem)
            );
        } catch (error) {
            console.error('Error al guardar en caché:', error);
        }
    }

    /**
     * Obtener un dato del caché
     * @param key Clave del dato a buscar
     * @returns El dato si existe y no ha expirado, null si no
     */
    get<T>(key: string): T | null {

        try {
            const cached = localStorage.getItem(this.CACHE_PREFIX + key);

            if (!cached) {
                return null;
            }

            const cacheItem: CacheItem<T> = JSON.parse(cached);
            const now = Date.now();

            // Verificar si ha expirado
            if (now > cacheItem.expiresAt) {
                this.remove(key);
                return null;
            }

            return cacheItem.data;
        } catch (error) {
            console.error('Error al leer caché:', error);
            return null;
        }
    }

    /**
     * Eliminar un dato específico del caché
     * @param key Clave del dato a eliminar
     */
    remove(key: string): void {
        try {
            localStorage.removeItem(this.CACHE_PREFIX + key);
        } catch (error) {
            console.error('Error al eliminar de caché:', error);
        }
    }

    /**
     * Obtener el TTL en horas para mostrar en Interfaz de Usuario
     *  @returns Número de horas
     */
    getTTLInHours(): number {
        return this.config.ttl / (60 * 60 * 1000);
    }

    /**
     * Configurar TTL en horas
     * @param hours Número de horas
     */
    setTTLInHours(hours: number): void {
        this.config.ttl = hours * 60 * 60 * 1000;
        this.saveConfig();
    }

    /**
     * Guardar la configuración actual en localStorage
     */
    private saveConfig(): void {
        try {
            localStorage.setItem(
                this.CONFIG_KEY,
                JSON.stringify(this.config)
            );
        } catch (error) {
            console.error('Error al guardar configuración:', error);
        }
    }

    /**
     * Cargar la configuración desde localStorage
     */
    private loadConfig(): void {
        try {
            const saved = localStorage.getItem(this.CONFIG_KEY);
            if (saved) {
                this.config = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Error al cargar configuración:', error);
        }
    }
}
