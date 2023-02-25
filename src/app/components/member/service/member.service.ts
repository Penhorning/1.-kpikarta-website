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
  activateUser(data: any) {
    return this._httpService.PUT('/users/unblock', data);
  }
  deactivateUser(data: any) {
    return this._httpService.PUT('/users/block', data);
  }
  deleteUser(data: any) {
    return this._httpService.PUT('/users/delete', data);
  }
  unblockSubscription(userId: any) {
    return this._httpService.POST('/subscriptions/unblock-subscription', userId);
  }
  blockSubscription(userId: any) {
    return this._httpService.POST('/subscriptions/block-subscription', userId);
  }
  deleteSubscription(userId: any) {
    return this._httpService.POST('/subscriptions/delete-subscription', userId);
  }
  updateSubscription(data: any) {
    return this._httpService.POST('/subscriptions/update-subscription', data);
  }
  createSubscription(data: any) {
    return this._httpService.POST('/subscriptions/create-subscription', data);
  }
  /*============================== API FUNCTIONS ENDS ==============================*/
}
