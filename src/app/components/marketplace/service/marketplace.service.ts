import { Injectable } from '@angular/core';
import { HttpService } from '@app/shared/_services/http/http.service';

@Injectable({
  providedIn: 'root'
})
export class MarketplaceService {

  constructor(private _httpService: HttpService) { }

/*============================== API FUNCTIONS STARTS ==============================*/
  getCatalogs(data: any, url: string) {
    return this._httpService.POST(url, data);
  }
/*============================== API FUNCTIONS ENDS ==============================*/

}
