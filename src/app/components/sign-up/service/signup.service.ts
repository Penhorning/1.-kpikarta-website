import { Injectable } from '@angular/core';
import { HttpService } from '../../../shared/_services/http/http.service';

@Injectable({
  providedIn: 'root'
})
export class SignupService {

  constructor(private _httpService: HttpService) { }

  // Set session storage for singup steps
  setSignUpSession(sessionData: any) {
    window.sessionStorage.setItem("kpi-karta-signup-session", JSON.stringify(sessionData));
  }
  getSignUpSession() {
    return JSON.parse(window.sessionStorage.getItem("kpi-karta-signup-session") || "{}");
  }
  updateSignUpSession(stageNumber: number, userId?: string) {
    let session = this.getSignUpSession();
    session.stage = stageNumber;
    userId ? session.userId = userId : null;
    window.sessionStorage.setItem("kpi-karta-signup-session", JSON.stringify(session));
  }
  deleteSignUpSession() {
    sessionStorage.removeItem("kpi-karta-signup-session");
  }



/*============================== API FUNCTIONS STARTS ==============================*/
  signup(data: any) {
    return this._httpService.POST('/users', data);
  }
  getUserByEmail(email: any) {
    return this._httpService.GET(`/users?filter[where][email]=${email}`);
  }
  updateUser(data: any, userId: string, accessToken: string) {
    return this._httpService.PATCH(`/users/${userId}?access_token=${accessToken}`, data);
  }
  verification(data: any) {
    return this._httpService.POST(`/users/verify-email?access_token=${this.getSignUpSession().token}`, data);
  }
  paymentVerification() {
    return this._httpService.POST(`/users/verify-payment?access_token=${this.getSignUpSession().token}`, "");
  }
  resendVerification() {
    return this._httpService.POST(`/users/send-email-code?access_token=${this.getSignUpSession().token}`, "");
  }
  sendMobileLoginCode() {
    return this._httpService.POST(`/users/send-mobile-login-code?access_token=${this.getSignUpSession().token}`, "");
  }
  verifyMobile(data: any) {
    return this._httpService.POST(`/users/verify-mobile?access_token=${this.getSignUpSession().token}`, data);
  }
/*============================== API FUNCTIONS ENDS ==============================*/


/*============================== API FUNCTIONS STARTS ==============================*/
  saveCard(data: any) {
    return this._httpService.POST(`/subscriptions/save-card`, data);
  }
/*============================== BILLING FUNCTIONS ENDS ==============================*/

}
