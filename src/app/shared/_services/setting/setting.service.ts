import { Injectable } from '@angular/core';
import { CommonService } from '../common.service';
import { HttpService } from '../http.service';

@Injectable({
  providedIn: 'root'
})
export class SettingService {

  constructor(private http: HttpService, private _commonService: CommonService) { }

  changePassword(data: any) {
    return this.http.POST(`/users/change-password?access_token=${this._commonService.getSession().token}`, data);
  }

}
