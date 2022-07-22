import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '@app/shared/_services/common.service';
import { SignupService } from '@app/components/sign-up/service/signup.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-two-step-verification',
  templateUrl: './two-step-verification.component.html',
  styleUrls: ['./two-step-verification.component.scss']
})
export class TwoStepVerificationComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject<boolean>();

  authType: string = "";

  submitted: boolean = false;
  submitFlag: boolean = false;

  verificationForm = this.fb.group({
    code: ['', [Validators.required, Validators.pattern(/^[0-9]*$/)]]
  });
  get form() { return this.verificationForm.controls; }

  mobileSubmitted: boolean = false;
  mobileSubmitFlag: boolean = false;
  mobileVerificationFlag: boolean = false;
  twoFactorFlag: boolean = false;

  mobileVerificationForm = this.fb.group({
    code: ['', [Validators.required, Validators.pattern(/^[0-9]*$/)]]
  });
  get mobileForm() { return this.mobileVerificationForm.controls; }

  constructor(
    private fb: FormBuilder,
    private _commonService: CommonService,
    private _signupService: SignupService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.authType = this.route.snapshot.queryParamMap.get("auth") || "";
  }

  ngOnInit(): void {
  }

  // On submit
  onSubmit() {

    this.submitted = true;

    if (this.verificationForm.valid) {

      this.submitFlag = true;

      this._signupService.verifyMFACode(this.verificationForm.value).pipe(takeUntil(this.destroy$)).subscribe(
        (response: any) => {
          this._commonService.setSession(this._signupService.getSignUpSession());
          this._signupService.deleteSignUpSession();
          this.router.navigate(['/dashboard']);
        },
        (error: any) => { }
      ).add(() => this.submitFlag = false);
    }
  }

  onMobileSubmit() {

    this.mobileSubmitted = true;

    if (this.mobileVerificationForm.valid) {

      this.mobileSubmitFlag = true;

      this._signupService.verifyMobile(this.mobileVerificationForm.value).pipe(takeUntil(this.destroy$)).subscribe(
        (response: any) => {
          this._commonService.setSession(this._signupService.getSignUpSession());
          this._signupService.deleteSignUpSession();
          this.router.navigate(['/dashboard']);
        },
        (error: any) => { }
      ).add(() => this.mobileSubmitFlag = false);
    }
  }

  resendMobileCode() {
    this.mobileVerificationFlag = true;
    this._signupService.sendMobileCode().pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {
        this._commonService.successToaster("Verification code resend successfully");
      },
      (error: any) => { }
    ).add(() => this.mobileVerificationFlag = false);
  }

  showTwoFactor() {
    this.twoFactorFlag = true;
    this._signupService.sendMobileCode().pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => { },
      (error: any) => { }
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
