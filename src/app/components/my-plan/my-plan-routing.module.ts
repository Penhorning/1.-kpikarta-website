import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyPlanComponent } from './my-plan.component';

const routes: Routes = [
  { path: '', component: MyPlanComponent, data: { title: "My Plan - KPI Karta" } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyPlanRoutingModule { }
