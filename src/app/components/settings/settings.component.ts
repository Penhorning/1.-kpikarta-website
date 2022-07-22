import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CommonService } from '@app/shared/_services/common.service';
import { SettingService } from '@app/components/settings/service/setting.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Options } from '@angular-slider/ngx-slider';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject<boolean>();

// Color variables
  colorSubmitFlag: boolean = false;
  colorSettings: any;
  defaultColor: string = "#F85C5C";
  minValue: number = 0;
  maxValue: number = 100;
  options: Options = {
    floor: 0,
    ceil: 100
  };

// MFA variables  
  qr = {
    code: "",
    isChecking: false,
    isGenerating: false,
    isResetting: false,
    isMFASetup: false,
    isMFAEnabled: false,
    isAvailable: false,
    submitted: false,
    submitFlag: false
  }

  // QR code form
  authenticatorForm = this.fb.group({
    code: ['', [Validators.required]]
  });
  get authenticatorControls() { return this.authenticatorForm.controls };

  // Color slider form
  colorForm = this.fb.group({
    color: [this.defaultColor, Validators.required],
    min: [this.minValue, Validators.required],
    max: [this.maxValue, Validators.required]
  });


// Change password variables
  submitted: boolean = false;
  submitFlag: boolean = false;

  passwordForm = this.fb.group({
    oldPassword: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)]],
    newPassword: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)]],
    confirmPassword: ['', [Validators.required, Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/)]]
  });

  get form() { return this.passwordForm.controls };

  constructor(private fb: FormBuilder, private _settingService: SettingService, private _commonService: CommonService) { }

  ngOnInit(): void {
    this.getColorSettings();
  }
// Color setting functions 
  getColorSettings() {
    this._settingService.getColorSettingByUser({ userId: this._commonService.getUserId() }).pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {
        this.colorSettings = response;
        this.colorForm.patchValue({
          minMax: [this.colorSettings.settings[0].min,this.colorSettings.settings[0].max]
        });
      }
    );
  }
  removeColor(index: number) {
    this.colorSettings.settings.splice(index, 1);
  }
  onColorChange(colorCode: string) {
    this.colorForm.patchValue({ color: colorCode });
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
    let sum = this.colorSettings.settings.reduce((acc: any, item: any) => { return acc + (item.max - item.min); }, 0);
    return sum += this.colorSettings.settings.length-1;
  }
  onColorSubmit() {
    if (this.checkInRange(this.colorForm.value.min, this.colorForm.value.max)) {
      this._commonService.errorToaster("You cannot add this range of color!");
    } else {
      console.log(this.findColorInRange(this.colorForm.value.color))
      if (this.findColorInRange(this.colorForm.value.color)) this._commonService.errorToaster("This color has aleady been taken by other ranges!");
      else this.colorSettings.settings.push(this.colorForm.value);
    }
  }
  saveColorSetting() {
    if (this.colorForm.valid) {
      if (this.sumOfRange() == 100) {
        this.colorSubmitFlag = true;
        if (this.colorSettings.hasOwnProperty("userId")) {
          this._settingService.updateColorSetting(this.colorSettings, this.colorSettings.id).pipe(takeUntil(this.destroy$)).subscribe(
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
          this._settingService.createColorSetting(settingData).pipe(takeUntil(this.destroy$)).subscribe(
            (response: any) => {
              this._commonService.successToaster("Settings saved successfully");
              this.getColorSettings();
            }
          ).add(() => this.colorSubmitFlag = false );
        }
      } else this._commonService.errorToaster("Please complete all the color ranges!");
    }
  }



// MFA functions
  checkMFAConfig() {
    this.qr.isChecking = true;
    this._settingService.checkMFAConfig().pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {
        this.qr.isMFAEnabled = response.mfa.enabled;
        if (response.mfa.secret && response.mfa.qrCode) {
          this.qr.isMFASetup = true;
        }
      },
      (error: any) => { }
    ).add(() => this.qr.isChecking = false );
  }

  generateQRCode(e: any) {
    if (e.target.checked && !this.qr.isMFASetup) {
      this.qr.isGenerating = true;
      this._settingService.generateMFAQRCode().pipe(takeUntil(this.destroy$)).subscribe(
        (response: any) => {
          this.qr.code = response.qrcode;
          this.qr.isAvailable = true;
        },
        (error: any) => { }
      ).add(() => this.qr.isGenerating = false );
    } else this.resetMFA();
  }

  onAuthenticationSubmit() {
    this.qr.submitted = true;

    if (this.authenticatorForm.valid) {
      this.qr.submitFlag = true;
      this._settingService.enableMFA(this.authenticatorForm.value).pipe(takeUntil(this.destroy$)).subscribe(
        (response: any) => {
          this._commonService.successToaster("MFA setup successfully");
          this.qr.isMFAEnabled = this.qr.isMFASetup = true;
          this.qr.isAvailable = false;
        },
        (error: any) => { }
      ).add(() => this.qr.submitFlag = false );
    }
  }

  resetMFA() {
    if (this.qr.isMFASetup) {
      this.qr.isResetting = true;
      this._settingService.resetMFAConfig().pipe(takeUntil(this.destroy$)).subscribe(
        (response: any) => {
          this.qr.isMFAEnabled = this.qr.isMFASetup = false;
          this._commonService.successToaster("Your MFA resetted successfully");
        },
        (error: any) => { }
      ).add(() => this.qr.isResetting = false );
    }
  }

  toggleMFA(e: any) {
    if (this.qr.isMFASetup) {
      this._settingService.toggleMFA({type: e.target.checked}).pipe(takeUntil(this.destroy$)).subscribe(
        (response: any) => {
          if (response.type === true) this._commonService.successToaster("Your MFA enabled successfully");
          else if (response.type === false) this._commonService.successToaster("Your MFA disabled successfully");
        },
        (error: any) => { }
      );
    }
  }



// Change password functions
  onPasswordSubmit() {
    this.submitted = true;

    if (this.passwordForm.valid) {
      if (this.passwordForm.value.newPassword != this.passwordForm.value.confirmPassword) {
        this._commonService.errorToaster("Confirm password should be same as new password");
      } else {
        this.submitFlag = true;
        this._settingService.changePassword(this.passwordForm.value).pipe(takeUntil(this.destroy$)).subscribe(
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

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
