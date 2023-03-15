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

// Filter pipe
import { FilterPipe } from '../../shared/_pipes/filter.pipe';
import { HistoricalViewComponent } from './historical-view/historical-view.component';
@NgModule({
  declarations: [
    MyKpiComponent,
    FilterPipe,
    HistoricalViewComponent
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
