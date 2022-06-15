import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '@app/shared/_services/common.service';
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

  signupForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.pattern(/^(\s+\S+\s*)*(?!\s).*$/)]], // Validtion for blank space
    email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]],
    mobile: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(10), Validators.maxLength(10)]],
    companyNumber: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(10), Validators.maxLength(10)]]
  });
  get form() { return this.signupForm.controls; }

  constructor(private fb: FormBuilder, private _commonService: CommonService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.user.userId = this.route.snapshot.queryParamMap.get("userId") || "";
    this.user.accessToken = this.route.snapshot.queryParamMap.get("access_token") || "";
    this.user.email = this.route.snapshot.queryParamMap.get("email") || "";

    if (!this.user.userId) {
      this.signupForm.addControl("password", this.fb.control('', [Validators.required, Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)]));
    }
    this.signupForm.patchValue({
      fullName: this.route.snapshot.queryParamMap.get("name"),
      email: this.route.snapshot.queryParamMap.get("email")
    })
  }

  // On submit
  onSubmit() {

    this.submitted = true;

    if (this.signupForm.valid) {

      this.submitFlag = true;

      if (!this.user.userId) {
        this._commonService.signup(this.signupForm.value).pipe(takeUntil(this.destroy$)).subscribe(
          (response: any) => {
            let { token, email } = response;
            let sessionData = {
              userId: token.id,
              email
            }
            this._commonService.setSession(sessionData);
            this.router.navigate(['/verification']);
          },
          (error: any) => {
            this.submitFlag = false;
          }
        );
      } else {
        this.signupForm.value.userId = this.user.userId;
        this.signupForm.value.token = this.user.accessToken;
        this._commonService.updateUser(this.signupForm.value).pipe(takeUntil(this.destroy$)).subscribe(
          (response: any) => {
            let sessionData = {
              userId: this.user.accessToken,
              email: this.user.email
            }
            this._commonService.setSession(sessionData);
            this.router.navigate(['/subscription-plan']);
          },
          (error: any) => {
            this.submitFlag = false;
          }
        );
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
