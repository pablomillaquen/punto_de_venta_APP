import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SalesService } from '../../core/services/sales.service';
import { ProductService } from '../../core/services/product.service';
import { AuthService } from '../../core/services/auth.service';
import { ClpCurrencyPipe } from '../../shared/pipes/clp-currency.pipe';

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule, ClpCurrencyPipe],
  templateUrl: './pos.component.html',
  styles: [`
    :host { display: block; height: 100%; }
    
    .product-card { 
        cursor: pointer; 
        transition: all 0.2s ease;
        border: 1px solid #eee;
        
        &:hover { 
            transform: translateY(-2px); 
            box-shadow: 0 4px 12px rgba(248, 136, 19, 0.15);
            border-color: #F88813;
        }
        
        .card-body {
            padding: 0.75rem;
        }
        
        .card-title {
            font-size: 0.8rem;
            font-weight: 500;
            margin-bottom: 0.35rem;
            line-height: 1.3;
        }
        
        .card-text {
            font-size: 0.9rem;
            margin-bottom: 0;
        }
    }
    
    .cart-container { 
        overflow-y: auto;
        max-height: calc(100vh - 320px);
    }
    
    .row-cols-md-3 > * {
        padding: 0.35rem;
    }
  `]
})
export class PosComponent implements OnInit, AfterViewInit {
  @ViewChild('barcodeInput') barcodeInput!: ElementRef;

  products: any[] = [];
  cart: any[] = [];
  barcode: string = '';
  searchTerm: string = '';
  total: number = 0;
  totalNet: number = 0;
  totalTax: number = 0;
  
  constructor(
      private salesService: SalesService,
      private productService: ProductService,
      private authService: AuthService
  ) {}

  get filteredProducts() {
    if (!this.searchTerm) return this.products;
    const term = this.searchTerm.toLowerCase();
    return this.products.filter(p => 
      p.name.toLowerCase().includes(term) || 
      p.barcode.includes(term)
    );
  }

  ngOnInit() {
      this.loadProducts();
  }

  ngAfterViewInit() {
      this.barcodeInput.nativeElement.focus();
  }

  loadProducts() {
    const branchId = this.authService.getUserBranch();
    let params: any = {};
    if (branchId) {
        params.branchId = branchId;
    }

    this.productService.getProducts(params).subscribe((res: any) => {
      this.products = res.data;
    });
  }

  onBarcodeEnter() {
      if(!this.barcode) return;
      
      const product = this.products.find(p => p.barcode === this.barcode);
      if(product) {
          this.addToCart(product);
          this.barcode = '';
      } else {
          alert('Producto no encontrado');
          this.barcode = '';
      }
  }

  getGrossPrice(product: any): number {
      const taxRate = product.taxRate || 19; // Default to 19% if not set
      return product.price * (1 + taxRate / 100);
  }

  addToCart(product: any) {
    const existing = this.cart.find(item => item.product._id === product._id);
    const grossPrice = this.getGrossPrice(product);
    
    if(existing) {
        existing.quantity++;
        existing.total = Math.round(existing.quantity * grossPrice);
    } else {
        this.cart.push({ 
            product, 
            quantity: 1, 
            total: Math.round(grossPrice) 
        });
    }
    this.calculateTotal();
  }

  updateQuantity(index: number, newQty: number) {
      if (newQty <= 0) {
          this.removeFromCart(index);
          return;
      }
      
      const item = this.cart[index];
      const grossPrice = this.getGrossPrice(item.product);
      item.quantity = newQty;
      item.total = Math.round(newQty * grossPrice);
      this.calculateTotal();
  }

  removeFromCart(index: number) {
      this.cart.splice(index, 1);
      this.calculateTotal();
  }

  calculateTotal() {
    this.total = this.cart.reduce((acc, item) => acc + item.total, 0);
    
    this.totalNet = Math.round(this.cart.reduce((acc, item) => {
        return acc + (item.product.price * item.quantity);
    }, 0));
    
    this.totalTax = this.total - this.totalNet;
  }

  checkout(method: string) {
      if(this.cart.length === 0) return;

      const saleData = {
          items: this.cart.map(item => ({
              product: item.product._id,
              name: item.product.name,
              quantity: item.quantity,
              price: item.product.price,
              total: item.total
          })),
          branchId: this.authService.getUserBranch(), 
          paymentMethod: method
      };

      this.salesService.createSale(saleData).subscribe({
          next: (res) => {
              alert('Venta exitosa');
              this.cart = [];
              this.total = 0;
              this.totalNet = 0;
              this.totalTax = 0;
              this.barcodeInput.nativeElement.focus();
          },
          error: (err) => alert('Error en venta: ' + (err.error?.error || 'Unknown error'))
      });
  }
}
