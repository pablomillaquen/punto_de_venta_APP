import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-transfer-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './transfer-modal.component.html',
  styleUrls: ['./transfer-modal.component.scss']
})
export class TransferModalComponent {
  @Input() isOpen: boolean = false;
  @Input() transferForm: any = {
    fromBranchId: '',
    fromBranchName: '',
    toBranchId: '',
    items: []
  };
  @Input() branches: any[] = [];
  
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }

  onConfirm() {
    this.confirm.emit();
  }
}
