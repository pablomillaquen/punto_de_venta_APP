import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { BranchService } from '../../core/services/branch.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styles: []
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  branches: any[] = [];
  
  isModalOpen: boolean = false;
  isEditing: boolean = false;
  
  // Filters
  filterSearch: string = '';
  filterRole: string = '';
  filterBranch: string = '';

  // Pagination
  page: number = 1;
  limit: number = 10;
  totalDocs: number = 0;
  totalPages: number = 1;

  userForm: any = {
    name: '',
    email: '',
    password: '',
    role: 'cajero',
    branch: ''
  };

  constructor(
      private userService: UserService, 
      private branchService: BranchService
  ) {}

  ngOnInit() {
    this.loadBranches();
    this.loadUsers();
  }

  loadUsers() {
    let params: any = {
        page: this.page,
        limit: this.limit
    };

    if (this.filterSearch) params.search = this.filterSearch;
    if (this.filterRole) params.role = this.filterRole;
    if (this.filterBranch) params.branch = this.filterBranch;

    this.userService.getUsers(params).subscribe((res: any) => {
      this.users = res.data;
      this.totalDocs = res.total;
      this.totalPages = Math.ceil(this.totalDocs / this.limit);
    });
  }

  onFilterChange() {
      this.page = 1;
      this.loadUsers();
  }

  changePage(newPage: number) {
      if (newPage >= 1 && newPage <= this.totalPages) {
          this.page = newPage;
          this.loadUsers();
      }
  }

  getBranchName(branch: any): string {
      if (branch && branch.name) return branch.name;
      if (typeof branch === 'string') {
          const found = this.branches.find(b => b._id === branch);
          return found ? found.name : '-';
      }
      return '-';
  }

  loadBranches() {
      this.branchService.getBranches().subscribe((res: any) => {
          this.branches = res.data;
      });
  }

  openModal(user?: any) {
    this.isModalOpen = true;
    if (user) {
      this.isEditing = true;
      this.userForm = { ...user, password: '' };
      // Ensure branch ID is selected if it's an object
      if (this.userForm.branch && typeof this.userForm.branch === 'object') {
          this.userForm.branch = this.userForm.branch._id;
      }
    } else {
      this.isEditing = false;
      this.userForm = {
        name: '',
        email: '',
        password: '',
        role: 'cajero',
        branch: ''
      };
    }
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveUser() {
      if (this.isEditing) {
          const updateData = { ...this.userForm };
          if (!updateData.password) delete updateData.password;
          
          this.userService.updateUser(this.userForm._id, updateData).subscribe(() => {
              this.loadUsers();
              this.closeModal();
          });
      } else {
          this.userService.createUser(this.userForm).subscribe(() => {
              this.loadUsers();
              this.closeModal();
          });
      }
  }

  deleteUser(id: string) {
      if(confirm('¿Estás seguro de eliminar este usuario?')) {
          this.userService.deleteUser(id).subscribe(() => {
              this.loadUsers();
          });
      }
  }
}
