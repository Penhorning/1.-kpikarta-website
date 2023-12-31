import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { KartaComponent } from './karta.component';

import { AllKartasComponent } from './all-kartas/all-kartas.component';
import { CreateKartaComponent } from './create-karta/create-karta.component';
import { EditKartaComponent } from './edit-karta/edit-karta.component';
import { ViewKartaComponent } from './view-karta/view-karta.component';
import { IntroKartaComponent } from './intro-karta/intro-karta.component';
import { SampleKartaComponent } from './sample-karta/sample-karta.component';

const routes: Routes = [
  { path: '', redirectTo:'/dashboard', pathMatch: 'full' },
  { path: '', component: KartaComponent,
    children: [
      { path: 'all', component: AllKartasComponent, data: { title: "All Kartas - KPI Karta" } },
      { path: 'create', component: CreateKartaComponent,
        data: {
          title: "Create - KPI Karta",
          roles: ["company_admin", "department_admin", "user"],
          licenses: ["Creator"]
        }
      },
      { path: 'edit/:id', component: EditKartaComponent,
        data: {
          title: "Edit - KPI Karta",
          roles: ["company_admin", "department_admin", "user"],
          licenses: ["Creator"]
        }
      },
      { path: 'view/:id', component: ViewKartaComponent, data: { title: 'View Karta - KPI Karta'} },
      { path: 'intro/:id', component: IntroKartaComponent, data: { title: 'Intro Karta - KPI Karta'} },
      { path: 'sample/:id', component: SampleKartaComponent, data: { title: 'Sample Karta - KPI Karta'} },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KartaRoutingModule { }
