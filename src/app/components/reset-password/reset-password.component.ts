import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '@app/shared/_services/common.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject<boolean>();

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
  }

  // On submit
  onSubmit() {

    this.submitted = true;

    if (this.resetPasswordForm.valid) {

      if (this.resetPasswordForm.value.newPassword != this.resetPasswordForm.value.confirmPassword) {
        this._commonService.errorToaster("Confirm password should be same as new password");
      } else {

        this.submitFlag = true;
        
        this.resetPasswordForm.value.access_token = this.accessToken;
        this._commonService.resetPassword(this.resetPasswordForm.value).pipe(takeUntil(this.destroy$)).subscribe(
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

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
