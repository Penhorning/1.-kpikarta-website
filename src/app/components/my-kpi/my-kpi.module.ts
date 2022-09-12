import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MyKpiRoutingModule } from './my-kpi-routing.module';
import { MyKpiComponent } from './my-kpi.component';

// Shared module
import { SharedModule } from '@app/shared/_modules/shared.module';

// Third party module
import { NgxSliderModule } from '@angular-slider/ngx-slider';


@NgModule({
  declarations: [
    MyKpiComponent
  ],
  imports: [
    CommonModule,
    MyKpiRoutingModule,
    SharedModule,
    NgxSliderModule
  ]
})
export class MyKpiModule { }
