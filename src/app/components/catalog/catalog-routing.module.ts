import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CatalogComponent } from './catalog.component';

const routes: Routes = [
  { path: '', component: CatalogComponent,
    data: {
      title: "Inventory - KPI Karta",
      roles: ["company_admin", "department_admin", "user"],
      licenses: ["Creator"]
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CatalogRoutingModule { }
