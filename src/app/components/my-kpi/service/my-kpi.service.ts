import { Injectable } from '@angular/core';
import { HttpService } from '@app/shared/_services/http/http.service';

@Injectable({
  providedIn: 'root'
})
export class MyKpiService {

  constructor(private _httpService: HttpService) { }

  /*============================== API FUNCTIONS STARTS ==============================*/
  getMyKPIs(userId: string) {
    return this._httpService.GET(`/karta_nodes?filter[include]=karta_detail&[where][contributors.userId]=${userId}`);
  }

  getColorSettingByUser(data: any) {
    return this._httpService.POST('/color-settings-by-user', data);
  }
}

