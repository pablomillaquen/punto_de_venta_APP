import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-form-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-form-modal.component.html',
  styleUrls: ['./user-form-modal.component.scss']
})
export class UserFormModalComponent {
  @Input() isOpen: boolean = false;
  @Input() isEditing: boolean = false;
  @Input() userForm: any = {
    name: '',
    email: '',
    password: '',
    role: 'cajero',
    branch: ''
  };
  @Input() branches: any[] = [];
  
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<any>();

  onClose() {
    this.close.emit();
  }

  onSave() {
    this.save.emit(this.userForm);
  }
}
