import { Injectable } from '@angular/core';
import { HttpService } from '@app/shared/_services/http/http.service';

@Injectable({
  providedIn: 'root'
})
export class MyKpiService {

  constructor(private _httpService: HttpService) { }

  /*============================== API FUNCTIONS STARTS ==============================*/
  getMyKPIs() {
    return this._httpService.GET('/karta_nodes?filter[where][achieved_value]=0');
  }

  getColorSettingByUser(data: any) {
    return this._httpService.POST('/color-settings-by-user', data);
  }
}
