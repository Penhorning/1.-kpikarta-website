import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MyProfileComponent } from './my-profile.component';

const routes: Routes = [
  { path: '', component: MyProfileComponent, data: { title: "My Profile - KPI Karta" } }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyProfileRoutingModule { }
