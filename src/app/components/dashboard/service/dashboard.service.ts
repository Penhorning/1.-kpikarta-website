import { Injectable } from '@angular/core';
import { HttpService } from '@app/shared/_services/http/http.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  constructor(private _httpService: HttpService) { }

  getSubscribedUsers(userId: string) {
    return this._httpService.POST(`/subscriptions/get-dashboard-users`, { userId });
  }
}
