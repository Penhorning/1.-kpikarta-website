import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders  } from '@angular/common/http';
import { HttpService } from '../../../shared/_services/http/http.service';
import { SignupService } from '../../sign-up/service/signup.service';
@Injectable()
export class ChargebeeService {

  constructor(private http: HttpClient, private _httpService: HttpService, private _signupService: SignupService) { }

  validateCoupon(couponCode: any) {
    return this._httpService.POST('/chargebee-coupons/verify-coupon', { couponCode });
  }
  
}
