import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SalesService {
  private apiUrl = `${environment.apiUrl}/sales`;

  constructor(private http: HttpClient) {}

  getSales(params?: any): Observable<any> {
    return this.http.get<any>(this.apiUrl, { params });
  }

  createSale(sale: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, sale);
  }

  downloadReport(params?: any) {
      return this.http.get(`${environment.apiUrl}/reports/sales`, { 
          params,
          responseType: 'blob' 
      });
  }
}
