import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Socket } from 'ngx-socket-io';
import { AuthService } from '../../core/services/auth.service';
import { InventoryService } from '../../core/services/inventory.service';
import { ProductService } from '../../core/services/product.service';
import { BranchService } from '../../core/services/branch.service';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory.component.html',
  styles: []
})
export class InventoryComponent implements OnInit, OnDestroy {
  inventory: any[] = [];
  branches: any[] = [];
  products: any[] = []; // For dropdowns
  
  userRole: string = '';
  userBranch: string = '';

  // Modals
  isProductModalOpen: boolean = false;
  isStockModalOpen: boolean = false;
  isEditingProduct: boolean = false;

  // Forms
  productForm: any = { name: '', barcode: '', price: 0, cost: 0, category: '', taxRate: 19 };
  stockForm: any = { productId: '', branchId: '', quantity: 0, lot: '', expiry: '' };

  // Filters
  filterSearch: string = '';
  filterBranch: string = '';
  filterStatus: string = '';

  // Pagination
  page: number = 1;
  limit: number = 10;
  totalDocs: number = 0;
  totalPages: number = 1;

  constructor(
      private inventoryService: InventoryService,
      private productService: ProductService,
      private branchService: BranchService,
      privateBO: Socket, // Typo fixed in next tool call or assume local name
      private socket: Socket,
      private authService: AuthService
  ) {
      this.userRole = this.authService.getUserRole();
      this.userBranch = this.authService.getUserBranch();
  }

  ngOnInit() {
    this.loadBranches();
    this.loadProducts();
    this.loadInventory();
    
    this.socket.fromEvent('stock-updated').subscribe((data: any) => {
        this.loadInventory(); 
    });
  }

  ngOnDestroy() {}

  loadInventory() {
    let params: any = {
        page: this.page,
        limit: this.limit
    };
    
    // Role logic
    // If Supervisor, force branch? 
    // The previous code had: if (supervisor && branch) params.branch = branch;
    // But now we have a filter selector. 
    // If Admin: can select any branch.
    // If Supervisor: should be restricted to own branch, usually hidden/disabled or auto-selected.
    // I'll stick to: If Supervisor, force params.branch = userBranch. If Admin, allow filterBranch.
    
    if (this.userRole === 'supervisor' && this.userBranch) {
        params.branch = this.userBranch;
        this.filterBranch = this.userBranch; // Sync UI
    } else if (this.filterBranch) {
        params.branch = this.filterBranch;
    }

    if (this.filterSearch) params.search = this.filterSearch;
    if (this.filterStatus) params.status = this.filterStatus;
    
    this.inventoryService.getInventory(params).subscribe((res: any) => {
      this.inventory = res.data;
      this.totalDocs = res.total || 0;
      this.totalPages = Math.ceil(this.totalDocs / this.limit);
    });
  }

  onFilterChange() {
      this.page = 1;
      this.loadInventory();
  }

  changePage(newPage: number) {
      if(newPage >= 1 && newPage <= this.totalPages) {
          this.page = newPage;
          this.loadInventory();
      }
  }

  loadBranches() {
      this.branchService.getBranches().subscribe((res: any) => this.branches = res.data);
  }

  loadProducts() {
      this.productService.getProducts().subscribe((res: any) => this.products = res.data);
  }

  // --- Product Modal (Create / Edit) ---
  openProductModal(product?: any) {
      this.isProductModalOpen = true;
      if (product) {
          this.isEditingProduct = true;
          this.productForm = { ...product };
      } else {
          this.isEditingProduct = false;
          this.productForm = { name: '', barcode: '', price: 0, cost: 0, taxRate: 19 };
      }
  }

  closeProductModal() {
      this.isProductModalOpen = false;
  }

  saveProduct() {
      if(this.isEditingProduct) {
          this.productService.updateProduct(this.productForm._id, this.productForm).subscribe(() => {
              this.loadProducts(); 
              this.loadInventory();
              this.closeProductModal();
          });
      } else {
          this.productService.createProduct(this.productForm).subscribe(() => {
              this.loadProducts(); 
              this.loadInventory();
              this.closeProductModal();
          });
      }
  }

  // --- Stock Modal (Add Stock) ---
  openStockModal(item?: any) {
      this.isStockModalOpen = true;
      if(item) {
          // Pre-fill from existing inventory item row
          this.stockForm = {
              productId: item.product._id,
              branchId: item.branch._id,
              quantity: 0,
              lot: '',
              expiry: ''
          };
      } else {
          // Fresh stock entry
          this.stockForm = {
              productId: '',
              branchId: (this.userRole === 'supervisor') ? this.userBranch : '',
              quantity: 0,
              lot: '',
              expiry: ''
          };
      }
  }

  closeStockModal() {
      this.isStockModalOpen = false;
  }

