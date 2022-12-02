import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { KartaRoutingModule } from './karta-routing.module';
import { KartaComponent } from './karta.component';
import { CreateKartaComponent } from './create-karta/create-karta.component';
import { EditKartaComponent } from './edit-karta/edit-karta.component';
import { AllKartasComponent } from './all-kartas/all-kartas.component';

// Shared module
import { SharedModule } from '@app/shared/_modules/shared.module';

// Third party module
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';

@NgModule({
  declarations: [
    KartaComponent,
    CreateKartaComponent,
    EditKartaComponent,
    AllKartasComponent
  ],
  imports: [
    CommonModule,
    KartaRoutingModule,
    SharedModule,
    NgxSliderModule,
    NgSelectModule,
    NgOptionHighlightModule
  ]
})
export class KartaModule { }
