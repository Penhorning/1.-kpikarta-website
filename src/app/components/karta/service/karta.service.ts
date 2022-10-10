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
  addSubPhase(data: any) {
    return this._httpService.POST('/karta_sub_phases', data);
  }
  getSubPhases(kartaId: string) {
    return this._httpService.GET(`/karta_sub_phases?filter[where][kartaId]=${kartaId}&filter[order]=createdAt Desc`);
  }
  getSuggestion(data: any) {
    return this._httpService.POST('/suggestion-by-phase', data);
  }
  getColorSettingByUser(data: any) {
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
  getKartas(userId: string) {
    return this._httpService.GET(`/karta?filter[include]=owner&filter[limit]=3&filter[where][userId]=${userId}&filter[where][is_deleted]=false&filter[order]=createdAt Desc`);
  }
  deleteKarta(data: any) {
    return this._httpService.POST('/karta/delete', data);
  }
  deleteSharedKarta(id: any) {
    return this._httpService.POST('/karta/delete-shared-karta', id);
  }
  addNode(data: any) {
    return this._httpService.POST('/karta_nodes', data);
  }
  updateNode(nodeId: string, data: any) {
    return this._httpService.PATCH(`/karta_nodes/${nodeId}`, data);
  }
  removeNode(nodeId: string) {
    return this._httpService.POST('/karta_nodes/delete', {nodeId});
  }
  getAllUsers() {
    return this._httpService.POST('/users/get-all');
  }
  sharedEmails(data: any) {
    return this._httpService.POST('/karta/share', data);
  }
  getSharedKarta(data: any) {
    return this._httpService.POST('/karta/sharedKartas', data);
  }
  copyKarta(data: any){
    return this._httpService.POST('/karta/copy-shared-karta', data);
  }
/*============================== API FUNCTIONS ENDS ==============================*/

}
