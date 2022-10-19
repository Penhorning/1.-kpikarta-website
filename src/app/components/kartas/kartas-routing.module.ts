import { KartasComponent } from './kartas.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', component: KartasComponent, data: { title: "Kartas - KPI Karta" }}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KartasRoutingModule { }
