import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '@app/shared/_services/common.service';
import { SignupService } from '@app/components/sign-up/service/signup.service';
import { RedemptionSignUpRoutingModule } from './appsumo-signup-routing.module';
import { ChargebeeService } from './services/chargebee-coupon.service';

@Component({
  selector: 'app-redemption-sign-up',
  templateUrl: './appsumo-signup.component.html',
  styleUrls: ['./appsumo-signup.component.scss']
})
export class RedemptionSignUpComponent implements OnInit {

  user: any = {
    name: "",
    userId: "",
    email: "",
    accessToken: "",
    userType : "appsumo"
  }

  submitted: boolean = false;
  submitFlag: boolean = false;

  isAppSumo: boolean = true;

  
    signupForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.pattern(this._commonService.formValidation.blank_space)]], // Validtion for blank space
      email: ['', [Validators.required, Validators.pattern(this._commonService.formValidation.email)]],
      companyName: ['', [Validators.required, Validators.pattern(this._commonService.formValidation.blank_space)]], // Validtion for blank space
      couponCode: ['', [Validators.required, Validators.pattern(this._commonService.formValidation.blank_space)]],
      // couponCode: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9-]*$/)]],
      userType : "appsumo",
      job_title: ['', [Validators.required, Validators.pattern(this._commonService.formValidation.blank_space)]],
      country: ['', [Validators.required, Validators.pattern(this._commonService.formValidation.blank_space)]],
    });
  
    get form() { return this.signupForm.controls; }
  
    constructor(
      private fb: FormBuilder,
      private _commonService: CommonService,
      private _signupService: SignupService,
      private router: Router,
      private route: ActivatedRoute,
      private chargebeeService: ChargebeeService
    ) {
      if(this._signupService.getSignUpSession().stage >= 1) {
        window.onpopstate = function (e: any) { window.history.forward(); }
      }
    }

    ngOnInit(): void {
      this.user.userId = this.route.snapshot.queryParamMap.get("userId") || "";
      this.user.accessToken = this.route.snapshot.queryParamMap.get("access_token") || "";
      this.user.email = this.route.snapshot.queryParamMap.get("email") || "";

      this.isAppSumo = true;
      if (this.user.userId) {
        this.signupForm.patchValue({
          fullName: this.route.snapshot.queryParamMap.get("name"),
          email: this.route.snapshot.queryParamMap.get("email")
        });
        this.signupForm.controls["fullName"].disable();
        this.signupForm.controls["email"].disable();
      } else {
        this.signupForm.addControl("password", this.fb.control('', [Validators.required, Validators.pattern(this._commonService.formValidation.password)]));
        this.signupForm.addControl("confirmPassword", this.fb.control('', [Validators.required, Validators.pattern(this._commonService.formValidation.password)]));
      }
      
    }

    // On submit
    onSubmit() {
      this.submitted = true;
      console.log('Form Data:', this.signupForm.value);
  
      if (this.signupForm.valid) {
        const couponCode = this.signupForm.value.couponCode;
        console.log("this.signupForm.value ---",this.signupForm.value)
        if (couponCode) {
          // Call the CouponService to validate the coupon code
          this.chargebeeService.validateCoupon(couponCode).subscribe(
            (response) => {
              console.log("response->",response?.data ,response?.couponCodeDetails)
              if(response?.data?.status === 'active' || response?.couponCodeDetails?.status === 'not_redeemed'){
                console.log('Coupon Validated:', response);
                this._commonService.successToaster('Coupon code is valid');


              if (!this.user.userId) {
                if (this.signupForm.value.password !== this.signupForm.value.confirmPassword) {
                  this._commonService.errorToaster("Password and Confirm Password are not matching");
                }
                else {
                  this.submitFlag = true;
                  this.signupForm.value.email = this.signupForm.value.email.toLowerCase();
                  console.log("this.signupForm.value",this.signupForm.value)
                  this._signupService.signup(this.signupForm.value).subscribe(
                    (response: any) => {
                      let { token, email } = response;
                      let sessionData = {
                        token: token.id,
                        email,
                        stage: 1,
                        emailVerified: false,
                        userId: "",
                        userType : "appsumo"
                      }
                      this._signupService.setSignUpSession(sessionData);
                      this.router.navigate(['/sign-up/verification']);
                    },
                    (error: any) => {
                      if (error.status === 422 && error.error.error.details.codes.email[0] === "uniqueness") {
                        this._commonService.errorToaster("Email is already registered, please try a different one");
                      }
                    }
                  ).add(() => this.submitFlag = false );
                }
              } else {
                this.submitFlag = true;
                this.signupForm.value.fullName = this.signupForm.getRawValue().fullName;
                this.signupForm.value.email = this.signupForm.getRawValue().email;
                this.signupForm.value.type = "social_user";
        
                this._signupService.updateUser(this.signupForm.value, this.user.userId, this.user.accessToken).subscribe(
                  (response: any) => {
                    let sessionData = {
                      token: response.accessToken,
                      email: this.user.email,
                      stage: 1
                    }
                    this._signupService.setSignUpSession(sessionData);
                    this.router.navigate(['/subscription-plan']);
                  },
                  (error: any) => { }
                ).add(() => this.submitFlag = false );
              }

              }
              else(
                this._commonService.warningToaster('Invalid or expired coupon code.')
              )
            },
            (error) => {
              console.error('Error validating coupon:', error);
              // Show error message if the coupon is invalid
              this._commonService.errorToaster('Invalid coupon code.');
            }
          );
        } else {
          this._commonService.errorToaster('Redemption code is required.');
        }
      }
    }
  
    

}
