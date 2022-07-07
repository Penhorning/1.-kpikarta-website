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

  isLoading: boolean = false;
  qr = {
    code: "",
    isMFASetup: false,
    isMFAEnabled: false,
    isLoading: false,
    isAvailable: false,
    submitted: false,
    submitFlag: false
  }

  authenticatorForm = this.fb.group({
    code: ['', [Validators.required]]
  });

  get authenticatorControls() { return this.authenticatorForm.controls };



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

  checkMFAEnabled() {
    this.isLoading = true;
    this._settingService.checkMFAEnabled().pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {
        if (response.enabled) this.qr.isMFAEnabled = this.qr.isMFASetup = true;
        else this.qr.isMFAEnabled = false;
      },
      (error: any) => { }
    ).add(() => this.isLoading = false );
  }

  generateQRCode() {
    this.qr.isLoading = true;
    this._settingService.generateMFAQRCode().pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {
        this.qr.code = response.qrcode;
        this.qr.isAvailable = true;
      },
      (error: any) => { }
    ).add(() => this.qr.isLoading = false );
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
    this._settingService.resetMFAConfig().pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {
        this._commonService.successToaster("You MFA resetted successfully");
      },
      (error: any) => { }
    );
  }

  toggleMFA(e: any) {
    this._settingService.toggleMFA(e).pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {
        this._commonService.successToaster("You MFA resetted successfully");
      },
      (error: any) => { }
    );
  }

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
