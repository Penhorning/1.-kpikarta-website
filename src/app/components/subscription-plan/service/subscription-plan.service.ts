import { Injectable } from '@angular/core';
import { HttpService } from '../../../shared/_services/http/http.service';
import { SignupService } from '../../sign-up/service/signup.service';

@Injectable({
  providedIn: 'root'
})
export class SubscriptionPlanService {

  constructor(private _httpService: HttpService, private _signupService: SignupService) { }

/*============================== API FUNCTIONS STARTS ==============================*/
  assignPlan(data: any) {
    return this._httpService.POST(`/users/assign-plan?access_token=${this._signupService.getSignUpSession().token}`, data);
  }
/*============================== API FUNCTIONS ENDS ==============================*/

}