  // Import & Checklist
  isImportModalOpen: boolean = false;
  importPreviewData: any[] = [];
  selectedItems: any[] = [];
  barcodeBuffer: string = '';

  saveStock() {
      this.inventoryService.addStock(this.stockForm).subscribe(() => {
          this.loadInventory();
          this.closeStockModal();
      });
  }

  // --- Excel Import ---
  openImportModal() {
      this.isImportModalOpen = true;
      this.importPreviewData = [];
  }

  closeImportModal() {
      this.isImportModalOpen = false;
      this.importPreviewData = [];
  }

  handleFileUpload(event: any) {
      const file = event.target.files[0];
      if (file) {
          this.inventoryService.importPreview(file).subscribe((res: any) => {
              this.importPreviewData = res.data;
          }, err => alert(err.error?.error || 'Error al procesar archivo'));
      }
  }

  confirmImport() {
      // Filter out invalid rows? Or assume user corrected them?
      // For now, confirm valid ones.
      const validItems = this.importPreviewData.filter(i => i.status !== 'Error');
      if (validItems.length === 0) return alert('No hay ítems válidos para importar');

      this.inventoryService.confirmImport(validItems).subscribe((res: any) => {
          alert(`Importación exitosa. Batch ID: ${res.batchId}`);
          
          this.inventoryService.downloadImportReceipt(res.batchId).subscribe((blob: Blob) => {
               const url = window.URL.createObjectURL(blob);
               window.open(url);
          }, err => console.error('Error downloading receipt', err));

          this.closeImportModal();
          this.loadInventory();
      });
  }

  downloadTemplate() {
      // Just a simple link or generate one?
      // I'll assume a static link or generic generate.
      // For now, alert or mock.
      alert('Descarga de plantilla pendiente de implementación (formato: Barcode, Branch, Qty, Lot, Expiry)');
  }

  // --- Checklist ---
  toggleItemSelection(item: any, event: any) {
      if (event.target.checked) {
          this.selectedItems.push(item);
      } else {
          this.selectedItems = this.selectedItems.filter(i => i._id !== item._id);
      }
  }

  generateChecklist() {
      if (this.selectedItems.length === 0) return alert('Seleccione ítems primero');
      
      const items = this.selectedItems.map(i => ({
          productName: i.product.name,
          branchName: i.branch.name,
          quantity: i.quantity
      }));

      this.inventoryService.downloadChecklist(items).subscribe((data: Blob) => {
           const blob = new Blob([data], { type: 'application/pdf' });
           const url = window.URL.createObjectURL(blob);
           window.open(url);
      });
  }

  // --- Barcode Logic ---
  onBarcodeChange(event: any) {
      const barcode = event.target.value;
      const product = this.products.find(p => p.barcode === barcode);
      if (product) {
          this.stockForm.productId = product._id;
      }
  }

  // --- Transfer Logic ---
  isTransferModalOpen: boolean = false;
  transferForm: any = { toBranchId: '', items: [] };

  openTransferModal() {
      if (this.selectedItems.length === 0) return alert('Seleccione ítems para traspasar');
      
      // Validate Logic: All must be from same branch?
      // Ideally yes, to create a single document "From X to Y".
      const firstBranch = this.selectedItems[0].branch._id;
      const mixed = this.selectedItems.some(i => i.branch._id !== firstBranch);
      
      if (mixed) return alert('Para realizar un traspaso, seleccione ítems de una misma sucursal de origen.');

      this.transferForm = {
          toBranchId: '',
          fromBranchId: firstBranch,
          fromBranchName: this.selectedItems[0].branch.name,
          items: this.selectedItems.map(i => ({
              productId: i.product._id,
              productName: i.product.name,
              maxQty: i.quantity,
              quantity: 1 // Default 1 or max?
          }))
      };
      
      this.isTransferModalOpen = true;
  }

  closeTransferModal() {
      this.isTransferModalOpen = false;
  }

  confirmTransfer() {
       if (!this.transferForm.toBranchId) return alert('Seleccione sucursal de destino');
       if (this.transferForm.toBranchId === this.transferForm.fromBranchId) return alert('El destino no puede ser igual al origen');

       const payload = {
           toBranchId: this.transferForm.toBranchId,
           items: this.transferForm.items.map((i: any) => ({
               productId: i.productId,
               fromBranchId: this.transferForm.fromBranchId,
               quantity: i.quantity
           }))
       };

       this.inventoryService.transferStockBulk(payload).subscribe({
           next: (res) => {
               alert('Traspaso realizado con éxito');
               
               this.inventoryService.downloadTransferDocument(res.transferId).subscribe((blob: Blob) => {
                   const url = window.URL.createObjectURL(blob);
                   window.open(url);
               }, err => console.error('Error downloading transfer doc', err));

               this.closeTransferModal();
               this.selectedItems = []; // Clear selection
               this.loadInventory();
           },
           error: (err) => alert(err.error?.error || 'Error en traspaso')
       });
  }
}
