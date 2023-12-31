import { Injectable } from '@angular/core';
import { HttpService } from '@app/shared/_services/http/http.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(private _httpService: HttpService) { }

/*============================== API FUNCTIONS STARTS ==============================*/
  getProfile(userId: string) {
    return this._httpService.GET(`/users/${userId}?filter[include]=company`);
  }
  getDepartments() {
    return this._httpService.GET('/departments/');
  }
  getEmployeesRanges() {
    return this._httpService.GET('/employee_ranges/');
  }
  updateProfile(data: any, userId: string) {
    return this._httpService.PATCH(`/users/${userId}`, data);
  }
  uploadFile(data: any, type: string) {
    return this._httpService.POST(`/Containers/${type}/upload`, data);
  }
  // getCompanyByUser(userId: string) {
  //   return this._httpService.GET(`/companies/findOne?filter[where][userId]=${userId}`);
  // }
  updateCompany(data: any, companyId: string) {
    return this._httpService.PATCH(`/companies/${companyId}`, data);
  }
  sendMobileCode(data: any) {
    return this._httpService.POST('/users/send-mobile-code', data);
  }
  verifyMobile(data: any) {
    return this._httpService.POST('/users/verify-mobile', data);
  }
/*============================== API FUNCTIONS ENDS ==============================*/

}
