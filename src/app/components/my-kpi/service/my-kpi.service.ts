import { Injectable } from '@angular/core';
import { HttpService } from '@app/shared/_services/http/http.service';

@Injectable({
  providedIn: 'root'
})
export class MyKpiService {

  constructor(private _httpService: HttpService) { }

  /*============================== API FUNCTIONS STARTS ==============================*/
  getMyKPIs(data: any) {
    return this._httpService.POST('/karta_nodes/kpis', data);
  }
  getColorSettingByUser(data: any) {
    return this._httpService.POST('/color-settings-by-user', data);
  }
  getAllUsers() {
    return this._httpService.POST('/users/get-all');
  }
  updateNode(nodeId: string, data: any) {
    return this._httpService.PATCH(`/karta_nodes/${nodeId}`, data);
  }
  getKpiStats(nodeId: any) {
    return this._httpService.POST('/karta_nodes/kpiStats', nodeId);
  }
  getCreators(data: any) {
    return this._httpService.POST('/karta_nodes/kpiCreators', data);
  }
}

