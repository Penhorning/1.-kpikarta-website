import { Injectable } from '@angular/core';
import { HttpService } from '@app/shared/_services/http/http.service';

@Injectable({
  providedIn: 'root'
})
export class KartaService {

  constructor(private _httpService: HttpService) { }

/*============================== API FUNCTIONS STARTS ==============================*/
  getPhases() {
    return this._httpService.GET('/kartaphases');
  }
  getSuggestion(data: any) {
    return this._httpService.POST('/suggestion-by-phase', data);
  }
  createKarta(data: any) {
    return this._httpService.POST('/karta', data);
  }
  getKarta(kartaId: string) {
    return this._httpService.GET_BY_ID('/karta/', kartaId);
  }
  getKartas() {
    return this._httpService.GET('/karta?filter[limit]=3&filter[order]=createdAt Desc');
  }
  deleteKarta(id: string) {
    return this._httpService.DELETE('/karta/', id);
  }
  addNode(data: any) {
    return this._httpService.POST('/kartanodes', data);
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
