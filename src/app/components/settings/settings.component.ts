import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CommonService } from '@app/shared/_services/common.service';
import { SettingService } from '@app/components/settings/service/setting.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

// 2FA variables  
  _2fa = {
    isChecking: false,
    isSetup: false,
    isEnabled: false,
    showVerifyAlert: false
  }


// Change password variables
  submitted: boolean = false;
  submitFlag: boolean = false;

  passwordForm = this.fb.group({
    oldPassword: ['', [Validators.required, Validators.pattern(this._commonService.formValidation.password)]],
    newPassword: ['', [Validators.required, Validators.pattern(this._commonService.formValidation.password)]],
    confirmPassword: ['', [Validators.required, Validators.pattern(this._commonService.formValidation.password)]]
  });

  get form() { return this.passwordForm.controls };

  constructor(private fb: FormBuilder, private _settingService: SettingService, private _commonService: CommonService, private router: Router) { }

  ngOnInit(): void {
    this.check2FAConfig();
  }



// 2FA functions
  check2FAConfig() {
    this._2fa.isChecking = true;
    this._settingService.check2FAConfig().subscribe(
      (response: any) => {
        this._2fa.isEnabled = response.data._2faEnabled;
        if (response.data.mobile && response.data.mobileVerified) {
          this._2fa.isSetup = true;
        }
      },
      (error: any) => { }
    ).add(() => this._2fa.isChecking = false );
  }

  toggle2FA(e: any) {
    if (this._2fa.isSetup) {
      this._settingService.toggle2FA({type: e.target.checked}).subscribe(
        (response: any) => {
          if (response.type === true) this._commonService.successToaster("Your 2FA enabled successfully");
          else if (response.type === false) this._commonService.successToaster("Your 2FA disabled successfully");
        },
        (error: any) => { }
      );
    } else {
      setTimeout(() => e.target.checked = false, 500);
      this._2fa.showVerifyAlert = true;
      setTimeout(() => this._2fa.showVerifyAlert = false, 5000);
    }
  }

  navigateToProfile() {
    this.router.navigate(['/my-profile'], { fragment: 'phoneNumber' });
    // this._commonService.warningToaster("Please verify your mobile number first!");
  }



// Change password functions
  onPasswordSubmit() {
    this.submitted = true;
    if (this.passwordForm.valid) {
      if (this.passwordForm.value.newPassword != this.passwordForm.value.confirmPassword) {
        this._commonService.errorToaster("Confirm password should be same as new password");
      } else {
        this.submitFlag = true;
        this._settingService.changePassword(this.passwordForm.value).subscribe(
          (response: any) => {
            this.passwordForm.reset();
            this.passwordForm.markAsPristine();
            this.submitted = false;
            this._commonService.successToaster("Your password changed successfully");
          },
          (error: any) => { }
        ).add(() => this.submitFlag = false );
      }
    }
  }

}
