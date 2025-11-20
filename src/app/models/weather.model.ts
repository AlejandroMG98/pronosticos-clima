export interface Location {
    zipCode: string;
    name: string;
    addedAt: Date;
}

export interface CurrentWeather {
    temp: number;           // Temperatura actual
    weather: {
        description: string;  // Descripción del clima
        icon: string;         // Código del ícono
    };
    rh: number;             // Humedad relativa (%)
    sunrise: string;        // Hora de salida del sol
    sunset: string;         // Hora de puesta del sol
    city_name: string;      // Nombre de la ciudad
    state_code: string;     // Código del estado
    country_code: string;   // Código del país
    wind_spd: number;       // Velocidad del viento
    clouds: number;         // Nubosidad (%)
}

export interface CurrentWeatherResponse {
    data: CurrentWeather[];
    count: number;
}

export interface ForecastDay {
    valid_date: string;     // Fecha del pronóstico
    temp: number;           // Temperatura promedio
    max_temp: number;       // Temperatura máxima
    min_temp: number;       // Temperatura mínima
    weather: {
        description: string;  // Descripción
        icon: string;         // Código del ícono
    };
    pop: number;            // Probabilidad de precipitación (%)
    rh: number;             // Humedad relativa (%)
}

export interface ForecastResponse {
    data: ForecastDay[];
    city_name: string;
    state_code: string;
    country_code: string;
}
