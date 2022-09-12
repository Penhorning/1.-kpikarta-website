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
    return this._httpService.GET(`/karta?filter[limit]=3&filter[where][userId]=${userId}&filter[order]=createdAt Desc`);
  }
  deleteKarta(id: string) {
    return this._httpService.DELETE('/karta/', id);
  }
  addNode(data: any) {
    return this._httpService.POST('/karta_nodes', data);
  }
  updateNode(nodeId: string, data: any) {
    return this._httpService.PATCH(`/karta_nodes/${nodeId}`, data);
  }
  removeNode(nodeId: string) {
    return this._httpService.DELETE('/karta_nodes/', nodeId);
  }
  // getNodes() {
  //   return this._httpService.GET('/karta?filter[limit]=3&filter[order]=crea');
  // }
  // getSuggestion(data: any) {
  //   return this._httpService.POST('/suggestion-by-phase', data);
  // }
  // createSuggestion(data: any) {
  //   return this._httpService.POST('/suggestions', data);
  // }
  // updateSuggestion(data: any, suggestionId: string) {
  //   return this._httpService.PATCH(`/suggestions/${suggestionId}`, data);
  // }
  // deleteSuggestion(suggestionId: string) {
  //   return this._httpService.DELETE('/suggestions/', suggestionId);
  // }
/*============================== API FUNCTIONS ENDS ==============================*/

}
