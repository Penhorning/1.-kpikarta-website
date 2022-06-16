import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { CommonService } from '@app/shared/_services/common.service';
import { SettingService } from '@app/shared/_services/setting/setting.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject<boolean>();

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
      )
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}
