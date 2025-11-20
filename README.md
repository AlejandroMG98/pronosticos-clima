# Pronósticos del Clima

App de clima en Angular que permite consultar el pronóstico de varias ubicaciones de EE.UU. usando códigos postales.

## Stack

- **Angular 18.2.0**
- **TypeScript 5.5.2**
- **Bootstrap 5**
- **RxJS 7.8.0** + Signals
- **WeatherBit API**
- **localStorage** para cache

## Estructura del Proyecto

```
src/app/
├── core/               # Servicios core
│   └── services/       # Cache, Location, Weather, Validation
├── shared/             # Componentes reutilizables
│   └── components/     # Tabs, Loading
├── features/           # Módulos
│   ├── dashboard/      # Vista principal
│   ├── weather-detail/ # Vista de pronóstico 5 días
│   └── products        # Ejemplo de otro componente que usa tabs
├── layouts/            # Estructuras de layout
│   ├── main-layout/    # Layout principal
│   ├── header/         # Barra de navegación
│   └── footer/         # Pie de página
└── models/             # Interfaces
```

## Setup

```bash
git clone <url-del-repo>
npm install
npm start
```

Abre http://localhost:4200

## Comandos útiles

```bash
# Crear componente (con html, css, ts)
ng generate component features/nombre-componente
# o la versión corta:
ng g c features/nombre-componente

# Crear servicio (sin archivo .spec.ts)
ng generate service core/services/nombre-servicio --skip-tests
# o la versión corta:
ng g s core/services/nombre-servicio --skip-tests

# Build de producción
npm run build
```

## Uso

1. Agrega un código postal de 5 dígitos (EE.UU)
2. Cada tab muestra el clima actual de esa ubicación
3. Click en "Ver Pronóstico" para ver 5 días
4. Cierra tabs con la X
5. Ajusta el cache (1-24 horas) en la configuración

## Config

**Cache:**
- TTL por defecto: 2 horas (1-24 configurable)
- Usa localStorage

**API:**
- WeatherBit: `https://api.weatherbit.io/v2.0/`
- Endpoints: `/current`, `/forecast/daily`

## Arquitectura

**Services:**
- CacheService - Cache genérico con localStorage
- LocationService - Manejo reactivo de ubicaciones
- WeatherService - API del clima

**Components:**
- DashboardComponent - Vista principal
- WeatherDetailComponent - Pronóstico 5 días
- TabsComponent - Tabs reutilizables
- LoadingComponent - Spinner
- ProductsComponent - Otro ejemplo usando el tab

## Autor

**Desarrollador:** Alejandro Morán Gutiérrez
