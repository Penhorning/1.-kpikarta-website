import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SettingsRoutingModule } from './settings-routing.module';
import { SettingsComponent } from './settings.component';

// Shared module
import { SharedModule } from '@app/shared/_modules/shared.module';
// Third party module
import { NgxSliderModule } from '@angular-slider/ngx-slider';


@NgModule({
  declarations: [
    SettingsComponent
  ],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    SharedModule,
    NgxSliderModule
  ]
})
export class SettingsModule { }
