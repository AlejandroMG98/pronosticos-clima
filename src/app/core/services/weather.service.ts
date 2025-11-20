import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, catchError, map, firstValueFrom } from 'rxjs';
import {
    CurrentWeatherResponse,
    ForecastResponse,
    CurrentWeather,
    ForecastDay
} from '../../models';
import { CacheService } from './cache.service';
import { environment } from '../../../environments/environment';

/**
 * Servicio para consumir la API de WeatherBit
 * Integra sistema de caché para evitar solicitudes HTTP innecesarias
 */
@Injectable({
    providedIn: 'root'
})
export class WeatherService {

    private readonly API_URL = environment.API_URL;
    private readonly API_KEY = environment.API_KEY;
    private readonly ROUTES = environment.ROUTES;

    constructor(
        private http: HttpClient,
        private cacheService: CacheService
    ) { }

    /**
     * Obtener condiciones climáticas actuales para un código postal
     * @param zipCode Código postal de EE.UU.
     * @returns Observable con los datos del clima actual
     */
    getCurrentWeather(zipCode: string): Observable<CurrentWeather> {
        // Generar clave de caché única
        const cacheKey = `current_${zipCode}`;

        // Intentar obtener desde caché primero
        const cached = this.cacheService.get<CurrentWeather>(cacheKey);

        if (cached) {
            console.log('Datos obtenidos desde caché:', zipCode);
            return of(cached);
        }

        console.log('Solicitar datos a la API:', zipCode);

        const params = new HttpParams()
            .set('postal_code', zipCode)
            .set('country', 'US')
            .set('key', this.API_KEY);

        return this.http
            .get<CurrentWeatherResponse>(`${this.API_URL}${this.ROUTES.current}`, { params })
            .pipe(
                map(response => {
                    // Guardar en caché después de obtener
                    if (response.data && response.data.length > 0) {
                        this.cacheService.set(cacheKey, response.data[0]);
                        return response.data[0];
                    }
                    throw new Error('No se encontraron datos para esta ubicación');
                }),
                catchError(error => {
                    console.error('Error al obtener clima actual:', error);
                    throw error;
                })
            );
    }

    /**
     * Obtener pronóstico a 5 días para un código postal
     * @param zipCode Código postal de EE.UU.
     * @returns Observable con el pronóstico de 5 días
     */
    getForecast(zipCode: string): Observable<ForecastDay[]> {
        // Generar clave de caché única
        const cacheKey = `forecast_${zipCode}`;

        // Intentar obtener desde caché primero
        const cached = this.cacheService.get<ForecastDay[]>(cacheKey);

        if (cached) {
            console.log('Pronóstico obtenido desde caché:', zipCode);
            return of(cached);
        }

        console.log('Solicitando pronóstico a la API:', zipCode);

        const params = new HttpParams()
            .set('postal_code', zipCode)
            .set('country', 'US')
            .set('days', '5') 
            .set('key', this.API_KEY);

        return this.http
            .get<ForecastResponse>(`${this.API_URL}${this.ROUTES.forecast}`, { params })
            .pipe(
                map(response => {
                    // Guardar en caché
                    if (response.data && response.data.length > 0) {
                        this.cacheService.set(cacheKey, response.data);
                        return response.data;
                    }
                    throw new Error('No se encontraron datos de pronóstico');
                }),
                catchError(error => {
                    console.error('Error al obtener pronóstico:', error);
                    throw error;
                })
            );
    }

    /**
     * Obtener clima actual Y pronóstico en una sola llamada
     * Útil para la vista de detalles
     * @param zipCode Código postal
     */
    getCompleteWeather(zipCode: string): Observable<{
        current: CurrentWeather;
        forecast: ForecastDay[];
    }> {
        // Obtener ambos desde caché
        const currentCached = this.cacheService.get<CurrentWeather>(`current_${zipCode}`);
        const forecastCached = this.cacheService.get<ForecastDay[]>(`forecast_${zipCode}`);

        if (currentCached && forecastCached) {
            console.log('Datos completos desde caché:', zipCode);
            return of({
                current: currentCached,
                forecast: forecastCached
            });
        }

        return new Observable(observer => {
            Promise.all([
                firstValueFrom(this.getCurrentWeather(zipCode)),
                firstValueFrom(this.getForecast(zipCode))
            ])
                .then(([current, forecast]) => {
                    observer.next({
                        current,
                        forecast
                    });
                    observer.complete();
                })
                .catch(error => {
                    observer.error(error);
                });
        });
    }

    /**
     * Obtener URL del ícono del clima
     * @param iconCode Código del ícono de WeatherBit
     */
    getWeatherIconUrl(iconCode: string): string {
        return `https://www.weatherbit.io/static/img/icons/${iconCode}.png`;
    }
}
