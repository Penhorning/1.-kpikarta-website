import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BillingTrialRoutingModule } from './billing-trial-routing.module';
import { BillingTrialComponent } from './billing-trial.component';
import { SharedModule } from '@app/shared/_modules/shared.module';


@NgModule({
  declarations: [
    BillingTrialComponent
  ],
  imports: [
    CommonModule,
    BillingTrialRoutingModule,
    SharedModule
  ]
})
export class BillingTrialModule { }
