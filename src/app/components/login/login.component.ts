import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { environment } from '@environments/environment';
import { CommonService } from '@app/shared/_services/common.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SignupService } from '@app/shared/_services/signup/signup.service';

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
    password: ['', Validators.required]
  });
  get form() { return this.loginForm.controls };

  constructor(
    private fb: FormBuilder,
    private _commonService: CommonService,
    private _signupService: SignupService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    if (this.route.snapshot.queryParamMap.get("access_token") && this.route.snapshot.queryParamMap.get("userId")) {
      let sessionData = {
        token: this.route.snapshot.queryParamMap.get("access_token") || "",
        userId: this.route.snapshot.queryParamMap.get("userId") || "",
        name: this.route.snapshot.queryParamMap.get("name") || "",
        email: this.route.snapshot.queryParamMap.get("email") || "",
        profilePic: ""
      }
      this._commonService.setSession(sessionData);
      this.router.navigate(['/my-plan']);
    }
  }

  // On submit
  onSubmit() {
    this.submitted = true;

    if (this.loginForm.valid) {
      this.submitFlag = true;

      this._commonService.login(this.loginForm.value).pipe(takeUntil(this.destroy$)).subscribe(
        (response: any) => {
          let { id, fullName, email, profilePic, emailVerified, currentPlan } = response.user;
          if (!emailVerified) {
            let sessionData = {
              token: response.id,
              email,
              stage: 1
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
              profilePic
            }
            this._commonService.setSession(sessionData);
            this.router.navigate(['/my-plan']);
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
