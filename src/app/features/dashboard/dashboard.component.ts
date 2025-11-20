import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { TabsComponent } from '../../shared/components/tabs/tabs.component';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { LocationService } from '../../core/services/location.service';
import { WeatherService } from '../../core/services/weather.service';
import { CacheService } from '../../core/services/cache.service';
import { ValidationService } from '../../core/services/validation.service';
import { Tab, CurrentWeather } from '../../models';

/**
 * Dashboard Principal
 */
@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule, TabsComponent, LoadingComponent],
    templateUrl: './dashboard.component.html',
    styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
    // Suscripciones reactivas
    private locationsSubscription?: Subscription;

    // Formulario para nuevo código postal
    newZipCode = signal<string>('');

    // Estado de carga botón agregar y mensajes de error
    isLoading = signal<boolean>(false);
    errorMessage = signal<string>('');

    // Lista de pestañas dinámicas
    tabs = signal<Tab[]>([]);

    // Datos del clima para cada pestaña
    weatherData = signal<Map<string, CurrentWeather>>(new Map());

    // TTL del caché en horas
    cacheTTL = signal<number>(2);

    constructor(
        public locationService: LocationService,
        public weatherService: WeatherService,
        public cacheService: CacheService,
        private validationService: ValidationService,
        private router: Router
    ) {
        // Obtener valor inicial del TTL de caché.
        this.cacheTTL.set(this.cacheService.getTTLInHours());
    }

    /**
     * Implementa sistema reactivo (cualquier cambio en LocationService)
     */
    ngOnInit(): void {
        // Cargar ubicaciones iniciales
        this.loadSavedLocations();

        // Cada vez que se añade/quita una ubicación, este observable notifica
        this.locationsSubscription = this.locationService.locations$.subscribe({
            next: (locations) => {
                console.log('Ubicaciones actualizadas:', locations);
            },
            error: (error) => {
                console.error('Error en suscripción de ubicaciones:', error);
            }
        });
    }

    /**
     * Eliminar suscripción al destruir el componente
     */
    ngOnDestroy(): void {
        if (this.locationsSubscription) {
            this.locationsSubscription.unsubscribe();
        }
    }

    /**
     * Cargar ubicaciones guardadas y crear pestañas
     */
    private loadSavedLocations(): void {
        const locations = this.locationService.getLocations();

        locations.forEach(location => {
            this.addTabForLocation(location.zipCode, location.name);
        });
    }

    /**
     * Agregar una nueva ubicación
     */
    addLocation(): void {
        const zipCode = this.newZipCode().trim();

        // Validar código postal por sus caracteres
        const validation = this.validationService.validateZipCode(zipCode);
        if (!validation.valid) {
            this.errorMessage.set(validation.error!);
            return;
        }

        // Verificar si ya existe
        if (this.locationService.locationExists(zipCode)) {
            this.errorMessage.set('Esta ubicación ya está agregada.');
            return;
        }

        this.errorMessage.set('');
        this.isLoading.set(true);

        // Obtener datos del clima
        this.weatherService.getCurrentWeather(zipCode).subscribe({
            next: (weather) => {
                // Agregar la ubicación al servicio
                this.locationService.addLocation(zipCode, weather.city_name);

                // Crear pestaña
                this.addTabForLocation(zipCode, weather.city_name);

                // Guardar datos del clima
                this.weatherData.update(map => {
                    map.set(zipCode, weather);
                    return new Map(map);
                });

                // Limpiar formulario
                this.newZipCode.set('');
                this.isLoading.set(false);
            },
            error: (error) => {
                this.errorMessage.set('Código postal inválido o error de conexión');
                this.isLoading.set(false);
                console.error('Error al obtener clima:', error);
            }
        });
    }

    /**
     * Crear una pestaña para una ubicación
     * @param zipCode Código postal
     * @param cityName Nombre de la ciudad
     */
    private addTabForLocation(zipCode: string, cityName?: string): void {
        const tabId = `tab_${zipCode}`;
        const title = cityName || 'N/A';

        const newTab: Tab = {
            id: tabId,
            title: title + ` (${zipCode})`,
            active: this.tabs().length === 0,
            closable: true
        };

        this.tabs.update(tabs => [...tabs, newTab]);

        // Cargar datos del clima si no existen
        if (!this.weatherData().has(zipCode)) {
            this.loadWeatherForTab(zipCode);
        }
    }

    /**
     * Cargar datos del clima para una pestaña
     * @param zipCode Código postal
     */
    private loadWeatherForTab(zipCode: string): void {
        this.weatherService.getCurrentWeather(zipCode).subscribe({
            next: (weather) => {
                this.weatherData.update(map => {
                    map.set(zipCode, weather);
                    return new Map(map);
                });
            },
            error: (error) => {
                console.error('Error al cargar clima para tab:', error);
            }
        });
    }

    /**
     * Cerrar una pestaña
     * @param tabId ID de la pestaña cerrada
     */
    onTabClosed(tabId: string): void {
        // Extraer zipCode del tabId
        const zipCode = tabId.replace('tab_', '');

        // Eliminar del servicio de ubicaciones
        this.locationService.removeLocation(zipCode);

        // Eliminar pestaña
        this.tabs.update(tabs => tabs.filter(t => t.id !== tabId));

        // Eliminar datos del clima
        this.weatherData.update(map => {
            map.delete(zipCode);
            return new Map(map);
        });
    }

    /**
     * Obtener datos del clima de una pestaña
     * @param tabId ID de la pestaña
     */
    getWeatherForTab(tabId: string): CurrentWeather | undefined {
        const zipCode = tabId.replace('tab_', '');
        return this.weatherData().get(zipCode);
    }

    /**
     * Ver pronósticos de 5 días
     * @param zipCode Código postal
     */
    viewDetails(tabId: string): void {
        const zipCode = tabId.replace('tab_', '');
        this.router.navigate(['/weather', zipCode]);
    }

    /**
     * Actualizar configuración de caché
     */
    updateCacheTTL(): void {
        this.cacheService.setTTLInHours(this.cacheTTL());
    }

    /**
     * Obtener URL del ícono del clima
     */
    getWeatherIcon(iconCode: string): string {
        return this.weatherService.getWeatherIconUrl(iconCode);
    }
}
