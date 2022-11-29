import { Injectable } from '@angular/core';
import { HttpService } from '@app/shared/_services/http/http.service';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {

  constructor(private _httpService: HttpService) { }

/*============================== API FUNCTIONS STARTS ==============================*/
  getCatalogs(data: any) {
    return this._httpService.POST('/karta_catalogs/get-all', data);
  }
  getAllMembers(data: any) {
    return this._httpService.POST('/users/get-all-members', data);
  }
  getSharedCatalogs(data: any) {
    return this._httpService.POST('/karta_catalogs/shared-all', data);
  }
  updateCatalog(catalogId: string, data: any) {
    return this._httpService.PATCH(`/karta_catalogs/${catalogId}`, data);
  }
  deleteCatalog(data: any) {
    return this._httpService.POST('/karta_catalogs/delete', data);
  }
  shareCatalog(data: any) {
    return this._httpService.POST('/karta_catalogs/share', data);
  }
/*============================== API FUNCTIONS ENDS ==============================*/

}
