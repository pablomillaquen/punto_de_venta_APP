import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-stock-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock-form-modal.component.html',
  styleUrls: ['./stock-form-modal.component.scss']
})
export class StockFormModalComponent {
  @Input() isOpen: boolean = false;
  @Input() stockForm: any = {
    productId: '',
    branchId: '',
    quantity: 0,
    lot: '',
    expiry: ''
  };
  @Input() products: any[] = [];
  @Input() branches: any[] = [];
  @Input() userRole: string = '';
  
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();
  @Output() barcodeChange = new EventEmitter<any>();

  onClose() {
    this.close.emit();
  }

  onSave() {
    this.save.emit();
  }

  onBarcodeChange(event: any) {
    this.barcodeChange.emit(event);
  }
}
