import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: {email: string, password: string}): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => {
        if (res.success && res.token) {
          localStorage.setItem('token', res.token);
          if (res.user) {
              localStorage.setItem('user', JSON.stringify(res.user));
          }
          this.router.navigate(['/pos']);
        }
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUserName(): string {
      const userStr = localStorage.getItem('user');
      if (userStr) {
          try {
              const user = JSON.parse(userStr);
              return user.name || 'User';
          } catch (e) {
              return 'User';
          }
      }
      return 'User';
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    // Check expiry
    try {
        const decoded: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
            this.logout();
            return false;
        }
        return true;
    } catch (e) {
        return false;
    }
  }

  getUserRole(): string {
      const token = this.getToken();
      if(!token) return '';
      try {
          const decoded: any = jwtDecode(token);
          return decoded.role;
      } catch (e) {
          return '';
      }
  }

  getUserBranch(): string {
      const token = this.getToken();
      if(!token) return '';
      try {
          const decoded: any = jwtDecode(token);
          return decoded.branch || ''; // Assuming branch ID is in token
      } catch (e) {
          return '';
      }
  }

  getUserId(): string {
      const token = this.getToken();
      if(!token) return '';
      try {
          const decoded: any = jwtDecode(token);
          return decoded.id || ''; 
      } catch (e) {
          return '';
      }
  }
}
