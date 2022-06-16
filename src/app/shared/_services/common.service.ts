import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Router } from '@angular/router';

import { environment } from '../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  private BASE_URL = environment.API_URL;
  public MEDIA_URL = `${this.BASE_URL}/public/uploads`;
  
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

  constructor(private http: HttpService, private toastr: ToastrService, private router: Router) { }



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
  deleteSession() {
    localStorage.removeItem("kpi-karta-session");
    this.router.navigate(['/login']);
  }



/*============================== API FUNCTIONS STARTS ==============================*/
  // Login apis
  login(data: any) {
    return this.http.POST('/users/login?include=user', data);
  }
  forgotPassword(data: any) {
    return this.http.POST('/users/reset', data);
  }
  checkResetPasswordToken(data: any) {
    return this.http.POST('/admin/checkResetPasswordToken', data);
  }
  resetPassword(data: any) {
    return this.http.POST(`/users/reset-password?access_token=${data.access_token}`, data);
  }
  signup(data: any) {
    return this.http.POST('/users', data);
  }
  updateUser(data: any) {
    return this.http.PATCH(`/users/${data.userId}?access_token=${data.token}`, data);
  }
  verification(data: any) {
    return this.http.GET(`/users/verify_email?otp=${data.code}&access_token=${this.getUserId()}`);
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
