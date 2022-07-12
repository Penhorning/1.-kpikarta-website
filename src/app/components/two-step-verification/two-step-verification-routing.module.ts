import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TwoStepVerificationComponent } from './two-step-verification.component';

const routes: Routes = [
  { path: '', component: TwoStepVerificationComponent, data: { title: "Two Step Verification - KPI Karta" } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TwoStepVerificationRoutingModule { }
