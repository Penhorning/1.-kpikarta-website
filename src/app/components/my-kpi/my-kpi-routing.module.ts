import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyKpiComponent } from './my-kpi.component';

const routes: Routes = [
  { path: '', component: MyKpiComponent, data: { title: "My KPIs - KPI Karta" } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyKpiRoutingModule { }
