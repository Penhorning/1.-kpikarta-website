import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignupGuard } from '@app/shared/_authguard/auth.guard';
import { RedemptionSignUpComponent } from './appsumo-signup.component';

const routes: Routes = [
  { path: '', component: RedemptionSignUpComponent, data: { title: "Register - KPI Karta" } },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RedemptionSignUpRoutingModule { }
