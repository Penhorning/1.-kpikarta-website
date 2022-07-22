import { Injectable } from '@angular/core';
import { CommonService } from '@app/shared/_services/common.service';
import { HttpService } from '@app/shared/_services/http/http.service';

@Injectable({
  providedIn: 'root'
})
export class SettingService {

  constructor(private _httpService: HttpService, private _commonService: CommonService) { }

/*============================== API FUNCTIONS STARTS ==============================*/
  getColorSettingByUser(data: any) {
    return this._httpService.POST('/color-settings-by-user', data);
  }
  createColorSetting(data: any) {
    return this._httpService.POST('/color_settings', data);
  }
  updateColorSetting(data: any, settingId: string) {
    return this._httpService.PATCH(`/color_settings/${settingId}`, data);
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

  changePassword(data: any) {
    return this._httpService.POST(`/users/change-password?access_token=${this._commonService.getSession().token}`, data);
  }
/*============================== API FUNCTIONS ENDS ==============================*/

}