import { Injectable } from '@angular/core';
import { HttpService } from '../http/http.service';
import { SignupService } from '../signup/signup.service';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionPlanService {

  constructor(private _httpService: HttpService, private _signupService: SignupService) { }

  assignPlan(data: any) {
    return this._httpService.POST(`/users/assign_plan?access_token=${this._signupService.getSignUpSession().token}`, data);
  }
}
