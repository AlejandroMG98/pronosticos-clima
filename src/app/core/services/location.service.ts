import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Location } from '../../models';

/**
 * Servicio para gestionar la lista de ubicaciones (códigos postales)
 * Implementa sistema reactivo usando RxJS
 * Permite que múltiples componentes se suscriban a cambios
 */
@Injectable({
    providedIn: 'root'
})
export class LocationService {
    private readonly STORAGE_KEY = 'saved_locations';

    // BehaviorSubject para notificaciones reactivas
    private locationsSubject = new BehaviorSubject<Location[]>([]);

    // Observable público para subscripciones
    public locations$: Observable<Location[]> = this.locationsSubject.asObservable();

    constructor() {
        this.loadLocations();
    }

    /**
     * Obtener todas las ubicaciones como array
     */
    getLocations(): Location[] {
        return [...this.locationsSubject.value];
    }

    /**
     * Agregar una nueva ubicación
     * @param zipCode Código postal de EE.UU.
     * @param name Nombre de la ciudad
     * @returns true si se agregó, false si ya existía
     */
    addLocation(zipCode: string, name: string): boolean {

        if (this.locationExists(zipCode)) {
            return false;
        }

        const newLocation: Location = {
            zipCode: zipCode.trim(),
            name,
            addedAt: new Date()
        };

        // Actualizar y notificar a subscriptores
        const currentLocations = this.locationsSubject.value;
        this.locationsSubject.next([...currentLocations, newLocation]);

        // Guardar en localStorage
        this.saveLocations();

        return true;
    }

    /**
     * Eliminar una ubicación por código postal
     * @param zipCode Código postal a eliminar
     * @returns true si se eliminó, false si no existía
     */
    removeLocation(zipCode: string): boolean {
        const currentLocations = this.locationsSubject.value;
        const filteredLocations = currentLocations.filter(loc => loc.zipCode !== zipCode);

        const removed = filteredLocations.length < currentLocations.length;

        if (removed) {
            // Notificar a subscriptores
            this.locationsSubject.next(filteredLocations);

            // Guardar en localStorage
            this.saveLocations();
        }

        return removed;
    }

    /**
     * Verificar si una ubicación ya existe
     * @param zipCode Código postal a verificar
     */
    locationExists(zipCode: string): boolean {
        return this.locationsSubject.value.some(loc =>
            loc.zipCode === zipCode.trim()
        );
    }

    /**
     * Obtener una ubicación específica
     * @param zipCode Código postal
     */
    getLocation(zipCode: string): Location | undefined {
        return this.locationsSubject.value.find(loc =>
            loc.zipCode === zipCode
        );
    }

    /**
     * Limpiar todas las ubicaciones
     */
    clearAll(): void {
        this.locationsSubject.next([]);
        this.saveLocations();
    }

    /**
     * Guardar ubicaciones en localStorage
     */
    private saveLocations(): void {
        try {
            localStorage.setItem(
                this.STORAGE_KEY,
                JSON.stringify(this.locationsSubject.value)
            );
        } catch (error) {
            console.error('Error al guardar ubicaciones:', error);
        }
    }

    /**
     * Cargar ubicaciones desde localStorage
     */
    private loadLocations(): void {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);

            if (saved) {
                const locations: Location[] = JSON.parse(saved);

                // Convertir fechas de string a Date
                locations.forEach(loc => {
                    loc.addedAt = new Date(loc.addedAt);
                });

                this.locationsSubject.next(locations);
            }
        } catch (error) {
            console.error('Error al cargar ubicaciones:', error);
        }
    }
}
