import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { environment } from '@environments/environment';
import { CommonService } from '@app/shared/_services/common.service';
import { SignupService } from '@app/components/sign-up/service/signup.service';

declare const $: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  facebookUrl: string = `${environment.API_URL}/auth/facebook`;
  googleUrl: string = `${environment.API_URL}/auth/google`;
  linkedInUrl: string = `${environment.API_URL}/auth/linkedin`;

  chargebeePortalUrl: string = `${environment.API_URL}/api/subscriptions/get-portal`;

  submitted: boolean = false;
  submitFlag: boolean = false; 

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]],
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
    if (email) this.loginForm.patchValue({ email, rememberMe: true });
  }

  // Confirm box
  confirmBox(message: string, yesCallback: any, noCallback: any) {
    $("#confirm_message").text(message);
    $("#confirmModal").modal('show');
    $('#btnYes').unbind('click');
    $('#btnYes').click(function() {
      $("#confirmModal").modal('hide');
      yesCallback();
    });
    $('#btnNo').unbind('click');
    $('#btnNo').click(function() {
      $("#confirmModal").modal('hide');
      noCallback();
    });
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
        companyId: this.route.snapshot.queryParamMap.get("companyId") || "",
        role: this.route.snapshot.queryParamMap.get("role") || "",
        license: this.route.snapshot.queryParamMap.get("license") || "",
        _2faEnabled: this.route.snapshot.queryParamMap.get("_2faEnabled") || "false",
        mobileVerified: this.route.snapshot.queryParamMap.get("mobileVerified") || "false",
        subscriptionStatus: this.route.snapshot.queryParamMap.get("subscriptionStatus") || "none",
        // paymentVerified: this.route.snapshot.queryParamMap.get("paymentVerified") || "false",
        // paymentFailed: this.route.snapshot.queryParamMap.get("paymentFailed") || "false",
        // trialCancelled: this.route.snapshot.queryParamMap.get("trialCancelled") || "false"
      }
      if (sessionData.subscriptionStatus === "none") {
        let data = {
          token: sessionData.token,
          email: sessionData.email,
          stage: 1
        }
        this._signupService.setSignUpSession(data);
        this.router.navigate(['/subscription-plan']);
      }
      // else if (sessionData.trialCancelled === "true") {
      //   let sessionData2 = {
      //     token: sessionData.token,
      //     email: sessionData.email,
      //     stage: 1
      //   }
      //   this._signupService.setSignUpSession(sessionData2);
      //   this._signupService.setLoginSession(sessionData);
      //   this.router.navigate(['/billing-trial']);
      // }
      else {
        if (sessionData.mobileVerified == "true" && sessionData._2faEnabled == "true") {
          this._signupService.setSignUpSession(sessionData);
          this.router.navigate(['/two-step-verification']);
        } else {
          this._signupService.setSignUpSession(sessionData);
          if (sessionData.subscriptionStatus === "cancelled" && (sessionData.role === "company_admin" || sessionData.role === "billing_staff")) {
            this.chargebeePortalUrl += `?access_token=${this._signupService.getSignUpSession().token}`;
            const message = `Hi ${sessionData.name}, Your subscription has been cancelled. You need to reactivate this in order to access your account.`;
            this.confirmBox(message, () => {},
            () => { });
          } else {
            this._commonService.setSession(sessionData);
            this.router.navigate(['/dashboard']);
          }
        }
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
          this._commonService.deleteRememberMeSession();
          let { id, fullName, email, profilePic, emailVerified, mobile, mobileVerified, _2faEnabled, subscriptionStatus } = response.user;
          if (!emailVerified) {
            let sessionData = {
              token: response.id,
              email,
              stage: 1
            }
            this._signupService.setSignUpSession(sessionData);
            this.router.navigate(['/sign-up/verification']);
          }
          else if (subscriptionStatus === "none") {
            let sessionData = {
              token: response.id,
              email,
              stage: 1
            }
            this._signupService.setSignUpSession(sessionData);
            this.router.navigate(['/subscription-plan']);
          }
          // else if (trialCancelled) {
          //   let sessionDataUser = {
          //     token: response.id,
          //     userId: id,
          //     name: fullName,
          //     email,
          //     profilePic,
          //     companyLogo: response.user.company.logo,
          //     role: response.user.role.name,
          //     license: response.user.license.name,
          //     companyId: response.user.companyId
          //   };
          //   let sessionData = {
          //     token: response.id,
          //     email,
          //     stage: 1
          //   }
          //   if (this.loginForm.value.rememberMe) {
          //     this._commonService.setRememberMeSession({ email: this.loginForm.value.email });
          //   }
          //   this._signupService.setSignUpSession(sessionData);
          //   this._signupService.setLoginSession(sessionDataUser);
          //   this.router.navigate(['/billing-trial']);
          // }
          else {
            let sessionData = {
              token: response.id,
              userId: id,
              name: fullName,
              email,
              profilePic,
              companyLogo: response.user.company.logo,
              role: response.user.role.name,
              license: response.user.license.name,
              companyId: response.user.companyId
            }
            if (this.loginForm.value.rememberMe) {
              this._commonService.setRememberMeSession({ email: this.loginForm.value.email });
            }
            if (mobile && _2faEnabled && mobileVerified) {
              this._signupService.setSignUpSession(sessionData);
              this.router.navigate(['/two-step-verification']);
            } else {
              this._signupService.setSignUpSession(sessionData);
              if (subscriptionStatus === "cancelled" && (response.user.role.name === "company_admin" || response.user.role.name === "billing_staff")) {
                this.chargebeePortalUrl += `?access_token=${this._signupService.getSignUpSession().token}`;
                const message = `Hi ${fullName}, Your subscription has been cancelled. You need to reactivate this in order to access your account.`;
                this.confirmBox(message, () => {},
                () => { });
              } else {
                this._commonService.setSession(sessionData);
                this.router.navigate(['/dashboard']);
              }
            }
          }
        },
        (error: any) => { }
      ).add(() => this.submitFlag = false );
    }
  }

  toggleShowPassword() {
    let x: any = document.getElementById("password");
    let icon: any = document.getElementById("password_icon");
    if (x.type === "password") {
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
      icon.setAttribute("title", "Hide password");
      x.type = "text";
    } else {
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
      icon.setAttribute("title", "Show password");
      x.type = "password";
    }
  }

}
