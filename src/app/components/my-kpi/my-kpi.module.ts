import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MyKpiRoutingModule } from './my-kpi-routing.module';
import { MyKpiComponent } from './my-kpi.component';

// Shared module
import { SharedModule } from '@app/shared/_modules/shared.module';

// Third party module
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { DatepickerModule, BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FilterPipe } from './filter.pipe';

@NgModule({
  declarations: [
    MyKpiComponent,
    FilterPipe
  ],
  imports: [
    CommonModule,
    MyKpiRoutingModule,
    SharedModule,
    NgxSliderModule,
    BsDatepickerModule.forRoot(),
    DatepickerModule.forRoot(),
    NgMultiSelectDropDownModule.forRoot()
  ]
})
export class MyKpiModule { }
