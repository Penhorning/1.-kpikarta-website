import { Injectable } from '@angular/core';
import { HttpService } from '@app/shared/_services/http/http.service';

@Injectable({
  providedIn: 'root'
})
export class MarketplaceService {

  constructor(private _httpService: HttpService) { }

/*============================== API FUNCTIONS STARTS ==============================*/
  getAllCatalogs(data: any) {
    return this._httpService.POST('/karta_catalogs/get-all-public', data);
  }
  getAllKartas(data: any) {
    return this._httpService.POST('/karta/get-all-public', data);
  }
/*============================== API FUNCTIONS ENDS ==============================*/

}
