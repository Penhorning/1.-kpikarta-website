import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder, FormGroup, AbstractControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonService } from '@app/shared/_services/common.service';
import { SignupService } from '../service/signup.service';

@Component({
  selector: 'app-add-payment-method',
  templateUrl: './add-payment-method.component.html',
  styleUrls: ['./add-payment-method.component.scss']
})
export class AddPaymentMethodComponent implements OnInit {

  user: any = {
    name: "",
    userId: "",
    email: "",
    accessToken: "",
  }

  submitted: boolean = false;
  submitFlag: boolean = false;
  paymentMethodForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private _commonService: CommonService,
    private _signupService: SignupService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Preventing back button in browser
    window.onpopstate = function (e: any) { window.history.forward(); }

    // Initializing FormGroup
    this.paymentMethodForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.pattern(this._commonService.formValidation.blank_space)]], // Validtion for blank space
      cardNumber: ['', [Validators.required, Validators.pattern(this._commonService.formValidation.blank_space), Validators.minLength(16), this.numberValidation]], // Validtion for blank space
      expirationDate: ['', [Validators.required, Validators.pattern(this._commonService.formValidation.blank_space), this.expirationDateValidation ]], // Validtion for blank space
      cvv: ['', [Validators.required, Validators.pattern(this._commonService.formValidation.blank_space), Validators.minLength(3), this.numberValidation]], // Validtion for blank space
    });
  }

  ngOnInit(): void {
    this.user.userId = this.route.snapshot.queryParamMap.get("userId") || "";
    this.user.accessToken = this.route.snapshot.queryParamMap.get("access_token") || "";
    this.user.email = this.route.snapshot.queryParamMap.get("email") || "";
  }

  get form() { return this.paymentMethodForm.controls; }

  expirationDateValidation( control: AbstractControl ): { [key:string] : boolean } | null {
    if(control.value) {
      let splitValue = control.value.trim().split('/');
      let month = splitValue[0] ? splitValue[0] : "";
      let year = splitValue[1] ? splitValue[1] : "";
      
      if ( month.toString().length != 2 || year.toString().length != 4 ) {
        return { 'expiration' : true };
      }
      else {
        if( isNaN(month) || isNaN(year) ) {
          return { 'expiration' : true };
        }
        else {
          return null;
        }
      }
    }
    else {
      return null;
    }
  }

  numberValidation( control: AbstractControl ): { [key:string] : boolean } | null {
    if(control.value) {
      return isNaN(control.value) ? { 'numerror' : true } : null;
    } else {
      return null;
    }
  }

  // On submit
  onSubmit() {
    this.submitted = true;
    if (this.paymentMethodForm.valid) {
      // this.submitFlag = true;
      // this._subscriptionPlanService.assignPlan(this.paymentMethodForm.value).subscribe(
      //   (response: any) => {
      //     this._signupService.updateSignUpSession(3);
      //     this.router.navigate(['/thank-you']);
      //   },
      //   (error: any) => {
      //     console.log(error);
      //     this.submitFlag = false
      //   }
      // ).add(() => this.submitFlag = false);
    }
  }

}
