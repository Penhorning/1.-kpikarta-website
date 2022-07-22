import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateKartaComponent } from './create-karta/create-karta.component';
import { KartaComponent } from './karta.component';

const routes: Routes = [
  { path: '', redirectTo:'/dashboard', pathMatch: 'full' },
  { path: '', component: KartaComponent,
    children: [
      { path: 'create-karta', component: CreateKartaComponent, data: { title: 'Create Karta - Karta'} }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KartaRoutingModule { }
