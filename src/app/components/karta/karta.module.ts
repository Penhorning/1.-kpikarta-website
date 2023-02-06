import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { KartaRoutingModule } from './karta-routing.module';
import { KartaComponent } from './karta.component';
import { CreateKartaComponent } from './create-karta/create-karta.component';
import { EditKartaComponent } from './edit-karta/edit-karta.component';
import { AllKartasComponent } from './all-kartas/all-kartas.component';
import { EditKartaPropertyComponent } from './edit-karta-property/edit-karta-property.component';
import { EditKartaInventoryComponent } from './edit-karta-inventory/edit-karta-inventory.component';
import { EditKartaHeaderComponent } from './edit-karta-header/edit-karta-header.component';
import { ViewKartaComponent } from './view-karta/view-karta.component';

// Shared module
import { SharedModule } from '@app/shared/_modules/shared.module';

// Third party module
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { TrialComponentComponent } from './trial-component/trial-component.component';

@NgModule({
  declarations: [
    KartaComponent,
    CreateKartaComponent,
    EditKartaComponent,
    AllKartasComponent,
    EditKartaPropertyComponent,
    EditKartaInventoryComponent,
    EditKartaHeaderComponent,
    ViewKartaComponent,
    TrialComponentComponent,
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
