import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SignupGuard } from '@app/shared/_authguard/auth.guard';
import { AddPaymentMethodComponent } from './add-payment-method/add-payment-method.component';
import { SignUpComponent } from './sign-up.component';
import { VerificationComponent } from './verification/verification.component';

const routes: Routes = [
  { path: '', component: SignUpComponent, data: { title: "Register - KPI Karta" } },
  { path: 'verification', canActivate: [SignupGuard], component: VerificationComponent, data: { title: "Verification - KPI Karta" } },
  { path: 'payment-method', canActivate: [SignupGuard], component: AddPaymentMethodComponent, data: { title: "Payment Method - KPI Karta" } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SignUpRoutingModule { }
