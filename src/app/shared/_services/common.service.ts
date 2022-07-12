import { Injectable } from '@angular/core';
import { HttpService } from './http/http.service';
import { Router } from '@angular/router';

import { environment } from '@environments/environment';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  private BASE_URL = environment.API_URL;
  public MEDIA_URL = `${this.BASE_URL}`;
  
  loginFlag: boolean = false;
  loader = `
    <div class="text-center">
      <div class="spinner-border" role="status">
        <span class="sr-only">Loading...</span>
      </div>
    </div>
  `;
  somethingWentWrong = `
    <div class="text-center">
      <div class="alert alert-danger" role="alert">
        Error, Something went wrong
      </div>
    </div>
  `;

  // Datepicker config
  maxDate: any = moment();
  alwaysShowCalendars: boolean = true;
  ranges: any = {
    'Today': [moment(), moment()],
    'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
    'Last 15 Days': [moment().subtract(14, 'days'), moment()],
    'Last 30 Days': [moment().subtract(29, 'days'), moment()],
    'This Month': [moment().startOf('month'), moment().endOf('month')],
    'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
  }
  invalidDates: moment.Moment[] = [];
  isInvalidDate = (m: moment.Moment) => {
    return this.invalidDates.some(d => d.isSame(m, 'day'))
  }

  constructor(private _httpService: HttpService, private toastr: ToastrService, private router: Router) { }



  // Session code starts
  setSession(sessionData: any) {
    window.localStorage.setItem("kpi-karta-session", JSON.stringify(sessionData));
  }
  getSession() {
    return JSON.parse(window.localStorage.getItem("kpi-karta-session") || "{}");
  }
  getUserId() {
    return JSON.parse(window.localStorage.getItem("kpi-karta-session") || "{}").userId;
  }
  updateUserNameInSession(updatedName: string) {
    let session = JSON.parse(window.localStorage.getItem("kpi-karta-session") || "{}");
    session.name = updatedName;
    window.localStorage.setItem("kpi-karta-session", JSON.stringify(session));
  }
  updateUserImageInSession(updatedPic: string) {
    let session = JSON.parse(window.localStorage.getItem("kpi-karta-session") || "{}");
    session.profilePic = updatedPic;
    window.localStorage.setItem("kpi-karta-session", JSON.stringify(session));
  }
  updateCompanyLogoInSession(updatedLogo: string) {
    let session = JSON.parse(window.localStorage.getItem("kpi-karta-session") || "{}");
    session.companyLogo = updatedLogo;
    window.localStorage.setItem("kpi-karta-session", JSON.stringify(session));
  }
  deleteSession() {
    localStorage.removeItem("kpi-karta-session");
    this.router.navigate(['/login']);
  }

  // Remember me session
  setRememberMeSession(sessionData: any) {
    window.localStorage.setItem("kpi-karta-remember-me-session", JSON.stringify(sessionData));
  }
  getRememberMeSession() {
    return JSON.parse(window.localStorage.getItem("kpi-karta-remember-me-session") || "{}");
  }



/*============================== API FUNCTIONS STARTS ==============================*/
  // Login apis
  login(data: any) {
    return this._httpService.POST('/users/login/user', data);
  }
  logout() {
    return this._httpService.POST(`/users/logout?access_token=${this.getSession().token}`);
  }
  forgotPassword(data: any) {
    return this._httpService.POST('/users/forgot-password/user', data);
  }
  resetPassword(data: any, accessToken: string) {
    return this._httpService.POST(`/users/reset-password?access_token=${accessToken}`, data);
  }
  // Common apis
/*============================== API FUNCTIONS ENDS ==============================*/



  // Toaster messages
  toasterErrorStatus = true;
  successToaster(message: any) {
    this.toastr.success(message);
  }

  errorToaster(message: any) {
    if (this.toasterErrorStatus) {
      this.toasterErrorStatus = false;
      this.toastr.error(message);
      setTimeout(() => {
        this.toasterErrorStatus = true;
      }, 2000);
    }
  }
}
