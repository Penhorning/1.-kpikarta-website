import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HistoricalViewComponent } from './historical-view/historical-view.component';
import { MyKpiComponent } from './my-kpi.component';

const routes: Routes = [
  { path: '', component: MyKpiComponent,
    data: {
      title: "My KPIs - KPI Karta",
      roles: ["company_admin", "department_admin", "user"],
      licenses: ["Creator", "Champion"]
    }
  },
  { path: 'history', component: HistoricalViewComponent,
    data: {
      title: "History - KPI Karta",
      roles: ["company_admin", "department_admin", "user"],
      licenses: ["Creator", "Champion"]
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MyKpiRoutingModule { }
