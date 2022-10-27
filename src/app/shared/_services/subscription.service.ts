import { Injectable } from '@angular/core';
import { HttpService } from './http/http.service';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {

  constructor(private _httpService: HttpService) { }

  getSubscriptions() {
    return this._httpService.GET('/subscriptions?filter[status]=true');
  }
}
