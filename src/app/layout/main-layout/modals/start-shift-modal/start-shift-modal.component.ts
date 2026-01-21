import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-start-shift-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './start-shift-modal.component.html',
  styleUrls: ['./start-shift-modal.component.scss']
})
export class StartShiftModalComponent {
  @Input() isOpen: boolean = false;
  @Input() shiftForm: any = { startAmount: 0 };
  
  @Output() save = new EventEmitter<void>();

  onSave() {
    this.save.emit();
  }
}
