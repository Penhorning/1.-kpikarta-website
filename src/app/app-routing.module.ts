import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard, LoginGuard } from './shared/_authguard/auth.guard';

const routes: Routes = [
  {
    path: "",
    redirectTo: "/login",
    pathMatch: "full"
  },
  { path: 'login', canActivateChild: [LoginGuard], loadChildren: () => import('./components/login/login.module').then(m => m.LoginModule) },
  { path: 'sign-up', canActivateChild: [LoginGuard], loadChildren: () => import('./components/sign-up/sign-up.module').then(m => m.SignUpModule) },
  { path: 'forgot-password', canActivateChild: [LoginGuard], loadChildren: () => import('./components/forgot-password/forgot-password.module').then(m => m.ForgotPasswordModule) },
  { path: 'reset-password', canActivateChild: [LoginGuard], loadChildren: () => import('./components/reset-password/reset-password.module').then(m => m.ResetPasswordModule) },
  { path: 'verification', canActivateChild: [LoginGuard], loadChildren: () => import('./components/verification/verification.module').then(m => m.VerificationModule) },
  { path: 'my-plan', canActivateChild: [AuthGuard], loadChildren: () => import('./components/my-plan/my-plan.module').then(m => m.MyPlanModule) },
  { path: 'subscription-plan', loadChildren: () => import('./components/subscription-plan/subscription-plan.module').then(m => m.SubscriptionPlanModule) },
  { path: 'thank-you', loadChildren: () => import('./components/thank-you/thank-you.module').then(m => m.ThankYouModule) },
  { path: '**', loadChildren: () => import('./components/page-not-found/page-not-found.module').then(m => m.PageNotFoundModule) }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
