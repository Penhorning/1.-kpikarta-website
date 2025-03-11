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
    // this.getPlansFree();
  }

  getPlans() {
    this._subscriptionPlanService.getCreatorPalns().subscribe(
      (response: any) => {
        if (response.plans.length > 0) {
          this.plans.month = response.plans.find((item: any) => item.item_price.period_unit === "month").item_price;
          this.plans.year = response.plans.find((item: any) => item.item_price.period_unit === "year").item_price;
        } else this._commonService.errorToaster("Error, Something went wrong");
      }
    ).add(() => this.loader = false );
  }
  // getPlansFree() {
  //   this._subscriptionPlanService.getCreatorPalnsFree().subscribe(
  //     (response: any) => {
  //       if (response.plans.length > 0) {
  //         this.plans.free = response.plans.find((item: any) => {
  //           console.log("item--",item)
  //           item.item_price.plan_id === "Creator-Test-Free"
  //         });
  //         console.log("this.plans",response.plans)
  //       } else this._commonService.errorToaster("Error, Something went wrong");
  //     }
  //   ).add(() => this.loader = false );
  // }

  selectPlan(planId: string) {
    this.submitFlag = true;
    this._subscriptionPlanService.assignPlan({ planId }).subscribe(
      (response: any) => {
        this._signupService.updateSignUpSession(3);
        this.router.navigate(['/thank-you']);
      }
      
    ).add(() => this.submitFlag = false);
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
