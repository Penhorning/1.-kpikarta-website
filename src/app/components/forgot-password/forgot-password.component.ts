import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from '@app/shared/_services/common.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {

  submitted: boolean = false;
  submitFlag: boolean = false;

  message = {
    msg: "",
    type: "",
    show: false
  }

  forgotForm = this.fb.group({
    email: ['', [Validators.required, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$')]]
  });
  get form() { return this.forgotForm.controls; }

  constructor(private fb: FormBuilder, private _commonService: CommonService, private router: Router) { }

  ngOnInit(): void {
  }

  showMessage(message: string, type: string) {
    this.message.msg = message;
    this.message.type = type;
    this.message.show = true;
    setTimeout(() => {
      this.message.msg = '';
      this.message.type = '';
      this.message.show = false;
    }, 5000);
  }

  // On submit
  onSubmit() {

    this.submitted = true;

    if (this.forgotForm.valid) {

      this.submitFlag = true;

      this._commonService.forgotPassword(this.forgotForm.value).subscribe(
        (response: any) => {
          this.submitted = false;
          this.forgotForm.controls["email"].reset();
          this.showMessage("An email with password reset instructions has been sent to registered email address", "Success");
        },
        (error: any) => { }
      ).add(() => this.submitFlag = false);
    }
  }

}
