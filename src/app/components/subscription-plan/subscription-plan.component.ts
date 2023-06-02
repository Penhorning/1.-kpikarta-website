import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SignupService } from '@app/components/sign-up/service/signup.service';
import { SubscriptionPlanService } from '@app/components/subscription-plan/service/subscription-plan.service';
import { CommonService } from '@app/shared/_services/common.service';

declare const $: any;

@Component({
  selector: 'app-subscription-plan',
  templateUrl: './subscription-plan.component.html',
  styleUrls: ['./subscription-plan.component.scss']
})
export class SubscriptionPlanComponent implements OnInit {

  plans: any = {};
  loader: any = true;
  submitFlag: boolean = false;
  loadingComponent: any = this._commonService.loader;

  constructor(private _signupService: SignupService, private _subscriptionPlanService: SubscriptionPlanService, private router: Router, private _commonService: CommonService) {
    // Preventing back button in browser
    // window.onpopstate = function (e: any) { window.history.forward(); }
  }

  ngOnInit(): void {
    this.getPlans();
  }

  getPlans() {
    this._subscriptionPlanService.getCreatorPalns().subscribe(
      (response: any) => {
        this.plans.month = response.plans.find((item: any) => item.item_price.period_unit === "month").item_price;
        this.plans.year = response.plans.find((item: any) => item.item_price.period_unit === "year").item_price;
        this.loader = false;
      }
    );
  }

  selectPlan(planId: string) {
    this.submitFlag = true;
    this._subscriptionPlanService.assignPlan({ planId }).subscribe(
      (response: any) => {
        this._signupService.updateSignUpSession(3);
        this.router.navigate(['/thank-you']);
      }
    ).add(() => this.submitFlag = false);
  }
}
