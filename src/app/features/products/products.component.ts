import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsComponent } from '../../shared/components/tabs/tabs.component';
import { Tab } from '../../models';

/**
 * Componente de Productos con Pestañas Reutilizables (Es de ejemplo)
 */
@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, TabsComponent],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent {

  // Lista de tabs
  productTabs = signal<Tab[]>([]);

  // Mensaje de ayuda
  helpMessage = signal<string>('');

  // Datos de productos
  private products = [
    { id: 'prod1', name: 'Laptop HP', category: 'Computadoras', description: 'Laptop con procesador Intel i7, 16GB RAM, 512GB SSD', price: '$899.99', stock: 15 },
    { id: 'prod2', name: 'Mouse Logitech', category: 'Accesorios', description: 'Mouse inalámbrico ergonómico con 6 botones programables', price: '$29.99', stock: 50 },
    { id: 'prod3', name: 'Teclado Mecánico', category: 'Accesorios', description: 'Teclado mecánico RGB con switches Cherry MX', price: '$149.99', stock: 8 },
    { id: 'prod4', name: 'Monitor 4K', category: 'Pantallas', description: 'Monitor 27 pulgadas 4K UHD con HDR', price: '$399.99', stock: 12 },
    { id: 'prod5', name: 'Webcam HD', category: 'Accesorios', description: 'Webcam 1080p con micrófono integrado', price: '$79.99', stock: 25 }
  ];

  activeProduct = signal<any>(null);
  disabled = signal<boolean>(false);

  constructor() {
    this.addProductTab();
  }

  addProductTab(): void {
    const openTabIds = this.productTabs().map(t => t.id);
    const availableProduct = this.products.find(p => !openTabIds.includes(p.id));

    if (!availableProduct) {
      this.helpMessage.set('No hay más productos disponibles');
      this.disabled.set(true);
      return;
    }

    const newTab: Tab = {
      id: availableProduct.id,
      title: availableProduct.name,
      active: this.productTabs().length === 0,
      closable: true
    };

    this.productTabs.update(tabs => [...tabs, newTab]);

    if (this.productTabs().length === 1) {
      this.activeProduct.set(availableProduct);
    }

    this.helpMessage.set('');
  }

  onTabClosed(tabId: string): void {
    this.productTabs.update(tabs => tabs.filter(t => t.id !== tabId));

    const openTabIds = this.productTabs().map(t => t.id);
    const hasAvailableProducts = this.products.some(p => !openTabIds.includes(p.id));

    if (hasAvailableProducts) {
      this.disabled.set(false);
      this.helpMessage.set('');
    }
  }

  getProductById(productId: string) {
    return this.products.find(p => p.id === productId);
  }
}
