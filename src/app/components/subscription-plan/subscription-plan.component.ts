import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SignupService } from '@app/shared/_services/signup/signup.service';
import { SubscriptionPlanService } from '@app/shared/_services/subscription-plan/subscription-plan.service';
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

  constructor(
    private _signupService: SignupService,
    private _subscriptionPlanService: SubscriptionPlanService,
    private router: Router
  ) {
    if (!this._signupService.getSignUpSession().token) this.router.navigate(['/login']);
    else if (this._signupService.getSignUpSession().stage == 3) this.router.navigate(['/thank-you']);
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
