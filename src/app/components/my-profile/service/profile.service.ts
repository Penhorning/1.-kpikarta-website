import { Injectable } from '@angular/core';
import { HttpService } from '@app/shared/_services/http/http.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(private _httpService: HttpService) { }



/*============================== API FUNCTIONS STARTS ==============================*/
  getProfile(userId: string) {
    return this._httpService.GET_BY_ID('/users/', userId);
  }
  updateProfile(data: any, userId: string) {
    return this._httpService.PATCH(`/users/${userId}`, data);
  }
  uploadFile(data: any, type: string) {
    return this._httpService.POST(`/Containers/${type}/upload`, data);
  }
  getCompanyByUser(userId: string) {
    return this._httpService.GET(`/companies/findOne?filter[where][userId]=${userId}`);
  }
  updateCompany(data: any, companyId: string) {
    return this._httpService.PATCH(`/companies/${companyId}`, data);
  }
  sendMobileCode(data: any) {
    return this._httpService.POST('/users/send_mobile_code', data);
  }
  verifyMobile(data: any) {
    return this._httpService.POST('/users/verify_mobile', data);
  }
/*============================== API FUNCTIONS ENDS ==============================*/
}
