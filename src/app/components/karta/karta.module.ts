import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { KartaRoutingModule } from './karta-routing.module';
import { KartaComponent } from './karta.component';
import { CreateKartaComponent } from './create-karta/create-karta.component';

// Shared module
import { SharedModule } from '@app/shared/_modules/shared.module';
import { EditKartaComponent } from './edit-karta/edit-karta.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


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
    NgSelectModule,
    NgOptionHighlightModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class KartaModule { }
