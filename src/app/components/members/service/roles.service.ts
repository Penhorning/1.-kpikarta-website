import { Injectable } from '@angular/core';
import { HttpService } from '@app/shared/_services/http/http.service';

@Injectable({
  providedIn: 'root'
})
export class RolesService {

  constructor(private _httpService: HttpService) { }

  getRoles() {
    return this._httpService.GET('/users/get-roles');
  }
  // signup(data: any) {
  //   return this._httpService.POST('/users', data);
  // }
  // updateUser(data: any, userId: string, accessToken: string) {
  //   return this._httpService.PATCH(`/users/${userId}?access_token=${accessToken}`, data);
  // }
}
