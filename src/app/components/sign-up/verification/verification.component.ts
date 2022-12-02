import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from '@app/shared/_services/common.service';
import { SignupService } from '@app/components/sign-up/service/signup.service';

@Component({
  selector: 'app-verification',
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.scss']
})
export class VerificationComponent implements OnInit {

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
    public _signupService: SignupService,
    private router: Router
  ) {
    // Preventing back button in browser
    window.onpopstate = function (e: any) { window.history.forward(); }
  }

  ngOnInit(): void {
  }

  // On submit
  onSubmit() {
    this.submitted = true;
    if (this.verificationForm.valid) {
      this.submitFlag = true;
      this._signupService.verification(this.verificationForm.value).subscribe(
        (response: any) => {
          this._commonService.successToaster("Email is verified successfully");
          this._signupService.updateSignUpSession(2);
          this.router.navigate(['/thank-you']);
        },
        (error: any) => { }
      ).add(() => this.submitFlag = false);
    }
  }

  resendCode() {
    this.verificationFlag = true;
    this._signupService.resendVerification().subscribe(
      (response: any) => {
        this._commonService.successToaster("Verification code resent successfully");
      },
      (error: any) => { }
    ).add(() => this.verificationFlag = false);
  }

}
