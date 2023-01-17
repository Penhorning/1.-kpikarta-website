import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MySuggestionComponent } from './my-suggestion.component';

const routes: Routes = [
  { path: '', component: MySuggestionComponent,
    data: {
      title: "My Suggestions - KPI Karta",
      roles: ["company_admin", "department_admin", "user"],
      licenses: ["Creator"]
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MySuggestionRoutingModule { }
