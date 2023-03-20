import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from '@app/shared/_services/common.service';
import { SignupService } from '@app/components/sign-up/service/signup.service';

@Component({
  selector: 'app-two-step-verification',
  templateUrl: './two-step-verification.component.html',
  styleUrls: ['./two-step-verification.component.scss']
})
export class TwoStepVerificationComponent implements OnInit {

  submitted: boolean = false;
  submitFlag: boolean = false;
  verificationFlag: boolean = false;

  verificationForm = this.fb.group({
    code: ['', [Validators.required, Validators.pattern(/^[0-9]*$/)]]
  });
  get form() { return this.verificationForm.controls; }

  constructor(
    private fb: FormBuilder,
    private _commonService: CommonService,
    private _signupService: SignupService,
    private router: Router
  ) { }

  ngOnInit(): void {
  }

  // On submit
  onSubmit() {

    this.submitted = true;

    if (this.verificationForm.valid) {

      this.submitFlag = true;

      this._signupService.verifyMobile(this.verificationForm.value).subscribe(
        (response: any) => {
          this._commonService.setSession(this._signupService.getSignUpSession());
          this._signupService.deleteSignUpSession();
          this.router.navigate(['/dashboard']);
        },
        (error: any) => { }
      ).add(() => this.submitFlag = false);
    }
  }

  resendCode() {
    this.verificationFlag = true;
    this._signupService.sendMobileLoginCode().subscribe(
      (response: any) => {
        this._commonService.successToaster("Verification code resend successfully");
      },
      (error: any) => { }
    ).add(() => this.verificationFlag = false);
  }

}

