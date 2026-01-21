import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-close-shift-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './close-shift-modal.component.html',
  styleUrls: ['./close-shift-modal.component.scss']
})
export class CloseShiftModalComponent {
  @Input() isOpen: boolean = false;
  @Input() shiftForm: any = { actualCash: 0, observations: '' };
  
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }

  onConfirm() {
    this.confirm.emit();
  }
}
