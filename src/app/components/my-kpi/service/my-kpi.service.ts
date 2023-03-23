import { Injectable } from '@angular/core';
import { HttpService } from '@app/shared/_services/http/http.service';

@Injectable({
  providedIn: 'root'
})
export class MyKpiService {

  constructor(private _httpService: HttpService) { }

  /*============================== API FUNCTIONS STARTS ==============================*/
  getMyKPIs(data: { "userId": string }) {
    return this._httpService.POST('/karta_nodes/kpis', data);
  }
  getKPIsByMonth(data: any) {
    return this._httpService.POST('/karta_nodes/view-previous-kpis-by-month', data);
  }
  getKPIsByYear(data: any) {
    return this._httpService.POST('/karta_nodes/view-previous-kpis-by-year', data);
  }
  getColorSettings(data: any) {
    return this._httpService.POST('/color_settings/global', data);
  }
  getAllMembers(data: any) {
    return this._httpService.POST('/users/get-all-members', data);
  }
  updateNode(nodeId: string, data: any) {
    return this._httpService.PATCH(`/karta_nodes/${nodeId}`, data);
  }
  createKartaHistory(data: any) {
    return this._httpService.POST('/karta_histories/create-karta-history', data);
  }
  updateKartaHistory(histroyId: string, data: any) {
    return this._httpService.PATCH(`/karta_histories/${histroyId}`, data);
  }
  getKpiStats(nodeId: any) {
    return this._httpService.POST('/karta_nodes/kpiStats', nodeId);
  }
  getCreators(data: any) {
    return this._httpService.POST('/karta_nodes/kpiCreators', data);
  }
  shareNode(data: any) {
    return this._httpService.POST('/karta_nodes/share', data);
  }
  getKarta(kartaId: string) {
    return this._httpService.GET(`/karta/${kartaId}?filter[include]=node`);
  }
  updateCsv(data: any) {
    return this._httpService.POST('/karta_nodes/update-kpi-nodes', data);
  }
  getNodesDetails(data: any) {
    return this._httpService.POST('/karta_nodes/get-nodes-details', data);
  }
}

