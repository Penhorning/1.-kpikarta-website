import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { KartaRoutingModule } from './karta-routing.module';
import { KartaComponent } from './karta.component';
import { CreateKartaComponent } from './create-karta/create-karta.component';

// Shared module
import { SharedModule } from '@app/shared/_modules/shared.module';


@NgModule({
  declarations: [
    KartaComponent,
    CreateKartaComponent
  ],
  imports: [
    CommonModule,
    KartaRoutingModule,
    SharedModule
  ]
})
export class KartaModule { }
