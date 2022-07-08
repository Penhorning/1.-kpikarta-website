import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from '@app/shared/_services/common.service';
import { SignupService } from '@app/components/sign-up/service/signup.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-verification',
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.scss']
})
export class VerificationComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject<boolean>();

  submitted: boolean = false;
  submitFlag: boolean = false;
  verificationFlag: boolean = false;

  verificationForm = this.fb.group({
    code: ['', [Validators.required, Validators.pattern(/^[0-9]*$/)]]
  });
  get form() { return this.verificationForm.controls; }

  mobileSubmitted: boolean = false;
  mobileSubmitFlag: boolean = false;
  mobileVerificationFlag: boolean = false;

  mobileVerificationForm = this.fb.group({
    code: ['', Validators.pattern(/^[0-9]*$/)]
  });
  get mobileForm() { return this.mobileVerificationForm.controls; }

  emailVerified: boolean = false;
  mobileVerified: boolean = false;
  mobileVerifiedFlag: boolean = false;

  constructor(
    private fb: FormBuilder,
    private _commonService: CommonService,
    private _signupService: SignupService,
    private router: Router
  ) {
    // Preventing back button in browser
    window.onpopstate = function (e: any) { window.history.forward(); }

    // Check verification
    if (this._signupService.getSignUpSession().mobileVerified) {
      this.mobileVerified = this.mobileVerifiedFlag = this._signupService.getSignUpSession().mobileVerified;
      this.mobileVerificationForm.controls["code"].disable();
    }
    if (this._signupService.getSignUpSession().emailVerified) {
      this.emailVerified = this.mobileVerifiedFlag = this._signupService.getSignUpSession().emailVerified;
      this.verificationForm.controls["code"].disable();
    }
  }

  ngOnInit(): void {
  }

  // On submit
  onSubmit() {

    this.submitted = true;

    if (this.verificationForm.valid) {

      this.submitFlag = true;

      this._signupService.verification(this.verificationForm.value).pipe(takeUntil(this.destroy$)).subscribe(
        (response: any) => {
          this.emailVerified = true;
          this._commonService.successToaster("Email verified successfully");
          this.verificationForm.controls["code"].disable();
          this._signupService.updateSignUpVerificationSession('email');
        },
        (error: any) => { }
      ).add(() => this.submitFlag = false);
    }
  }

  resendCode() {
    this.verificationFlag = true;
    this._signupService.resendVerification().pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {
        this._commonService.successToaster("Code sent successfully");
      },
      (error: any) => { }
    ).add(() => this.verificationFlag = false);
  }

  onMobileSubmit() {

    this.mobileSubmitted = true;

    if (this.mobileVerificationForm.valid && this.mobileVerificationForm.value.code) {

      this.mobileSubmitFlag = true;

      this._signupService.verifyMobile(this.mobileVerificationForm.value).pipe(takeUntil(this.destroy$)).subscribe(
        (response: any) => {
          this.mobileVerified = true;
          this._commonService.successToaster("Mobile verified successfully");
          this.mobileVerificationForm.controls["code"].disable();
          this._signupService.updateSignUpVerificationSession('mobile');
        },
        (error: any) => { }
      ).add(() => this.mobileSubmitFlag = false);
    }
  }

resendMobileCode() {
    this.mobileVerificationFlag = true;
    this._signupService.sendMobileCode().pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {
        this._commonService.successToaster("Code sent successfully");
      },
      (error: any) => { }
    ).add(() => this.mobileVerificationFlag = false);
  }

  goToNext() {
    if (this.emailVerified) {
      this.router.navigate(['/subscription-plan']);
      this._signupService.updateSignUpSession(2);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
