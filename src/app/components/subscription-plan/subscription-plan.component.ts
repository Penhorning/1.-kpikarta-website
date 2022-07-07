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

  constructor(
    private _signupService: SignupService,
    private _subscriptionPlanService: SubscriptionPlanService,
    private router: Router
  ) {
    if (!this._signupService.getSignUpSession().token) this.router.navigate(['/login']);
    else if (this._signupService.getSignUpSession().stage == 3) this.router.navigate(['/thank-you']);
    // router.events
		// 	.pipe(
		// 		filter(
		// 			( event: NavigationEvent ) => {
		// 				return( event instanceof NavigationStart );
		// 			}
		// 		)
		// 	)
		// 	.subscribe(
		// 		( event: any ) => {
		// 			console.group( "NavigationStart Event" );
		// 			console.log( "navigation id:", event.id );
		// 			console.log( "route:", event.url );
		// 			console.log( "trigger:", event.navigationTrigger );
		// 			if ( event.restoredState ) {
		// 				console.warn(
		// 					"restoring navigation id:",
		// 					event.restoredState.navigationId
		// 				);
    //         this.router.navigate(['/subscription-plan']);
		// 			}
		// 			console.groupEnd();
		// 		}
		// 	);
    // router.events
    //   .subscribe((event: any) => {
    //     if (event.navigationTrigger === 'popstate') {
    //       // Perform actions
    //       alert("back")
    //     }
    //   });
    // this.location.subscribe(x => alert(x));
  }

  ngOnInit(): void {
  }

  // @HostListener('window:popstate', ['$event'])
  // onpopstate(event: any) {
  //   console.log('Back button pressed', event);
  //   alert("back")
  // }

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
