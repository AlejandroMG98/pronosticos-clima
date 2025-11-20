import { Component, Input, Output, EventEmitter, signal, ViewChild, ElementRef, AfterViewInit, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Tab } from '../../../models';

/**
 * Componente genérico de pestañas
 */
@Component({
    selector: 'app-tabs',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './tabs.component.html',
    styleUrl: './tabs.component.css'
})
export class TabsComponent implements AfterViewInit, AfterViewChecked {
    // Lista de pestañas recibidas del componente padre
    @Input() tabs: Tab[] = [];

    // Evento cuando se cierra una pestaña
    @Output() tabClosed = new EventEmitter<string>();

    // Evento cuando se selecciona una pestaña
    @Output() tabSelected = new EventEmitter<string>();

    // Para trackear la pestaña activa
    activeTabId = signal<string>('');

    // Referencia al contenedor scrollable
    @ViewChild('tabsContainer') tabsContainer!: ElementRef<HTMLDivElement>;

    // Estados de de los botones de scroll
    canScrollLeft = false;
    canScrollRight = false;

    ngOnInit() {
        // Activar la primera pestaña al iniciar
        if (this.tabs.length > 0) {
            const firstTab = this.tabs.find(t => t.active) || this.tabs[0];
            this.selectTab(firstTab.id);
        }
    }

    ngOnChanges() {
        // Actualizar pestaña activa si las tabs cambian
        const activeTab = this.tabs.find(t => t.active);
        if (activeTab) {
            this.activeTabId.set(activeTab.id);
        }
    }

    /**
     * Seleccionar una pestaña
     * @param tabId ID de la pestaña a activar
     */
    selectTab(tabId: string): void {
        // Marcar todas como inactivas
        this.tabs.forEach(tab => tab.active = false);

        // Activar la seleccionada
        const selectedTab = this.tabs.find(t => t.id === tabId);
        if (selectedTab) {
            selectedTab.active = true;
            this.activeTabId.set(tabId);
            this.tabSelected.emit(tabId);
        }
    }

    /**
     * Cerrar una pestaña
     * @param tabId ID de la pestaña a cerrar
     * @param event
     */
    closeTab(tabId: string, event: Event): void {
        event.stopPropagation();

        const tabIndex = this.tabs.findIndex(t => t.id === tabId);
        const wasActive = this.tabs[tabIndex]?.active;

        if (wasActive && this.tabs.length > 1) {
            const newActiveIndex = tabIndex > 0 ? tabIndex - 1 : 1;
            if (this.tabs[newActiveIndex]) {
                this.selectTab(this.tabs[newActiveIndex].id);
            }
        }

        // Emitir evento al padre para que elimine el tab
        this.tabClosed.emit(tabId);
    }

    /**
     * Verificar si una pestaña está activa
     * @param tabId ID de la pestaña
     */
    isActive(tabId: string): boolean {
        return this.activeTabId() === tabId;
    }

    // Verificar scroll después de que la vista esté lista
    ngAfterViewInit() {
        setTimeout(() => this.updateScrollButtons(), 100);
    }

    // Actualizar botones cuando cambien las tabs
    ngAfterViewChecked() {
        setTimeout(() => this.updateScrollButtons(), 0);
    }

    /**
     * Actualizar estado de los botones de scroll
     */
    updateScrollButtons(): void {
        if (!this.tabsContainer) return;

        const container = this.tabsContainer.nativeElement;
        const hasScroll = container.scrollWidth > container.clientWidth;

        this.canScrollLeft = hasScroll && container.scrollLeft > 0;
        this.canScrollRight = hasScroll && container.scrollLeft < (container.scrollWidth - container.clientWidth - 1);
    }

    /**
     * Scroll hacia la izquierda
     */
    scrollLeft(): void {
        if (!this.tabsContainer) return;
        const container = this.tabsContainer.nativeElement;
        container.scrollBy({ left: -200, behavior: 'smooth' });
        setTimeout(() => this.updateScrollButtons(), 150);
    }

    /**
     * Scroll hacia la derecha
     */
    scrollRight(): void {
        if (!this.tabsContainer) return;
        const container = this.tabsContainer.nativeElement;
        container.scrollBy({ left: 200, behavior: 'smooth' });
        setTimeout(() => this.updateScrollButtons(), 150);
    }

    /**
     * Manejar evento de scroll
     */
    onScroll(): void {
        this.updateScrollButtons();
    }
}
