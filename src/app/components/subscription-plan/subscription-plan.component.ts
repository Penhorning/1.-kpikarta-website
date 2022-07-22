import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SignupService } from '@app/components/sign-up/service/signup.service';
import { SubscriptionPlanService } from '@app/components/subscription-plan/service/subscription-plan.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-subscription-plan',
  templateUrl: './subscription-plan.component.html',
  styleUrls: ['./subscription-plan.component.scss']
})
export class SubscriptionPlanComponent implements OnInit, OnDestroy {

  destroy$: Subject<boolean> = new Subject<boolean>();

  submitFlag: boolean = false;

  constructor(private _signupService: SignupService, private _subscriptionPlanService: SubscriptionPlanService, private router: Router) {
    // Preventing back button in browser
    window.onpopstate = function (e: any) { window.history.forward(); }
  }

  ngOnInit(): void {
  }

  selectPlan(type: string) {

    this.submitFlag = true;

    this._subscriptionPlanService.assignPlan({ plan: type }).pipe(takeUntil(this.destroy$)).subscribe(
      (response: any) => {
        this.router.navigate(['/thank-you']);
        this._signupService.updateSignUpSession(3);
      },
      (error: any) => {}
    ).add(() => this.submitFlag = false);
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.unsubscribe();
  }

}