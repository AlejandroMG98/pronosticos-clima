import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { LocationService } from '@core/services/location.service';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './header.component.html',
    styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
    locationCount = signal<number>(0);
    private subscription?: Subscription;

    constructor(private locationService: LocationService) { }

    ngOnInit(): void {

        this.subscription = this.locationService.locations$.subscribe({
            next: (locations) => {
                this.locationCount.set(locations.length);
            }
        });
    }
    
    ngOnDestroy(): void {
        this.subscription?.unsubscribe();
    }
}
