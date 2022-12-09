import { Injectable } from '@angular/core';
import { HttpService } from '@app/shared/_services/http/http.service';

@Injectable({
  providedIn: 'root'
})
export class BillingService {

  constructor(private _httpService: HttpService) { }

  getCards(userId: string) {
    return this._httpService.POST(`/subscriptions/get-cards`, { userId });
  }
}
