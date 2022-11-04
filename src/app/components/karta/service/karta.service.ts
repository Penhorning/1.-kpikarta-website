import { Injectable } from '@angular/core';
import { HttpService } from '@app/shared/_services/http/http.service';

@Injectable({
  providedIn: 'root'
})
export class KartaService {

  constructor(private _httpService: HttpService) { }

/*============================== API FUNCTIONS STARTS ==============================*/
  getPhases() {
    return this._httpService.GET('/karta_phases');
  }
  // addSubPhase(data: any) {
  //   return this._httpService.POST('/karta_sub_phases', data);
  // }
  // getSubPhases(kartaId: string) {
  //   return this._httpService.GET(`/karta_sub_phases?filter[where][kartaId]=${kartaId}&filter[order]=createdAt Desc`);
  // }
  getSuggestion(data: any) {
    return this._httpService.POST('/suggestion-by-phase', data);
  }
  getColorSettingsByUser(data: any) {
    return this._httpService.POST('/color-settings-by-user', data);
  }
  createKarta(data: any) {
    return this._httpService.POST('/karta', data);
  }
  updateKarta(kartaId: string, data: any) {
    return this._httpService.PATCH(`/karta/${kartaId}`, data);
  }
  getKarta(kartaId: string) {
    return this._httpService.GET(`/karta/${kartaId}?filter[include]=node`);
  }
  getKartas(data: any) {
    return this._httpService.POST('/karta/get-kartas', data);
  }
  deleteKarta(data: any) {
    return this._httpService.POST('/karta/delete', data);
  }
  // deleteSharedKarta(id: any) {
  //   return this._httpService.POST('/karta/delete-shared-karta', id);
  // }
  addNode(data: any) {
    return this._httpService.POST('/karta_nodes', data);
  }
  updateNode(nodeId: string, data: any) {
    return this._httpService.PATCH(`/karta_nodes/${nodeId}`, data);
  }
  removeNode(nodeId: string) {
    return this._httpService.POST('/karta_nodes/delete', {nodeId});
  }
  addKartaHistory(data: any) {
    return this._httpService.POST('/karta_histories', data);
  }
  addKartaHistoryObject(data: any) {
    return this._httpService.POST('/karta_histories/create-karta-history', data);
  }
  getAllUsers() {
    return this._httpService.POST('/users/get-all');
  }
  getAllVersions(kartaId: string) {
    return this._httpService.GET(`/karta_versions?filter[where][kartaId]=${kartaId}&filter[order]=name ASC`);
  }
  shareKarta(data: any) {
    return this._httpService.POST('/karta/share', data);
  }
  getSharedKartas(data: any) {
    return this._httpService.POST('/karta/shared-kartas', data);
  }
  copyKarta(data: any) {
    return this._httpService.POST('/karta/copy-shared-karta', data);
  }
  getColorSettingByUser(data: any) {
    return this._httpService.POST('/color-settings-by-user', data);
  }
  createColorSetting(data: any) {
    return this._httpService.POST('/color_settings', data);
  }
  updateColorSetting(data: any, settingId: string) {
    return this._httpService.PATCH(`/color_settings/${settingId}`, data);
  }
/*============================== API FUNCTIONS ENDS ==============================*/

}
