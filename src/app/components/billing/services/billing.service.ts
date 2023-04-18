import { Injectable } from '@angular/core';
import { HttpService } from '@app/shared/_services/http/http.service';

@Injectable({
  providedIn: 'root'
})
export class BillingService {

  constructor(private _httpService: HttpService) { }

  getCards(companyId: string) {
    return this._httpService.POST(`/subscriptions/get-cards`, { companyId });
  }

  getSubscribedUsers(companyId: string) {
    return this._httpService.POST(`/subscriptions/get-subscription-users`, { companyId });
  }

  getInvoices(companyId?: string) {
    const query: any = {};
    companyId ? query['companyId'] = companyId : {};
    return this._httpService.POST(`/subscriptions/get-invoices`, query );
  }

  cancelTrial(userId: string) {
    return this._httpService.POST(`/subscriptions/cancel-trial`, { userId });
  }
}
