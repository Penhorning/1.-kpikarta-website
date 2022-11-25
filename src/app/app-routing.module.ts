import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard, LoginGuard, SignupGuard } from './shared/_authguard/auth.guard';

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
  { path: 'two-step-verification', canActivateChild: [LoginGuard], loadChildren: () => import('./components/two-step-verification/two-step-verification.module').then(m => m.TwoStepVerificationModule) },
  { path: 'dashboard', canActivateChild: [AuthGuard], loadChildren: () => import('./components/dashboard/dashboard.module').then(m => m.DashboardModule) },
  { path: 'my-plan', canActivateChild: [AuthGuard], loadChildren: () => import('./components/my-plan/my-plan.module').then(m => m.MyPlanModule) },
  { path: 'subscription-plan', canActivate: [SignupGuard], loadChildren: () => import('./components/subscription-plan/subscription-plan.module').then(m => m.SubscriptionPlanModule) },
  { path: 'thank-you', canActivate: [SignupGuard], loadChildren: () => import('./components/thank-you/thank-you.module').then(m => m.ThankYouModule) },
  { path: 'settings', canActivateChild: [AuthGuard], loadChildren: () => import('./components/settings/settings.module').then(m => m.SettingsModule) },
  { path: 'my-suggestion', canActivateChild: [AuthGuard], loadChildren: () => import('./components/my-suggestion/my-suggestion.module').then(m => m.MySuggestionModule) },
  { path: 'my-profile', canActivateChild: [AuthGuard], loadChildren: () => import('./components/my-profile/my-profile.module').then(m => m.MyProfileModule) },
  { path: 'members', canActivateChild: [ AuthGuard ], loadChildren: () => import('./components/member/member.module').then(m => m.MemberModule) },
  { path: 'karta', canActivateChild: [AuthGuard], loadChildren: () => import('./components/karta/karta.module').then(m => m.KartaModule) },
  { path: 'my-kpi', canActivateChild: [AuthGuard], loadChildren: () => import('./components/my-kpi/my-kpi.module').then(m => m.MyKpiModule) },
  { path: 'notifications', canActivateChild: [AuthGuard], loadChildren: () => import('./components/notification/notification.module').then(m => m.NotificationModule) },
  { path: 'billing', canActivateChild: [AuthGuard], loadChildren: () => import('./components/billing/billing.module').then(m => m.BillingModule) },
  { path: 'catalogs', canActivateChild: [AuthGuard], loadChildren: () => import('./components/catalog/catalog.module').then(m => m.CatalogModule) },
  { path: 'marketplace', loadChildren: () => import('./components/marketplace/marketplace.module').then(m => m.MarketplaceModule) },

  { path: '**', loadChildren: () => import('./components/page-not-found/page-not-found.module').then(m => m.PageNotFoundModule) },

];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
