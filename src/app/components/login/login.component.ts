import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from '@app/shared/_services/common.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject<boolean>();

  submitted: boolean = false;
  submitFlag: boolean = false; 

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]],
    password: ['', Validators.required]
  });
  get form() { return this.loginForm.controls };

  constructor(private fb: FormBuilder, private _commonService: CommonService, private router: Router) { }

  ngOnInit(): void {
  }

  // On submit
  onSubmit() {
    this.submitted = true;

    if (this.loginForm.valid) {
      this.submitFlag = true;

      this._commonService.login(this.loginForm.value).pipe(takeUntil(this.destroy$)).subscribe(
        (response: any) => {
          if (!response.error) {
            let { id, fullName, email, profilePic, emailVerified } = response.user;
            if (emailVerified) {
              let sessionData = {
                token: response.id,
                userId: id,
                name: fullName,
                email,
                profilePic
              }
              this._commonService.setSession(sessionData);
              this.router.navigate(['/my-plan']);
            } else {
              let sessionData = {
                userId: response.id,
                email
              }
              this._commonService.setSession(sessionData);
              this.router.navigate(['/verification']);
            }
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
