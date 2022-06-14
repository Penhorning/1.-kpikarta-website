import { Injectable } from '@angular/core';
import { CommonService } from '../common.service';
import { HttpService } from '../http.service';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionPlanService {

  constructor(private http: HttpService, private _commonService: CommonService) { }

  assignPlan(data: any) {
    return this.http.POST(`/users/assign_plan?access_token=${this._commonService.getUserId()}`, data);
  }
}
