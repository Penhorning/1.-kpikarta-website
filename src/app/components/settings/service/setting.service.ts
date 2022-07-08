import { Injectable } from '@angular/core';
import { CommonService } from '@app/shared/_services/common.service';
import { HttpService } from '@app/shared/_services/http/http.service';

@Injectable({
  providedIn: 'root'
})
export class SettingService {

  constructor(private _httpService: HttpService, private _commonService: CommonService) { }

  changePassword(data: any) {
    return this._httpService.POST(`/users/change-password?access_token=${this._commonService.getSession().token}`, data);
  }
  generateMFAQRCode() {
    return this._httpService.PUT('/users/generateMFAQRCode');
  }
  enableMFA(data: any) {
    return this._httpService.PUT('/users/enableMFA', data);
  }
  resetMFAConfig() {
    return this._httpService.PUT('/users/resetMFA');
  }
  checkMFAConfig() {
    return this._httpService.POST('/users/checkMFAConfig');
  }
  toggleMFA(data: any) {
    return this._httpService.PUT('/users/toggleMFA', data);
  }

}
