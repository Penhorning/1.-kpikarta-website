import { Injectable } from '@angular/core';
import { HttpService } from '../../../shared/_services/http/http.service';
import { SignupService } from '../../sign-up/service/signup.service';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionPlanService {

  constructor(private _httpService: HttpService, private _signupService: SignupService) { }

/*============================== API FUNCTIONS STARTS ==============================*/
  getCreatorPalns() {
    return this._httpService.GET('/subscriptions/get-plans');
  }  
  assignPlan(data: any) {
    return this._httpService.POST(`/subscriptions/assign-plan?access_token=${this._signupService.getSignUpSession().token}`, data);
  }
  getCreatorPrices() {
    return this._httpService.GET(`/subscriptions/get-prices`);
  }
  startSubscription(data: any) {
    return this._httpService.POST(`/subscriptions/start-subscription`, data);
  }
/*============================== API FUNCTIONS ENDS ==============================*/

}
