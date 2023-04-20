import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonService } from '@app/shared/_services/common.service';
import { SignupService } from '../sign-up/service/signup.service';
import { SubscriptionPlanService } from '../subscription-plan/service/subscription-plan.service';

@Component({
  selector: 'app-billing-trial',
  templateUrl: './billing-trial.component.html',
  styleUrls: ['./billing-trial.component.scss']
})
export class BillingTrialComponent implements OnInit {

  constructor(private _subscriptionPlanService: SubscriptionPlanService, private router: Router, private _commonService: CommonService, private _signUpService: SignupService) { }

  submitFlag: boolean = false;
  prices: any = {};
  loader: any = false;
  loadingComponent: any = this._commonService.loader;

  ngOnInit(): void {
    this._subscriptionPlanService.getCreatorPrices().subscribe(
      (response) => {
        this.prices = response.data;
        this.loader = true;
      },
      (err) => console.log(err)
    );
  }

  selectPlan(type: string) {
    let userData = this._signUpService.getLoginSession();
    this.submitFlag = true;
    this._subscriptionPlanService.startSubscription({ userId: userData.userId, plan: type }).subscribe(
      (response: any) => {
        let data = this._signUpService.getLoginSession();
        this._commonService.setSession(data);
        this.router.navigate(['/dashboard']);
      },
      (err) => {
        this._commonService.errorToaster("Please try again after sometime!");
        // Logic for payment failure
      }
    ).add(() => this.submitFlag = false );
  }

}
