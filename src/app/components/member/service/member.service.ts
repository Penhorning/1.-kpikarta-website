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
  getAllInvites(data: any) {
    return this._httpService.POST('/users/get-all-invites', data);
  }
  getLicenses() {
    return this._httpService.GET('/licenses?filter[active]=true');
  }
  invite(data: any) {
    return this._httpService.POST('/users/invite', data);
  }
  updateUser(data: any, userId: string, accessToken: string) {
    return this._httpService.PATCH(`/users/${userId}?access_token=${accessToken}`, data);
  }
  /*============================== API FUNCTIONS ENDS ==============================*/
}
