import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '@app/shared/_services/common.service';
import { SignupService } from '@app/shared/_services/signup/signup.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject<boolean>();

  user: any = {
    name: "",
    userId: "",
    email: "",
    accessToken: "",
  }

  submitted: boolean = false;
  submitFlag: boolean = false;
  wantToVerify: boolean = false;

  signupForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)]], // Validtion for blank space
    email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]],
    mobile: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(10), Validators.maxLength(10)]],
    companyName: ['', [Validators.required, Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)]], // Validtion for blank space
  });
  get form() { return this.signupForm.controls; }

  constructor(
    private fb: FormBuilder,
    private _commonService: CommonService,
    private _signupService: SignupService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.user.userId = this.route.snapshot.queryParamMap.get("userId") || "";
    this.user.accessToken = this.route.snapshot.queryParamMap.get("access_token") || "";
    this.user.email = this.route.snapshot.queryParamMap.get("email") || "";

    if (this.user.userId) {
      this.signupForm.patchValue({
        fullName: this.route.snapshot.queryParamMap.get("name"),
        email: this.route.snapshot.queryParamMap.get("email")
      });
      this.signupForm.controls["fullName"].disable();
      this.signupForm.controls["email"].disable();
    } else {
      this.signupForm.addControl("password", this.fb.control('', [Validators.required, Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)]));
    }
    
  }

  // On submit
  onSubmit() {

    this.submitted = true;

    if (this.signupForm.valid) {

      this.submitFlag = true;

      if (!this.user.userId) {
        this._signupService.signup(this.signupForm.value).pipe(takeUntil(this.destroy$)).subscribe(
          (response: any) => {
            let { token, email } = response;
            let sessionData = {
              token: token.id,
              email,
              stage: 1
            }
            this._signupService.setSignUpSession(sessionData);
            this.router.navigate(['/sign-up/verification']);
          },
          (error: any) => {
            this.submitFlag = false;
            if (error.status === 422 && error.error.error.details.codes.email[0] === "uniqueness") {
              this._commonService.errorToaster("This email already exist in the system");
            }
          }
        );
      } else {
        this._signupService.updateUser(this.signupForm.getRawValue(), this.user.userId, this.user.accessToken).pipe(takeUntil(this.destroy$)).subscribe(
          (response: any) => {
            let sessionData = {
              token: this.user.accessToken,
              email: this.user.email,
              stage: 1
            }
            this._signupService.setSignUpSession(sessionData);
            this.router.navigate(['/subscription-plan']);
          },
          (error: any) => {
            this.submitFlag = false;
          }
        );
      }
    }
  }

  verifyMobile() {
    this.wantToVerify = true;
    this.signupForm.addControl("otp", this.fb.control(''));
    console.log(this.signupForm.value.mobile);
    // this._signupService.sendMobileOTP()
  }

  resendOtp() {
    console.log("resned")
  }

  verifyOtp() {
    console.log("veirfy")
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
