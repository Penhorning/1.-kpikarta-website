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
  noDataAvailable = `
    <div class="text-center bg-light p-5">
      <h5>No data available</h5>
    </div>
  `;

  // Form validation variables
  formValidation: any  = {
    blank_space: /^(\s+\S+\s*)*(?!\s).*$/,
    email: /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/,
    password: /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()+=\?;,./{}|\":<>\[\]\\\' ~_-`]).{8,}/,
    only_string: '^[a-zA-Z ]*$',
  }

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

  // Months list
  monthsName = [
    { name: "January", shortName: "Jan", value: 0 },
    { name: "February", shortName: "Feb", value: 1 },
    { name: "March", shortName: "Mar", value: 2 },
    { name: "April", shortName: "Apr", value: 3 },
    { name: "May", shortName: "May", value: 4 },
    { name: "June", shortName: "Jun", value: 5 },
    { name: "July", shortName: "Jul", value: 6 },
    { name: "August", shortName: "Aug", value: 7 },
    { name: "September", shortName: "Sep", value: 8 },
    { name: "October", shortName: "Oct", value: 9 },
    { name: "November", shortName: "Nov", value: 10 },
    { name: "December", shortName: "Dec", value: 11 }
  ]

  constructor(private _httpService: HttpService, private toastr: ToastrService, private router: Router) { }



  // Encode
  encode(value: any) {
    return window.btoa(value);
  }
  // Decode
  decode(value: any) {
    if (value) return window.atob(value);
    return "{}";
  }

  // Session code starts
  setSession(sessionData: any) {
    window.localStorage.setItem("kpi-karta-session", this.encode(JSON.stringify(sessionData)));
  }
  getSession() {
    return JSON.parse(this.decode(window.localStorage.getItem("kpi-karta-session")));
  }
  getUserId() {
    return this.getSession().userId;
  }
  getCompanyId() {
    return this.getSession().companyId;
  }
  getEmailId() {
    return this.getSession().email;
  }
  getUserRole() {
    return this.getSession().role;
  }
  getUserLicense() {
    return this.getSession().license;
  }
  getUserPaymentStatus() {
    return this.getSession().py_failed;
  }
  updateSession(key: string, value: string) {
    let session = this.getSession();
    session[key] = value;
    this.setSession(session);
  }
  deleteSession() {
    localStorage.removeItem("kpi-karta-session");
    this.router.navigate(['/login']);
  }

  // Remember me session
  setRememberMeSession(sessionData: any) {
    window.localStorage.setItem("kpi-karta-remember-me-session", this.encode(JSON.stringify(sessionData)));
  }
  getRememberMeSession() {
    return JSON.parse(this.decode(window.localStorage.getItem("kpi-karta-remember-me-session")));
  }

  // Collapsed/Expand node session
  setNodeSession(sessionData: any) {
    sessionStorage.setItem("kpi-karta-node-session", this.encode(JSON.stringify(sessionData)));
  }
  getNodeSession() {
    return JSON.parse(this.decode(sessionStorage.getItem("kpi-karta-node-session")));
  }
  addNodeInSession(id: string) {
    let session = this.getNodeSession();
    if (session) {
      session[id] = id;
      this.setNodeSession(session);
    } else this.setNodeSession({ [id]: id });
  }
  removeNodeFromSession(id: string) {
    let session = this.getNodeSession();
    delete session[id];
    this.setNodeSession(session);
  }
  deleteNodeSession() {
    sessionStorage.removeItem("kpi-karta-node-session");
  }

  // Historical view nodeIds session
  // setNodeIdsSession(sessionData: any) {
  //   sessionStorage.setItem("kpi-karta-nodeIds-session", this.encode(JSON.stringify(sessionData)));
  // }
  // getNodeIdsSession() {
  //   return JSON.parse(this.decode(sessionStorage.getItem("kpi-karta-nodeIds-session")));
  // }



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
  // Get user info and set user role and license and based on that we will hide or show members tab in sidebar
  getUserInfo() {
    return this._httpService.GET(`/users/${this.getUserId()}?filter[include]=roles&filter[include]=license`);
  }
  // Common apis
/*============================== API FUNCTIONS ENDS ==============================*/



  // Toaster messages
  toasterErrorStatus = true;
  successToaster(message: any) {
    this.toastr.success(message);
  }

  warningToaster(message: any) {
    this.toastr.warning(message);
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
