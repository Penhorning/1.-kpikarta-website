import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { environment } from '@environments/environment';
import { CommonService } from '@app/shared/_services/common.service';
import { SignupService } from '@app/components/sign-up/service/signup.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  facebookUrl: string = `${environment.API_URL}/auth/facebook`;
  googleUrl: string = `${environment.API_URL}/auth/google`;
  linkedInUrl: string = `${environment.API_URL}/auth/linkedin`;

  submitted: boolean = false;
  submitFlag: boolean = false; 

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]],
    password: ['', Validators.required],
    rememberMe: [false]
  });
  get form() { return this.loginForm.controls };

  constructor(
    private fb: FormBuilder,
    private _commonService: CommonService,
    private _signupService: SignupService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    let email = this._commonService.getRememberMeSession().email;
    if (email) {
      this.loginForm.patchValue({ email });
    }
  }

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get("access_token") && this.route.snapshot.queryParamMap.get("userId")) {
      let sessionData = {
        token: this.route.snapshot.queryParamMap.get("access_token") || "",
        userId: this.route.snapshot.queryParamMap.get("userId") || "",
        name: this.route.snapshot.queryParamMap.get("name") || "",
        email: this.route.snapshot.queryParamMap.get("email") || "",
        profilePic: this.route.snapshot.queryParamMap.get("profilePic") || "",
        companyLogo: this.route.snapshot.queryParamMap.get("companyLogo") || "",
        _2faEnabled: this.route.snapshot.queryParamMap.get("_2faEnabled") || "false",
        mobileVerified: this.route.snapshot.queryParamMap.get("mobileVerified") || "false"
      }
      if (sessionData.mobileVerified == "true" && sessionData._2faEnabled == "true") {
        this._signupService.setSignUpSession(sessionData);
        this.router.navigate(['/two-step-verification']);
      } else {
        this._commonService.setSession(sessionData);
        this.router.navigate(['/dashboard']);
      }
    }

    if (this.route.snapshot.queryParamMap.get("isDeleted") && this.route.snapshot.queryParamMap.get("isActive")) {
      this._commonService.errorToaster("Your account has been deactivated or deleted by the admin, please connect admin at info@kpikarta.com for more details.");
    }
  }

  // On submit
  onSubmit() {
    this.submitted = true;

    if (this.loginForm.valid) {
      this.submitFlag = true;

      this._commonService.login(this.loginForm.value).subscribe(
        (response: any) => {
          let { id, fullName, email, profilePic, emailVerified, mobile, mobileVerified, creatorId, _2faEnabled, paymentVerified } = response.user;
          if (!emailVerified) {
            let sessionData = {
              token: response.id,
              email,
              stage: 1
            }
            this._signupService.setSignUpSession(sessionData);
            this.router.navigate(['/sign-up/verification']);
          }
          else if (!paymentVerified) {
            let sessionData = {
              token: response.id,
              email,
              stage: 1
            }
            this._signupService.setSignUpSession(sessionData);
            this.router.navigate(['/subscription-plan']);
            // this.router.navigate(['/sign-up/payment-method']);
          }
          else {
            let sessionData = {
              token: response.id,
              userId: id,
              name: fullName,
              email,
              profilePic,
              companyLogo: response.company.logo
            }
            if (this.loginForm.value.rememberMe) {
              this._commonService.setRememberMeSession({ email: this.loginForm.value.email });
            }
            if (mobile && _2faEnabled && mobileVerified) {
              this._signupService.setSignUpSession(sessionData);
              this.router.navigate(['/two-step-verification']);
            } else {
              this._commonService.setSession(sessionData);
              this.router.navigate(['/dashboard']);
            }
          }
        },
        (error: any) => { }
      ).add(() => this.submitFlag = false );
    }
  }

}
