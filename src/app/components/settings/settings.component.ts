import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CommonService } from '@app/shared/_services/common.service';
import { SettingService } from '@app/components/settings/service/setting.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject<boolean>();


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

  authenticatorForm = this.fb.group({
    code: ['', [Validators.required]]
  });

  get authenticatorControls() { return this.authenticatorForm.controls };



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

      if (this.passwordForm.value.newPassword != this.passwordForm.value.confirmPassword) {
        this._commonService.errorToaster("Confirm password should be same as new password");
      }
      
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
          this._commonService.successToaster("You MFA resetted successfully");
        },
        (error: any) => { }
      ).add(() => this.qr.isResetting = false );
    }
  }

  toggleMFA(e: any) {
    if (this.qr.isMFASetup) {
      this._settingService.toggleMFA({type: e.target.checked}).pipe(takeUntil(this.destroy$)).subscribe(
        (response: any) => {
          if (response.type === true) this._commonService.successToaster("You MFA enabled successfully");
          else if (response.type === false) this._commonService.successToaster("You MFA disabled successfully");
        },
        (error: any) => { }
      );
    }
  }



// Change password functions
  onPasswordSubmit() {
    this.submitted = true;

    if (this.passwordForm.valid) {
      this.submitFlag = true;

      if (this.passwordForm.value.newPassword != this.passwordForm.value.confirmPassword) {
        this._commonService.errorToaster("Confirm password should be same as new password");
      }
      
      this._settingService.changePassword(this.passwordForm.value).pipe(takeUntil(this.destroy$)).subscribe(
        (response: any) => {
          this._commonService.successToaster("Your password changed successfully");
        },
        (error: any) => { }
      ).add(() => this.submitFlag = false );
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
