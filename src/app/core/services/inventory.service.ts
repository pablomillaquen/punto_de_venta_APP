import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = `${environment.apiUrl}/inventory`;

  constructor(private http: HttpClient) {}

  getInventory(params?: any): Observable<any> {
    return this.http.get<any>(this.apiUrl, { params });
  }

  addStock(stockData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/add`, stockData);
  }

  getHistory(params?: any): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/history`, { params });
  }

  importPreview(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<any>(`${this.apiUrl}/import-preview`, formData);
  }

  confirmImport(items: any[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/import-confirm`, { items });
  }

  downloadImportReceipt(batchId: string) {
      return this.http.get(`${environment.apiUrl}/reports/import-receipt/${batchId}`, {
          responseType: 'blob'
      });
  }

  downloadChecklist(items: any[]) {
      // Post items, receive blob or url logic?
      // Since it's a POST and we want to download, we can use http client blob response.
      return this.http.post(`${environment.apiUrl}/reports/checklist`, { items }, {
          responseType: 'blob'
      });
  }

  transferStockBulk(data: any): Observable<any> {
      return this.http.post<any>(`${this.apiUrl}/transfer-bulk`, data);
  }

  downloadTransferDocument(transferId: string) {
      return this.http.get(`${environment.apiUrl}/reports/transfer-document/${transferId}`, {
          responseType: 'blob'
      });
  }
}
