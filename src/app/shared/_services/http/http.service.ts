import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  
  private BASE_URL = environment.API_URL;

  constructor(private httpClient: HttpClient) { }

  /*============================== CURD OPERATIONS STARTS ==============================*/
  // Get all
  GET(url: string): Observable<any> {
    return this.httpClient.get(this.BASE_URL + "/api" + url);
  }
  // Post data
  POST(url: string, data?: any): Observable<any> {
    return this.httpClient.post(this.BASE_URL + "/api" + url, data);
  }
  // Get by Id
  GET_BY_ID(url: string, id: any): Observable<any> {
    return this.httpClient.get(this.BASE_URL + "/api" + url + id);
  }
  // Update partial data
  PATCH(url: string, data: any): Observable<any> {
    return this.httpClient.patch(this.BASE_URL + "/api" + url, data);
  }
  // Update whole data
  PUT(url: string, data?: any): Observable<any> {
    return this.httpClient.put(this.BASE_URL + "/api" + url, data);
  }
  // Delete
  DELETE(url: string, id: any): Observable<any> {
    return this.httpClient.delete(this.BASE_URL + "/api" + url + id);
  }
  /*============================== CURD OPERATIONS ENDS ==============================*/

}