import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SubscriptionPlanComponent } from './subscription-plan.component';

const routes: Routes = [
  { path: '', component: SubscriptionPlanComponent, data: { title: "Buy Subscription Package - KPI Karta" } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubscriptionPlanRoutingModule { }
