import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SubscriptionPlanRoutingModule } from './subscription-plan-routing.module';
import { SubscriptionPlanComponent } from './subscription-plan.component';

// Shared module
import { SharedModule } from '@app/shared/_modules/shared.module';


@NgModule({
  declarations: [
    SubscriptionPlanComponent
  ],
  imports: [
    CommonModule,
    SubscriptionPlanRoutingModule,
    SharedModule
  ]
})
export class SubscriptionPlanModule { }
