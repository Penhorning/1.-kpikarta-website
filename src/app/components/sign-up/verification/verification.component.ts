import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonService } from '@app/shared/_services/common.service';
import { SignupService } from '@app/components/sign-up/service/signup.service';

import { SubscriptionPlanService } from '@app/components/subscription-plan/service/subscription-plan.service';

@Component({
  selector: 'app-verification',
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.scss']
})
export class VerificationComponent implements OnInit {

  submitted: boolean = false;
  submitFlag: boolean = false;
  verificationFlag: boolean = false;

  plans: any = {};
  loader: any = true;

  verificationForm = this.fb.group({
    code: ['', [Validators.required, Validators.pattern(/^[0-9]*$/)]]
  });
  get form() { return this.verificationForm.controls; }

  constructor(
    private fb: FormBuilder,
    private _commonService: CommonService,
    public _signupService: SignupService,
    private router: Router,
    private _subscriptionPlanService: SubscriptionPlanService,
  ) {
    // Preventing back button in browser
    if(this._signupService.getSignUpSession().stage >= 2) {
      window.onpopstate = function (e: any) { window.history.forward(); }
    }
  }

  ngOnInit(): void {
    this.getPlansFree();
    console.log("sessionData:",this._signupService.getSignUpSession())
  }
  
  // On submit
  onSubmit() {
    this.submitted = true;
    if (this.verificationForm.valid) {
      this.submitFlag = true;
      this._signupService.verification(this.verificationForm.value).subscribe(
        (response: any) => {
          this._commonService.successToaster("Email is verified successfully");
          // this._signupService.updateSignUpSession(2, response.id);
          // this.router.navigate(['/subscription-plan']);
          
          const sessionData = this._signupService.getSignUpSession(); // Check userType from the session
          console.log("sessionData:",sessionData)
          console.log("sessionData.userType:",sessionData.userType)
          if (sessionData.userType === 'appsumo') {
            console.log("sessionData.userType",sessionData.userType)

            this.submitFlag = true;
            this._subscriptionPlanService.assignPlan({ planId : "Creator-Test-Free-USD-Monthly" }).subscribe(
              (response: any) => {
                console.log("submit response",response)
                  // this._commonService.successToaster("Free subscription activated!");
                  this._signupService.updateSignUpSession(3);
                  this.router.navigate(['/thank-you']);
              
              }
              
            ).add(() => this.submitFlag = false);
            
            this.router.navigate(['/thank-you']);
            // this.router.navigate(['/dashboard']);
          } else {
            this._signupService.updateSignUpSession(2, response.id);
            this.router.navigate(['/subscription-plan']);
          }
        },
        (error: any) => { }
      ).add(() => this.submitFlag = false);
    }
  }

  resendCode() {
    this.verificationFlag = true;
    this._signupService.resendVerification().subscribe(
      (response: any) => {
        this._commonService.successToaster("Verification code resent successfully");
      },
      (error: any) => { }
    ).add(() => this.verificationFlag = false);
  }

  getPlansFree() {
    this._subscriptionPlanService.getCreatorPalnsFree().subscribe(
      (response: any) => {
        if (response.plans.length > 0) {
          this.plans.free = response.plans.find((item: any) => {
            console.log("item--",item)
            item.item_price.plan_id === "Creator-Test-Free"
          });
          console.log("this.plans-",response.plans)
        } else this._commonService.errorToaster("Error, Something went wrong");
      }
    ).add(() => this.loader = false );
  }

  selectPlanFree(planId: string) {
    this.submitFlag = true;
    this._subscriptionPlanService.assignPlan({ planId }).subscribe(
      (response: any) => {
        if (planId === "Creator-Test-Free") {
          this._commonService.successToaster("Free subscription activated!");
      } else {
          this._signupService.updateSignUpSession(3);
          this.router.navigate(['/thank-you']);
      }
      }
      
    ).add(() => this.submitFlag = false);
  }

}
