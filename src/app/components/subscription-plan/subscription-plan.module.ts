import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SubscriptionPlanRoutingModule } from './subscription-plan-routing.module';
import { SubscriptionPlanComponent } from './subscription-plan.component';


@NgModule({
  declarations: [
    SubscriptionPlanComponent
  ],
  imports: [
    CommonModule,
    SubscriptionPlanRoutingModule
  ]
})
export class SubscriptionPlanModule { }
