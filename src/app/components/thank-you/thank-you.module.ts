import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ThankYouRoutingModule } from './thank-you-routing.module';
import { ThankYouComponent } from './thank-you.component';

// Shared module
import { SharedModule } from '@app/shared/_modules/shared.module';


@NgModule({
  declarations: [
    ThankYouComponent
  ],
  imports: [
    CommonModule,
    ThankYouRoutingModule,
    SharedModule
  ]
})
export class ThankYouModule { }
