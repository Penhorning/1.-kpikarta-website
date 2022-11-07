import { Injectable } from '@angular/core';
import { HttpService } from '@app/shared/_services/http/http.service';

@Injectable({
  providedIn: 'root'
})
export class MemberService {

  constructor(private _httpService: HttpService) { }
  /*============================== API FUNCTIONS STARTS ==============================*/
  getDepartments() {
    return this._httpService.GET('/departments');
  }
  getRoles() {
    return this._httpService.GET('/users/get-roles');
  }
  getLicenses() {
    return this._httpService.GET('/licenses?filter[active]=true');
  }
  inviteMember(data: any) {
    return this._httpService.POST('/users/invite-member', data);
  }
  getAllMembers(data: any) {
    return this._httpService.POST('/users/get-all-members', data);
  }
  updateUser(data: any, userId: string) {
    return this._httpService.PATCH(`/users/${userId}`, data);
  }
  sendCredentials(data: any) {
    return this._httpService.POST('/users/send-credentials', data);
  }
  /*============================== API FUNCTIONS ENDS ==============================*/
}
