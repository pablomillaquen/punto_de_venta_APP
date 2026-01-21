import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CashService {
  private apiUrl = `${environment.apiUrl}/cash-shifts`;

  constructor(private http: HttpClient) {}

  startShift(startAmount: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/start`, { startAmount });
  }

  closeShift(actualCash: number, observations?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/close`, { actualCash, observations });
  }

  getCurrentShift(): Observable<any> {
    return this.http.get(`${this.apiUrl}/current`);
  }

  getShifts(params?: any): Observable<any> {
    return this.http.get(this.apiUrl, { params });
  }

  downloadShiftReport(shiftId: string): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/reports/cash-shift/${shiftId}`, {
      responseType: 'blob'
    });
  }

  downloadDailyReport(params: any): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/reports/daily-cash`, {
      params,
      responseType: 'blob'
    });
  }
}
