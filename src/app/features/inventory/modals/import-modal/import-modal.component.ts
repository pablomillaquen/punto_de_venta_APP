import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-import-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './import-modal.component.html',
  styleUrls: ['./import-modal.component.scss']
})
export class ImportModalComponent {
  @Input() isOpen: boolean = false;
  @Input() importPreviewData: any[] = [];
  
  @Output() close = new EventEmitter<void>();
  @Output() fileUpload = new EventEmitter<any>();
  @Output() confirmImport = new EventEmitter<void>();
  @Output() downloadTemplate = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }

  onFileUpload(event: any) {
    this.fileUpload.emit(event);
  }

  onConfirmImport() {
    this.confirmImport.emit();
  }

  onDownloadTemplate() {
    this.downloadTemplate.emit();
  }
}
