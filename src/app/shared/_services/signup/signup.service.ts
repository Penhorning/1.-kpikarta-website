import { Injectable } from '@angular/core';
import { HttpService } from '../http/http.service';

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
    return this._httpService.GET(`/users/verify_email?otp=${data.code}&access_token=${this.getSignUpSession().token}`);
  }
  resendVerification() {
    return this._httpService.POST(`/users/resend_code?access_token=${this.getSignUpSession().token}`, "");
  }
  sendMobileOTP(data: any) {
    return this._httpService.POST('/mobiles', data);
  }
  resendMobileOTP() {
    return this._httpService.POST(`/users/resend_code?access_token=${this.getSignUpSession().token}`, "");
  }
  verifyMobileOTP() {
    return this._httpService.POST(`/users/resend_code?access_token=${this.getSignUpSession().token}`, "");
  }
/*============================== API FUNCTIONS ENDS ==============================*/
}
