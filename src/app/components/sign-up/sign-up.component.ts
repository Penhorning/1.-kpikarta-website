import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '@app/shared/_services/common.service';
import { SignupService } from '@app/components/sign-up/service/signup.service';
import { SearchCountryField, CountryISO, PhoneNumberFormat } from 'ngx-intl-tel-input';

@Component({
  selector: 'app-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss']
})
export class SignUpComponent implements OnInit {

  user: any = {
    name: "",
    userId: "",
    email: "",
    accessToken: "",
  }

  submitted: boolean = false;
  submitFlag: boolean = false;

  // ngx-intl-tel-input config
  separateDialCode = true;
	SearchCountryField = SearchCountryField;
	CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
	preferredCountries: CountryISO[] = [CountryISO.UnitedStates, CountryISO.India, CountryISO.Canada];

  signupForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.pattern(this._commonService.formValidation.blank_space)]], // Validtion for blank space
    email: ['', [Validators.required, Validators.pattern(this._commonService.formValidation.email)]],
    mobile: [{}, Validators.required],
    companyName: ['', [Validators.required, Validators.pattern(this._commonService.formValidation.blank_space)]], // Validtion for blank space
  });
  get form() { return this.signupForm.controls; }

  constructor(
    private fb: FormBuilder,
    private _commonService: CommonService,
    private _signupService: SignupService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.user.userId = this.route.snapshot.queryParamMap.get("userId") || "";
    this.user.accessToken = this.route.snapshot.queryParamMap.get("access_token") || "";
    this.user.email = this.route.snapshot.queryParamMap.get("email") || "";

    if (this.user.userId) {
      this.signupForm.patchValue({
        fullName: this.route.snapshot.queryParamMap.get("name"),
        email: this.route.snapshot.queryParamMap.get("email")
      });
      this.signupForm.controls["fullName"].disable();
      this.signupForm.controls["email"].disable();
    } else {
      this.signupForm.addControl("password", this.fb.control('', [Validators.required, Validators.pattern(this._commonService.formValidation.password)]));
      this.signupForm.addControl("confirmPassword", this.fb.control('', [Validators.required, Validators.pattern(this._commonService.formValidation.password)]));
    }
    
  }

  // On submit
  onSubmit() {

    this.submitted = true;

    if (this.signupForm.valid) {

      if (!this.user.userId) {
        if (this.signupForm.value.password !== this.signupForm.value.confirmPassword) {
          this._commonService.errorToaster("Password and Confirm Password are not matching");
        }
        else {
          this.submitFlag = true;
          this._signupService.signup(this.signupForm.value).subscribe(
            (response: any) => {
              let { token, email } = response;
              let sessionData = {
                token: token.id,
                email,
                stage: 1,
                emailVerified: false
              }
              this._signupService.setSignUpSession(sessionData);
              this.router.navigate(['/sign-up/verification']);
            },
            (error: any) => {
              if (error.status === 422 && error.error.error.details.codes.email[0] === "uniqueness") {
                this._commonService.errorToaster("Email is already registered, please try with a different one");
              }
            }
          ).add(() => this.submitFlag = false );
        }
      } else {
        this.submitFlag = true;
        this.signupForm.value.fullName = this.signupForm.getRawValue().fullName;
        this.signupForm.value.email = this.signupForm.getRawValue().email;
        this.signupForm.value.type = "social_user";

        this._signupService.updateUser(this.signupForm.value, this.user.userId, this.user.accessToken).subscribe(
          (response: any) => {
            let sessionData = {
              token: response.accessToken,
              email: this.user.email,
              stage: 1
            }
            this._signupService.setSignUpSession(sessionData);
            this.router.navigate(['/thank-you']);
          },
          (error: any) => { }
        ).add(() => this.submitFlag = false );
      }
    }
  }

}
