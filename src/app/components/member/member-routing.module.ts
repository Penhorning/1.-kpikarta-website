import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MemberComponent } from './member.component';

const routes: Routes = [
  { path: '', component: MemberComponent,
    data: {
      title: "Members - KPI Karta",
      roles: ["company_admin", "billing_staff", "department_admin"]
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MemberRoutingModule { }
