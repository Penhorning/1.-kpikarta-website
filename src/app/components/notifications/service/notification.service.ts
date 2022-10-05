import { Injectable } from '@angular/core';
import { HttpService } from '@app/shared/_services/http/http.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private _httpService: HttpService) { }

  getNotifications(userId: string) {
    return this._httpService.GET(`/notifications?filter[where][userId]=${userId}&filter[order]=createdAt Desc`);
  }
}
