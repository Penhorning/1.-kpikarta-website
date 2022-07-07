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
  updateSignUpVerificationSession(type: string) {
    let session = JSON.parse(window.sessionStorage.getItem("kpi-karta-signup-session") || "{}");
    if (type == "mobile") session.mobileVerified = true;
    else if (type == "email") session.emailVerified = true;
    window.sessionStorage.setItem("kpi-karta-signup-session", JSON.stringify(session));
  }
  updateSignUpSession(stageNumber: number) {
    let session = JSON.parse(window.sessionStorage.getItem("kpi-karta-signup-session") || "{}");
    session.stage = stageNumber;
    window.sessionStorage.setItem("kpi-karta-signup-session", JSON.stringify(session));
  }
  deleteSignUpSession() {
    sessionStorage.removeItem("kpi-karta-signup-session");
  }



/*============================== API FUNCTIONS STARTS ==============================*/
  signup(data: any) {
    return this._httpService.POST('/users', data);
  }
  updateUser(data: any, userId: string, accessToken: string) {
    return this._httpService.PATCH(`/users/${userId}?access_token=${accessToken}`, data);
  }
  verification(data: any) {
    return this._httpService.POST(`/users/verify_email?access_token=${this.getSignUpSession().token}`, data);
  }
  resendVerification() {
    return this._httpService.POST(`/users/send_email_code?access_token=${this.getSignUpSession().token}`, "");
  }
  sendMobileCode() {
    return this._httpService.POST(`/users/send_mobile_code?access_token=${this.getSignUpSession().token}`, "");
  }
  verifyMobile(data: any) {
    return this._httpService.POST(`/users/verify_mobile?access_token=${this.getSignUpSession().token}`, data);
  }
/*============================== API FUNCTIONS ENDS ==============================*/
}
