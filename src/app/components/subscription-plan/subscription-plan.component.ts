import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SignupService } from '@app/components/sign-up/service/signup.service';
import { SubscriptionPlanService } from '@app/components/subscription-plan/service/subscription-plan.service';

declare const $: any;

@Component({
  selector: 'app-subscription-plan',
  templateUrl: './subscription-plan.component.html',
  styleUrls: ['./subscription-plan.component.scss']
})
export class SubscriptionPlanComponent implements OnInit {

  submitFlag: boolean = false;

  constructor(private _signupService: SignupService, private _subscriptionPlanService: SubscriptionPlanService, private router: Router) {
    // Preventing back button in browser
    window.onpopstate = function (e: any) { window.history.forward(); }
  }

  ngOnInit(): void {
  }

  selectPlan() {
    // this.submitFlag = true;
    // const plantype = $('#buytype').attr('aria-pressed') ? "yearly" : "monthly";
    // this._subscriptionPlanService.assignPlan({ plan: plantype }).subscribe(
    //   (response: any) => {
    //     this._signupService.updateSignUpSession(3);
    //     this.router.navigate(['/sign-up/payment-method']);
    //   },
    //   (error: any) => {
    //     console.log(error);
    //     this.submitFlag = false
    //   }
    // ).add(() => this.submitFlag = false);

    const plantype = $('#buytype').attr('aria-pressed') == 'true' ? "yearly" : "monthly";
    this._signupService.updateSignUpSession(3);
    this.router.navigate(['/sign-up/payment-method', { data: plantype } ]);
  }
}
