import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { WeatherService } from '../../core/services/weather.service';
import { CurrentWeather, ForecastDay } from '../../models';

/**
 * Vista de Detalles del Clima
 */
@Component({
  selector: 'app-weather-detail',
  standalone: true,
  imports: [CommonModule, LoadingComponent],
  templateUrl: './weather-detail.component.html',
  styleUrl: './weather-detail.component.css'
})
export class WeatherDetailComponent implements OnInit {
  // Código postal
  zipCode = signal<string>('');
  
  // Datos del clima
  currentWeather = signal<CurrentWeather | null>(null);
  forecast = signal<ForecastDay[]>([]);
  
  // Estado de carga y mensaje de error
  isLoading = signal<boolean>(true);
  error = signal<string>('');

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private weatherService: WeatherService
  ) {}

  ngOnInit(): void {
    const zipCode = this.route.snapshot.paramMap.get('zipCode');
    
    if (!zipCode) {
      this.router.navigate(['/']);
      return;
    }
    
    this.zipCode.set(zipCode);
    this.loadWeatherData();
  }

  /**
   * Cargar datos completos del clima
   */
  private loadWeatherData(): void {
    this.isLoading.set(true);
    this.error.set('');
    
    this.weatherService.getCompleteWeather(this.zipCode()).subscribe({
      next: (data) => {
        this.currentWeather.set(data.current);
        this.forecast.set(data.forecast);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar datos:', err);
        this.error.set('Error al cargar los datos del clima');
        this.isLoading.set(false);
      }
    });
  }

  /**
   * Volver al dashboard
   */
  goBack(): void {
    this.router.navigate(['/']);
  }

  /**
   * Obtener URL del ícono del clima
   * @param iconCode Código del ícono
   */
  getWeatherIcon(iconCode: string): string {
    return this.weatherService.getWeatherIconUrl(iconCode);
  }

  /**
   * Formatear fecha para mostrar
   * @param dateString Fecha en formato string
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }

  /**
   * Obtener día de la semana
   * @param dateString Fecha en formato string
   */
  getDayName(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long'
    }).format(date);
  }
}
