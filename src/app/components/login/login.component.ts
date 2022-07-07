import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { environment } from '@environments/environment';
import { CommonService } from '@app/shared/_services/common.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SignupService } from '@app/components/sign-up/service/signup.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject<boolean>();

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
        companyLogo: this.route.snapshot.queryParamMap.get("companyLogo") || ""
      }
      this._commonService.setSession(sessionData);
      this.router.navigate(['/dashboard']);
    }
  }

  // On submit
  onSubmit() {
    this.submitted = true;

    if (this.loginForm.valid) {
      this.submitFlag = true;

      this._commonService.login(this.loginForm.value).pipe(takeUntil(this.destroy$)).subscribe(
        (response: any) => {
          let { id, fullName, email, profilePic, emailVerified, mobileVerified, currentPlan } = response.user;
          if (!emailVerified) {
            let sessionData = {
              token: response.id,
              email,
              stage: 1,
              mobileVerified: mobileVerified
            }
            this._signupService.setSignUpSession(sessionData);
            this.router.navigate(['/sign-up/verification']);
          } else if (!currentPlan) {
            let sessionData = {
              token: response.id,
              email,
              stage: 1
            }
            this._signupService.setSignUpSession(sessionData);
            this.router.navigate(['/subscription-plan']);
          } else {
            let sessionData = {
              token: response.id,
              userId: id,
              name: fullName,
              email,
              profilePic,
              companyLogo: response.companyLogo
            }
            this._commonService.setSession(sessionData);
            if (this.loginForm.value.rememberMe) {
              this._commonService.setRememberMeSession({email: this.loginForm.value.email});
            }
            this.router.navigate(['/dashboard']);
          }
        },
        (error: any) => {
          this.submitFlag = false;
        }
      );
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
