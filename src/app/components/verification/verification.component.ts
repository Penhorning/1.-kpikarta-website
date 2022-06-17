import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from '@app/shared/_services/common.service';
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

  verificationForm = this.fb.group({
    code: ['', Validators.required]
  });
  get form() { return this.verificationForm.controls; }

  constructor(private fb: FormBuilder, private _commonService: CommonService, private router: Router) {
    if (!this._commonService.getUserId()) this.router.navigate(['/login']);
  }

  ngOnInit(): void {
  }

  // On submit
  onSubmit() {

    this.submitted = true;

    if (this.verificationForm.valid) {

      this.submitFlag = true;

      this._commonService.verification(this.verificationForm.value).pipe(takeUntil(this.destroy$)).subscribe(
        (response: any) => {
          this.router.navigate(['/subscription-plan']);
        },
        (error: any) => {
          this.submitFlag = false;
        }
      );
    }
  }

  resendCode() {
    this._commonService.resendVerification().pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {
        this._commonService.successToaster("Code sent successfully")
      },
      (error: any) => {
        this.submitFlag = false;
      }
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
