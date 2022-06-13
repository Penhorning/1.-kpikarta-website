import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from '@app/shared/_services/common.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject<boolean>();

  submitted: boolean = false;
  submitFlag: boolean = false;

  forgotForm = this.fb.group({
    email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]]
  });
  get form() { return this.forgotForm.controls; }

  constructor(private fb: FormBuilder, private _commonService: CommonService, private router: Router) { }

  ngOnInit(): void {
  }

  // On submit
  onSubmit() {

    this.submitted = true;

    if (this.forgotForm.valid) {

      this.submitFlag = true;

      this._commonService.signup(this.forgotForm.value).pipe(takeUntil(this.destroy$)).subscribe(
        (response: any) => {
          let { userId, email } = response.data;
          let sessionData = {
            userId,
            email
          }
          this._commonService.setSession(sessionData);
          this.router.navigate(['/verify'], { queryParams: { urlType: this.router.url } });
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
