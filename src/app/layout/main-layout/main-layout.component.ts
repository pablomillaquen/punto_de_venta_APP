import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CashService } from '../../core/services/cash.service';
import { FormsModule } from '@angular/forms';
import { ClpCurrencyPipe } from '../../shared/pipes/clp-currency.pipe';
import { StartShiftModalComponent } from './modals/start-shift-modal/start-shift-modal.component';
import { CloseShiftModalComponent } from './modals/close-shift-modal/close-shift-modal.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    RouterModule, 
    FormsModule, 
    ClpCurrencyPipe,
    StartShiftModalComponent,
    CloseShiftModalComponent
  ],
  templateUrl: './main-layout.component.html',

  styles: [`
    :host { display: block; height: 100%; }
    
    .sidebar {
        width: 230px;
        min-height: 100vh;
        background: linear-gradient(180deg, #2d3748 0%, #1a202c 100%);
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
    }
    
    .sidebar-brand {
        padding: 1.25rem 1rem;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        color: white;
        font-size: 1.25rem;
        font-weight: 600;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        
        i { 
            font-size: 1.5rem; 
            color: #F88813;
        }
    }
    
    .sidebar-nav {
        flex: 1;
        padding: 1rem 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }
    
    .sidebar-link {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.6rem 0.875rem;
        color: rgba(255, 255, 255, 0.7);
        text-decoration: none;
        border-radius: 0.375rem;
        font-size: 0.875rem;
        font-weight: 500;
        transition: all 0.2s ease;
        
        i { font-size: 1.1rem; }
        
        &:hover {
            background-color: rgba(255, 255, 255, 0.08);
            color: white;
        }
        
        &.active {
            background-color: #F88813;
            color: white;
            box-shadow: 0 2px 8px rgba(248, 136, 19, 0.35);
        }
    }
    
    .sidebar-footer {
        padding: 0.75rem;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .sidebar-user {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.5rem 0.75rem;
        background: rgba(255, 255, 255, 0.05);
        border: none;
        border-radius: 0.375rem;
        color: white;
        text-align: left;
        cursor: pointer;
        transition: background 0.2s ease;
        
        &:hover { background: rgba(255, 255, 255, 0.1); }
        &::after { margin-left: auto; }
    }
    
    .user-avatar {
        width: 32px;
        height: 32px;
        background: linear-gradient(135deg, #F88813 0%, #F76214 100%);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        font-size: 0.875rem;
    }
    
    .user-info {
        display: flex;
        flex-direction: column;
        line-height: 1.2;
    }
    
    .user-name {
        font-weight: 500;
        font-size: 0.8125rem;
    }
    
    .user-role {
        font-size: 0.7rem;
        color: rgba(255, 255, 255, 0.5);
        text-transform: capitalize;
    }
    
    .main-content {
        flex: 1;
        height: 100vh;
        overflow-y: auto;
        padding: 1.5rem;
        background-color: #faf7f4;
    }
  `]
})
export class MainLayoutComponent implements OnInit {
  userRole: string = '';
  userName: string = 'User';

  // Cash Shift State
  currentShift: any = null;
  isStartShiftModalOpen: boolean = false;
  isCloseShiftModalOpen: boolean = false;
  
  shiftForm: any = {
      startAmount: 0,
      actualCash: 0,
      observations: ''
  };

  constructor(
      private authService: AuthService,
      private cashService: CashService,
      private router: Router
  ) {}

  ngOnInit() {
      this.userRole = this.authService.getUserRole();
      this.userName = this.authService.getUserName();
      
      if (this.userRole === 'cajero') {
          this.checkCurrentShift();
      }
  }

  checkCurrentShift() {
      this.cashService.getCurrentShift().subscribe(res => {
          this.currentShift = res.data;
          // No auto-redirect/modal. User initiates via menu if closed.
      });
  }

  // Start Shift
  initiateOpenShift() {
      this.shiftForm = { startAmount: 0, actualCash: 0, observations: '' };
      this.isStartShiftModalOpen = true;
  }
  
  closeStartShiftModal() {
      this.isStartShiftModalOpen = false;
  }

  startShift() {
      this.cashService.startShift(this.shiftForm.startAmount).subscribe(() => {
          this.checkCurrentShift();
          this.isStartShiftModalOpen = false;
          alert('Turno de caja iniciado exitosamente.');
      });
  }

  // Close Shift (Corte de Caja)
  initiateCloseShift() {
      if (!this.currentShift) return;
      this.shiftForm.actualCash = 0;
      this.shiftForm.observations = '';
      this.isCloseShiftModalOpen = true;
  }

  closeCloseShiftModal() {
      this.isCloseShiftModalOpen = false;
  }

  closeShift() {
      this.cashService.closeShift(this.shiftForm.actualCash, this.shiftForm.observations).subscribe(res => {
          const closedShiftId = res.data._id;
          this.isCloseShiftModalOpen = false;
          alert('Corte de caja realizado.');
          
          // Download Report
          this.cashService.downloadShiftReport(closedShiftId).subscribe(blob => {
              const url = window.URL.createObjectURL(blob);
              window.open(url);
          });

          this.currentShift = null;
          // Prompt for new cycle immediately
          this.initiateOpenShift();
      });
  }

  logout() {
    this.authService.logout();
  }
}
