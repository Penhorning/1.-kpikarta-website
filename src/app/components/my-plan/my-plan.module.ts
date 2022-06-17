import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MyPlanRoutingModule } from './my-plan-routing.module';
import { MyPlanComponent } from './my-plan.component';

// Shared module
import { SharedModule } from '@app/shared/_modules/shared.module';


@NgModule({
  declarations: [
    MyPlanComponent
  ],
  imports: [
    CommonModule,
    MyPlanRoutingModule,
    SharedModule
  ]
})
export class MyPlanModule { }
