import { Injectable } from '@angular/core';
import { HttpService } from '@app/shared/_services/http/http.service';

@Injectable({
  providedIn: 'root'
})
export class KartaService {

  constructor(private _httpService: HttpService) { }

/*============================== API FUNCTIONS STARTS ==============================*/
  createKarta(data: any) {
    return this._httpService.POST('/karta', data);
  }
  getKartas() {
    return this._httpService.GET('/karta?filter[limit]=3&filter[order]=createdAt Desc');
  }
  deleteKarta(id: string) {
    return this._httpService.DELETE('/karta/', id);
  }
  // getSuggestionByUser(data: any) {
  //   return this._httpService.POST('/suggestion-by-user', data);
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
