import { Injectable } from '@angular/core';
import { HttpService } from '@app/shared/_services/http/http.service';

@Injectable({
  providedIn: 'root'
})
export class KartasService {

  constructor(private _httpService: HttpService) { }
  /*============================== API FUNCTIONS STARTS ==============================*/
  getKartas(data: any) {
    return this._httpService.POST('/karta/get-kartas', data);
  }
  getSharedKarta(data: any) {
    return this._httpService.POST('/karta/shared-kartas', data);
  }
  getAllUsers() {
    return this._httpService.POST('/users/get-all');
  }
  updateNode(nodeId: string, data: any) {
    return this._httpService.PATCH(`/karta_nodes/${nodeId}`, data);
  }
  copyKarta(data: any) {
    return this._httpService.POST('/karta/copy-shared-karta', data);
  }
  sharedEmails(data: any) {
    return this._httpService.POST('/karta/share', data);
  }
  updateKarta(kartaId: string, data: any) {
    return this._httpService.PATCH(`/karta/${kartaId}`, data);
  }
  deleteKarta(data: any) {
    return this._httpService.POST('/karta/delete', data);
  }
}
