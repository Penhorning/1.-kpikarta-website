import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AllKartasComponent } from './all-kartas/all-kartas.component';
import { CreateKartaComponent } from './create-karta/create-karta.component';
import { EditKartaComponent } from './edit-karta/edit-karta.component';
import { KartaComponent } from './karta.component';

const routes: Routes = [
  { path: '', redirectTo:'/dashboard', pathMatch: 'full' },
  { path: '', component: KartaComponent,
    children: [
      { path: 'all', component: AllKartasComponent, data: { title: 'All Kartas - KPI Karta'} },
      { path: 'create', component: CreateKartaComponent, data: { title: 'Create Karta - KPI Karta'} },
      { path: 'edit/:id', component: EditKartaComponent, data: { title: 'Edit Karta - KPI Karta'} }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KartaRoutingModule { }
