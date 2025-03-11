import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChargebeeService } from './services/chargebee-coupon.service';

import { RedemptionSignUpRoutingModule } from './appsumo-signup-routing.module';
import { RedemptionSignUpComponent } from './appsumo-signup.component';
import { HttpClientModule } from '@angular/common/http';


// Shared module
import { SharedModule } from '@app/shared/_modules/shared.module';

@NgModule({
  declarations: [
    RedemptionSignUpComponent
  ],
  imports: [
    CommonModule,
    RedemptionSignUpRoutingModule,
    SharedModule,
    HttpClientModule
  ],
  providers: [ChargebeeService],
})
export class RedemptionSignUpModule { }
