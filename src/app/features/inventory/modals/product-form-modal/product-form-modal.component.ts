import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './product-form-modal.component.html',
  styleUrls: ['./product-form-modal.component.scss']
})
export class ProductFormModalComponent {
  @Input() isOpen: boolean = false;
  @Input() isEditing: boolean = false;
  @Input() productForm: any = {
    name: '',
    barcode: '',
    price: 0,
    cost: 0,
    taxRate: 19
  };
  
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  onClose() {
    this.close.emit();
  }

  onSave() {
    this.save.emit();
  }
}
