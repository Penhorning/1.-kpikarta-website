import { Injectable } from '@angular/core';
import { HttpService } from '@app/shared/_services/http/http.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private _httpService: HttpService) { }

  getNotifications(data: any) {
    return this._httpService.POST('/notifications/get-notifications', data);
  }
}
