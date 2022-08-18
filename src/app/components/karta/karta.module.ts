import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { KartaRoutingModule } from './karta-routing.module';
import { KartaComponent } from './karta.component';
import { CreateKartaComponent } from './create-karta/create-karta.component';

// Shared module
import { SharedModule } from '@app/shared/_modules/shared.module';
import { EditKartaComponent } from './edit-karta/edit-karta.component';
import { ColorPickerModule } from 'ngx-color-picker';



@NgModule({
  declarations: [
    KartaComponent,
    CreateKartaComponent,
    EditKartaComponent
  ],
  imports: [
    CommonModule,
    KartaRoutingModule,
    SharedModule,
    ColorPickerModule
  ]
})
export class KartaModule { }
