import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CommonService } from '@app/shared/_services/common.service';
import { SettingService } from '@app/components/settings/service/setting.service';
import { Options } from '@angular-slider/ngx-slider';
import { Router } from '@angular/router';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {

// Color variables
  colorSubmitFlag: boolean = false;
  colorSettings: any;
  selectedColor2: string = "#F85C5C";
  minValue: number = 0;
  maxValue: number = 100;
  options: Options = {
    floor: 0,
    ceil: 100
  };

// 2FA variables  
  _2fa = {
    isChecking: false,
    isSetup: false,
    isEnabled: false,
    showVerifyAlert: false
  }

  // Color slider form
  colorForm = this.fb.group({
    color: ["000000", Validators.required],
    min: [this.minValue, Validators.required],
    max: [this.maxValue, Validators.required]
  });


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
    this.getColorSettings();
  }
// Color setting functions 
  getColorSettings() {
    this._settingService.getColorSettingByUser({ userId: this._commonService.getUserId() }).subscribe(
      (response: any) => {
        this.colorSettings = response;
        this.colorSettings.settings = this.colorSettings.settings.sort((a: any,b: any) => a.min - b.min);
      }
    );
  }
  removeColor(index: number) {
    this.colorSettings.settings.splice(index, 1);
  }
  onColorChange2(colorCode: string, index: number) {
    this.colorSettings.settings[index].color = colorCode;
  }
  onMinValueChange(value: number) {
    this.colorForm.patchValue({ min: value });
  }
  onMaxValueChange(value: number) {
    this.colorForm.patchValue({ max: value });
  }
  checkInRange(minValue: number, maxValue: number): boolean {
    for (let item of this.colorSettings.settings) {
      if (minValue >= item.min && minValue <= item.max) return true;
      else if (maxValue >= item.min && maxValue <= item.max) return true;
    }
    return false;
  }
  findColorInRange(color: string) {
    return this.colorSettings.settings.find((item: any) => item.color === color);
  }
  sumOfRange() {
    let sum = 0;
    for (let i=0; i<this.colorSettings.settings.length; i++) {
      if (this.colorSettings.settings[i].min < 101 && this.colorSettings.settings[i].max < 101) {
        sum+= this.colorSettings.settings[i].max - this.colorSettings.settings[i].min;
      }
    }
    return sum += this.colorSettings.settings.length-2;
  }
  onColorSubmit() {
    if (this.checkInRange(this.colorForm.value.min, this.colorForm.value.max)) {
      this._commonService.errorToaster("You cannot add this range of color!");
    } else {
      if (this.findColorInRange(this.colorForm.value.color)) this._commonService.errorToaster("This color has aleady been taken by other ranges!");
      else this.colorSettings.settings.push(this.colorForm.value);
    }
  }
  saveColorSetting() {
    if (this.colorForm.valid) {
      if (this.sumOfRange() == 100) {
        this.colorSubmitFlag = true;
        if (this.colorSettings.hasOwnProperty("userId")) {
          this._settingService.updateColorSetting(this.colorSettings, this.colorSettings.id).subscribe(
            (response: any) => {
              this._commonService.successToaster("Settings saved successfully");
              this.getColorSettings();
            }
          ).add(() => this.colorSubmitFlag = false );
        } else {
          let settingData = {
            userId: this._commonService.getUserId(),
            settings: this.colorSettings.settings
          }
          this._settingService.createColorSetting(settingData).subscribe(
            (response: any) => {
              this._commonService.successToaster("Settings saved successfully");
              this.getColorSettings();
            }
          ).add(() => this.colorSubmitFlag = false );
        }
      } else this._commonService.errorToaster("Please complete all the color ranges!");
    }
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
