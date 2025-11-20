import { Injectable } from '@angular/core';

export interface ValidationResult {
    valid: boolean;
    error?: string;
}

/**
 * Servicio de validación
 */
@Injectable({
    providedIn: 'root'
})
export class ValidationService {

    /**
     * Valida un código postal de EE.UU.
     * @param zipCode Código postal
     * @returns Objeto con resultado de validación y mensaje de error si aplica
     */
    validateZipCode(zipCode: string): ValidationResult {
        const trimmedZipCode = zipCode.trim();

        // Validar que no esté vacío
        if (!trimmedZipCode) {
            return {
                valid: false,
                error: 'Por favor ingresa un código postal.'
            };
        }

        // Validar formato (5 dígitos)
        if (!/^\d{5}$/.test(trimmedZipCode)) {
            return {
                valid: false,
                error: 'El código postal debe tener 5 dígitos.'
            };
        }

        return { valid: true };
    }
}
