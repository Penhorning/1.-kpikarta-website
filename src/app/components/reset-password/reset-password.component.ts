import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '@app/shared/_services/common.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {

  submitted: boolean = false;
  submitFlag: boolean = false;

  accessToken: string = "";

  resetPasswordForm = this.fb.group({
    newPassword: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)]],
    confirmPassword: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)]]
  });
  get form() { return this.resetPasswordForm.controls; }

  constructor(private fb: FormBuilder, private _commonService: CommonService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.accessToken = this.route.snapshot.queryParamMap.get("access_token") || "";
    if (!this.accessToken) this.router.navigate(['/login']);
  }

  // On submit
  onSubmit() {

    this.submitted = true;

    if (this.resetPasswordForm.valid) {

      if (this.resetPasswordForm.value.newPassword != this.resetPasswordForm.value.confirmPassword) {
        this._commonService.errorToaster("Confirm password should be same as new password");
      } else {

        this.submitFlag = true;
        this._commonService.resetPassword(this.resetPasswordForm.value, this.accessToken).subscribe(
          (response: any) => {
            this._commonService.successToaster("Your password has been changed successfully. Please login with your new password");
            this.router.navigate(['']);
          },
          (error: any) => {
            this.submitFlag = false;
          }
        )
      }
    }
  }

}
