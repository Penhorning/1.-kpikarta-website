import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TwoStepVerificationRoutingModule } from './two-step-verification-routing.module';
import { TwoStepVerificationComponent } from './two-step-verification.component';

// Shared module
import { SharedModule } from '@app/shared/_modules/shared.module';


@NgModule({
  declarations: [
    TwoStepVerificationComponent
  ],
  imports: [
    CommonModule,
    TwoStepVerificationRoutingModule,
    SharedModule
  ]
})
export class TwoStepVerificationModule { }
