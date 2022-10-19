import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { KartasRoutingModule } from './kartas-routing.module';
import { KartasComponent } from './kartas.component';
import { SharedModule } from '@app/shared/_modules/shared.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgOptionHighlightModule } from '@ng-select/ng-option-highlight';


@NgModule({
  declarations: [
    KartasComponent
  ],
  imports: [
    CommonModule,
    KartasRoutingModule,
    SharedModule,
    NgSelectModule,
    NgOptionHighlightModule
  ]
})
export class KartasModule { }
