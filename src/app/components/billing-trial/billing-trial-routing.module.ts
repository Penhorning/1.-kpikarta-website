import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BillingTrialComponent } from './billing-trial.component';

const routes: Routes = [
  { path: '', component: BillingTrialComponent,
    data: {
      title: "Billing - KPI Karta",
      roles: ["company_admin", "billing_staff"]
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BillingTrialRoutingModule { }
